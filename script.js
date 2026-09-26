const commentInput = document.getElementById('commentInput');
const commentsList = document.getElementById('commentsList');
const sendCommentBtn = document.getElementById('sendCommentBtn');
const mediaUpload = document.getElementById('mediaUpload');
const stickerBtn = document.getElementById('stickerBtn');
const stickerDrawer = document.getElementById('stickerDrawer');
const videoOverlay = document.getElementById('videoOverlay');
const overlayMedia = document.getElementById('overlayMedia');

let selectedMediaUrl = null;

// Handle media selection via camera icon (Photo/Video comment reply)
mediaUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedMediaUrl = URL.createObjectURL(file);
        alert('Media attached! Now post your comment.');
    }
});

// Toggle Sticker Drawer
stickerBtn.addEventListener('click', () => {
    stickerDrawer.classList.toggle('hidden');
});

// Insert sticker into input text
document.querySelectorAll('.sticker').forEach(sticker => {
    sticker.addEventListener('click', () => {
        commentInput.value += sticker.getAttribute('data-sticker');
        stickerDrawer.classList.add('hidden');
    });
});

// Post Comment with Text, Stickers, or Attached Media
sendCommentBtn.addEventListener('click', () => {
    const text = commentInput.value.trim();
    if (!text && !selectedMediaUrl) return;

    const commentItem = document.createElement('div');
    commentItem.classList.add('comment-item');
    
    let contentHtml = `<p>${text}</p>`;
    
    if (selectedMediaUrl) {
        contentHtml += `<img src="${selectedMediaUrl}" alt="Media reply">`;
        // Also showcase the video story overlay feature if a media reply is sent
        overlayMedia.src = selectedMediaUrl;
        videoOverlay.classList.remove('hidden');
    }

    commentItem.innerHTML = contentHtml;
    commentsList.appendChild(commentItem);

    // Reset inputs
    commentInput.value = '';
    selectedMediaUrl = null;
    mediaUpload.value = '';
});
