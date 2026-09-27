document.addEventListener("DOMContentLoaded", () => {
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

    // Stronger Auth Validation (Min 6 characters, checks for numbers or symbols like #, *, !)
    const nextAuthBtn = document.getElementById("next-auth-btn");
    const authPassword = document.getElementById("auth-password");
    const authWarning = document.getElementById("auth-warning");
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");

    if (nextAuthBtn) {
        nextAuthBtn.addEventListener("click", () => {
            const val = authInput.value.trim();
            const pwd = authPassword.value.trim();

            const isPasswordSecure = pwd.length >= 6 && /[0-9#*!@$%^&+=]/.test(pwd);

            if (val.length < 4 || !isPasswordSecure) {
                authWarning.classList.remove("hidden");
                return;
            }

            authWarning.classList.add("hidden");
            authScreen.classList.remove("active");
            authScreen.classList.add("hidden");
            mainApp.classList.remove("hidden");
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
                userCoinsDisplay.innerText = currentCoins.toLocaleString();
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

    // Redirect to Standalone Legal Pages (Terms & Privacy)
    const openTermsBtn = document.getElementById("open-terms");
    if (openTermsBtn) {
        openTermsBtn.addEventListener("click", () => {
            window.location.href = "terms.html";
        });
    }

    const openPrivacyBtn = document.getElementById("open-privacy");
    if (openPrivacyBtn) {
        openPrivacyBtn.addEventListener("click", () => {
            window.location.href = "privacy.html";
        });
    }

    // Redirect to Standalone Feedback Page
    const openFeedbackBtn = document.getElementById("open-feedback");
    if (openFeedbackBtn) {
        openFeedbackBtn.addEventListener("click", () => {
            window.location.href = "feedback.html";
        });
    }

    // Appeal Modal Controls
    window.openAppealModal = function() {
        document.getElementById("appeal-modal").classList.remove("hidden");
    };

    const closeAppeal = document.getElementById("close-appeal");
    if (closeAppeal) {
        closeAppeal.addEventListener("click", () => {
            document.getElementById("appeal-modal").classList.add("hidden");
        });
    }

    const submitAppealBtn = document.getElementById("submit-appeal-btn");
    if (submitAppealBtn) {
        submitAppealBtn.addEventListener("click", () => {
            alert("Quote-based appeal submitted for safety review.");
            document.getElementById("appeal-modal").classList.add("hidden");
        });
    }

    // --- NEW: Password Show/Hide Eye Toggle ---
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

    // --- NEW: Profile Settings (Username, Password, & Bio Management) ---
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
});
                
