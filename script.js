/**
 * Switch between main app views (Home, Friends, Inbox, Profile)
 * and update the bottom navigation bar active states.
 */
const switchScreen = (screenId, element) => {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    }
};

/**
 * Open and close the sliding video comments modal.
 */
const openComments = () => {
    document.getElementById('comments-modal').classList.add('open');
};

const closeComments = () => {
    document.getElementById('comments-modal').classList.remove('open');
};
