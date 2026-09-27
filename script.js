document.addEventListener("DOMContentLoaded", function() {
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");
    const nextAuthBtn = document.getElementById("next-auth-btn");
    const switchModeBtn = document.getElementById("switch-mode-btn");
    const forgotPasswordBtn = document.getElementById("forgot-password-btn");
    
    // Modals (Safe guarded against null elements)
    const legalModal = document.getElementById("legal-modal");
    const legalTitle = document.getElementById("legal-title");
    const legalBody = document.getElementById("legal-body");
    const closeLegal = document.getElementById("close-legal");
    const openTerms = document.getElementById("open-terms");
    const openPrivacy = document.getElementById("open-privacy");
    const openTermsProfile = document.getElementById("open-terms-profile");
    const openPrivacyProfile = document.getElementById("open-privacy-profile");

    // Appeal Modal Elements
    const appealModal = document.getElementById("appeal-modal");
    const openAppealBtn = document.getElementById("open-appeal-btn");
    const closeAppeal = document.getElementById("close-appeal");
    const submitAppealBtn = document.getElementById("submit-appeal-btn");

    // Country Selector Elements
    const selectedCountryBtn = document.getElementById("selected-country-btn");
    const countryModal = document.getElementById("country-modal");
    const closeCountry = document.getElementById("close-country");
    const countrySearchInput = document.getElementById("country-search-input");
    const countryOptions = document.querySelectorAll(".country-option");

    // Gift Modal Elements
    const giftModal = document.getElementById("gift-modal");
    const triggerGiftModal = document.getElementById("trigger-gift-modal");
    const closeGift = document.getElementById("close-gift");
    const giftItems = document.querySelectorAll(".gift-item");
    const sendGiftAction = document.getElementById("send-gift-action");

    // Comments Modal Elements
    const commentContainer = document.getElementById("comment-section-container");
    const closeComments = document.getElementById("close-comments");
    const recordVoiceBtn = document.getElementById("record-voice-btn");
    const sendCommentBtn = document.getElementById("send-comment-btn");
    const commentTextInput = document.getElementById("comment-text-input");
    const commentsListContainer = document.getElementById("comments-list-container");

    let isLoginMode = true;
    let selectedGiftCost = 100;

    // Toggle Login / Sign Up mode
    if (switchModeBtn) {
        switchModeBtn.addEventListener("click", function() {
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                if (nextAuthBtn) nextAuthBtn.innerText = "Log In";
                switchModeBtn.innerHTML = `Don't have an account? <span>Sign Up</span>`;
                if (forgotPasswordBtn) forgotPasswordBtn.style.display = "block";
            } else {
                if (nextAuthBtn) nextAuthBtn.innerText = "Sign Up";
                switchModeBtn.innerHTML = `Already have an account? <span>Log In</span>`;
                if (forgotPasswordBtn) forgotPasswordBtn.style.display = "none";
            }
        });
    }

    // Handle Log In / Sign Up button click
    if (nextAuthBtn) {
        nextAuthBtn.addEventListener("click", function() {
            const userInput = document.getElementById("auth-input")?.value;
            const passwordInput = document.getElementById("auth-password")?.value;

            if(!userInput || !passwordInput) {
                alert("Please fill in both fields to continue.");
                return;
            }

            if (authScreen) authScreen.classList.add("hidden");
            if (mainApp) mainApp.classList.remove("hidden");
        });
    }

    // Handle Forgot Password click
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", function() {
            const userInput = document.getElementById("auth-input")?.value;
            if(!userInput) {
                alert("Please enter your email or phone number first, then click Forgot Password.");
            } else {
                alert("Password reset instructions have been sent to: " + userInput);
            }
        });
    }

    // Open Country Selector Modal
    if (selectedCountryBtn && countryModal) {
        selectedCountryBtn.addEventListener("click", function() {
            countryModal.classList.remove("hidden");
        });
    }

    // Close Country Selector Modal
    if (closeCountry && countryModal) {
        closeCountry.addEventListener("click", function() {
            countryModal.classList.add("hidden");
        });
    }

    // Select Country from List
    countryOptions.forEach(option => {
        option.addEventListener("click", function() {
            const chosenCountry = this.getAttribute("data-country");
            if (selectedCountryBtn) {
                selectedCountryBtn.innerHTML = chosenCountry + ` <i class="fa-solid fa-chevron-down" style="font-size: 9px;"></i>`;
            }
            if (countryModal) countryModal.classList.add("hidden");
        });
    });

    // Filter countries on search input
    if (countrySearchInput) {
        countrySearchInput.addEventListener("input", function() {
            const filter = this.value.toLowerCase();
            countryOptions.forEach(option => {
                const text = option.innerText.toLowerCase();
                if (text.includes(filter)) {
                    option.style.display = "block";
                } else {
                    option.style.display = "none";
                }
            });
        });
    }

    // Terms & Privacy Modals Handler
    function showTerms() {
        if (legalTitle) legalTitle.innerText = "Terms of Service";
        if (legalBody) {
            legalBody.innerHTML = `
                <p><strong>1. Acceptance of Terms</strong><br>By accessing or using OTA X globally, you agree to comply with these terms.</p>
                <p><strong>2. User Content</strong><br>You retain ownership of videos, comments, and voice notes you post, but grant OTA X a license to display them within the ecosystem.</p>
                <p><strong>3. Community Guidelines</strong><br>Harassment, hate speech, and unverified harmful activities are strictly prohibited.</p>
            `;
        }
        if (legalModal) legalModal.classList.remove("hidden");
    }

    function showPrivacy() {
        if (legalTitle) legalTitle.innerText = "Privacy Policy";
        if (legalBody) {
            legalBody.innerHTML = `
                <p><strong>1. Information Collection</strong><br>We collect account credentials, uploaded media, and interaction metrics to improve your feed experience.</p>
                <p><strong>2. Data Usage</strong><br>Your regional data context helps tailor content delivery and community safety standards.</p>
                <p><strong>3. Security</strong><br>We implement standard encryption to protect your account information.</p>
            `;
        }
        if (legalModal) legalModal.classList.remove("hidden");
    }

    if (openTerms) openTerms.addEventListener("click", showTerms);
    if (openPrivacy) openPrivacy.addEventListener("click", showPrivacy);
    if (openTermsProfile) openTermsProfile.addEventListener("click", showTerms);
    if (openPrivacyProfile) openPrivacyProfile.addEventListener("click", showPrivacy);
    if (closeLegal && legalModal) {
        closeLegal.addEventListener("click", function() {
            legalModal.classList.add("hidden");
        });
    }

    // Gift Modal Logic
    if (triggerGiftModal && giftModal) {
        triggerGiftModal.addEventListener("click", function() {
            giftModal.classList.remove("hidden");
        });
    }

    if (closeGift && giftModal) {
        closeGift.addEventListener("click", function() {
            giftModal.classList.add("hidden");
        });
    }

    giftItems.forEach(item => {
        item.addEventListener("click", function() {
            giftItems.forEach(i => i.classList.remove("selected"));
            this.classList.add("selected");
            selectedGiftCost = parseInt(this.getAttribute("data-cost"));
        });
    });

    if (sendGiftAction) {
        sendGiftAction.addEventListener("click", function() {
            const userCoinsSpan = document.getElementById("user-coins");
            if (userCoinsSpan) {
                let currentCoins = parseInt(userCoinsSpan.innerText);
                if(currentCoins >= selectedGiftCost) {
                    currentCoins -= selectedGiftCost;
                    userCoinsSpan.innerText = currentCoins;
                    alert("Universal Gift sent successfully! Creator rewarded.");
                    if (giftModal) giftModal.classList.add("hidden");
                } else {
                    alert("Insufficient coin balance! Top up your wallet in profile.");
                }
            }
        });
    }

    // Comments & Voice Note Logic
    window.openComments = function(postId) {
        if (commentContainer) commentContainer.classList.remove("hidden");
    }

    if (closeComments && commentContainer) {
        closeComments.addEventListener("click", function() {
            commentContainer.classList.add("hidden");
        });
    }

    if (recordVoiceBtn) {
        recordVoiceBtn.addEventListener("click", function() {
            alert("Microphone active: Voice note recorded and attached to comment!");
            if (commentsListContainer) {
                if (commentsListContainer.innerText.includes("No comments yet")) {
                    commentsListContainer.innerHTML = "";
                }
                const voiceItem = document.createElement("div");
                voiceItem.style.cssText = "background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 8px; text-align: left; color: #fff; font-size: 13px;";
                voiceItem.innerHTML = `<i class="fa-solid fa-microphone" style="color: #ff3b5c; margin-right: 6px;"></i> Voice Note (0:04)`;
                commentsListContainer.appendChild(voiceItem);
            }
        });
    }

    if (sendCommentBtn && commentTextInput) {
        sendCommentBtn.addEventListener("click", function() {
            const text = commentTextInput.value.trim();
            if (!text) return;
            if (commentsListContainer) {
                if (commentsListContainer.innerText.includes("No comments yet")) {
                    commentsListContainer.innerHTML = "";
                }
                const commentItem = document.createElement("div");
                commentItem.style.cssText = "background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 8px; text-align: left; color: #fff; font-size: 13px;";
                commentItem.innerHTML = `<strong>@You:</strong> ${text}`;
                commentsListContainer.appendChild(commentItem);
                commentTextInput.value = "";
            }
        });
    }

    // Appeal Modal Logic
    if (openAppealBtn && appealModal) {
        openAppealBtn.addEventListener("click", function() {
            appealModal.classList.remove("hidden");
        });
    }

    if (closeAppeal && appealModal) {
        closeAppeal.addEventListener("click", function() {
            appealModal.classList.add("hidden");
        });
    }

    if (submitAppealBtn) {
        submitAppealBtn.addEventListener("click", function() {
            const appealTextEl = document.getElementById("appeal-text");
            const text = appealTextEl ? appealTextEl.value : "";
            if(!text) {
                alert("Please provide details for your appeal.");
                return;
            }
            alert("Moderation appeal submitted successfully. Our safety review team will respond shortly.");
            if (appealModal) appealModal.classList.add("hidden");
            if (appealTextEl) appealTextEl.value = "";
        });
    }

    // Like Toggle Function
    window.toggleLike = function(btn) {
        btn.classList.toggle("active");
        const span = btn.parentElement.querySelector(".action-count") || btn.querySelector("span");
        if (span) {
            let count = parseInt(span.innerText) || 120000;
            if(btn.classList.contains("active")) {
                span.innerText = (count + 1).toLocaleString();
            } else {
                span.innerText = (count - 1).toLocaleString();
            }
        }
    }

    // Bottom Navigation Tab Switching Logic (Fixes Create, Home, Profile, Inbox tabs)
    const navButtons = document.querySelectorAll(".bot-nav-btn");
    const appTabs = document.querySelectorAll(".app-tab");

    navButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            const targetTabId = this.getAttribute("data-tab");
            if (!targetTabId) return;
            
            navButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            appTabs.forEach(tab => {
                if(tab.id === targetTabId) {
                    tab.classList.remove("hidden");
                } else {
                    tab.classList.add("hidden");
                }
            });
        });
    });
});
            
