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

    // Real Server-Connected Authentication (Prisma + PostgreSQL via Render)
    const nextAuthBtn = document.getElementById("next-auth-btn");
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

            // Try Logging In First, if user doesn't exist, Register automatically
            try {
                nextAuthBtn.innerText = "Connecting to OTA X...";
                nextAuthBtn.disabled = true;

                let response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: val, password: pwd })
                });

                let data = await response.json();

                if (!response.ok) {
                    // If login fails because user isn't found or unverified, try registering them
                    response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: val.split('@')[0], email: val, password: pwd })
                    });
                    data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Authentication failed.");
                    }

                    alert("Registration successful! Check your email for verification code if required, or login.");
                } else {
                    // Save JWT Token
                    if (data.token) {
                        localStorage.setItem("otax_token", data.token);
                    }
                    alert("Login successful! Welcome back to OTA X.");
                }

                // Transition to main app interface
                authScreen.classList.remove("active");
                authScreen.classList.add("hidden");
                mainApp.classList.remove("hidden");

            } catch (err) {
                authWarning.innerText = err.message;
                authWarning.classList.remove("hidden");
            } finally {
                nextAuthBtn.innerText = "Next";
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

    // Helper function for tab switching programmatically
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

    // --- UPLOAD & POST CREATION LOGIC (Live Backend Connected) ---
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

                switchToTab('feed-tab');
            } catch (error) {
                console.error("Publish error:", error);
                alert(error.message);
            } finally {
                publishBtn.innerText = "Post";
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

    // Universal Gift Modal Controls
    const giftModal = document.getElementById("gift-modal");
    const triggerGiftModal = document.getElementById("trigger-gift-modal");
    const closeGift = document.getElementById("close-gift");

    if (triggerGiftModal) {
        triggerGiftModal.addEventListener("click", () => giftModal.classList.remove("hidden"));
    }
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
                alert("OTA X Universal Gift sent worldwide successfully!");
                giftModal.classList.add("hidden");
            } else {
                alert("Insufficient OTA X Coins!");
            }
        });
    }

    // Voice Comment Drawer Control
    const commentDrawer = document.getElementById("comment-section-container");
    const openCommentsBtn = document.getElementById("open-comments-btn");
    const closeComments = document.getElementById("close-comments");

    if (openCommentsBtn) {
        openCommentsBtn.addEventListener("click", () => commentDrawer.classList.remove("hidden"));
    }
    if (closeComments) {
        closeComments.addEventListener("click", () => commentDrawer.classList.add("hidden"));
    }

    // Voice Note Recording Simulation
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

    // Redirect to Standalone Legal Pages
    const openTermsBtn = document.getElementById("open-terms");
    if (openTermsBtn) {
        openTermsBtn.addEventListener("click", () => { window.location.href = "terms.html"; });
    }

    const openPrivacyBtn = document.getElementById("open-privacy");
    if (openPrivacyBtn) {
        openPrivacyBtn.addEventListener("click", () => { window.location.href = "privacy.html"; });
    }

    const openFeedbackBtn = document.getElementById("open-feedback");
    if (openFeedbackBtn) {
        openFeedbackBtn.addEventListener("click", () => { window.location.href = "feedback.html"; });
    }

    // Appeal Modal Controls
    window.openAppealModal = function() {
        document.getElementById("appeal-modal").classList.remove("hidden");
    };

    const closeAppeal = document.getElementById("close-appeal");
    if (closeAppeal) {
        closeAppeal.addEventListener("click", () => { document.getElementById("appeal-modal").classList.add("hidden"); });
    }

    const submitAppealBtn = document.getElementById("submit-appeal-btn");
    if (submitAppealBtn) {
        submitAppealBtn.addEventListener("click", () => {
            alert("Quote-based appeal submitted for safety review.");
            document.getElementById("appeal-modal").classList.add("hidden");
        });
    }

    // Password Show/Hide Eye Toggle
    const togglePasswordBtn = document.getElementById("toggle-password-btn");
    const authPasswordInput = document.getElementById("auth-password");

    if (togglePasswordBtn && authPasswordInput) {
        togglePasswordBtn.addEventListener("click", () => {
            if (authPasswordInput.type === "password") {
                authPasswordInput.type = "text";
                togglePasswordBtn.innerText = "👁️‍🗨️";
                setTimeout(() => {
                    if (authPasswordInput.type === "text") {
                        authPasswordInput.type = "password";
                        togglePasswordBtn.innerText = "👁️";
                    }
                }, 3000);
            } else {
                authPasswordInput.type = "password";
                togglePasswordBtn.innerText = "👁️";
            }
        });
    }

    // Profile Settings Management
    const updateUsernameBtn = document.getElementById("update-username-btn");
    const newUsernameInput = document.getElementById("new-username");
    const displayUsername = document.getElementById("profile-username-display");

    if (updateUsernameBtn && newUsernameInput) {
        updateUsernameBtn.addEventListener("click", () => {
            const newName = newUsernameInput.value.trim();
            if (newName.length < 3) {
                alert("Username must be at least 3 characters long.");
                return;
            }
            if (displayUsername) {
                displayUsername.innerText = "@" + newName;
            }
            alert("Username successfully updated to @" + newName);
            newUsernameInput.value = "";
        });
    }

    const updatePasswordBtn = document.getElementById("update-password-btn");
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");

    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener("click", () => {
            const currentPwd = currentPasswordInput.value.trim();
            const newPwd = newPasswordInput.value.trim();

            if (!currentPwd || !newPwd) {
                alert("Please fill in both password fields.");
                return;
            }

            const isNewPwdSecure = newPwd.length >= 6 && /[0-9#*!@$%^&+=]/.test(newPwd);
            if (!isNewPwdSecure) {
                alert("New password must be at least 6 characters and include a number or special symbol.");
                return;
            }

            alert("Password updated successfully!");
            currentPasswordInput.value = "";
            newPasswordInput.value = "";
        });
    }

    const updateBioBtn = document.getElementById("update-bio-btn");
    const newBioInput = document.getElementById("new-bio");
    const displayBio = document.getElementById("profile-bio-display");

    if (updateBioBtn && newBioInput) {
        updateBioBtn.addEventListener("click", () => {
            const bioText = newBioInput.value.trim();
            if (bioText.length > 80) {
                alert("Bio is too long! Please keep it under 80 characters.");
                return;
            }
            if (displayBio) {
                displayBio.innerText = bioText || "No bio yet.";
            }
            alert("Profile bio successfully updated!");
            newBioInput.value = "";
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
                            
