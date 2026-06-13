import { DeviceDetector, LayoutCache } from "./device-detector.js";
import { getLanguage, getTranslations } from "./i18n.js";
import {
  renderMedia,
  setCurrentMediaIndex,
  initVideoTouchInteractivity,
  initMediaSwipe,
} from "./media.js";
import { initPulseAnimations } from "./effects.js";

const modal = document.getElementById("project-modal");
const modalContent = document.getElementById("modal-content");
const body = document.body;

let lastFocusedElementBeforeModal = null;
let modalSettleTimeoutId = null;
let isNavigating = false;
let keyPressed = {};
let pageScrollLockState = null;

export function updateModalRailOffset() {
  const root = document.documentElement;
  if (!root) return;

  if (!modal || !modal.classList.contains("active")) {
    root.style.setProperty("--modal-rail-offset", "0px");
    return;
  }

  const isScrollable = modal.scrollHeight > modal.clientHeight + 1;
  if (!isScrollable) {
    root.style.setProperty("--modal-rail-offset", "0px");
    return;
  }

  const width = modal.offsetWidth - modal.clientWidth;
  root.style.setProperty("--modal-rail-offset", `${Math.max(0, width)}px`);
}

window.addEventListener("resize", () => {
  requestAnimationFrame(updateModalRailOffset);
});

export function lockPageScroll() {
  if (pageScrollLockState) return;

  const html = document.documentElement;
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  pageScrollLockState = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
  };

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    const data = LayoutCache.get(body);
    const existingPadding = parseFloat(data ? data.paddingRight : "0") || 0;
    body.style.paddingRight = `${existingPadding + scrollbarWidth}px`;
  }

  LayoutCache.invalidate();
}

export function unlockPageScroll() {
  if (!pageScrollLockState) return;

  const html = document.documentElement;
  html.style.overflow = pageScrollLockState.htmlOverflow || "";
  body.style.overflow = pageScrollLockState.bodyOverflow || "";
  body.style.paddingRight = pageScrollLockState.bodyPaddingRight || "";

  pageScrollLockState = null;
  LayoutCache.invalidate();
}

export function clearModalSettleTimer() {
  if (modalSettleTimeoutId) {
    clearTimeout(modalSettleTimeoutId);
    modalSettleTimeoutId = null;
  }
}

export function markModalSettled() {
  if (!modal) return;
  if (!modal.classList.contains("active")) return;
  modal.classList.add("is-settled");
}

export function unmarkModalSettled() {
  if (!modal) return;
  modal.classList.remove("is-settled");
}

export function scheduleModalSettled() {
  if (!modal) return;

  clearModalSettleTimer();
  unmarkModalSettled();

  const onTransitionEnd = (e) => {
    if (e.target !== modal) return;
    if (e.propertyName !== "transform") return;
    markModalSettled();
  };

  modal.addEventListener("transitionend", onTransitionEnd, { once: true });

  modalSettleTimeoutId = setTimeout(() => {
    modalSettleTimeoutId = null;
    markModalSettled();
  }, 700);
}

export function renderModalContent(index) {
  const projectsData = window.projectsData;
  const TRANSLATIONS = getTranslations();
  const p = projectsData[index];
  setCurrentMediaIndex(0);

  modalContent.innerHTML = `
        ${_renderModalHeader(p, index)}
        ${_renderModalMediaSection(p, index)}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="md:col-span-2">
                ${_renderModalDescription(p, index)}
                ${_renderModalFeatures(p, index)}
                ${_renderModalCodeSnippet(p)}
            </div>
            <div class="md:col-span-1">
                ${_renderModalTechStack(p)}
            </div>
        </div>
    `;

  if (typeof lucide !== "undefined") lucide.createIcons();

  if (p.media.length > 1 && DeviceDetector.isTouchDevice) {
    initMediaSwipe();
  }

  if (typeof Prism !== "undefined") {
    Prism.highlightAllUnder(modalContent);
  }

  initPulseAnimations();
  bindProjectCTAAnalytics();
}

function _renderModalHeader(project, index) {
  const TRANSLATIONS = getTranslations();
  let badgesHtml = "";
  if (project.badges && project.badges.length) {
    const currentLang = getLanguage() || "en";
    badgesHtml = `
            <div class="flex flex-wrap items-center gap-2 mt-3">
                ${project.badges
                  .map((badge, badgeIndex) => {
                    const isTapeUsOut = project && project.title === "Tape Us Out";

                    let text = "";
                    if (badge && typeof badge === "object") {
                      text = badge[currentLang] || badge.en || "";
                    } else if (typeof badge === "string") {
                      text = badge.trim();
                    }
                    if (!text) return "";

                    const baseClasses =
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] md:text-xs font-mono text-muted tracking-tight bg-white/5 border-white/15";

                    let badgeClasses = baseClasses;
                    let dotClasses = "inline-block h-1.5 w-1.5 rounded-full bg-emerald-400";

                    if (isTapeUsOut && badgeIndex === 0) {
                      badgeClasses +=
                        " border-emerald-400/70 bg-emerald-500/10 text-emerald-100";
                      dotClasses =
                        "inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.7)]";
                    }

                    return `<span class="${badgeClasses}">
                                      <span class="${dotClasses}"></span>
                                      <span>${text}</span>
                                  </span>`;
                  })
                  .join("")}
            </div>
        `;
  }

  return `
        <div class="mb-12 animate-fade-in">
            <div class="text-sm font-mono text-muted mb-2">${TRANSLATIONS["modal_project_index"] || "PROJECT"}_0${index + 1}</div>
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">${project.title}</h1>
            ${badgesHtml}
        </div>
    `;
}

function _renderModalMediaSection(project, index) {
  const TRANSLATIONS = getTranslations();
  return `
        <div class="w-full mb-6">
            <div class="modal-media-wrapper relative w-full aspect-video rounded-3xl border border-white/10 shadow-2xl bg-black/50 overflow-hidden">
                <div id="media-container" class="relative w-full h-full rounded-3xl overflow-hidden">
                    <div class="media-inner w-full h-full">
                        ${renderMedia(project.media[0], project.title)}
                    </div>
                    ${
                      project.media.length > 1
                        ? `
                    <div class="media-overlay-layer">
                        <button onclick="navigateMedia(-1)" class="media-overlay-btn media-overlay-btn--prev" aria-label="Previous media">
                            <i data-lucide="chevron-left" class="w-5 h-5 md:w-6 md:h-6"></i>
                        </button>
                        <button onclick="navigateMedia(1)" class="media-overlay-btn media-overlay-btn--next" aria-label="Next media">
                            <i data-lucide="chevron-right" class="w-5 h-5 md:w-6 md:h-6"></i>
                        </button>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
            ${
              project.media.length > 1
                ? `
            <div class="media-controls flex items-center justify-center gap-4 mt-4">
                <button onclick="navigateMedia(-1)" class="media-nav-btn media-bottom-nav-btn flex items-center justify-center" aria-label="Previous media">
                    <i data-lucide="chevron-left" class="w-5 h-5 md:w-6 md:h-6"></i>
                </button>
                <div class="flex items-center justify-center gap-2">
                    ${project.media
                      .map(
                        (_, i) => `
                        <button onclick="goToMedia(${i})" class="media-dot ${i === 0 ? "is-active" : ""}" aria-label="Go to media ${i + 1}"></button>
                    `
                      )
                      .join("")}
                </div>
                <button onclick="navigateMedia(1)" class="media-nav-btn media-bottom-nav-btn flex items-center justify-center" aria-label="Next media">
                    <i data-lucide="chevron-right" class="w-5 h-5 md:w-6 md:h-6"></i>
                </button>
            </div>
            `
                : ""
            }
        </div>
    `;
}

function _renderModalDescription(project, index) {
  const TRANSLATIONS = getTranslations();
  const LANG = getLanguage();
  return `
        <p class="text-muted leading-relaxed text-lg mb-8">${TRANSLATIONS["project" + (index + 1) + "_description"] || project.description[LANG] || project.description.en}</p>
        <h2 class="text-2xl font-bold mb-4 text-white">${TRANSLATIONS["modal_challenge"] || "The Challenge"}</h2>
        <p class="text-muted leading-relaxed text-lg mb-8">${TRANSLATIONS["project" + (index + 1) + "_challenge"] || ""}</p>
    `;
}

function _renderModalFeatures(project, index) {
  const TRANSLATIONS = getTranslations();
  const LANG = getLanguage();
  return `
        <h2 class="text-2xl font-bold mb-4 text-white">${TRANSLATIONS["modal_features"] || "Key Features"}</h2>
        <ul class="space-y-3 mb-8">
            ${(TRANSLATIONS["project" + (index + 1) + "_features"] || project.features[LANG] || project.features.en)
              .map((f) => `<li class="flex items-center gap-3 text-gray-300"><i data-lucide="check-circle" class="w-5 h-5 shrink-0 text-white"></i> ${f}</li>`)
              .join("")}
        </ul>
    `;
}

function _escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function _renderModalCodeSnippet(project) {
  const TRANSLATIONS = getTranslations();
  const summary =
    TRANSLATIONS["code_snippet_disclaimer_summary"] ||
    "Illustrative example inspired by a real system from this project.";
  const remarks =
    TRANSLATIONS["code_snippet_disclaimer_remarks"] ||
    "Not a literal source file. Intentionally simplified to show how I would structure this today (names and details reduced).";

  const disclaimer = `/// <summary>
/// ${summary}
/// </summary>
/// <remarks>
/// ${remarks}
/// </remarks>

`;

  const code = _escapeHtml(`${disclaimer}${project.codeSnippet || ""}`);

  return `
        <div class="rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-white/5 group/code">
            <div class="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div class="p-6 overflow-x-auto">
                <pre class="!bg-transparent !m-0 !p-0"><code class="language-${project.language || "clike"} font-mono text-sm leading-relaxed">${code}</code></pre>
            </div>
        </div>
    `;
}

function _renderModalTechStack(project) {
  const TRANSLATIONS = getTranslations();
  const isTapeUsOut = project && project.title === "Tape Us Out";
  const isIdleJourney = project && project.title === "Idle Journey";
  const platform = isTapeUsOut ? "steam" : isIdleJourney ? "browser" : "itch";

  let labelKey;
  let defaultLabel;
  if (platform === "steam") {
    labelKey = "modal_view_steam";
    defaultLabel = "View on Steam";
  } else if (platform === "browser") {
    labelKey = "modal_play_browser";
    defaultLabel = "Play in Browser";
  } else {
    labelKey = "modal_view_itch";
    defaultLabel = "View on itch.io";
  }
  const buttonLabel = TRANSLATIONS[labelKey] || defaultLabel;

  const baseButtonClasses =
    "pulse-btn w-full py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border";
  let platformClasses;
  if (platform === "steam") {
    platformClasses =
      "bg-gradient-to-r from-[#1f2937] via-[#334155] to-[#3b82f6] text-white border-[#66c0f4]/70 shadow-[0_0_22px_rgba(37,99,235,0.75)]";
  } else if (platform === "browser") {
    platformClasses =
      "bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] text-white border-[#38bdf8]/70 shadow-[0_0_22px_rgba(30,64,175,0.75)]";
  } else {
    platformClasses =
      "bg-gradient-to-r from-[#b91c1c] via-[#e11d48] to-[#fb923c] text-white border-[#fb7185]/70 shadow-[0_0_22px_rgba(185,28,28,0.75)]";
  }

  let iconHtml;
  if (platform === "steam") {
    const iconSrc = "https://cdn.simpleicons.org/steam/ffffff";
    iconHtml = `<img src="${iconSrc}" alt="Steam logo" class="w-4 h-4 md:w-5 md:h-5 object-contain" loading="lazy" />`;
  } else if (platform === "browser") {
    iconHtml = `<i data-lucide="globe-2" class="w-4 h-4 md:w-5 md:h-5 text-white"></i>`;
  } else {
    const iconSrc = "https://cdn.simpleicons.org/itchdotio/ffffff";
    iconHtml = `<img src="${iconSrc}" alt="itch.io logo" class="w-4 h-4 md:w-5 md:h-5 object-contain" loading="lazy" />`;
  }

  let targetUrl = "https://github.com/marciorosendo";
  if (project && project.links) {
    const links = project.links;
    if (platform === "steam" && links.steam) {
      targetUrl = links.steam;
    } else if (platform === "itch" && links.itch) {
      targetUrl = links.itch;
    } else if (links.repo) {
      targetUrl = links.repo;
    } else if (links.play) {
      targetUrl = links.play;
    } else if (links.demo) {
      targetUrl = links.demo;
    }
  }

  const destinationType = platform;

  return `
        <div class="sticky top-12 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">${TRANSLATIONS["modal_stack"] || "Tech Stack"}</h3>
            <div class="flex flex-wrap gap-2 mb-8">
                ${project.stack.map((s) => `<span class="px-3 py-1 bg-black rounded-lg border border-white/10 text-xs text-white font-mono">${s}</span>`).join("")}
            </div>
            <button
              class="${baseButtonClasses} ${platformClasses}"
              type="button"
              data-project-cta="primary"
              data-project-title="${project.title}"
              data-project-destination="${destinationType}"
              data-project-url="${targetUrl}"
            >
              ${iconHtml}
              <span>${buttonLabel}</span>
            </button>
        </div>
    `;
}

export function bindProjectCTAAnalytics() {
  const cta = document.querySelector("#project-modal [data-project-cta='primary']");
  if (!cta) return;

  const title = cta.dataset.projectTitle || "Unknown Project";
  const destinationType = cta.dataset.projectDestination || "unknown";
  const destinationUrl = cta.dataset.projectUrl || cta.href;

  cta.removeEventListener("click", cta._gaClickHandler || (() => { }));

  const handler = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "project_outbound_click", {
        event_category: "projects",
        event_label: title,
        destination_type: destinationType,
        destination: destinationUrl,
      });
    }

    if (destinationUrl) {
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  cta._gaClickHandler = handler;
  cta.addEventListener("click", handler);
}

export function getModalFocusableElements() {
  const focusableSelectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  const elements = [];

  if (modal) {
    elements.push(...modal.querySelectorAll(focusableSelectors));
  }

  const closeBtn = document.getElementById("modal-close-btn");
  const prevBtn = document.getElementById("modal-prev-btn");
  const nextBtn = document.getElementById("modal-next-btn");
  [closeBtn, prevBtn, nextBtn].forEach((el) => {
    if (el) {
      elements.push(el);
    }
  });

  return Array.from(new Set(elements)).filter(
    (el) => !el.hasAttribute("disabled")
  );
}

export function handleModalFocusTrap(e) {
  if (!modal || !modal.classList.contains("active")) return;
  if (e.key !== "Tab") return;

  const focusable = getModalFocusableElements();
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const current = document.activeElement;

  const isOutsideCycle = !focusable.includes(current);

  if (e.shiftKey) {
    if (current === first || isOutsideCycle) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (current === last || isOutsideCycle) {
      e.preventDefault();
      first.focus();
    }
  }
}

const PRISM_ASSETS = [
  "./assets/vendor/prism.min.js",
  "./assets/vendor/prism-clike.min.js",
  "./assets/vendor/prism-c.min.js",
  "./assets/vendor/prism-cpp.min.js",
  "./assets/vendor/prism-csharp.min.js",
  "./assets/vendor/prism-nasm.min.js",
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadProjectPrism() {
  if (window.Prism) return;
  try {
    for (const asset of PRISM_ASSETS) {
      await loadScript(asset);
    }
  } catch (err) {
    console.warn("Failed to load Prism assets:", err);
  }
}

export function openProject(index) {
  window.currentProjectIndex = index;
  if (!modalContent) return;

  isNavigating = false;
  keyPressed = {};

  lastFocusedElementBeforeModal = document.activeElement;

  renderModalContent(index);
  loadProjectPrism().then(() => {
    if (window.Prism && modalContent) {
      Prism.highlightAllUnder(modalContent);
    }
  });

  if (modal) {
    modal.scrollTop = 0;
    const scrollContainer = document.getElementById("modal-scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    unmarkModalSettled();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    scheduleModalSettled();
  }

  requestAnimationFrame(() => {
    updateModalRailOffset();
  });

  const closeBtn = document.getElementById("modal-close-btn");
  const prevBtn = document.getElementById("modal-prev-btn");
  const nextBtn = document.getElementById("modal-next-btn");

  if (closeBtn) {
    closeBtn.tabIndex = 0;
    closeBtn.classList.remove("opacity-0", "pointer-events-none");
  }
  if (prevBtn) {
    prevBtn.tabIndex = 0;
    prevBtn.classList.remove("opacity-0", "pointer-events-none");
  }
  if (nextBtn) {
    nextBtn.tabIndex = 0;
    nextBtn.classList.remove("opacity-0", "pointer-events-none");
  }

  const focusable = getModalFocusableElements();
  if (focusable.length) {
    let initialTarget = null;
    const heading = modalContent.querySelector("h1");

    if (heading) {
      if (!heading.hasAttribute("tabindex")) {
        heading.setAttribute("tabindex", "-1");
      }
      initialTarget = heading;
    } else {
      const closeBtn = document.getElementById("modal-close-btn");
      initialTarget =
        closeBtn && focusable.includes(closeBtn) ? closeBtn : focusable[0];
    }

    initialTarget.focus();
  }
  document.addEventListener("keydown", handleModalFocusTrap);

  if (window.scrollManager) {
    window.scrollManager.pauseForModal();
  }

  lockPageScroll();

  const isTablet = DeviceDetector.layout === "tablet";

  if (isTablet) {
    gsap.set("#modal-content > div", { opacity: 1, y: 0 });
  } else {
    gsap.from("#modal-content > div", {
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
    });
  }
}

export function navigateProject(direction) {
  if (isNavigating) return;
  isNavigating = true;

  const prevBtn = document.getElementById("modal-prev-btn");
  const nextBtn = document.getElementById("modal-next-btn");
  if (prevBtn) {
    prevBtn.style.pointerEvents = "none";
    prevBtn.style.opacity = "0.5";
  }
  if (nextBtn) {
    nextBtn.style.pointerEvents = "none";
    nextBtn.style.opacity = "0.5";
  }

  const totalProjects = window.projectsData.length;
  window.currentProjectIndex = (window.currentProjectIndex + direction + totalProjects) % totalProjects;

  modalContent.classList.add("transitioning");

  setTimeout(() => {
    renderModalContent(window.currentProjectIndex);

    const scrollContainer = document.getElementById("modal-scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    setTimeout(() => {
      modalContent.classList.remove("transitioning");
      updateModalRailOffset();

      const isTablet = DeviceDetector.layout === "tablet";

      if (isTablet) {
        gsap.set("#modal-content > div", { opacity: 1, y: 0 });
      } else {
        gsap.from("#modal-content > div", {
          y: 30,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        });
      }

      if (prevBtn) {
        prevBtn.style.pointerEvents = "";
        prevBtn.style.opacity = "";
      }
      if (nextBtn) {
        nextBtn.style.pointerEvents = "";
        nextBtn.style.opacity = "";
      }

      isNavigating = false;
    }, 50);
  }, 300);
}

export function closeProject() {
  isNavigating = false;
  keyPressed = {};

  if (modal) {
    clearModalSettleTimer();

    if (modal.classList.contains("is-settled")) {
      unmarkModalSettled();
      void modal.offsetHeight;
    }
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  updateModalRailOffset();

  const closeBtn = document.getElementById("modal-close-btn");
  const prevBtn = document.getElementById("modal-prev-btn");
  const nextBtn = document.getElementById("modal-next-btn");

  if (closeBtn) {
    closeBtn.tabIndex = -1;
    closeBtn.classList.add("opacity-0", "pointer-events-none");
  }
  if (prevBtn) {
    prevBtn.tabIndex = -1;
    prevBtn.classList.add("opacity-0", "pointer-events-none");
  }
  if (nextBtn) {
    nextBtn.tabIndex = -1;
    nextBtn.classList.add("opacity-0", "pointer-events-none");
  }

  if (window.scrollManager) {
    window.scrollManager.resumeAfterModal();
  }
  body.style.overflow = "";

  unlockPageScroll();

  document.removeEventListener("keydown", handleModalFocusTrap);
  if (
    lastFocusedElementBeforeModal &&
    typeof lastFocusedElementBeforeModal.focus === "function"
  ) {
    lastFocusedElementBeforeModal.focus();
  }
  lastFocusedElementBeforeModal = null;
}

export function initProjectCardsAccessibility() {
  const cards = document.querySelectorAll(".accordion-card[data-project-index]");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const index = parseInt(card.dataset.projectIndex, 10);
        if (!Number.isNaN(index)) {
          openProject(index);
        }
      }
    });

    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.projectIndex, 10);
      if (!Number.isNaN(index)) {
        openProject(index);
      }
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (!modal || !modal.classList.contains("active")) return;

  switch (e.key) {
    case "Escape":
      e.preventDefault();
      closeProject();
      break;
    case "ArrowLeft":
      e.preventDefault();
      if (!keyPressed["ArrowLeft"] && !isNavigating) {
        keyPressed["ArrowLeft"] = true;
        navigateProject(-1);
      }
      break;
    case "ArrowRight":
      e.preventDefault();
      if (!keyPressed["ArrowRight"] && !isNavigating) {
        keyPressed["ArrowRight"] = true;
        navigateProject(1);
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    keyPressed[e.key] = false;
  }
});

window.addEventListener("blur", () => {
  keyPressed = {};
});

window.renderModalContent = renderModalContent;
window.openProject = openProject;
window.closeProject = closeProject;
window.navigateProject = navigateProject;
