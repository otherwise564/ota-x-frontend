document.addEventListener("DOMContentLoaded", () => {
    // Approved Monetization & Payout Countries (Restricted Payouts)
    const approvedMonetizationCountries = [
        "Nigeria", "Türkiye", "Turkey", "Dubai", "United Arab Emirates", 
        "United States", "United Kingdom", "France", "Germany", "Japan", 
        "South Korea", "Brazil", "Mexico", "Italy", "Spain"
    ];

    // Simulated Automated Country Detection via IP/Geolocation
    const detectedCountry = "Nigeria"; 
    
    const countryDisplay = document.getElementById("user-country-display");
    const monetizationBadge = document.getElementById("monetization-badge");

    if (countryDisplay) {
        countryDisplay.innerText = `Region Detected: ${detectedCountry}`;
    }

    if (monetizationBadge) {
        if (approvedMonetizationCountries.includes(detectedCountry)) {
            monetizationBadge.innerText = "Monetization & Payouts: UNLOCKED ✅";
            monetizationBadge.style.background = "#00e676";
        } else {
            monetizationBadge.innerText = "Monetization Payouts: Restricted (Gifting Active Worldwide) 🌍";
            monetizationBadge.style.background = "#ff3b5c";
        }
    }

    // Auth Validation Logic (< 4 characters warning & OTP trigger)
    const nextAuthBtn = document.getElementById("next-auth-btn");
    const authInput = document.getElementById("auth-input");
    const authWarning = document.getElementById("auth-warning");
    const otpContainer = document.getElementById("otp-container");
    const verifyOtpBtn = document.getElementById("verify-otp-btn");
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");

    if (nextAuthBtn) {
        nextAuthBtn.addEventListener("click", () => {
            const val = authInput.value.trim();
            if (val.length < 4) {
                authWarning.classList.remove("hidden");
            } else {
                authWarning.classList.add("hidden");
                alert("Human verification passed. Verification code dispatched!");
                nextAuthBtn.classList.add("hidden");
                authInput.classList.add("hidden");
                otpContainer.classList.remove("hidden");
            }
        });
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener("click", () => {
            const otpVal = document.getElementById("otp-input").value.trim();
            if (otpVal.length >= 4) {
                authScreen.classList.add("hidden");
                mainApp.classList.remove("hidden");
            } else {
                alert("Please enter a valid verification code.");
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

    // Top Header Feed Tabs
    const topNavTabs = document.querySelectorAll(".nav-tab");
    topNavTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            topNavTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
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

    // Gift Selection
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
                alert("OTA X Universal Gift sent successfully! Creator received Diamonds 💎");
                giftModal.classList.add("hidden");
            } else {
                alert("Insufficient OTA X Coins! Top up required.");
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
        recordVoiceBtn.addEventListener("mousedown", () => {
            isRecording = true;
            recordVoiceBtn.style.color = "#ff3b5c";
            alert("Recording voice note... Release or click again to post.");
        });

        recordVoiceBtn.addEventListener("click", () => {
            if (isRecording) {
                isRecording = false;
                recordVoiceBtn.style.color = "#aaa";
                alert("Voice comment recorded and posted to OTA X successfully!");
            }
        });
    }

    // Quote-Based Appeal Modal Control
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
            const appealText = document.getElementById("appeal-text").value.trim();
            if (appealText.length > 5) {
                alert("Appeal submitted successfully for safety review.");
                document.getElementById("appeal-modal").classList.add("hidden");
            } else {
                alert("Please provide a detailed quote or explanation.");
            }
        });
    }

    // Studio Live Stream Trigger
    const startLiveBtn = document.getElementById("start-live-btn");
    if (startLiveBtn) {
        startLiveBtn.addEventListener("click", () => {
            alert("Initializing OTA X Studio Real-Time Live Broadcasting stream...");
        });
    }
});
      
