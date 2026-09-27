document.addEventListener("DOMContentLoaded", () => {
    // Live Render Backend URL
    const BACKEND_URL = "https://ota-x-backend.onrender.com";

    // Auto-detect user country via IP
    const countryContainer = document.getElementById("detected-country-container");
    
    if (countryContainer) {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                if (data && data.country_name) {
                    countryContainer.innerHTML = `<i class="fa-solid fa-location-dot"></i> Connected from ${data.country_name}`;
                    countryContainer.classList.remove("hidden");
                }
            })
            .catch(() => {
                countryContainer.classList.add("hidden");
            });
    }

    // Auth Tab Switching (Email vs Phone)
    const tabEmailBtn = document.getElementById("tab-email-btn");
    const tabPhoneBtn = document.getElementById("tab-phone-btn");
    const authInput = document.getElementById("auth-input");

    if (tabEmailBtn && tabPhoneBtn && authInput) {
        tabEmailBtn.addEventListener("click", () => {
            tabEmailBtn.classList.add("active");
            tabPhoneBtn.classList.remove("active");
            authInput.placeholder = "Email address";
            authInput.type = "email";
            authInput.value = "";
        });

        tabPhoneBtn.addEventListener("click", () => {
            tabPhoneBtn.classList.add("active");
            tabEmailBtn.classList.remove("active");
            authInput.placeholder = "Phone number (+234...)";
            authInput.type = "tel";
            authInput.value = "";
        });
    }

    // Toggle between Sign Up and Log In mode
    const switchModeBtn = document.getElementById("switch-mode-btn");
    const nextAuthBtn = document.getElementById("next-auth-btn");
    let isLoginMode = false;

    if (switchModeBtn && nextAuthBtn) {
        switchModeBtn.addEventListener("click", () => {
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                switchModeBtn.innerText = "Don't have an account? Sign Up";
                nextAuthBtn.innerText = "Log In";
            } else {
                switchModeBtn.innerText = "Already have an account? Log In";
                nextAuthBtn.innerText = "Sign Up / Continue";
            }
        });
    }

    // Real Server-Connected Authentication (Prisma + PostgreSQL via Render)
    const authPassword = document.getElementById("auth-password");
    const authWarning = document.getElementById("auth-warning");
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");

    if (nextAuthBtn) {
        nextAuthBtn.addEventListener("click", async () => {
            const val = authInput.value.trim();
            const pwd = authPassword.value.trim();

            const isPasswordSecure = pwd.length >= 6 && /[0-9#*!@$%^&+=]/.test(pwd);

            if (val.length < 4 || !isPasswordSecure) {
                authWarning.innerText = "Please enter a valid email and a secure password (min 6 chars with number/symbol).";
                authWarning.classList.remove("hidden");
                return;
            }

            authWarning.classList.add("hidden");

            try {
                nextAuthBtn.innerText = "Connecting to OTA X...";
                nextAuthBtn.disabled = true;

                let endpoint = `${BACKEND_URL}/api/auth/login`;
                let bodyData = { email: val, password: pwd };

                let response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bodyData)
                });

                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    data = { error: "Invalid response from server." };
                }

                if (!response.ok && !isLoginMode) {
                    // Try Registering if login fails and we are in sign-up mode
                    response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: val.split('@')[0], email: val, password: pwd })
                    });
                    
                    try {
                        data = await response.json();
                    } catch (e) {
                        data = { error: "Invalid registration response from server." };
                    }

                    if (!response.ok) {
                        throw new Error(data.error || data.message || "Registration failed.");
                    }

                    alert("Registration successful! Welcome to OTA X.");
                } else if (!response.ok && isLoginMode) {
                    throw new Error(data.error || data.message || "Invalid login credentials.");
                } else {
                    if (data.token) {
                        localStorage.setItem("otax_token", data.token);
                    }
                    alert(isLoginMode ? "Login successful! Welcome back to OTA X." : "Authentication successful!");
                }

                authScreen.classList.remove("active");
                authScreen.classList.add("hidden");
                mainApp.classList.remove("hidden");

            } catch (err) {
                console.error("Auth error:", err);
                authWarning.innerText = err.message || "Network error or server unreachable.";
                authWarning.classList.remove("hidden");
            } finally {
                nextAuthBtn.innerText = isLoginMode ? "Log In" : "Sign Up / Continue";
                nextAuthBtn.disabled = false;
            }
        });
    }

    // Bottom Navigation Switcher
    const botNavButtons = document.querySelectorAll(".bot-nav-btn[data-tab]");
    botNavButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTabId = btn.getAttribute("data-tab");
            
            document.querySelectorAll(".app-tab").forEach(tab => {
                tab.classList.add("hidden");
            });

            const targetTab = document.getElementById(targetTabId);
            if (targetTab) {
                targetTab.classList.remove("hidden");
            }

            botNavButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    window.switchToTab = function(tabId) {
        document.querySelectorAll(".app-tab").forEach(tab => {
            tab.classList.add("hidden");
        });
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.remove("hidden");
        }
        botNavButtons.forEach(b => {
            if (b.getAttribute("data-tab") === tabId) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });
    };

    // --- UPLOAD & POST CREATION LOGIC ---
    const publishBtn = document.getElementById("publish-post-btn");
    
    if (publishBtn) {
        publishBtn.addEventListener("click", async () => {
            const captionInput = document.getElementById("post-caption");
            const fileInput = document.getElementById("media-file-input");
            const songSelect = document.getElementById("selected-song");

            const captionText = captionInput ? captionInput.value.trim() : "New OTA X Post! 🔥";
            const selectedSong = songSelect ? songSelect.value : "Trending Sound";
            
            let mediaUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";

            if (fileInput && fileInput.files && fileInput.files[0]) {
                mediaUrl = URL.createObjectURL(fileInput.files[0]);
            }

            const token = localStorage.getItem("otax_token");
            if (!token) {
                alert("Please log in first before publishing a post!");
                switchToTab('profile-tab');
                return;
            }

            try {
                publishBtn.innerText = "Publishing globally...";
                publishBtn.disabled = true;

                const response = await fetch(`${BACKEND_URL}/api/posts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        caption: captionText,
                        mediaUrl: mediaUrl,
                        song: selectedSong
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to publish post.");
                }

                alert("Post published globally to PostgreSQL successfully! 🔥");

                if (captionInput) captionInput.value = "";
                if (fileInput) fileInput.value = "";

                loadGlobalFeed();
                switchToTab('feed-tab');
            } catch (error) {
                console.error("Publish error:", error);
                alert(error.message);
            } finally {
                publishBtn.innerText = "Post to OTA X Feed";
                publishBtn.disabled = false;
            }
        });
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // --- FETCH & DISPLAY GLOBAL POSTS FROM BACKEND ---
    async function loadGlobalFeed() {
        const feedTab = document.getElementById("feed-tab");
        if (!feedTab) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/posts`);
            const posts = await response.json();

            if (!response.ok) return;

            const existingItems = feedTab.querySelectorAll(".video-feed-item.live-post");
            existingItems.forEach(item => item.remove());

            posts.forEach(post => {
                const username = post.user ? post.user.username : "OX_Creator";
                const postItem = document.createElement("div");
                postItem.className = "video-feed-item live-post";
                postItem.innerHTML = `
                    <div class="video-placeholder" style="background-image: url('${post.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}'); background-size: cover; background-position: center;">
                        <div class="video-overlay-info">
                            <h3>@${escapeHtml(username)}</h3>
                            <p>${escapeHtml(post.caption)}</p>
                            <div class="sound-tag"><i class="fa-solid fa-music"></i> <span>${escapeHtml(post.song || 'Trending Sound')}</span></div>
                        </div>
                        <div class="right-action-bar">
                            <button class="action-btn like-btn" onclick="toggleLike(this)"><i class="fa-solid fa-heart"></i><span>1</span></button>
                            <button class="action-btn comment-btn" onclick="openComments('${post.id}')"><i class="fa-solid fa-comment-dots"></i><span>0</span></button>
                            <button class="action-btn gift-btn" id="trigger-gift-modal"><i class="fa-solid fa-gift"></i><span>Gift</span></button>
                            <button class="action-btn share-btn" onclick="alert('Post link copied to clipboard!')"><i class="fa-solid fa-share"></i><span>Share</span></button>
                            <button class="action-btn download-btn" onclick="downloadWatermarkedContent('${post.mediaUrl}', '${escapeHtml(username)}', false)">
                                <i class="fa-solid fa-download"></i><span>Save</span>
                            </button>
                        </div>
                    </div>
                `;
                feedTab.appendChild(postItem);
            });
        } catch (error) {
            console.error("Error loading feed:", error);
        }
    }

    loadGlobalFeed();

    // Global Interactive Functions
    window.toggleLike = function(btn) {
        btn.classList.toggle('active');
        const span = btn.querySelector('span');
        let count = parseInt(span.innerText);
        if (btn.classList.contains('active')) {
            span.innerText = count + 1;
        } else {
            span.innerText = Math.max(0, count - 1);
        }
    };

    window.openComments = function(postId) {
        const commentDrawer = document.getElementById("comment-section-container");
        if (commentDrawer) commentDrawer.classList.remove("hidden");
    };

    // Universal Gift Modal Controls
    const giftModal = document.getElementById("gift-modal");
    const closeGift = document.getElementById("close-gift");

    if (closeGift) {
        closeGift.addEventListener("click", () => giftModal.classList.add("hidden"));
    }

    let selectedGiftCost = 0;
    const giftItems = document.querySelectorAll(".gift-item");
    giftItems.forEach(item => {
        item.addEventListener("click", () => {
            giftItems.forEach(i => i.classList.remove("selected"));
            item.classList.add("selected");
            selectedGiftCost = parseInt(item.getAttribute("data-cost"));
        });
    });

    const sendGiftAction = document.getElementById("send-gift-action");
    const userCoinsDisplay = document.getElementById("user-coins");
    let currentCoins = 5000;

    if (sendGiftAction) {
        sendGiftAction.addEventListener("click", () => {
            if (selectedGiftCost === 0) {
                alert("Please select a universal gift first.");
                return;
            }
            if (currentCoins >= selectedGiftCost) {
                currentCoins -= selectedGiftCost;
                if (userCoinsDisplay) userCoinsDisplay.innerText = currentCoins.toLocaleString();
                alert("OTA X Universal Gift sent successfully!");
                giftModal.classList.add("hidden");
            } else {
                alert("Insufficient OTA X Coins!");
            }
        });
    }

    // Voice Comment Drawer Control
    const commentDrawer = document.getElementById("comment-section-container");
    const closeComments = document.getElementById("close-comments");

    if (closeComments) {
        closeComments.addEventListener("click", () => commentDrawer.classList.add("hidden"));
    }

    const recordVoiceBtn = document.getElementById("record-voice-btn");
    if (recordVoiceBtn) {
        let isRecording = false;
        recordVoiceBtn.addEventListener("click", () => {
            isRecording = !isRecording;
            if (isRecording) {
                recordVoiceBtn.style.color = "#ff3b5c";
                alert("Recording voice note... Click mic again to send.");
            } else {
                recordVoiceBtn.style.color = "#aaa";
                alert("Voice comment posted to feed successfully!");
            }
        });
    }

    // Legal Modal Controls (Terms & Privacy)
    const legalModal = document.getElementById("legal-modal");
    const closeLegal = document.getElementById("close-legal");
    const legalTitle = document.getElementById("legal-title");
    const legalBody = document.getElementById("legal-body");
    const openTerms = document.getElementById("open-terms");
    const openPrivacy = document.getElementById("open-privacy");

    if (openTerms && legalModal) {
        openTerms.addEventListener("click", () => {
            legalTitle.innerText = "Terms of Service";
            legalBody.innerHTML = `
                <p><strong>1. Acceptance of Terms</strong><br>By accessing or using OTA X, you agree to be bound by these Terms of Service.</p>
                <p><strong>2. User Content & Conduct</strong><br>You are solely responsible for the videos, voice notes, and text comments you publish. No harassment or illegal content is tolerated.</p>
                <p><strong>3. Gifting and Virtual Currency</strong><br>OTA X coins and diamonds are part of the platform's engagement ecosystem and subject to digital item policies.</p>
            `;
            legalModal.classList.remove("hidden");
        });
    }

    if (openPrivacy && legalModal) {
        openPrivacy.addEventListener("click", () => {
            legalTitle.innerText = "Privacy Policy";
            legalBody.innerHTML = `
                <p><strong>1. Information We Collect</strong><br>We collect your account credentials (email/phone), uploaded media content, and interaction data to provide the global ecosystem experience.</p>
                <p><strong>2. Data Security</strong><br>Your passwords are securely hashed, and your tokens are handled safely via local storage and PostgreSQL.</p>
                <p><strong>3. Contact Us</strong><br>For privacy concerns, reach out via your profile support or appeal center.</p>
            `;
            legalModal.classList.remove("hidden");
        });
    }

    if (closeLegal && legalModal) {
        closeLegal.addEventListener("click", () => {
            legalModal.classList.add("hidden");
        });
    }

    // Watermarked Content Download Function
    window.downloadWatermarkedContent = async function(mediaUrl, creatorUsername, isVideo = false) {
        try {
            if (isVideo) {
                window.open(mediaUrl, '_blank');
                alert(`Downloading video by @${creatorUsername} with OTA X watermark!`);
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = mediaUrl;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0);

                const fontSize = Math.max(canvas.width * 0.04, 24);
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 6;

                const watermarkText = `OTA X • @${creatorUsername}`;
                const padding = 30;
                const textX = canvas.width - ctx.measureText(watermarkText).width - padding;
                const textY = canvas.height - padding;

                ctx.fillText(watermarkText, textX, textY);

                canvas.toBlob(function(blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `otax-${creatorUsername}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    alert('Downloaded with OTA X watermark!');
                }, 'image/jpeg');
            };
        } catch (error) {
            console.error('Watermark download error:', error);
            window.open(mediaUrl, '_blank');
        }
    };
});
                        
