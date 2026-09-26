// Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const openCommentsBtn = document.getElementById('openCommentsBtn');
const closeCommentsBtn = document.getElementById('closeComments');
const commentModal = document.getElementById('commentModal');

// Switch between Home, Profile, Create views
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-target');
        
        if (targetView === 'home' || targetView === 'profile' || targetView === 'create') {
            // Hide all views
            views.forEach(v => v.classList.add('hidden'));
            
            // Show target view
            document.getElementById(targetView + 'View').classList.remove('hidden');
            
            // Update active nav state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        } else {
            alert(targetView.toUpperCase() + ' tab clicked!');
        }
    });
});

// Handle back/close buttons inside views
document.querySelectorAll('[data-target="home"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        views.forEach(v => v.classList.add('hidden'));
        document.getElementById('homeView').classList.remove('hidden');
        navItems.forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-target="home"]').classList.add('active');
    });
});

// Open Comments Modal
openCommentsBtn.addEventListener('click', () => {
    commentModal.classList.remove('hidden');
});

// Close Comments Modal
closeCommentsBtn.addEventListener('click', () => {
    commentModal.classList.add('hidden');
});
