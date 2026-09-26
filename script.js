/* =========================
   OTA X — MAIN SCRIPT
========================= */


/* =========================
   LIKE
========================= */

function toggleLike(button) {
  button.classList.toggle("active");

  const count = button.querySelector("span");

  if (!count) return;

  let number = parseFloat(
    count.textContent.replace("K", "").replace("M", "")
  );

  if (count.textContent.includes("M")) {
    number *= 1000;
  }

  if (button.classList.contains("active")) {
    number += 0.1;
  } else {
    number -= 0.1;
  }

  if (number < 0) number = 0;

  if (number >= 1000) {
    count.textContent = (number / 1000).toFixed(1) + "M";
  } else {
    count.textContent = number.toFixed(1) + "K";
  }
}


/* =========================
   SEARCH
========================= */

function openSearch() {
  const panel = document.getElementById("searchPanel");

  if (panel) {
    panel.classList.add("open");
  }
}

function closeSearch() {
  const panel = document.getElementById("searchPanel");

  if (panel) {
    panel.classList.remove("open");
  }
}


/* =========================
   COMMENTS
========================= */

function openComments() {
  const comments = document.getElementById("comments");

  if (comments) {
    comments.classList.add("open");
  }
}

function closeComments() {
  const comments = document.getElementById("comments");

  if (comments) {
    comments.classList.remove("open");
  }

  const stickerPanel = document.getElementById("stickerPanel");

  if (stickerPanel) {
    stickerPanel.classList.remove("open");
  }
}


/* =========================
   SEND COMMENT
========================= */

function sendComment() {
  const input = document.getElementById("commentInput");
  const list = document.getElementById("commentList");

  if (!input || !list) return;

  const text = input.value.trim();

  if (!text) return;

  const comment = document.createElement("div");

  comment.className = "comment";

  comment.innerHTML = `
    <div class="comment-photo">Y</div>

    <div class="comment-body">

      <div class="comment-name">@you</div>

      <div class="comment-text">
        ${escapeHTML(text)}
      </div>

      <div class="comment-tools">
        <span>now</span>
        <button>♡</button>
        <button>Reply</button>
      </div>

    </div>
  `;

  list.appendChild(comment);

  input.value = "";

  updateCommentCount();

  list.scrollTop = list.scrollHeight;
}


/* =========================
   COMMENT ENTER KEY
========================= */

function handleCommentKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendComment();
  }
}


/* =========================
   SAFE TEXT
========================= */

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


/* =========================
   COMMENT COUNT
========================= */

function updateCommentCount() {
  const list = document.getElementById("commentList");
  const count = document.getElementById("commentCount");

  if (!list || !count) return;

  const comments = list.querySelectorAll(".comment").length;

  count.textContent = comments;
}


/* =========================
   STICKER PANEL
========================= */

function toggleStickerPanel() {
  const panel = document.getElementById("stickerPanel");

  if (!panel) return;

  panel.classList.toggle("open");
}


/* =========================
   SEND STICKER
========================= */

function sendSticker(sticker) {
  const list = document.getElementById("commentList");

  if (!list) return;

  const comment = document.createElement("div");

  comment.className = "comment";

  comment.innerHTML = `
    <div class="comment-photo">Y</div>

    <div class="comment-body">

      <div class="comment-name">@you</div>

      <div class="comment-text" style="font-size:32px;">
        ${escapeHTML(sticker)}
      </div>

      <div class="comment-tools">
        <span>now</span>
        <button>♡</button>
      </div>

    </div>
  `;

  list.appendChild(comment);

  updateCommentCount();

  const panel = document.getElementById("stickerPanel");

  if (panel) {
    panel.classList.remove("open");
  }

  list.scrollTop = list.scrollHeight;
}


/* =========================
   PHOTO STICKER
========================= */

function chooseStickerPhoto() {
  const input = document.getElementById("stickerPhotoInput");

  if (input) {
    input.click();
  }
}

function createPhotoSticker(event) {
  const file = event.target.files[0];

  if (!file) return;

  const url = URL.createObjectURL(file);

  const list = document.getElementById("commentList");

  if (!list) return;

  const comment = document.createElement("div");

  comment.className = "comment";

  comment.innerHTML = `
    <div class="comment-photo">Y</div>

    <div class="comment-body">

      <div class="comment-name">@you</div>

      <img
        src="${url}"
        alt="Photo sticker"
        style="
          width:140px;
          max-height:140px;
          object-fit:cover;
          border-radius:12px;
          margin-top:5px;
        "
      >

      <div class="comment-tools">
        <span>now</span>
      </div>

    </div>
  `;

  list.appendChild(comment);

  updateCommentCount();

  event.target.value = "";

  const panel = document.getElementById("stickerPanel");

  if (panel) {
    panel.classList.remove("open");
  }

  list.scrollTop = list.scrollHeight;
}


/* =========================
   VIDEO STICKER
========================= */

function chooseStickerVideo() {
  const input = document.getElementById("stickerVideoInput");

  if (input) {
    input.click();
  }
}

function createVideoSticker(event) {
  const file = event.target.files[0];

  if (!file) return;

  const url = URL.createObjectURL(file);

  const list = document.getElementById("commentList");

  if (!list) return;

  const comment = document.createElement("div");

  comment.className = "comment";

  comment.innerHTML = `
    <div class="comment-photo">Y</div>

    <div class="comment-body">

      <div class="comment-name">@you</div>

      <video
        src="${url}"
        controls
        playsinline
        style="
          width:180px;
          max-height:180px;
          border-radius:12px;
          margin-top:5px;
        "
      ></video>

      <div class="comment-tools">
        <span>now</span>
      </div>

    </div>
  `;

  list.appendChild(comment);

  updateCommentCount();

  event.target.value = "";

  const panel = document.getElementById("stickerPanel");

  if (panel) {
    panel.classList.remove("open");
  }

  list.scrollTop = list.scrollHeight;
}


/* =========================
   VOICE COMMENT
========================= */

let voiceRecorder = null;
let voiceChunks = [];


async function startVoiceComment() {

  const status = document.getElementById("recordingStatus");

  if (!navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia) {

    alert("Voice recording is not supported by this browser.");

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

    voiceRecorder.ondataavailable = function(event) {

      if (event.data.size > 0) {
        voiceChunks.push(event.data);
      }

    };

    voiceRecorder.onstop = function() {

      const blob =
        new Blob(voiceChunks, {
          type: "audio/webm"
        });

      const url =
        URL.createObjectURL(blob);

      addVoiceComment(url);

      stream.getTracks().forEach(
        track => track.stop()
      );

    };

    voiceRecorder.start();

    if (status) {
      status.classList.add("show");
    }

  } catch (error) {

    alert(
      "Microphone permission is required for voice comments."
    );

  }
}


function stopVoiceComment() {

  const status =
    document.getElementById("recordingStatus");

  if (voiceRecorder &&
      voiceRecorder.state !== "inactive") {

    voiceRecorder.stop();

  }

  if (status) {
    status.classList.remove("show");
  }
}


function addVoiceComment(url) {

  const list =
    document.getElementById("commentList");

  if (!list) return;

  const comment =
    document.createElement("div");

  comment.className = "comment";

  comment.innerHTML = `
    <div class="comment-photo">Y</div>

    <div class="comment-body">

      <div class="comment-name">@you</div>

      <audio
        src="${url}"
        controls
        style="width:220px;max-width:100%;"
      ></audio>

      <div class="comment-tools">
        <span>now</span>
      </div>

    </div>
  `;

  list.appendChild(comment);

  updateCommentCount();

  list.scrollTop =
    list.scrollHeight;
}


/* =========================
   CREATE
========================= */

function openCreate() {

  const panel =
    document.getElementById("createPanel");

  if (panel) {
    panel.classList.add("open");
  }

}

function closeCreate() {

  const panel =
    document.getElementById("createPanel");

  if (panel) {
    panel.classList.remove("open");
  }

}


/* =========================
   LIVE SYSTEM
========================= */

let currentFollowers = 48600;

let liveApproved = false;


function tryGoLive() {

  const message =
    document.getElementById("liveMessage");

  const text =
    document.getElementById("liveMessageText");

  if (!message || !text) return;


  /*
    UNDER 1,000 FOLLOWERS
  */

  if (currentFollowers < 1000) {

    text.textContent =
      "You need at least 1,000 followers before you can apply for OTA X LIVE.";

    message.classList.add("open");

    return;
  }


  /*
    1,000+ BUT NOT APPROVED
  */

  if (!liveApproved) {

    text.textContent =
      "You are eligible to apply for LIVE. Your LIVE request must be reviewed and approved by OTA X before you can start.";

    message.classList.add("open");

    return;
  }


  /*
    APPROVED
  */

  text.textContent =
    "Your LIVE access is approved. LIVE features will open here.";

  message.classList.add("open");

}


function closeLiveMessage() {

  const message =
    document.getElementById("liveMessage");

  if (message) {
    message.classList.remove("open");
  }

}


/* =========================
   INBOX
========================= */

function openInbox() {

  const inbox =
    document.getElementById("inbox");

  if (inbox) {
    inbox.classList.add("open");
  }

}

function closeInbox() {

  const inbox =
    document.getElementById("inbox");

  if (inbox) {
    inbox.classList.remove("open");
  }

}


/* =========================
   PROFILE
========================= */

function openProfile() {

  const profile =
    document.getElementById("profile");

  if (profile) {
    profile.classList.add("open");
  }

}

function closeProfile() {

  const profile =
    document.getElementById("profile");

  if (profile) {
    profile.classList.remove("open");
  }

}


/* =========================
   CLOSE COMMENTS
   WHEN CLICKING OUTSIDE
========================= */

document.addEventListener(
  "click",
  function(event) {

    const comments =
      document.getElementById("comments");

    if (!comments) return;

    if (!comments.classList.contains("open")) {
      return;
    }

    if (
      event.target.closest(".comments") ||
      event.target.closest(".action")
    ) {
      return;
    }

  }
);


/* =========================
   PREVENT BACKGROUND
   PAGE SCROLL
========================= */

document.addEventListener(
  "touchmove",
  function(event) {

    const comments =
      document.getElementById("comments");

    if (
      comments &&
      comments.classList.contains("open")
    ) {
      return;
    }

  },
  {
    passive: true
  }
);


/* =========================
   START OTA X
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    updateCommentCount();

    console.log(
      "OTA X frontend loaded successfully."
    );

  }
);
