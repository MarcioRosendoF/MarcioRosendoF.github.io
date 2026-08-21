import { DeviceDetector, LayoutCache } from "./device-detector.js";
import { projectsData } from "../projects-data.js";
import { getLanguage, getTranslations, onLanguageChange } from "./i18n.js";
import {
  renderMedia,
  setCurrentMediaIndex,
  initMediaSwipe,
  navigateMedia,
  goToMedia,
} from "./media.js";
import { initPulseAnimations } from "./effects.js";
import { loadScript } from "./utils.js";
import { renderTerminal, initTerminalEvents, clearActiveTerminalTimeout } from "./api-terminal.js";

const modal = document.getElementById("project-modal");
const modalContent = document.getElementById("modal-content");
const body = document.body;

let lastFocusedElementBeforeModal = null;
let modalSettleTimeoutId = null;
let isNavigating = false;
let keyPressed = {};
let pageScrollLockState = null;
let currentProjectIndex = 0;



export function getCurrentProjectIndex() {
  return currentProjectIndex;
}

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
  const TRANSLATIONS = getTranslations();
  const p = projectsData[index];
  setCurrentMediaIndex(0);

  modalContent.innerHTML = `
        ${_renderModalHeader(p, index)}
        ${_renderModalMediaSection(p)}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="md:col-span-2">
                ${_renderModalDescription(p, index)}
                ${_renderModalFeatures(p, index)}
                ${p.isBackend ? "" : _renderModalCodeSnippet(p)}
            </div>
            <div class="md:col-span-1">
                ${_renderModalTechStack(p)}
            </div>
        </div>
    `;

  if (typeof lucide !== "undefined") lucide.createIcons();

  if (p.isBackend) {
    const terminalEl = modalContent.querySelector(".api-terminal");
    if (terminalEl) {
      initTerminalEvents(terminalEl, p);
    }
  }

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

function _renderModalMediaSection(project) {
  const TRANSLATIONS = getTranslations();

  if (project.isBackend) {
    return renderTerminal(project);
  }

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
                        <button data-media-action="prev" class="media-overlay-btn media-overlay-btn--prev" aria-label="${TRANSLATIONS["aria_prev_media"] || "Previous media"}">
                            <i data-lucide="chevron-left" class="w-5 h-5 md:w-6 md:h-6"></i>
                        </button>
                        <button data-media-action="next" class="media-overlay-btn media-overlay-btn--next" aria-label="${TRANSLATIONS["aria_next_media"] || "Next media"}">
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
                <button data-media-action="prev" class="media-nav-btn media-bottom-nav-btn flex items-center justify-center" aria-label="${TRANSLATIONS["aria_prev_media"] || "Previous media"}">
                    <i data-lucide="chevron-left" class="w-5 h-5 md:w-6 md:h-6"></i>
                </button>
                <div class="flex items-center justify-center gap-2">
                    ${project.media
                      .map(
                        (_, i) => `
                        <button data-media-action="goto" data-media-index="${i}" class="media-dot ${i === 0 ? "is-active" : ""}" aria-label="${TRANSLATIONS["aria_go_to_media"] || "Go to media"} ${i + 1}"></button>
                    `
                      )
                      .join("")}
                </div>
                <button data-media-action="next" class="media-nav-btn media-bottom-nav-btn flex items-center justify-center" aria-label="${TRANSLATIONS["aria_next_media"] || "Next media"}">
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


function _renderEngineeringBadges(project) {
  if (!project.isBackend || !project.engineeringBadges?.length) return "";

  const badgesHtml = project.engineeringBadges
    .map(({ icon, variant, label }) => {
      const variantClass = variant !== "default" ? ` engineering-badge-${variant}` : "";
      return `
        <div class="engineering-badge${variantClass}">
          <i data-lucide="${icon}" class="engineering-badge-icon"></i>
          <span>${label}</span>
        </div>`;
    })
    .join("");

  return `
    <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mt-6 mb-4">Engineering Status</h3>
    <div class="flex flex-col gap-2 mb-8">${badgesHtml}</div>
  `;
}

function _renderModalTechStack(project) {
  const TRANSLATIONS = getTranslations();
  const isTapeUsOut = project && project.title === "Tape Us Out";
  const isIdleJourney = project && project.title === "Idle Journey";
  const platform = project.isBackend ? "github" : (isTapeUsOut ? "steam" : isIdleJourney ? "browser" : "itch");

  let labelKey;
  let defaultLabel;
  if (platform === "steam") {
    labelKey = "modal_view_steam";
    defaultLabel = "View on Steam";
  } else if (platform === "browser") {
    labelKey = "modal_play_browser";
    defaultLabel = "Play in Browser";
  } else if (platform === "github") {
    labelKey = hasFrontend ? "modal_view_github_backend" : "modal_view_github";
    defaultLabel = hasFrontend ? "View backend on GitHub" : "View source on GitHub";
  } else {
    labelKey = "modal_view_itch";
    defaultLabel = "View on itch.io";
  }
  const hasFrontend = project.links && project.links.frontend;

  const frontendLabel = TRANSLATIONS["modal_view_github_frontend"] || "View frontend on GitHub";

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
  } else if (platform === "github") {
    platformClasses =
      "bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-600 text-white border-zinc-500/70 shadow-[0_0_22px_rgba(63,63,70,0.75)]";
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
  } else if (platform === "github") {
    const iconSrc = "https://cdn.simpleicons.org/github/ffffff";
    iconHtml = `<img src="${iconSrc}" alt="GitHub logo" class="w-4 h-4 md:w-5 md:h-5 object-contain" loading="lazy" />`;
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
    } else if (platform === "github" && links.github) {
      targetUrl = links.github;
    } else if (links.repo) {
      targetUrl = links.repo;
    } else if (links.play) {
      targetUrl = links.play;
    } else if (links.demo) {
      targetUrl = links.demo;
    }
  }

  const destinationType = platform;

  const badgesHtml = _renderEngineeringBadges(project);

  return `
        <div class="sticky top-12 p-6 rounded-2xl border border-white/10 bg-zinc-900/90">
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">${TRANSLATIONS["modal_stack"] || "Tech Stack"}</h3>
            <div class="flex flex-wrap gap-2 mb-8">
                ${project.stack.map((s) => `<span class="px-3 py-1 bg-black rounded-lg border border-white/10 text-xs text-white font-mono">${s}</span>`).join("")}
            </div>
            ${badgesHtml}
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
            ${hasFrontend ? `
            <button
              class="${baseButtonClasses} ${platformClasses}"
              type="button"
              data-project-cta="frontend"
              data-project-title="${project.title}"
              data-project-destination="github"
              data-project-url="${project.links.frontend}"
            >
              ${iconHtml}
              <span>${frontendLabel}</span>
            </button>` : ""}
        </div>
    `;
}

export function bindProjectCTAAnalytics() {
  const ctas = document.querySelectorAll("#project-modal [data-project-cta]");
  if (!ctas.length) return;

  ctas.forEach((cta) => {
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
  });
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


async function loadProjectPrism() {
  if (window.Prism) return;
  try {
    await loadScript(PRISM_ASSETS[0]);
    await Promise.all(PRISM_ASSETS.slice(1).map(loadScript));
  } catch (err) {
    console.warn("Failed to load Prism assets:", err);
  }
}

export function openProject(index) {
  clearActiveTerminalTimeout();
  currentProjectIndex = index;
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

  if (closeBtn) {
    closeBtn.focus();
  } else {
    const focusable = getModalFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    }
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
  clearActiveTerminalTimeout();
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

  const totalProjects = projectsData.length;
  currentProjectIndex = (currentProjectIndex + direction + totalProjects) % totalProjects;

  modalContent.classList.add("transitioning");

  setTimeout(() => {
    renderModalContent(currentProjectIndex);

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
  clearActiveTerminalTimeout();
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

export function renderProjects() {
  const javaGrid = document.getElementById("java-projects-grid");
  const gameGrid = document.getElementById("game-projects-grid");
  if (!javaGrid && !gameGrid) return;

  const TRANSLATIONS = getTranslations();

  let javaHtml = "";
  let gameHtml = "";

  projectsData.forEach((project, index) => {
    const verticalText = project.title.toUpperCase().replace(/\s+/g, "_");
    const translateTitleKey = `project${index + 1}_title`;
    const translateSubtitleKey = `project${index + 1}_subtitle`;
    const title = TRANSLATIONS[translateTitleKey] || project.title;
    const subtitle = TRANSLATIONS[translateSubtitleKey] || "";

    const tagsHtml = project.stack.slice(0, 2).map(t => `
        <span class="px-2 py-1 bg-zinc-900/90 text-white text-xs font-mono rounded border border-white/10">${t}</span>
    `).join("");

    const bgImage = (project.media && project.media.find(m => m.type === "image")) || { src: "" };
    
    const cardHtml = `
      <div class="project-card group" role="button" tabindex="0" data-project-index="${index}">
          <div class="project-card-img-wrapper">
              <img src="${bgImage.src}" class="project-card-bg" alt="${title}" loading="lazy" decoding="async" />
          </div>
          <div class="project-card-vertical-text">${verticalText}</div>
          <div class="project-card-content">
              <h3 class="text-3xl font-bold text-white mb-2" data-translate="${translateTitleKey}">
                  ${title}
              </h3>
              <div class="flex gap-2 mb-2">
                  ${tagsHtml}
              </div>
              <p class="text-sm text-gray-300" data-translate="${translateSubtitleKey}">
                  ${subtitle}
              </p>
          </div>
          <div class="absolute top-6 right-6 flex items-center justify-center w-12 h-12 rounded-full border border-white/40 bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 hover:bg-black/80 hover:border-white/80 hover:scale-110 z-30 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <i data-lucide="external-link" class="w-6 h-6"></i>
          </div>
      </div>
    `;

    if (project.isBackend) {
      javaHtml += cardHtml;
    } else {
      gameHtml += cardHtml;
    }
  });

  if (javaGrid) {
    javaGrid.innerHTML = javaHtml;
  }
  if (gameGrid) {
    gameGrid.innerHTML = gameHtml;
  }

  const cards = document.querySelectorAll(".project-card[data-project-index]");
  cards.forEach((card) => {
    const index = parseInt(card.dataset.projectIndex, 10);
    
    card.addEventListener("click", () => {
      openProject(index);
    });
    
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProject(index);
      }
    });
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

export function initProjectCardsAccessibility() {
  renderProjects();

  const closeBtn = document.getElementById("modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeProject();
    });
  }

  const prevBtn = document.getElementById("modal-prev-btn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      navigateProject(-1);
    });
  }

  const nextBtn = document.getElementById("modal-next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      navigateProject(1);
    });
  }

  if (modalContent) {
    modalContent.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-media-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-media-action");
      if (action === "prev") navigateMedia(-1);
      else if (action === "next") navigateMedia(1);
      else if (action === "goto") {
        const idx = parseInt(btn.getAttribute("data-media-index"), 10);
        if (!isNaN(idx)) goToMedia(idx);
      }
    });
  }
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

onLanguageChange(() => {
  renderProjects();
  const modal = document.getElementById("project-modal");
  if (modal && modal.classList.contains("active")) {
    renderModalContent(currentProjectIndex);
  }
});
