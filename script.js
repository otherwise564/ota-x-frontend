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
   OTA X CREATE / EDIT STATE
   ========================================================= */

let otaCameraStream = null;
let otaMediaRecorder = null;
let otaRecordedChunks = [];
let otaCameraFacing = "user";
let otaCreateMode = "video";
let otaRecording = false;
let otaCurrentMediaURL = null;


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

    if (number < 0) {
      number = 0;
    }

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
      await navigator.clipboard.writeText(
        window.location.href
      );

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
    setTimeout(() => {
      input.focus();
    }, 150);
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

  const results =
    document.getElementById("searchResults");

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
  const input =
    document.getElementById("searchInput");

  if (input) {
    input.value = tag;
  }

  searchOTA();
}


/* =========================================================
   COMMENTS
   ========================================================= */

function openComments() {
  const panel =
    document.getElementById("commentsPanel");

  if (!panel) return;

  panel.classList.add("active");
  panel.style.display = "flex";
}


function closeComments() {
  const panel =
    document.getElementById("commentsPanel");

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
  const input =
    document.getElementById("commentInput");

  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  const list =
    document.querySelector(".comments-list");

  if (!list) return;

  const comment =
    document.createElement("div");

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
  const panel =
    document.getElementById("stickerPanel");

  if (!panel) return;

  panel.classList.toggle("active");
}


function closeStickerPanel() {
  const panel =
    document.getElementById("stickerPanel");

  if (!panel) return;

  panel.classList.remove("active");
}


function sendSticker(sticker) {
  const input =
    document.getElementById("commentInput");

  if (!input) return;

  input.value += sticker;

  closeStickerPanel();

  input.focus();
}


function stickerTab(tab) {
  const tabs =
    document.querySelectorAll(".sticker-tab");

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
  const button =
    document.querySelector(".composer-mic");

  if (
    voiceRecorder &&
    voiceRecorder.state === "recording"
  ) {
    stopVoiceComment();
    return;
  }

  startVoiceComment(button);
}


async function startVoiceComment(button) {
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    showToast(
      "Voice recording is not supported here"
    );

    return;
  }

  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    voiceChunks = [];

    voiceRecorder =
      new MediaRecorder(stream);

    voiceRecorder.ondataavailable =
      (event) => {

        if (event.data.size > 0) {
          voiceChunks.push(event.data);
        }

      };


    voiceRecorder.onstop = () => {

      stream.getTracks().forEach(
        (track) => {
          track.stop();
        }
      );

      addVoiceComment();

    };


    voiceRecorder.start();

    if (button) {
      button.classList.add("recording");
    }

    showToast(
      "Recording voice comment..."
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Microphone permission was not available"
    );

  }
}


function stopVoiceComment() {
  if (
    voiceRecorder &&
    voiceRecorder.state === "recording"
  ) {
    voiceRecorder.stop();
  }

  const button =
    document.querySelector(".composer-mic");

  if (button) {
    button.classList.remove("recording");
  }
}


function addVoiceComment() {
  showToast("Voice comment recorded");
}


/* =========================================================
   OLD CREATE SCREEN
   ========================================================= */

function openCreate() {
  showScreen("createScreen");

  const menu =
    document.getElementById("createMenu");

  if (menu) {
    menu.classList.remove("active");
  }
}


function closeCreate() {
  showScreen("homeScreen");
}


function toggleCreateMenu() {
  const menu =
    document.getElementById("createMenu");

  if (!menu) return;

  menu.classList.toggle("active");
}


function closeCreateMenu() {
  const menu =
    document.getElementById("createMenu");

  if (!menu) return;

  menu.classList.remove("active");
}


/* =========================================================
   OTA X CREATE — OPEN
   ========================================================= */

function openOtaCreate() {

  const screen =
    document.getElementById(
      "otaCreateScreen"
    );

  if (!screen) {
    showToast(
      "OTA X Create screen is not connected"
    );

    return;
  }

  screen.classList.add("active");

  otaSetMode("video");

  otaStartCamera();
}


/* =========================================================
   OTA X CREATE — CLOSE
   ========================================================= */

function closeOtaCreate() {

  const screen =
    document.getElementById(
      "otaCreateScreen"
    );

  if (screen) {
    screen.classList.remove("active");
  }

  otaStopCamera();

  otaRecording = false;

  const button =
    document.getElementById(
      "otaRecordButton"
    );

  if (button) {
    button.classList.remove(
      "recording"
    );
  }
}


/* =========================================================
   OTA X CAMERA
   ========================================================= */

async function otaStartCamera() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    showToast(
      "Camera is not supported here"
    );

    return;
  }

  try {

    otaStopCamera();

    otaCameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: otaCameraFacing
        },
        audio: true
      });


    const video =
      document.getElementById(
        "otaCameraVideo"
      );


    if (video) {

      video.srcObject =
        otaCameraStream;

      video.muted = true;

      video.playsInline = true;

      await video.play().catch(
        () => {}
      );

    }


    const empty =
      document.getElementById(
        "otaCameraEmpty"
      );

    if (empty) {
      empty.style.display = "none";
    }


  } catch (error) {

    console.error(
      "OTA X camera error:",
      error
    );

    const empty =
      document.getElementById(
        "otaCameraEmpty"
      );

    if (empty) {
      empty.style.display = "flex";
    }

    showToast(
      "Camera permission was not available"
    );

  }
}


/* =========================================================
   OTA X STOP CAMERA
   ========================================================= */

function otaStopCamera() {

  if (otaCameraStream) {

    otaCameraStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    otaCameraStream = null;

  }

}


/* =========================================================
   OTA X PHOTO / VIDEO MODE
   ========================================================= */

function otaSetMode(mode) {

  otaCreateMode = mode;

  const photo =
    document.getElementById(
      "otaPhotoMode"
    );

  const video =
    document.getElementById(
      "otaVideoMode"
    );


  if (photo) {

    photo.classList.toggle(
      "active",
      mode === "photo"
    );

  }


  if (video) {

    video.classList.toggle(
      "active",
      mode === "video"
    );

  }

}


/* =========================================================
   OTA X RECORD OR CAPTURE
   ========================================================= */

function otaRecordOrCapture() {

  if (otaCreateMode === "photo") {

    otaCapturePhoto();

    return;
  }


  if (otaRecording) {

    otaStopRecording();

  } else {

    otaStartRecording();

  }

}


/* =========================================================
   OTA X START RECORDING
   ========================================================= */

function otaStartRecording() {

  if (!otaCameraStream) {

    showToast(
      "Camera is not ready yet"
    );

    return;
  }


  otaRecordedChunks = [];


  try {

    otaMediaRecorder =
      new MediaRecorder(
        otaCameraStream
      );

  } catch (error) {

    showToast(
      "Video recording is not supported here"
    );

    return;

  }


  otaMediaRecorder.ondataavailable =
    (event) => {

      if (
        event.data &&
        event.data.size > 0
      ) {

        otaRecordedChunks.push(
          event.data
        );

      }

    };


  otaMediaRecorder.onstop =
    () => {

      const blob =
        new Blob(
          otaRecordedChunks,
          {
            type:
              otaMediaRecorder.mimeType ||
              "video/webm"
          }
        );

      otaOpenEditWithVideo(blob);

    };


  otaMediaRecorder.start();

  otaRecording = true;


  const button =
    document.getElementById(
      "otaRecordButton"
    );

  if (button) {

    button.classList.add(
      "recording"
    );

  }


  showToast(
    "Recording..."
  );

}


/* =========================================================
   OTA X STOP RECORDING
   ========================================================= */

function otaStopRecording() {

  if (
    otaMediaRecorder &&
    otaMediaRecorder.state !==
      "inactive"
  ) {

    otaMediaRecorder.stop();

  }

  otaRecording = false;


  const button =
    document.getElementById(
      "otaRecordButton"
    );

  if (button) {

    button.classList.remove(
      "recording"
    );

  }

}


/* =========================================================
   OTA X TAKE PHOTO
   ========================================================= */

function otaCapturePhoto() {

  const video =
    document.getElementById(
      "otaCameraVideo"
    );


  if (
    !video ||
    !video.videoWidth
  ) {

    showToast(
      "Camera is not ready yet"
    );

    return;
  }


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;


  const context =
    canvas.getContext(
      "2d"
    );


  if (
    otaCameraFacing ===
    "user"
  ) {

    context.translate(
      canvas.width,
      0
    );

    context.scale(
      -1,
      1
    );

  }


  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  canvas.toBlob(
    (blob) => {

      if (blob) {
        otaOpenEditWithImage(
          blob
        );
      }

    },
    "image/jpeg",
    0.92
  );

}


/* =========================================================
   OTA X UPLOAD
   ========================================================= */

function otaUploadMedia() {

  const input =
    document.getElementById(
      "otaMediaInput"
    );

  if (input) {
    input.click();
  }

}


function otaHandleMedia(input) {

  const file =
    input.files &&
    input.files[0];


  if (!file) return;


  if (
    file.type.startsWith(
      "video/"
    )
  ) {

    otaOpenEditWithVideo(
      file
    );

  } else if (
    file.type.startsWith(
      "image/"
    )
  ) {

    otaOpenEditWithImage(
      file
    );

  } else {

    showToast(
      "Please choose a photo or video"
    );

  }


  input.value = "";
}


/* =========================================================
   OTA X OPEN EDIT WITH VIDEO
   ========================================================= */

function otaOpenEditWithVideo(
  blob
) {

  otaStopCamera();


  const create =
    document.getElementById(
      "otaCreateScreen"
    );

  if (create) {
    create.classList.remove(
      "active"
    );
  }


  const screen =
    document.getElementById(
      "otaEditScreen"
    );

  const video =
    document.getElementById(
      "otaEditVideo"
    );

  const image =
    document.getElementById(
      "otaEditImage"
    );

  const placeholder =
    document.getElementById(
      "otaPreviewPlaceholder"
    );


  if (
    !screen ||
    !video ||
    !image ||
    !placeholder
  ) {

    showToast(
      "OTA X Edit screen is not connected"
    );

    return;
  }


  if (otaCurrentMediaURL) {

    URL.revokeObjectURL(
      otaCurrentMediaURL
    );

  }


  otaCurrentMediaURL =
    URL.createObjectURL(
      blob
    );


  video.src =
    otaCurrentMediaURL;

  video.style.display =
    "block";

  image.style.display =
    "none";

  placeholder.style.display =
    "none";


  screen.classList.add(
    "active"
  );

}


/* =========================================================
   OTA X OPEN EDIT WITH PHOTO
   ========================================================= */

function otaOpenEditWithImage(
  blob
) {

  otaStopCamera();


  const create =
    document.getElementById(
      "otaCreateScreen"
    );

  if (create) {
    create.classList.remove(
      "active"
    );
  }


  const screen =
    document.getElementById(
      "otaEditScreen"
    );

  const video =
    document.getElemen
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
    document.getElementById(
      "inboxAlert"
    );

  if (alert) {
    alert.style.display =
      "none";
  }

}


function openActivity() {
  showToast("Activity opened");
}


function openChat(name) {

  showToast(
    "Opening chat" +
    (name
      ? " with " + name
      : "")
  );

}


function openMessageCamera(name) {

  showToast(
    "Camera for" +
    (name
      ? " " + name
      : "") +
    " opened"
  );

}


/* =========================================================
   STORIES
   ========================================================= */

function createStory() {
  showToast(
    "Create your story"
  );
}


function openStory(name) {

  showToast(
    "Opening" +
    (name
      ? " " + name
      : "") +
    "'s story"
  );

}


function addProfileStory() {

  showToast(
    "Add a profile story"
  );

}


/* =========================================================
   PROFILE
   ========================================================= */

function openProfile() {
  showScreen(
    "profileScreen"
  );
}


function closeProfile() {
  showScreen(
    "homeScreen"
  );
}


function editProfile() {
  showToast(
    "Edit profile opened"
  );
}


function switchAccount() {
  showToast(
    "Account switcher opened"
  );
}


function addFriends() {
  showToast(
    "Find friends"
  );
}


function openProfileMenu() {
  showToast(
    "Profile menu opened"
  );
}


function showFollowing() {
  showToast(
    "Following list opened"
  );
}


function showFollowers() {
  showToast(
    "Followers list opened"
  );
}


function showLikes() {
  showToast(
    "Likes opened"
  );
}


/* =========================================================
   PROFILE TABS
   ========================================================= */

function profileTab(tab) {

  const buttons =
    document.querySelectorAll(
      ".profile-tab"
    );


  buttons.forEach(
    (button) => {
      button.classList.remove(
        "active"
      );
    }
  );


  buttons.forEach(
    (button) => {

      const value =
        button.getAttribute(
          "data-tab"
        );


      const text =
        button.textContent
          .trim()
          .toLowerCase();


      if (
        value === tab ||
        text ===
          tab.toLowerCase()
      ) {

        button.classList.add(
          "active"
        );

      }

    }
  );


  showToast(
    tab.charAt(0).toUpperCase() +
    tab.slice(1) +
    " selected"
  );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {
  showScreen(
    "settingsScreen"
  );
}


function closeSettings() {
  showScreen(
    "profileScreen"
  );
}


function openSetting(name) {

  showToast(
    (name || "Setting") +
    " opened"
  );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function openNotifications() {
  showScreen(
    "notificationsScreen"
  );
}


function closeNotifications() {
  showScreen(
    "homeScreen"
  );
}


/* =========================================================
   FRIENDS
   ========================================================= */

function openFriends() {
  showScreen(
    "friendsScreen"
  );
}


function closeFriends() {
  showScreen(
    "homeScreen"
  );
}


/* =========================================================
   CREATOR STUDIO
   ========================================================= */

function openCreatorStudio() {
  showScreen(
    "creatorStudioScreen"
  );
}


function closeCreatorStudio() {
  showScreen(
    "profileScreen"
  );
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

  document.body.classList.toggle(
    "light-mode"
  );


  const isLight =
    document.body.classList.contains(
      "light-mode"
    );


  localStorage.setItem(
    "otaTheme",
    isLight
      ? "light"
      : "dark"
  );

}


/* =========================================================
   LOAD SAVED THEME
   ========================================================= */

function loadSavedTheme() {

  const saved =
    localStorage.getItem(
      "otaTheme"
    );


  if (saved === "light") {

    document.body.classList.add(
      "light-mode"
    );

  }

}


/* =========================================================
   PANEL CLOSE HELPERS
   ========================================================= */

function closePanelById(id) {

  const panel =
    document.getElementById(id);

  if (!panel) return;

  panel.classList.remove(
    "active"
  );

  panel.style.display =
    "none";

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    const otaEdit =
      document.getElementById(
        "otaEditScreen"
      );


    const otaCreate =
      document.getElementById(
        "otaCreateScreen"
      );


    if (
      otaEdit &&
      otaEdit.classList.contains(
        "active"
      )
    ) {

      otaEdit.classList.remove(
        "active"
      );

      return;

    }


    if (
      otaCreate &&
      otaCreate.classList.contains(
        "active"
      )
    ) {

      closeOtaCreate();

      return;

    }


    closeSearch();

    closeComments();

    closeStickerPanel();

  }
);


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadSavedTheme();

  }
);


/* =========================================================
   OTA X CAMERA CLEANUP
   ========================================================= */

window.addEventListener(
  "beforeunload",
  function() {

    otaStopCamera();


    if (
      otaCurrentMediaURL
    ) {

      URL.revokeObjectURL(
        otaCurrentMediaURL
      );

    }

  }
);


/* =========================================================
   OTA X CREATE BUTTON HELPER
   =========================================================
   
   Your Create + button should use:

   onclick="openOtaCreate()"

   Do NOT change the + icon itself.
   ========================================================= */


/* =========================================================
   OTA X READY
   ========================================================= */

console.log(
  "OTA X Script loaded successfully."
);
