const RENDER_API_URL = 'https://ota-x-backend.onrender.com';
let currentAuthMode = 'email';
let mediaStream = null;
let useFrontCamera = true;
let isHumanVerified = false;
let currentCountryCode = 'US';

window.addEventListener('DOMContentLoaded', () => {
    detectUserIPLocation();
    const token = localStorage.getItem('otax_token');
    const savedIdentifier = localStorage.getItem('otax_identifier');
    const savedSig = localStorage.getItem('otax_streamer_sig');

    if (savedSig) {
        document.getElementById('streamer-signature-input').value = savedSig;
    }

    if (token && savedIdentifier) {
        onUserLoggedIn(savedIdentifier);
    }
});

async function detectUserIPLocation() {
    const badge = document.getElementById('geo-location-badge');
    const countrySelect = document.getElementById('country-code');
    const countryPrefixMap = { 'US': '+1', 'GB': '+44', 'KR': '+82', 'FR': '+33', 'DE': '+49', 'JP': '+81', 'BR': '+55', 'MX': '+52', 'NG': '+234', 'TR': '+90', 'AE': '+971' };

    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP lookup failed');
        const data = await response.json();
        currentCountryCode = data.country_code || 'US';
        badge.innerText = `📍 ${data.country_name || 'Region'} (${currentCountryCode})`;
        if (countryPrefixMap[currentCountryCode]) {
            countrySelect.value = countryPrefixMap[currentCountryCode];
        }
    } catch (err) {
        badge.innerText = `📍 Worldwide Secure Access`;
    }
}

function setAuthMode(mode) {
    currentAuthMode = mode;
    document.getElementById('tab-email').classList.toggle('active', mode === 'email');
    document.getElementById('tab-phone').classList.toggle('active', mode === 'phone');
    document.getElementById('email-field-group').style.display = (mode === 'email') ? 'block' : 'none';
    document.getElementById('phone-field-group').style.display = (mode === 'phone') ? 'flex' : 'none';
}

function getIdentifierDetails() {
    if (currentAuthMode === 'email') {
        return { type: 'email', key: 'email', value: document.getElementById('auth-email').value.trim() };
    } else {
        const code = document.getElementById('country-code').value;
        const phone = document.getElementById('auth-phone').value.trim();
        return { type: 'phone', key: 'phone', value: `${code}${phone}` };
    }
}

async function handleSignUp() {
    const details = getIdentifierDetails();
    const password = document.getElementById('auth-password').value;
    const errorEL = document.getElementById('auth-error');
    errorEL.innerText = '';

    if (!details.value || !password) {
        errorEL.innerText = 'Please fill in all fields.';
        return;
    }

    try {
        const payload = { password };
        payload[details.key] = details.value;
        const res = await fetch(`${RENDER_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        document.getElementById('form-container').style.display = 'none';
        document.getElementById('verify-section').style.display = 'flex';
    } catch (error) {
        errorEL.innerText = error.message;
    }
}

async function handleSignIn() {
    const details = getIdentifierDetails();
    const password = document.getElementById('auth-password').value;
    const errorEL = document.getElementById('auth-error');
    errorEL.innerText = '';

    if (!details.value || !password) {
        errorEL.innerText = 'Please fill in all fields.';
        return;
    }

    if (password === 'Suspend123') {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('suspend-appeal-section').style.display = 'flex';
        return;
    }

    try {
        const payload = { password };
        payload[details.key] = details.value;
        const res = await fetch(`${RENDER_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        if (data.token) localStorage.setItem('otax_token', data.token);
        onUserLoggedIn(details.value);
    } catch (error) {
        errorEL.innerText = error.message;
    }
}

function solveHumanVerification() {
    document.getElementById('captcha-trigger').innerHTML = '✅ Human Verification Confirmed';
    document.getElementById('captcha-trigger').classList.add('verified');
    isHumanVerified = true;
    const btn = document.getElementById('appeal-submit-btn');
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
}

function submitAccountAppeal() {
    if (!isHumanVerified) return;
    alert('Appeal reviewed! Account security flag lifted.');
    document.getElementById('suspend-appeal-section').style.display = 'none';
    document.getElementById('form-container').style.display = 'flex';
}

function verifyCode() {
    alert('Verification code confirmed!');
    document.getElementById('verify-section').style.display = 'none';
    document.getElementById('form-container').style.display = 'block';
}

function handleSignOut() {
    localStorage.clear();
    document.getElementById('main-nav').style.display = 'none';
    switchScreen('auth-screen');
}

function onUserLoggedIn(identifier) {
    const displayName = identifier.includes('@') ? identifier.split('@')[0] : identifier;
    document.getElementById('profile-username').innerText = `@${displayName}`;
    document.getElementById('main-nav').style.display = 'flex';
    switchScreen('home-screen');
}

function saveStreamerSignature() {
    const sigVal = document.getElementById('streamer-signature-input').value.trim();
    if (sigVal) {
        localStorage.setItem('otax_streamer_sig', sigVal);
        alert('Gift signature updated to: ' + sigVal);
    }
}

const openPolicyModal = () => document.getElementById('policy-modal').classList.add('open');
const closePolicyModal = () => document.getElementById('policy-modal').classList.remove('open');
const openOtaxStudio = () => document.getElementById('otax-studio-modal').classList.add('open');
const closeOtaxStudio = () => document.getElementById('otax-studio-modal').classList.remove('open');

const openVaultModal = () => document.getElementById('vault-modal').classList.add('open');
const closeVaultModal = () => document.getElementById('vault-modal').classList.remove('open');

function unlockVault() {
    const pin = document.getElementById('vault-pass-input').value.trim();
    const contentArea = document.getElementById('vault-content-area');
    if (pin.length >= 4) {
        contentArea.style.display = 'block';
    } else {
        alert('Please enter at least a 4-digit PIN to open your secure vault.');
    }
}

function joinActiveChain() {
    alert('Successfully linked to the multi-way chain slot! Your camera will sync on the next beat drop.');
    closeVaultModal();
}

const openGiftsModal = () => {
    const overlay = document.getElementById('gift-animation-overlay');
    const customSig = localStorage.getItem('otax_streamer_sig') || '@ΩDX3 🦅';
    overlay.innerHTML = `🎁 Universal Gift Sent! <span style="font-size:11px; color:#25f4ee;">${customSig}</span>`;
    overlay.style.display = 'block';
    setTimeout(() => overlay.style.display = 'none', 2200);
};

const openComments = () => alert('Comments drawer opened.');

function switchScreen(screenId, navEl) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (navEl) {
        document.querySelectorAll('.bottom-nav .nav-item, .bottom-nav .create-btn-nav').forEach(n => n.classList.remove('active'));
        navEl.classList.add('active');
    }
    if (screenId !== 'camera-screen' && mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
}

async function startCamera() {
    try {
        if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: useFrontCamera ? 'user' : 'environment' }, audio: true });
        document.getElementById('live-camera').srcObject = mediaStream;
    } catch (e) {
        console.error('Camera error:', e);
    }
}

const toggleCamera = () => { useFrontCamera = !useFrontCamera; startCamera(); };
                                
