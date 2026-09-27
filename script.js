document.addEventListener("DOMContentLoaded", function() {
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");
    const nextAuthBtn = document.getElementById("next-auth-btn");
    const switchModeBtn = document.getElementById("switch-mode-btn");
    const forgotPasswordBtn = document.getElementById("forgot-password-btn");
    
    // Modals
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

    let isLoginMode = true;
    let selectedGiftCost = 100;

    // Toggle Login / Sign Up mode
    switchModeBtn.addEventListener("click", function() {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            nextAuthBtn.innerText = "Log In";
            switchModeBtn.innerHTML = `Don't have an account? <span>Sign Up</span>`;
            forgotPasswordBtn.style.display = "block";
        } else {
            nextAuthBtn.innerText = "Sign Up";
            switchModeBtn.innerHTML = `Already have an account? <span>Log In</span>`;
            forgotPasswordBtn.style.display = "none";
        }
    });

    // Handle Log In / Sign Up button click
    nextAuthBtn.addEventListener("click", function() {
        const emailInput = document.getElementById("auth-input").value;
        const passwordInput = document.getElementById("auth-password").value;

        if(!emailInput || !passwordInput) {
            alert("Please fill in both fields to continue.");
            return;
        }

        authScreen.classList.add("hidden");
        mainApp.classList.remove("hidden");
    });

    // Handle Forgot Password click
    forgotPasswordBtn.addEventListener("click", function() {
        const email = document.getElementById("auth-input").value;
        if(!email) {
            alert("Please enter your email address first, then click Forgot Password.");
        } else {
            alert("Password reset link has been sent to: " + email);
        }
    });

    // Open Country Selector Modal
    selectedCountryBtn.addEventListener("click", function() {
        countryModal.classList.remove("hidden");
    });

    // Close Country Selector Modal
    closeCountry.addEventListener("click", function() {
        countryModal.classList.add("hidden");
    });

    // Select Country from List
    countryOptions.forEach(option => {
        option.addEventListener("click", function() {
            const chosenCountry = this.getAttribute("data-country");
            selectedCountryBtn.innerHTML = chosenCountry + ` <i class="fa-solid fa-chevron-down" style="font-size: 9px;"></i>`;
            countryModal.classList.add("hidden");
        });
    });

    // Filter countries on search input
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

    // Terms & Privacy Modals Handler
    function showTerms() {
        legalTitle.innerText = "Terms of Service";
        legalBody.innerHTML = `
            <p><strong>1. Acceptance of Terms</strong><br>By accessing or using OTA X globally, you agree to comply with these terms.</p>
            <p><strong>2. User Content</strong><br>You retain ownership of videos, comments, and voice notes you post, but grant OTA X a license to display them within the ecosystem.</p>
            <p><strong>3. Community Guidelines</strong><br>Harassment, hate speech, and unverified harmful activities are strictly prohibited.</p>
        `;
        legalModal.classList.remove("hidden");
    }

    function showPrivacy() {
        legalTitle.innerText = "Privacy Policy";
        legalBody.innerHTML = `
            <p><strong>1. Information Collection</strong><br>We collect account credentials, uploaded media, and interaction metrics to improve your feed experience.</p>
            <p><strong>2. Data Usage</strong><br>Your regional data context helps tailor content delivery and community safety standards.</p>
            <p><strong>3. Security</strong><br>We implement standard encryption to protect your account information.</p>
        `;
        legalModal.classList.remove("hidden");
    }

    openTerms.addEventListener("click", showTerms);
    openPrivacy.addEventListener("click", showPrivacy);
    if(openTermsProfile) openTermsProfile.addEventListener("click", showTerms);
    if(openPrivacyProfile) openPrivacyProfile.addEventListener("click", showPrivacy);

    closeLegal.addEventListener("click", function() {
        legalModal.classList.add("hidden");
    });

    // Gift Modal Logic
    triggerGiftModal.addEventListener("click", function() {
        giftModal.classList.remove("hidden");
    });

    closeGift.addEventListener("click", function() {
        giftModal.classList.add("hidden");
    });

    giftItems.forEach(item => {
        item.addEventListener("click", function() {
            giftItems.forEach(i => i.classList.remove("selected"));
            this.classList.add("selected");
            selectedGiftCost = parseInt(this.getAttribute("data-cost"));
        });
    });

    sendGiftAction.addEventListener("click", function() {
        const userCoinsSpan = document.getElementById("user-coins");
        let currentCoins = parseInt(userCoinsSpan.innerText);
        if(currentCoins >= selectedGiftCost) {
            currentCoins -= selectedGiftCost;
            userCoinsSpan.innerText = currentCoins;
            alert("Universal Gift sent successfully! Creator rewarded.");
            giftModal.classList.add("hidden");
        } else {
            alert("Insufficient coin balance! Top up your wallet in profile.");
        }
    });

    // Comments & Voice Note Logic
    window.openComments = function(postId) {
        commentContainer.classList.remove("hidden");
    }

    closeComments.addEventListener("click", function() {
        commentContainer.classList.add("hidden");
    });

    recordVoiceBtn.addEventListener("click", function() {
        alert("Microphone active: Voice note recorded and attached to comment!");
    });

    // Appeal Modal Logic
    openAppealBtn.addEventListener("click", function() {
        appealModal.classList.remove("hidden");
    });

    closeAppeal.addEventListener("click", function() {
        appealModal.classList.add("hidden");
    });

    submitAppealBtn.addEventListener("click", function() {
        const text = document.getElementById("appeal-text").value;
        if(!text) {
            alert("Please provide details for your appeal.");
            return;
        }
        alert("Moderation appeal submitted successfully. Our safety review team will respond shortly.");
        appealModal.classList.add("hidden");
        document.getElementById("appeal-text").value = "";
    });

    // Like Toggle Function
    window.toggleLike = function(btn) {
        btn.classList.toggle("active");
        const span = btn.querySelector("span");
        let count = parseInt(span.innerText);
        if(btn.classList.contains("active")) {
            span.innerText = count + 1;
        } else {
            span.innerText = count - 1;
        }
    }

    // Bottom Navigation Tab Switching Logic
    const navButtons = document.querySelectorAll(".bot-nav-btn");
    const appTabs = document.querySelectorAll(".app-tab");

    navButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            const targetTabId = this.getAttribute("data-tab");
            
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
                                                               
