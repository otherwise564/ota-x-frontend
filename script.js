let mediaStream = null;
let useFrontCamera = true;

// Switch between Email and Phone tabs on the Auth screen
function setAuthMode(mode) {
    document.getElementById('tab-email').classList.toggle('active', mode === 'email');
    document.getElementById('tab-phone').classList.toggle('active', mode === 'phone');
}

// Core screen-switching router function
function switchScreen(screenId, navElement) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    if (navElement) {
        document.querySelectorAll('.bottom-nav .nav-item, .bottom-nav .create-btn-nav').forEach(n => n.classList.remove('active'));
        navElement.classList.add('active');
    }

    if (screenId !== 'camera-screen' && mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

// Initialize live camera stream for the creation studio
async function startCamera() {
    try {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFrontCamera ? 'user' : 'environment' },
            audio: true
        });
        
        const videoElement = document.getElementById('live-camera');
        if (videoElement) {
            videoElement.srcObject = mediaStream;
        }
    } catch (err) {
        console.error("Camera access error:", err);
        alert("Unable to access camera. Please check permissions.");
    }
}

// Toggle between front and rear cameras
function toggleCamera() {
    useFrontCamera = !useFrontCamera;
    startCamera();
}

// Handle Sign Up action and reveal bottom navigation
function handleSignUp() {
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        mainNav.style.display = 'flex';
    }
    switchScreen('home-screen', document.querySelector('.bottom-nav .nav-item'));
}

// Handle Log In action
function handleSignIn() {
    handleSignUp();
}
