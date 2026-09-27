document.addEventListener("DOMContentLoaded", function() {
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");
    const nextAuthBtn = document.getElementById("next-auth-btn");
    const switchModeBtn = document.getElementById("switch-mode-btn");
    const forgotPasswordBtn = document.getElementById("forgot-password-btn");
    const legalModal = document.getElementById("legal-modal");
    const legalTitle = document.getElementById("legal-title");
    const legalBody = document.getElementById("legal-body");
    const closeLegal = document.getElementById("close-legal");
    const openTerms = document.getElementById("open-terms");
    const openPrivacy = document.getElementById("open-privacy");
    
    let isLoginMode = true;

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

    // Open Terms of Service Modal
    openTerms.addEventListener("click", function() {
        legalTitle.innerText = "Terms of Service";
        legalBody.innerHTML = `
            <p><strong>1. Acceptance of Terms</strong><br>By accessing or using OTA X in Nigeria and globally, you agree to comply with these terms.</p>
            <p><strong>2. User Content</strong><br>You retain ownership of videos, comments, and voice notes you post, but grant OTA X a license to display them within the ecosystem.</p>
            <p><strong>3. Community Guidelines</strong><br>Harassment, hate speech, and unverified harmful activities are strictly prohibited.</p>
        `;
        legalModal.classList.remove("hidden");
    });

    // Open Privacy Policy Modal
    openPrivacy.addEventListener("click", function() {
        legalTitle.innerText = "Privacy Policy";
        legalBody.innerHTML = `
            <p><strong>1. Information Collection</strong><br>We collect account credentials, uploaded media, and interaction metrics to improve your feed experience.</p>
            <p><strong>2. Data Usage</strong><br>Your regional data context helps tailor content delivery and community safety standards.</p>
            <p><strong>3. Security</strong><br>We implement standard encryption to protect your account information.</p>
        `;
        legalModal.classList.remove("hidden");
    });

    // Close Legal Modal
    closeLegal.addEventListener("click", function() {
        legalModal.classList.add("hidden");
    });

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
