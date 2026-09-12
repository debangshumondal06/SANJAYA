/**
 * SANJAYA Shared UI Script
 * Controls Header, Dropdown, Mobile Drawer, Toast announcements,
 * Active Nav State, and Language Toggle across all public pages.
 */

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initDropdown();
  initMobileDrawer();
  initActiveLinks();
  initLanguageSelector();
  initCopyButtons();
});

/* --- Header Scroll Effect --- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 15);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

/* --- "More" Dropdown --- */
function initDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  if (!dropdown) return;

  const trigger = dropdown.querySelector(".dropdown-trigger");
  const menu = dropdown.querySelector(".dropdown-menu");

  if (!trigger || !menu) return;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }
  });

  // Close on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      trigger.focus();
    }
  });
}

/* --- Mobile Navigation Drawer --- */
function initMobileDrawer() {
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  const closeBtn = document.querySelector(".drawer-close");

  if (!drawer) return;

  const openDrawer = () => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  toggle?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });
}

/* --- Active Navigation State --- */
function initActiveLinks() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const allNavLinks = document.querySelectorAll(".nav-link, .drawer-link, .dropdown-item");

  allNavLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkPath = href.split("/").pop();

    if (linkPath === currentPath || 
       (currentPath === "" && (linkPath === "index.html" || linkPath === "/")) ||
       (currentPath === "index.html" && linkPath === "index.html") ||
       ((currentPath === "report.html" || currentPath === "civic_report.html") && (linkPath === "report.html" || linkPath === "civic_report.html")) ||
       ((currentPath === "track.html" || currentPath === "complaint.html") && (linkPath === "track.html" || linkPath === "complaint.html"))) {
      link.classList.add("is-active");
    }
  });
}

/* --- Language (English Only) --- */
function initLanguageSelector() {
  localStorage.setItem("sanjaya_preferred_lang", "en");
}

/* --- Copy Buttons --- */
function initCopyButtons() {
  document.addEventListener("click", (e) => {
    const copyBtn = e.target.closest("[data-copy]");
    if (!copyBtn) return;

    const targetId = copyBtn.dataset.copy;
    const targetEl = document.getElementById(targetId);
    const textToCopy = targetEl ? targetEl.textContent.trim() : copyBtn.dataset.copyText;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Ticket identifier copied to clipboard: ${textToCopy}`, "success");
      }).catch(() => {
        showToast("Unable to copy to clipboard", "warning");
      });
    }
  });
}

/* --- Toast System (Accessible Live Region) --- */
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">◈</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// Global expose
window.showToast = showToast;
