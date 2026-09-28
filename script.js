document.addEventListener("DOMContentLoaded", function() {
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");
    const nextAuthBtn = document.getElementById("next-auth-btn");
    const publishPostBtn = document.getElementById("publish-post-btn");
    const postCaptionInput = document.getElementById("post-caption");
    const feedTab = document.getElementById("feed-tab");
    const userCoinsSpan = document.getElementById("user-coins");

    // Restore saved coins if available
    if (localStorage.getItem('ota_coins') && userCoinsSpan) {
        userCoinsSpan.innerText = localStorage.getItem('ota_coins');
    }

    // Handle Log In / Sign Up button click -> enters the app
    if (nextAuthBtn) {
        nextAuthBtn.addEventListener("click", function() {
            const userInput = document.getElementById("auth-input")?.value;
            const passwordInput = document.getElementById("auth-password")?.value;

            // Simple validation check
            if (authScreen && mainApp) {
                authScreen.classList.add("hidden");
                mainApp.classList.remove("hidden");
            }
        });
    }

    // Real-Time Post Publishing Logic (Pushes upload directly to feed)
    if (publishPostBtn) {
        publishPostBtn.addEventListener("click", function() {
            const caption = postCaptionInput ? postCaptionInput.value.trim() : "";

            if (!caption) {
                alert("Please write a caption before posting!");
                return;
            }

            // Create new feed item dynamically
            const newFeedItem = document.createElement("div");
            newFeedItem.className = "video-feed-item";
            newFeedItem.innerHTML = `
                <div class="video-overlay-info">
                    <h3>@OX_Creator</h3>
                    <p>${escapeHtml(caption)}</p>
                    <div class="sound-tag"><i class="fa-solid fa-music"></i> <span>Original Sound - OTA X</span></div>
                </div>
                <div class="right-action-bar">
                    <div class="action-item-wrapper">
                        <button class="action-btn like-btn" onclick="toggleLike(this)"><i class="fa-solid fa-heart"></i></button>
                        <span class="action-count">0</span>
                    </div>
                </div>
            `;

            if (feedTab) {
                feedTab.prepend(newFeedItem);
            }

            // Also add to profile grid view if present
            const postsGrid = document.getElementById("user-posts-grid");
            if (postsGrid) {
                if (postsGrid.querySelector(".ota-empty-post")) {
                    postsGrid.innerHTML = "";
                }
                const gridItem = document.createElement("div");
                gridItem.className = "grid-post-item";
                gridItem.style.background = "#181818";
                gridItem.innerHTML = `<span><i class="fa-solid fa-play"></i> 0</span>`;
                postsGrid.prepend(gridItem);
            }

            alert("Post published to OTA X Feed successfully!");
            if (postCaptionInput) postCaptionInput.value = "";

            // Switch to Home Feed tab automatically to view it
            const feedNavBtn = document.querySelector('[data-tab="feed-tab"]');
            if (feedNavBtn) feedNavBtn.click();
        });
    }

    // Helper to sanitize text input
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Like Toggle Functionality
    window.toggleLike = function(btn) {
        btn.classList.toggle("active");
        const span = btn.parentElement.querySelector(".action-count");
        if (span) {
            let count = parseInt(span.innerText) || 0;
            if (btn.classList.contains("active")) {
                span.innerText = count + 1;
            } else {
                span.innerText = Math.max(0, count - 1);
            }
        }
    }

    // Bottom Navigation Tab Switching Logic
    const navButtons = document.querySelectorAll(".bot-nav-btn");
    const appTabs = document.querySelectorAll(".app-tab");

    navButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            const targetTabId = this.getAttribute("data-tab");
            if (!targetTabId) return;
            
            navButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            appTabs.forEach(tab => {
                if (tab.id === targetTabId) {
                    tab.classList.remove("hidden");
                } else {
                    tab.classList.add("hidden");
                }
            });
        });
    });
});

                          
