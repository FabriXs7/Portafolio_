/* codigo de script.js */

(function () {
  "use strict";

  const data = window.SITE_DATA || {};
  const profile = data.profile || {};

  /* ---------------- PERFIL ---------------- */
  setText("navName", profile.name);
  setText("heroName", profile.name);
  setText("heroTagline", profile.tagline);
  setText("heroBio", profile.bio);
  setText("footerName", profile.name);

  setText("tName", profile.name);
  setText("tRole", profile.role);
  setText("tLocation", profile.location);
  setText("tExperience", profile.experience);
  setText("tAvailability", profile.availability);

  const emailBtn = document.getElementById("contactEmail");
  if (emailBtn && profile.email) {
    emailBtn.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(profile.email);
    emailBtn.target = "_blank";
    emailBtn.rel = "noopener noreferrer";
  }

  const socialWrap = document.getElementById("contactSocial");
  if (socialWrap && Array.isArray(profile.social)) {
    profile.social.forEach((s) => {
      const a = document.createElement("a");
      a.href = s.url;
      a.textContent = s.label;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "btn btn--ghost"
      socialWrap.appendChild(a);
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- BLENDER (con subcategorías) ---------------- */
  const blenderData = data.blender || {};

  renderCards("grid-blender-proyectos", blenderData.proyectos, buildBlenderCard);
  renderCards("grid-blender-ropa", blenderData.ropa, buildBlenderCard);
  renderCards("grid-blender-mapas", blenderData.mapas, buildVideoCard);

  function buildBlenderCard(item) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__media">${mediaOrPlaceholder(item.image, item.title)}</div>
      <div class="card__body">
        <h3>${escapeHtml(item.title || "")}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </div>
    `;
    return card;
  }

  function buildVideoCard(item) {
    const card = document.createElement("div");
    card.className = "video-card";
    const videoId = getYouTubeId(item.youtube);
    card.innerHTML = `
      <div class="video-card__frame">
        ${videoId
          ? `<iframe src="https://www.youtube.com/embed/${videoId}" title="${escapeAttr(item.title || "")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
          : `<div class="card__placeholder">Invalid YouTube link</div>`}
      </div>
      ${item.title ? `<div class="video-card__body"><h3>${escapeHtml(item.title)}</h3></div>` : ""}
    `;
    return card;
  }

  function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  /* ---------------- WEB ---------------- */
  renderCards("grid-web", data.web, buildVideoCard);

  /* ---------------- SOFTWARE ---------------- */
  renderCards("grid-software", data.software, (item) => {
    const card = document.createElement("div");
    card.className = "soft-card";
    const images = Array.isArray(item.images) ? item.images : [];
    card.innerHTML = `
      <div class="soft-card__head">
        <h3>${escapeHtml(item.name || "")}</h3>
        <span class="soft-card__tag">software</span>
      </div>
      ${item.description ? `<p class="desc">${escapeHtml(item.description)}</p>` : ""}
      ${images.length ? `<div class="soft-card__gallery">${images.map((src) => `<img src="${escapeAttr(src)}" alt="${escapeAttr(item.name || "")}" data-lightbox>`).join("")}</div>` : ""}
    `;
    return card;
  });

  /* ---------------- TABS ---------------- */
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      document.querySelectorAll(".panel").forEach((p) => {
        p.classList.remove("is-active");
        p.hidden = true;
      });
      const target = document.getElementById("panel-" + tab.dataset.tab);
      if (target) {
        target.classList.add("is-active");
        target.hidden = false;
      }
    });
  });

  /* ---------------- SUBTABS (Blender) ---------------- */
  const subtabs = document.querySelectorAll(".subtab");
  subtabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      subtabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      document.querySelectorAll(".subpanel").forEach((p) => {
        p.classList.remove("is-active");
        p.hidden = true;
      });
      const target = document.getElementById("subpanel-" + tab.dataset.subtab);
      if (target) {
        target.classList.add("is-active");
        target.hidden = false;
      }
    });
  });

  /* ---------------- LIGHTBOX ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    lightboxImg.src = trigger.src;
    lightboxImg.alt = trigger.alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------------- HELPERS ---------------- */
  function renderCards(containerId, items, buildCard) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `<p class="empty-note">// No projects here yet. Add them in data.js</p>`;
      return;
    }
    items.forEach((item) => container.appendChild(buildCard(item)));
  }

  function mediaOrPlaceholder(src, label) {
    if (!src) {
      return `<div class="card__placeholder">Add the image<br>in data.js</div>`;
    }
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(label || "")}" data-lightbox onerror="this.parentElement.innerHTML='<div class=\\'card__placeholder\\'>Image not found:<br>${escapeAttr(src)}</div>'">`;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }
  /* ---------------- DEBUG: reporta imágenes rotas en consola ---------------- */
window.addEventListener("load", () => {
  setTimeout(() => {
    const broken = [...document.querySelectorAll("img")].filter(
      (img) => !img.complete || img.naturalWidth === 0
    );
    if (broken.length) {
      console.warn(`⚠️ ${broken.length} imagen(es) no cargaron:`);
      broken.forEach((img) => console.warn("→", img.getAttribute("src")));
    } else {
      console.log("✅ Todas las imágenes cargaron correctamente.");
    }
  }, 500);
});
})();
