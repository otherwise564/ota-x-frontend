/* OTA X — Real API authentication and database-backed text posts */
document.addEventListener("DOMContentLoaded", () => {
  const API = "https://ota-x-backend.onrender.com/api";
  const $ = id => document.getElementById(id);

  const authScreen = $("auth-screen");
  const mainApp = $("main-app");
  const usernameInput = $("auth-username");
  const emailInput = $("auth-email");
  const passwordInput = $("auth-password");
  const confirmInput = $("auth-confirm-password");
  const authMessage = $("auth-message");
  const authButton = $("next-auth-btn");
  const feed = $("posts-feed");
  const captionInput = $("post-caption");
  const publishButton = $("publish-post-btn");
  const mediaFileInput = $("media-file-input");
  const mediaPreview = $("media-preview");
  const photoButton = $("upload-photo-btn");
  const videoButton = $("upload-video-btn");
  let selectedMediaFile = null;
  let previewObjectUrl = null;

  let mode = "login";
  let feedMode = "for-you";

  function message(text, error = true) {
    if (!authMessage) return;
    authMessage.textContent = text || "";
    authMessage.style.color = error ? "#ff6262" : "#9be7a5";
  }

  function showLogin() {
    authScreen?.classList.remove("hidden");
    authScreen?.classList.add("active");
    mainApp?.classList.add("hidden");
  }

  function showApp() {
    authScreen?.classList.add("hidden");
    authScreen?.classList.remove("active");
    mainApp?.classList.remove("hidden");
    loadFeed();
  }

  function setMode(nextMode) {
    mode = nextMode;
    const signup = mode === "signup";

    $("login-mode-btn")?.classList.toggle("active", !signup);
    $("signup-mode-btn")?.classList.toggle("active", signup);

    document.querySelectorAll(".signup-only").forEach(el => {
      el.classList.toggle("hidden", !signup);
    });

    if ($("auth-mode-title")) {
      $("auth-mode-title").textContent =
        signup ? "Create your OTA X account" : "Log in to OTA X";
    }

    if (authButton) authButton.textContent = signup ? "Sign Up" : "Log In";
    if ($("forgot-password-btn")) {
      $("forgot-password-btn").classList.toggle("hidden", signup);
    }

    if (passwordInput) {
      passwordInput.autocomplete = signup ? "new-password" : "current-password";
    }

    const switchButton = $("switch-mode-btn");
    if (switchButton) {
      switchButton.innerHTML = signup
        ? 'Already have an account? <span>Log In</span>'
        : "Don't have an account? <span>Sign Up</span>";
    }

    message("");
  }

  async function request(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = localStorage.getItem("ota_token");
    if (token) headers.Authorization = "Bearer " + token;

    let response;
    try {
      response = await fetch(API + path, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) }
      });
    } catch {
      throw new Error(
        "Could not connect to OTA X. Check your internet and try again."
      );
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.error || data.message || "Request failed (" + response.status + ")."
      );
    }
    return data;
  }

  async function authenticate() {
    const identity = (usernameInput?.value || "").trim();
    const password = passwordInput?.value || "";

    if (!identity || !password) {
      message("Enter your account details.");
      return;
    }

    authButton.disabled = true;
    authButton.textContent = "Please wait…";
    message("");

    try {
      if (mode === "signup") {
        const username = identity;
        const email = (emailInput?.value || "").trim().toLowerCase();
        const confirmation = confirmInput?.value || "";

        if (!email || !email.includes("@")) {
          throw new Error("Enter a valid email address.");
        }
        if (password.length < 8) {
          throw new Error("Your password must contain at least 8 characters.");
        }
        if (password !== confirmation) {
          throw new Error("Your passwords do not match.");
        }

        const result = await request("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password })
        });

        message(result.message || "Check your email for a verification code.", false);

        const code = window.prompt(
          "Enter the 6-digit verification code sent to " + email
        );
        if (!code) return;

        const verified = await request("/auth/verify-code", {
          method: "POST",
          body: JSON.stringify({ email, code: code.trim() })
        });

        setMode("login");
        if (usernameInput) usernameInput.value = email;
        if (passwordInput) passwordInput.value = "";
        if (confirmInput) confirmInput.value = "";
        message(verified.message || "Email verified. You can now log in.", false);
      } else {
        if (!identity.includes("@")) {
          throw new Error(
            "Use the email address linked to your OTA X account to log in."
          );
        }

        const result = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: identity.toLowerCase(),
            password
          })
        });

        if (!result.token || !result.user) {
          throw new Error("The server did not return a valid login session.");
        }

        localStorage.setItem("ota_token", result.token);
        localStorage.setItem("ota_user", JSON.stringify(result.user));
        showApp();
      }
    } catch (error) {
      message(error.message || "Authentication failed.");
    } finally {
      authButton.disabled = false;
      authButton.textContent = mode === "signup" ? "Sign Up" : "Log In";
    }
  }

  async function forgotPassword() {
    const identity = (usernameInput?.value || "").trim();
    const email = identity.includes("@")
      ? identity.toLowerCase()
      : (emailInput?.value || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      message("Enter your account email first.");
      return;
    }

    try {
      const result = await request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      message(result.message || "Check your email if the account exists.", false);

      const code = window.prompt("Enter the password reset code sent to " + email);
      if (!code) return;

      const newPassword = window.prompt("Enter your new password (at least 8 characters)");
      if (!newPassword) return;

      const confirmation = window.prompt("Enter your new password again");
      if (newPassword !== confirmation) {
        throw new Error("The passwords do not match.");
      }

      const reset = await request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code: code.trim(), newPassword })
      });
      message(reset.message || "Password reset. You can now log in.", false);
    } catch (error) {
      message(error.message || "Could not reset your password.");
    }
  }

  function showFeedState(titleText, detailText, retry = false) {
    if (!feed) return;
    feed.replaceChildren();

    const box = document.createElement("div");
    box.className = "empty-feed";
    box.classList.remove("hidden");

    const title = document.createElement("h3");
    title.textContent = titleText;

    const detail = document.createElement("p");
    detail.textContent = detailText;
    box.append(title, detail);

    if (retry) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Try again";
      button.addEventListener("click", loadFeed);
      box.appendChild(button);
    }

    feed.appendChild(box);
  }

  function renderPost(post) {
    const article = document.createElement("article");
    article.className = "post-card";
    article.dataset.postId = post.id || "";

    const header = document.createElement("div");
    header.className = "post-header";

    const user = document.createElement("div");
    user.className = "post-user";

    const avatar = document.createElement("div");
    avatar.className = "post-avatar";

    if (post.author?.avatarUrl) {
      const image = document.createElement("img");
      image.src = post.author.avatarUrl;
      image.alt = "";
      image.loading = "lazy";
      avatar.appendChild(image);
    } else {
      avatar.textContent = (post.author?.username || "O").charAt(0).toUpperCase();
    }

    const info = document.createElement("div");
    info.className = "post-user-info";

    const name = document.createElement("strong");
    name.textContent = post.author?.username || "OTA X user";

    const handle = document.createElement("span");
    handle.textContent = "@" + (post.author?.username || "user");

    info.append(name, handle);
    user.append(avatar, info);
    header.appendChild(user);
    article.appendChild(header);

    if (post.caption) {
      const caption = document.createElement("div");
      caption.className = "post-caption";
      caption.textContent = post.caption;
      article.appendChild(caption);
    }

    if (post.mediaUrl && post.mediaUrl.startsWith("https://")) {
      const media = document.createElement("div");
      media.className = "post-media";

      if (post.mediaType === "VIDEO") {
        const video = document.createElement("video");
        video.src = post.mediaUrl;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        media.appendChild(video);
      } else if (post.mediaType === "IMAGE") {
        const image = document.createElement("img");
        image.src = post.mediaUrl;
        image.alt = post.caption || "OTA X post image";
        image.loading = "lazy";
        media.appendChild(image);
      }

      article.appendChild(media);
    }

    const counts = post._count || {};
    const stats = document.createElement("p");
    stats.className = "post-live-counts";
    stats.textContent =
      "♥ " + Number(counts.likes || 0) +
      "  ·  Comments " + Number(counts.comments || 0) +
      "  ·  Shares " + Number(counts.shares || 0);
    article.appendChild(stats);

    return article;
  }

  async function loadFeed() {
    if (!feed) return;
    feed.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Loading OTA X posts…";
    feed.appendChild(loading);

    try {
      const result = await request("/posts");
      let posts = Array.isArray(result.posts) ? result.posts : [];

      if (feedMode === "following") {
        posts = [];
        showFeedState(
          "Your Following feed is empty",
          "Posts from creators you follow will appear here."
        );
        return;
      }

      feed.replaceChildren();

      if (!posts.length) {
        showFeedState(
          "Welcome to OTA X",
          "There are no posts yet. Be among the first to share something."
        );
        return;
      }

      posts.forEach(post => feed.appendChild(renderPost(post)));
    } catch (error) {
      showFeedState("We couldn't load the feed", error.message, true);
    }
  }

  function clearMediaPreview() {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }

    if (mediaPreview) {
      mediaPreview.replaceChildren();
      mediaPreview.classList.add("hidden");
    }
  }

  function previewSelectedMedia(file) {
    clearMediaPreview();
    selectedMediaFile = file || null;

    if (!file || !mediaPreview) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      selectedMediaFile = null;
      window.alert("Choose a valid photo or video.");
      return;
    }

    previewObjectUrl = URL.createObjectURL(file);

    const preview = isVideo
      ? document.createElement("video")
      : document.createElement("img");

    preview.src = previewObjectUrl;
    preview.className = "selected-media-preview";
    preview.style.maxWidth = "100%";
    preview.style.maxHeight = "360px";

    if (isVideo) {
      preview.controls = true;
      preview.playsInline = true;
    } else {
      preview.alt = "Selected photo preview";
    }

    const label = document.createElement("p");
    label.textContent = file.name;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove media";
    removeButton.addEventListener("click", () => {
      selectedMediaFile = null;
      if (mediaFileInput) mediaFileInput.value = "";
      clearMediaPreview();
    });

    mediaPreview.append(preview, label, removeButton);
    mediaPreview.classList.remove("hidden");
  }

  async function uploadSelectedMedia(file) {
    const mediaType = file.type.startsWith("image/")
      ? "IMAGE"
      : file.type.startsWith("video/")
        ? "VIDEO"
        : "";

    if (!mediaType) {
      throw new Error("Choose a valid photo or video file.");
    }

    // This request uses the existing helper, which adds the login JWT.
    const signed = await request(
      "/media/signature?mediaType=" + mediaType
    );

    if (
      !signed.cloudName ||
      !signed.apiKey ||
      !signed.timestamp ||
      !signed.signature ||
      !signed.folder ||
      !signed.resourceType
    ) {
      throw new Error("The media-upload signature response is incomplete.");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("folder", signed.folder);
    form.append("signature", signed.signature);
    form.append("type", signed.type || "upload");

    const uploadUrl =
      "https://api.cloudinary.com/v1_1/" +
      encodeURIComponent(signed.cloudName) + "/" +
      encodeURIComponent(signed.resourceType) + "/upload";

    let response;
    try {
      response = await fetch(uploadUrl, {
        method: "POST",
        body: form
      });
    } catch {
      throw new Error("Could not connect to Cloudinary. Check your connection.");
    }

    const uploaded = await response.json().catch(() => ({}));

    if (!response.ok || !uploaded.secure_url) {
      console.error("Cloudinary upload failed:", uploaded.error?.message);
      throw new Error(
        uploaded.error?.message || "Cloudinary could not upload this file."
      );
    }

    return {
      mediaUrl: uploaded.secure_url,
      mediaType,
      durationSeconds:
        mediaType === "VIDEO" && Number.isFinite(Number(uploaded.duration))
          ? Math.floor(Number(uploaded.duration))
          : undefined
    };
  }

  async function publishTextPost() {
    const caption = (captionInput?.value || "").trim();

    if (!localStorage.getItem("ota_token")) {
      showLogin();
      message("Log in before creating a post.");
      return;
    }

    if (!caption && !selectedMediaFile) {
      window.alert("Write a caption or choose a photo or video.");
      return;
    }

    publishButton.disabled = true;
    publishButton.textContent = selectedMediaFile
      ? "Uploading media…"
      : "Publishing…";

    try {
      let postData;

      if (selectedMediaFile) {
        const media = await uploadSelectedMedia(selectedMediaFile);

        publishButton.textContent = "Saving post…";

        postData = {
          caption,
          mediaUrl: media.mediaUrl,
          mediaType: media.mediaType
        };

        if (media.durationSeconds !== undefined) {
          postData.durationSeconds = media.durationSeconds;
        }
      } else {
        postData = { caption, mediaType: "TEXT" };
      }

      await request("/posts", {
        method: "POST",
        body: JSON.stringify(postData)
      });

      if (captionInput) captionInput.value = "";
      selectedMediaFile = null;
      if (mediaFileInput) mediaFileInput.value = "";
      clearMediaPreview();

      document.querySelector('[data-tab="feed-tab"]')?.click();
      document.querySelectorAll(".top-nav-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.feed === "for-you");
      });

      feedMode = "for-you";
      await loadFeed();
      window.alert("Your post was saved to OTA X.");
    } catch (error) {
      window.alert(error.message || "Your post could not be published.");
    } finally {
      publishButton.disabled = false;
      publishButton.textContent = "Post to OTA X";
    }
  }

  // Delete template/demo stories and post. Real API data is used instead.
  $("stories-list")?.querySelectorAll(".story-item:not(#create-story-btn)")
    .forEach(item => item.remove());

  feed?.querySelectorAll('[data-post-id="demo-1"], .post-card')
    .forEach(item => item.remove());

  $("login-mode-btn")?.addEventListener("click", () => setMode("login"));
  $("signup-mode-btn")?.addEventListener("click", () => setMode("signup"));
  $("switch-mode-btn")?.addEventListener("click", () => {
    setMode(mode === "login" ? "signup" : "login");
  });

  authButton?.addEventListener("click", authenticate);
  passwordInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") authenticate();
  });
  confirmInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") authenticate();
  });
  $("forgot-password-btn")?.addEventListener("click", forgotPassword);

  $("toggle-password")?.addEventListener("click", () => {
    if (!passwordInput) return;
    const reveal = passwordInput.type === "password";
    passwordInput.type = reveal ? "text" : "password";
    $("toggle-password").setAttribute(
      "aria-label",
      reveal ? "Hide password" : "Show password"
    );
  });

  photoButton?.addEventListener("click", () => {
    if (!localStorage.getItem("ota_token")) {
      showLogin();
      message("Log in before uploading media.");
      return;
    }
    if (mediaFileInput) {
      mediaFileInput.accept = "image/*";
      mediaFileInput.click();
    }
  });

  videoButton?.addEventListener("click", () => {
    if (!localStorage.getItem("ota_token")) {
      showLogin();
      message("Log in before uploading media.");
      return;
    }
    if (mediaFileInput) {
      mediaFileInput.accept = "video/*";
      mediaFileInput.click();
    }
  });

  mediaFileInput?.addEventListener("change", () => {
    previewSelectedMedia(mediaFileInput.files?.[0] || null);
  });

  publishButton?.addEventListener("click", publishTextPost);

  document.querySelectorAll(".top-nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      feedMode = tab.dataset.feed || "for-you";
      document.querySelectorAll(".top-nav-tab").forEach(other => {
        other.classList.toggle("active", other === tab);
      });
      loadFeed();
    });
  });

  // Country picker remains a UI preference, not an account database.
  const countryModal = $("country-modal");
  const countryTriggers = [
    $("login-country-btn"),
    $("selected-country-btn"),
    $("region-selector-btn")
  ].filter(Boolean);

  function closeCountryModal() {
    countryModal?.classList.add("hidden");
  }

  function filterCountries(query) {
    const q = query.trim().toLowerCase();
    countryModal?.querySelectorAll(".country-option").forEach(option => {
      option.hidden = !(option.dataset.country || option.textContent)
        .toLowerCase().includes(q);
    });
  }

  countryTriggers.forEach(button => {
    button.addEventListener("click", () => {
      countryModal?.classList.remove("hidden");
      if ($("country-search-input")) {
        $("country-search-input").value = "";
        filterCountries("");
        $("country-search-input").focus();
      }
    });
  });

  $("close-country")?.addEventListener("click", closeCountryModal);
  countryModal?.addEventListener("click", event => {
    if (event.target === countryModal) closeCountryModal();
  });
  $("country-search-input")?.addEventListener("input", event => {
    filterCountries(event.target.value);
  });

  countryModal?.querySelectorAll(".country-option").forEach(option => {
    option.type = "button";
    option.addEventListener("click", () => {
      const country = option.dataset.country;
      const code = option.dataset.code;
      if (!country || !code) return;

      const match = null;
      if ($("login-country-name")) $("login-country-name").textContent = country;
      if ($("selected-region-name")) $("selected-region-name").textContent = country;
      if ($("selected-country-code")) $("selected-country-code").textContent = code;
      if ($("selected-country-flag")) {
        $("selected-country-flag").textContent = match ? match[0] : "🌐";
      }

      localStorage.setItem("ota_selected_country", country);
      localStorage.setItem("ota_selected_country_code", code);
      closeCountryModal();
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCountryModal();
  });

  try {
    const savedCountry = localStorage.getItem("ota_selected_country");
    const savedCode = localStorage.getItem("ota_selected_country_code");
    const savedOption = Array.from(
      countryModal?.querySelectorAll(".country-option") || []
    ).find(option =>
      option.dataset.country === savedCountry &&
      option.dataset.code === savedCode
    );

    if (savedOption) {
      if ($("login-country-name")) $("login-country-name").textContent = savedCountry;
      if ($("selected-region-name")) $("selected-region-name").textContent = savedCountry;
      if ($("selected-country-code")) $("selected-country-code").textContent = savedCode;
      const match = null;
      if ($("selected-country-flag")) {
        $("selected-country-flag").textContent = match ? match[0] : "🌐";
      }
    }
  } catch (error) {
    console.warn("Could not restore country preference.", error);
  }

  // Always begin signed out unless a previous real login session exists.
  if (localStorage.getItem("ota_token") && localStorage.getItem("ota_user")) {
    showApp();
  } else {
    localStorage.removeItem("ota_token");
    localStorage.removeItem("ota_user");
    showLogin();
  }

  setMode("login");
});
