(function () {
  "use strict";

  const data = window.SITE_DATA || {};
  const profile = data.profile || {};
  const blender = data.blender || {};
  const profileFields = {
    navName: "name", heroName: "name", heroTagline: "tagline", heroBio: "bio",
    footerName: "name", tName: "name", tRole: "role", tLocation: "location",
    tExperience: "experience", tAvailability: "availability"
  };
  Object.entries(profileFields).forEach(([id, key]) => setText(id, profile[key]));
  setText("year", new Date().getFullYear());

  const whatsappButton = document.getElementById("contactWhatsapp");
  if (whatsappButton) {
    const digits = String(profile.phone || "").replace(/\D/g, "");
    if (digits) {
      whatsappButton.href = "https://wa.me/" + digits;
      whatsappButton.hidden = false;
    }
  }

  const emailButton = document.getElementById("contactEmail");
  if (emailButton && profile.email) {
    emailButton.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(profile.email);
    emailButton.target = "_blank";
    emailButton.rel = "noopener noreferrer";
  }
  (profile.social || []).forEach((social) => {
    const slug = ({ Instagram: "instagram", X: "x", Twitter: "x", Discord: "discord" })[social.label];
    const label = social.label === "Twitter" ? "X" : social.label;
    const wrapper = document.createElement("div");
    wrapper.className = "social-float social-float--" + (slug || "other");
    const link = document.createElement("a");
    link.href = safeUrl(social.url);
    link.setAttribute("aria-label", "Visit " + label + " profile (opens in a new tab)");
    if (slug) {
      const icon = document.createElement("img");
      icon.src = "images/social/" + slug + ".svg";
      icon.alt = "";
      icon.width = icon.height = 34;
      icon.setAttribute("aria-hidden", "true");
      link.appendChild(icon);
    }
    const name = document.createElement("span");
    name.className = "social-bubble__name";
    name.textContent = label;
    const arrow = document.createElement("span");
    arrow.className = "social-bubble__arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    link.append(name, arrow);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "social-bubble";
    wrapper.appendChild(link);
    document.getElementById("contactSocial").appendChild(wrapper);
  });

  renderCards("grid-blender-proyectos", blender.proyectos, buildModelCard);
  renderCards("grid-blender-ropa", blender.ropa, buildModelCard);
  renderCards("grid-blender-mapas", blender.mapas, buildVideoCard);
  renderCards("grid-blender-weapons", blender.weapons, (item, index, total) => buildModelCard(item, index, total, true));
  renderCards("grid-blender-animations", blender.animations, buildVideoCard);
  renderCards("grid-blender-assets", blender.assets, (item, index, total) => buildModelCard(item, index, total, true));
  renderCards("grid-web", data.web, buildVideoCard);
  renderCards("grid-roblox", data.roblox, buildVideoCard);
  renderCards("grid-software", data.software, buildSoftwareCard);

  Object.entries({ proyectos: "preview", ropa: "design", mapas: "video", weapons: "model", animations: "showcase", assets: "asset" }).forEach(([key, label]) => {
    const count = (blender[key] || []).length;
    setText("count-" + key, count + " " + label + (count === 1 ? "" : "s"));
  });

  if ((blender.weapons || []).length % 3 === 2) {
    const invitation = document.createElement("article");
    invitation.className = "collection-cta";
    invitation.innerHTML = '<p class="eyebrow">// your next idea</p><span class="collection-cta__symbol" aria-hidden="true">+</span><h3>Have a concept in mind?</h3><p>Let\'s turn your idea into a distinctive 3D asset.</p><a href="#contacto" class="btn btn--ghost btn--small">Start a conversation <span aria-hidden="true">↗</span></a>';
    document.getElementById("grid-blender-weapons").appendChild(invitation);
  }

  const characterCards = [...document.querySelectorAll("#grid-blender-proyectos .card")];
  const characterToggle = document.getElementById("characterToggle");
  if (characterCards.length > 12) {
    characterToggle.hidden = false;
    function toggleCharacters(expanded) {
      characterCards.forEach((card, index) => { card.hidden = !expanded && index >= 12; });
      characterToggle.setAttribute("aria-expanded", String(expanded));
      characterToggle.textContent = expanded ? "Show fewer previews ↑" : "Explore all " + characterCards.length + " character previews ↓";
    }
    toggleCharacters(false);
    characterToggle.addEventListener("click", () => {
      const expanded = characterToggle.getAttribute("aria-expanded") !== "true";
      toggleCharacters(expanded);
      if (!expanded) document.getElementById("subpanel-proyectos").scrollIntoView({ block: "start" });
    });
  }

  function buildModelCard(item, index, total, asset = false) {
    const card = document.createElement("article");
    card.className = "card" + (asset ? " card--asset" : "");
    card.innerHTML = `
      ${imageButton(item.image, item.title, item.description)}
      <div class="card__body">
        ${asset ? `<div class="card__meta"><span class="asset-tag">${escapeHtml(item.tag || "Blender")}</span><span class="card__index">${String(index + 1).padStart(2, "0")} / ${total}</span></div>` : ""}
        <h3>${escapeHtml(item.title || "")}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </div>`;
    return card;
  }

  function imageButton(src, title, description) {
    if (!src) return '<div class="card__media"><span class="card__placeholder">Preview coming soon</span></div>';
    return `<button class="card__media" type="button" data-lightbox data-src="${escapeAttr(src)}" data-title="${escapeAttr(title || "")}" data-description="${escapeAttr(description || "")}" aria-label="Inspect ${escapeAttr(title || "model")}"><img src="${escapeAttr(src)}" alt="${escapeAttr(title || "")}" loading="lazy" decoding="async"><span class="card__inspect" aria-hidden="true">Inspect model ↗</span></button>`;
  }

  function buildVideoCard(item) {
    const card = document.createElement("article");
    card.className = "video-card" + (item.link ? " video-card--experience" : "");
    const videoId = getYouTubeId(item.youtube);
    const linkLabel = item.linkLabel || "Play on Roblox";
    card.innerHTML = `<div class="video-card__frame" data-video-id="${escapeAttr(videoId || "")}" data-video-src="${escapeAttr(item.video || "")}" data-video-poster="${escapeAttr(item.poster || "")}" data-video-title="${escapeAttr(item.title || "Video")}"></div>
      <div class="video-card__body">
        ${item.tag ? `<span class="asset-tag">${escapeHtml(item.tag)}</span>` : ""}
        <h3>${escapeHtml(item.title || "Video showcase")}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        <div class="video-card__actions">
          ${item.link ? `<a class="btn btn--primary btn--small" href="${escapeAttr(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkLabel)} <span aria-hidden="true">↗</span></a>` : ""}
          ${videoId ? `<a class="video-card__link" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">Watch on YouTube <span aria-hidden="true">↗</span></a>` : ""}
        </div>
      </div>`;
    resetVideoFrame(card.querySelector(".video-card__frame"));
    return card;
  }

  function resetVideoFrame(frame) {
    const id = frame.dataset.videoId;
    const src = frame.dataset.videoSrc;
    const title = frame.dataset.videoTitle;
    if (src) {
      const poster = frame.dataset.videoPoster;
      frame.innerHTML = `<button class="video-card__preview" type="button" data-play-video aria-label="Play ${escapeAttr(title)}">${poster ? `<img src="${escapeAttr(poster)}" alt="${escapeAttr(title)} preview" loading="lazy" decoding="async">` : ""}<span class="video-card__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="video-card__watch" aria-hidden="true">Play demo</span></button>`;
      return;
    }
    frame.innerHTML = id ? `<button class="video-card__preview" type="button" data-play-video aria-label="Play ${escapeAttr(title)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${escapeAttr(title)} preview" loading="lazy" decoding="async"><span class="video-card__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="video-card__watch" aria-hidden="true">Play showcase</span></button>` : '<span class="card__placeholder">Video preview unavailable</span>';
  }

  document.addEventListener("click", (event) => {
    const playButton = event.target.closest("[data-play-video]");
    if (!playButton) return;
    const frame = playButton.closest(".video-card__frame");
    if (frame.dataset.videoSrc) {
      stopVideos();
      const video = document.createElement("video");
      video.src = frame.dataset.videoSrc;
      if (frame.dataset.videoPoster) video.poster = frame.dataset.videoPoster;
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("aria-label", frame.dataset.videoTitle);
      frame.replaceChildren(video);
      video.play().catch(() => {});
      video.focus();
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + frame.dataset.videoId + "?autoplay=1&rel=0&hl=en";
    iframe.title = frame.dataset.videoTitle;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    frame.replaceChildren(iframe);
    iframe.focus();
  });

  function stopVideos() {
    document.querySelectorAll(".video-card__frame iframe, .video-card__frame video").forEach((player) => resetVideoFrame(player.parentElement));
  }

  function buildSoftwareCard(item) {
    const card = document.createElement("article");
    card.className = "soft-card";
    const images = Array.isArray(item.images) ? item.images : [];
    card.innerHTML = `<div class="soft-card__head"><h3>${escapeHtml(item.name || "")}</h3><span class="soft-card__tag">software</span></div>
      ${item.description ? `<p class="desc">${escapeHtml(item.description)}</p>` : ""}
      ${images.length ? `<div class="soft-card__gallery">${images.map((src) => imageButton(src, item.name)).join("")}</div>` : '<a href="#contacto" class="btn btn--ghost btn--small">Discuss your project ↗</a>'}`;
    return card;
  }

  // Tabs support mouse input and standard arrow-key navigation.
  const mainTabs = [...document.querySelectorAll(".tab")];
  const subTabs = [...document.querySelectorAll(".subtab")];
  function selectTab(tab, group, panelSelector, prefix, key) {
    if (!tab) return;
    stopVideos();
    group.forEach((button) => {
      const active = button === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll(panelSelector).forEach((panel) => {
      const active = panel.id === prefix + tab.dataset[key];
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    document.dispatchEvent(new CustomEvent("collectionchange", { detail: { panel: prefix + tab.dataset[key] } }));
  }
  function setupTabs(group, panelSelector, prefix, key) {
    group.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab, group, panelSelector, prefix, key));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % group.length;
        if (event.key === "ArrowLeft") next = (index - 1 + group.length) % group.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = group.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        selectTab(group[next], group, panelSelector, prefix, key);
        group[next].focus();
        group[next].scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    });
  }
  setupTabs(mainTabs, ".panel", "panel-", "tab");
  setupTabs(subTabs, ".subpanel", "subpanel-", "subtab");
  document.querySelectorAll("[data-go-tab]").forEach((link) => {
    link.addEventListener("click", () => {
      selectTab(mainTabs.find((tab) => tab.dataset.tab === link.dataset.goTab), mainTabs, ".panel", "panel-", "tab");
      if (link.dataset.goSubtab) selectTab(subTabs.find((tab) => tab.dataset.subtab === link.dataset.goSubtab), subTabs, ".subpanel", "subpanel-", "subtab");
      const active = mainTabs.find((tab) => tab.classList.contains("is-active"));
      active.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImg");
  const previous = document.getElementById("lightboxPrev");
  const next = document.getElementById("lightboxNext");
  let gallery = [];
  let galleryIndex = 0;
  let returnFocus;
  let previousOverflow = "";

  function showImage(index) {
    galleryIndex = (index + gallery.length) % gallery.length;
    const item = gallery[galleryIndex].dataset;
    lightboxImage.hidden = false;
    lightboxImage.parentElement.querySelectorAll(".card__placeholder").forEach((element) => element.remove());
    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;
    setText("lightboxTitle", item.title);
    setText("lightboxDescription", item.description || "");
    setText("lightboxCount", (galleryIndex + 1) + " / " + gallery.length);
    previous.hidden = next.hidden = gallery.length < 2;
  }
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox]");
    if (!trigger) return;
    const container = trigger.closest(".grid, .soft-card__gallery");
    gallery = [...(container || document).querySelectorAll("[data-lightbox]")].filter((button) => !button.disabled && !button.closest("[hidden]"));
    returnFocus = trigger;
    showImage(gallery.indexOf(trigger));
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightbox.showModal();
  });
  document.getElementById("lightboxClose").addEventListener("click", () => lightbox.close());
  previous.addEventListener("click", () => showImage(galleryIndex - 1));
  next.addEventListener("click", () => showImage(galleryIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showImage(galleryIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  lightbox.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    lightboxImage.removeAttribute("src");
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  });

  // Handle missing images without exposing file paths to visitors.
  document.addEventListener("error", (event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    event.target.hidden = true;
    if (event.target.closest("[data-lightbox]")) event.target.closest("[data-lightbox]").disabled = true;
    const placeholder = document.createElement("span");
    placeholder.className = "card__placeholder";
    placeholder.textContent = "Preview unavailable";
    event.target.parentElement.appendChild(placeholder);
  }, true);

  function renderCards(id, items, builder) {
    const container = document.getElementById(id);
    if (!container) return;
    if (!Array.isArray(items) || !items.length) {
      container.innerHTML = '<p class="empty-note">More projects coming soon.</p>';
      return;
    }
    items.forEach((item, index) => container.appendChild(builder(item, index, items.length)));
  }
  function getYouTubeId(value) {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "");
      const id = host === "youtu.be" ? url.pathname.split("/")[1] :
        ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host) ? url.searchParams.get("v") || url.pathname.split("/")[2] : null;
      return /^[\w-]{11}$/.test(id || "") ? id : null;
    } catch { return null; }
  }
  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "#";
    } catch { return "#"; }
  }
  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) element.textContent = value;
  }
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeAttr(value) { return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
})();
