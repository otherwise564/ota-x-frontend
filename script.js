/* =========================================================
   OTA X — SCRIPT.JS
   PART 1 / 2
   ========================================================= */

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentScreen = "homeScreen";
let currentCameraMode = "15s";
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];

let currentFollowers = 48600;
let liveApproved = false;


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(screenId);

  if (target) {
    target.classList.add("active");
    currentScreen = screenId;
  }

  window.scrollTo(0, 0);
}


/* =========================================================
   HOME FEED TABS
   ========================================================= */

function feedTab(tab) {
  const tabs = document.querySelectorAll(".feed-tab");

  tabs.forEach((button) => {
    button.classList.remove("active");
  });

  tabs.forEach((button) => {
    const text = button.textContent.trim().toLowerCase();

    if (
      (tab === "following" && text === "following") ||
      (tab === "for-you" && text === "for you")
    ) {
      button.classList.add("active");
    }
  });

  const status = document.getElementById("cameraStatus");

  if (status) {
    status.textContent =
      tab === "following"
        ? "Following feed selected"
        : "For You feed selected";
  }
}


/* =========================================================
   LIKE
   ========================================================= */

function toggleLike(button) {
  if (!button) return;

  button.classList.toggle("liked");

  const count = button.querySelector(".action-count");

  if (!count) return;

  let number = parseInt(
    count.textContent.replace(/[^\d]/g, ""),
    10
  );

  if (isNaN(number)) {
    number = 0;
  }

  if (button.classList.contains("liked")) {
    number++;
    count.textContent = formatNumber(number);
  } else {
    number--;
    if (number < 0) number = 0;
    count.textContent = formatNumber(number);
  }
}


/* =========================================================
   SAVE
   ========================================================= */

function toggleSave(button) {
  if (!button) return;

  button.classList.toggle("saved");

  if (button.classList.contains("saved")) {
    showToast("Saved to your collection");
  } else {
    showToast("Removed from saved");
  }
}


/* =========================================================
   SHARE
   ========================================================= */

async function sharePost() {
  const shareData = {
    title: "OTA X",
    text: "Check this post on OTA X",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied");
    }
  } catch (error) {
    console.log("Share cancelled");
  }
}


/* =========================================================
   FOLLOW CREATOR
   ========================================================= */

function followCreator(button) {
  if (!button) return;

  button.classList.toggle("following");

  if (button.classList.contains("following")) {
    button.textContent = "Following";
    showToast("Following creator");
  } else {
    button.textContent = "Follow";
    showToast("Unfollowed creator");
  }
}


/* =========================================================
   SEARCH
   ========================================================= */

function openSearch() {
  const panel = document.getElementById("searchPanel");

  if (panel) {
    panel.classList.add("active");
    panel.style.display = "block";
  }

  const input = document.getElementById("searchInput");

  if (input) {
    setTimeout(() => input.focus(), 150);
  }
}

function closeSearch() {
  const panel = document.getElementById("searchPanel");

  if (panel) {
    panel.classList.remove("active");
    panel.style.display = "none";
  }
}

function clearSearch() {
  const input = document.getElementById("searchInput");

  if (input) {
    input.value = "";
    input.focus();
  }

  const results = document.getElementById("searchResults");

  if (results) {
    results.innerHTML = "";
  }
}

function handleSearchKey(event) {
  if (event.key === "Enter") {
    searchOTA();
  }
}

function searchOTA() {
  const input = document.getElementById("searchInput");

  if (!input) return;

  const query = input.value.trim();

  if (!query) {
    showToast("Type something to search");
    return;
  }

  const results = document.getElementById("searchResults");

  if (results) {
    results.innerHTML = `
      <div style="
        padding:20px 5px;
        color:#aaa;
        font-size:13px;
      ">
        Searching OTA X for
        <strong style="color:#fff;">
          ${escapeHTML(query)}
        </strong>
      </div>
    `;
  }
}

function searchTag(tag) {
  const input = document.getElementById("searchInput");

  if (input) {
    input.value = tag;
  }

  searchOTA();
}


/* =========================================================
   COMMENTS
   ========================================================= */

function openComments() {
  const panel = document.getElementById("commentsPanel");

  if (!panel) return;

  panel.classList.add("active");
  panel.style.display = "flex";
}

function closeComments() {
  const panel = document.getElementById("commentsPanel");

  if (!panel) return;

  panel.classList.remove("active");
  panel.style.display = "none";

  closeStickerPanel();
}

function handleCommentKey(event) {
  if (event.key === "Enter") {
    sendComment();
  }
}

function sendComment() {
  const input = document.getElementById("commentInput");

  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  const list = document.querySelector(".comments-list");

  if (!list) return;

  const comment = document.createElement("div");

  comment.className = "comment";

  comment.innerHTML = `
    <div class="comment-avatar">Y</div>

    <div class="comment-body">
      <div class="comment-name">
        You
      </div>

      <div class="comment-text">
        ${escapeHTML(text)}
      </div>

      <div class="comment-actions">
        <button
          class="comment-action"
          onclick="likeComment(this)"
        >
          ♡ Like
        </button>

        <button
          class="comment-action"
        >
          Reply
        </button>
      </div>
    </div>
  `;

  list.appendChild(comment);

  input.value = "";

  list.scrollTop = list.scrollHeight;
}

function likeComment(button) {
  if (!button) return;

  button.classList.toggle("liked");

  button.textContent =
    button.classList.contains("liked")
      ? "♥ Liked"
      : "♡ Like";
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   STICKERS
   ========================================================= */

function toggleStickerPanel() {
  const panel = document.getElementById("stickerPanel");

  if (!panel) return;

  panel.classList.toggle("active");
}

function closeStickerPanel() {
  const panel = document.getElementById("stickerPanel");

  if (!panel) return;

  panel.classList.remove("active");
}

function sendSticker(sticker) {
  const input = document.getElementById("commentInput");

  if (!input) return;

  input.value += sticker;

  closeStickerPanel();

  input.focus();
}

function stickerTab(tab) {
  const tabs = document.querySelectorAll(".sticker-tab");

  tabs.forEach((button) => {
    button.classList.remove("active");
  });

  tabs.forEach((button) => {
    if (
      button.textContent.trim().toLowerCase() ===
      tab.toLowerCase()
    ) {
      button.classList.add("active");
    }
  });
}


/* =========================================================
   VOICE COMMENTS
   ========================================================= */

let voiceRecorder = null;
let voiceChunks = [];

function toggleVoiceComment() {
  const button = document.querySelector(".composer-mic");

  if (voiceRecorder && voiceRecorder.state === "recording") {
    stopVoiceComment();
    return;
  }

  startVoiceComment(button);
}

async function startVoiceComment(button) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast("Voice recording is not supported here");
    return;
  }

  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    voiceChunks = [];

    voiceRecorder = new MediaRecorder(stream);

    voiceRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        voiceChunks.push(event.data);
      }
    };

    voiceRecorder.onstop = () => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      addVoiceComment();
    };

    voiceRecorder.start();

    if (button) {
      button.classList.add("recording");
    }

    showToast("Recording voice comment...");
  } catch (error) {
    console.error(error);
    showToast("Microphone permission was not available");
  }
}

function stopVoiceComment() {
  if (
    voiceRecorder &&
    voiceRecorder.state === "recording"
  ) {
    voiceRecorder.stop();
  }

  const button = document.querySelector(".composer-mic");

  if (button) {
    button.classList.remove("recording");
  }
}

function addVoiceComment() {
  showToast("Voice comment recorded");
}


/* =========================================================
   CREATE SCREEN
   ========================================================= */

function openCreate() {
  showScreen("createScreen");

  const menu = document.getElementById("createMenu");

  if (menu) {
    menu.classList.remove("active");
  }
}

function closeCreate() {
  showScreen("homeScreen");
}

function toggleCreateMenu() {
  const menu = document.getElementById("createMenu");

  if (!menu) return;

  menu.classList.toggle("active");
}

function closeCreateMenu() {
  const menu = document.getElementById("createMenu");

  if (!menu) return;

  menu.classList.remove("active");
}


/* =========================================================
   CAMERA
   ========================================================= */

function addSound() {
  showToast("Sound selector opened");
}

function flipCamera() {
  showToast("Camera flipped");
}

function cameraTool(tool) {
  const names = {
    effects: "Effects",
    timer: "Timer",
    layout: "Layout",
    filters: "Filters"
  };

  showToast(
    (names[tool] || "Camera") + " selected"
  );
}

function expandCameraTools() {
  showToast("More camera tools");
}

function cameraDuration(duration) {
  currentCameraMode = duration;

  const buttons =
    document.querySelectorAll(
      ".camera-mode-selector button"
    );

  buttons.forEach((button) => {
    button.classList.remove("active");

    const text =
      button.textContent.trim().toLowerCase();

    if (
      text === duration.toLowerCase() ||
      (duration === "photo" && text === "photo") ||
      (duration === "template" && text === "template")
    ) {
      button.classList.add("active");
    }
  });
}

function cameraBottomTab(tab) {
  const buttons =
    document.querySelectorAll(".camera-tabs button");

  buttons.forEach((button) => {
    button.classList.remove("active");

    if (
      button.textContent.trim().toLowerCase() ===
      tab.toLowerCase()
    ) {
      button.classList.add("active");
    }
  });

  if (tab === "live") {
    showToast("LIVE selected");
  }

  if (tab === "post") {
    showToast("POST selected");
  }

  if (tab === "create") {
    showToast("CREATE selected");
  }
}


/* =========================================================
   MEDIA SELECTION
   ========================================================= */

function chooseMedia(side) {
  const input = document.getElementById("videoInput");

  if (input) {
    input.click();
  }
}

function chooseVideo() {
  const input = document.getElementById("videoInput");

  if (input) {
    input.click();
  }
}

function choosePhoto() {
  const input = document.getElementById("photoInput");

  if (input) {
    input.click();
  }
}

function handleVideoSelected(event) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) return;

  showToast(
    "Video selected: " + file.name
  );

  const status =
    document.getElementById("cameraStatus");

  if (status) {
    status.textContent =
      "Video selected";
  }
}

function handlePhotoSelected(event) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) return;

  showToast(
    "Photo selected: " + file.name
  );

  const status =
    document.getElementById("cameraStatus");

  if (status) {
    status.textContent =
      "Photo selected";
  }
}


/* =========================================================
   CAMERA RECORDING
   ========================================================= */

async function toggleRecording() {
  if (isRecording) {
    stopRecording();
    return;
  }

  await startRecording();
}

async function startRecording() {
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    showToast("Camera recording is not supported here");
    return;
  }

  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

    recordedChunks = [];

    mediaRecorder =
      new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      showToast("Recording finished");
    };

    mediaRecorder.start();

    isRecording = true;

    const recordButton =
      document.querySelector(".record-button");

    if (recordButton) {
      recordButton.classList.add("recording");
    }

    const status =
      document.getElementById("cameraStatus");

    if (status) {
      status.textContent = "Recording...";
    };

  } catch (error) {
    console.error(error);
    showToast("Camera or microphone permission was not available");
  }
}

function stopRecording() {
  if (
    mediaRecorder &&
    mediaRecorder.state === "recording"
  ) {
    mediaRecorder.stop();
  }

  isRecording = false;

  const recordButton =
    document.querySelector(".record-button");

  if (recordButton) {
    recordButton.classList.remove("recording");
  }

  const status =
    document.getElementById("cameraStatus");

  if (status) {
    status.textContent = "Camera ready";
  }
}


/* =========================================================
   LIVE
   ========================================================= */

function tryGoLive() {
  if (currentFollowers < 1000) {
    showToast(
      "LIVE access is not available yet"
    );
    return;
  }

  if (!liveApproved) {
    showToast(
      "LIVE access requires OTA X approval"
    );
    return;
  }

  showToast("LIVE access approved");
}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showToast(message) {
  let toast =
    document.getElementById("otaToast");

  if (!toast) {
    toast = document.createElement("div");

    toast.id = "otaToast";

    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "92px";
    toast.style.transform = "translateX(-50%)";
    toast.style.zIndex = "9999";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "12px";
    toast.style.background = "#ffffff";
    toast.style.color = "#000000";
    toast.style.fontSize = "12px";
    toast.style.fontWeight = "700";
    toast.style.boxShadow =
      "0 5px 25px rgba(0,0,0,.4)";

    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";

  clearTimeout(window.otaToastTimer);

  window.otaToastTimer =
    setTimeout(() => {
      toast.style.display = "none";
    }, 2200);
}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {
  if (number >= 1000000) {
    return (
      (number / 1000000)
        .toFixed(1)
        .replace(".0", "") +
      "M"
    );
  }

  if (number >= 1000) {
    return (
      (number / 1000)
        .toFixed(1)
        .replace(".0", "") +
      "K"
    );
  }

  return String(number);
     }
/* =========================================================
   OTA X — SCRIPT.JS
   PART 2 / 2
   ========================================================= */


/* =========================================================
   INBOX
   ========================================================= */

function openInbox() {
  showScreen("inboxScreen");
}

function closeInbox() {
  showScreen("homeScreen");
}

function openInboxMenu() {
  showToast("Inbox menu opened");
}

function openInboxSearch() {
  showToast("Inbox search opened");
}

function dismissInboxAlert() {
  const alert =
    document.getElementById("inboxAlert");

  if (alert) {
    alert.style.display = "none";
  }
}

function openActivity() {
  showToast("Activity opened");
}

function openChat(name) {
  showToast(
    "Opening chat" +
    (name ? " with " + name : "")
  );
}

function openMessageCamera(name) {
  showToast(
    "Camera for" +
    (name ? " " + name : "") +
    " opened"
  );
}


/* =========================================================
   STORIES
   ========================================================= */

function createStory() {
  showToast("Create your story");
}

function openStory(name) {
  showToast(
    "Opening" +
    (name ? " " + name : "") +
    "'s story"
  );
}

function addProfileStory() {
  showToast("Add a profile story");
}


/* =========================================================
   PROFILE
   ========================================================= */

function openProfile() {
  showScreen("profileScreen");
}

function closeProfile() {
  showScreen("homeScreen");
}

function editProfile() {
  showToast("Edit profile opened");
}

function switchAccount() {
  showToast("Account switcher opened");
}

function addFriends() {
  showToast("Find friends");
}

function openProfileMenu() {
  showToast("Profile menu opened");
}

function showFollowing() {
  showToast("Following list opened");
}

function showFollowers() {
  showToast("Followers list opened");
}

function showLikes() {
  showToast("Likes opened");
}


/* =========================================================
   PROFILE TABS
   ========================================================= */

function profileTab(tab) {
  const buttons =
    document.querySelectorAll(".profile-tab");

  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  buttons.forEach((button) => {
    const value =
      button.getAttribute("data-tab");

    const text =
      button.textContent.trim().toLowerCase();

    if (
      value === tab ||
      text === tab.toLowerCase()
    ) {
      button.classList.add("active");
    }
  });

  showToast(
    tab.charAt(0).toUpperCase() +
    tab.slice(1) +
    " selected"
  );
}

function openProfilePost(index) {
  showToast(
    "Opening post " + (index || "")
  );
}


/* =========================================================
   OTA X STUDIO
   ========================================================= */

function openStudio() {
  showToast("OTA X Studio opened");
}


/* =========================================================
   FRIENDS
   ========================================================= */

function openFriends() {
  showToast("Friends opened");
}


/* =========================================================
   CREATE MENU ACTIONS
   ========================================================= */

function openUploadVideo() {
  chooseVideo();
  closeCreateMenu();
}

function openUploadPhoto() {
  choosePhoto();
  closeCreateMenu();
}


/* =========================================================
   COMMENT COUNT
   ========================================================= */

function updateCommentCount() {
  const comments =
    document.querySelectorAll(
      ".comments-list .comment"
    );

  const buttons =
    document.querySelectorAll(
      ".post-action"
    );

  buttons.forEach((button) => {
    const text =
      button.textContent.toLowerCase();

    if (text.includes("comment")) {
      const count =
        button.querySelector(".action-count");

      if (count) {
        count.textContent =
          formatNumber(comments.length);
      }
    }
  });
}


/* =========================================================
   STICKER PHOTO / VIDEO
   ========================================================= */

function chooseStickerPhoto() {
  showToast("Choose a photo for your sticker");
}

function createPhotoSticker() {
  showToast("Photo sticker created");
}

function chooseStickerVideo() {
  showToast("Choose a video for your sticker");
}

function createVideoSticker() {
  showToast("Video sticker created");
}


/* =========================================================
   CREATE SCREEN SHORTCUTS
   ========================================================= */

function openCamera() {
  openCreate();
}


/* =========================================================
   SIMPLE SETTINGS ACTIONS
   ========================================================= */

function toggleDarkMode() {
  document.body.classList.toggle("light-mode");

  if (
    document.body.classList.contains("light-mode")
  ) {
    showToast("Light mode enabled");
  } else {
    showToast("Dark mode enabled");
  }
}


/* =========================================================
   CLICK OUTSIDE STICKER PANEL
   ========================================================= */

document.addEventListener(
  "click",
  function (event) {
    const panel =
      document.getElementById("stickerPanel");

    if (!panel) return;

    if (!panel.classList.contains("active")) {
      return;
    }

    const clickedSticker =
      event.target.closest(
        ".composer-sticker"
      );

    const clickedPanel =
      event.target.closest(
        "#stickerPanel"
      );

    if (
      !clickedSticker &&
      !clickedPanel
    ) {
      closeStickerPanel();
    }
  }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  function (event) {
    if (event.key !== "Escape") {
      return;
    }

    closeSearch();
    closeComments();
    closeStickerPanel();
    closeCreateMenu();
  }
);


/* =========================================================
   PREVENT BUTTON DOUBLE ACTION
   ========================================================= */

document.addEventListener(
  "click",
  function (event) {
    const button =
      event.target.closest("button");

    if (!button) return;

    button.classList.add("ota-clicked");

    setTimeout(() => {
      button.classList.remove("ota-clicked");
    }, 150);
  }
);


/* =========================================================
   INITIAL OTA X STATE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    showScreen("homeScreen");

    const searchPanel =
      document.getElementById("searchPanel");

    if (searchPanel) {
      searchPanel.classList.remove("active");
      searchPanel.style.display = "none";
    }

    const commentsPanel =
      document.getElementById("commentsPanel");

    if (commentsPanel) {
      commentsPanel.classList.remove("active");
      commentsPanel.style.display = "none";
    }

    const stickerPanel =
      document.getElementById("stickerPanel");

    if (stickerPanel) {
      stickerPanel.classList.remove("active");
    }

    const createMenu =
      document.getElementById("createMenu");

    if (createMenu) {
      createMenu.classList.remove("active");
    }

    console.log(
      "OTA X frontend initialized successfully."
    );
  }
);
