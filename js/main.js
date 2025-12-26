


if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("beforeunload", () => {
  document.documentElement.style.backgroundColor = "#0a0a0a";
  document.body.style.backgroundColor = "#0a0a0a";

  window.scrollTo(0, 0);
});

window.addEventListener("focus", () => {
  document.body.style.backgroundColor = "";
});

let lenis;
let TRANSLATIONS = {};
let LANG = (localStorage.getItem("lang") || "en").toLowerCase();
let toastTimeoutId = null;
const MotionPreferences = {
  get prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
};

function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", name, params);
}


const DeviceDetector = {
  get isTouchDevice() {
    return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  },
  get isMobilePortrait() {
    return window.matchMedia(
      "(max-width: 820px) and (orientation: portrait)",
    ).matches;
  },
  get isTablet() {
    return window.matchMedia("(min-width: 820px) and (max-width: 1024px)")
      .matches;
  },
  get isMobile() {
    return window.matchMedia("(max-width: 820px)").matches;
  },
  get layout() {
    const width = window.innerWidth;
    if (width < 820) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  },
};


function getToastContainer() {
  let container = document.getElementById("toast-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-root";
    container.className =
      "fixed bottom-6 right-4 md:right-6 z-[11000] flex flex-col items-end gap-3 pointer-events-none";
    document.body.appendChild(container);
  }
  return container;
}


@param   { string } messageKeyOrText


@param   { "info" | "success" | "error" } [type = "info"]



function showToast(messageKeyOrText, type = "info") {
  const container = getToastContainer();
  if (!container) return;

  const message =
    (TRANSLATIONS && TRANSLATIONS[messageKeyOrText]) || messageKeyOrText;

  let toast = container.querySelector(".js-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className =
      "js-toast pointer-events-auto rounded-full border bg-zinc-900/90 backdrop-blur px-4 py-2.5 text-xs md:text-sm shadow-[0_20px_45px_rgba(0,0,0,0.45)] flex items-center gap-2 translate-y-4 opacity-0 transition-all duration-200 border-white/15 text-muted";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const dot = document.createElement("span");
    dot.className =
      "js-toast-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-400";

    const textEl = document.createElement("span");
    textEl.className = "js-toast-text font-mono tracking-tight";

    toast.appendChild(dot);
    toast.appendChild(textEl);
    container.appendChild(toast);
  }

  const textEl = toast.querySelector(".js-toast-text");
  const dotEl = toast.querySelector(".js-toast-dot");
  if (textEl) {
    textEl.textContent = message;
  }

  toast.className =
    "js-toast pointer-events-auto rounded-full border bg-zinc-900/90 backdrop-blur px-4 py-2.5 text-xs md:text-sm shadow-[0_20px_45px_rgba(0,0,0,0.45)] flex items-center gap-2 translate-y-4 opacity-0 transition-all duration-200 border-white/15 text-muted";

  if (dotEl) {
    dotEl.className =
      "js-toast-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-400";
  }

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-4", "opacity-0");
  }, 2800);
}


function getContactEmail() {
  const localPart = ["marcio", "rosendof"].join(".");
  const domain = ["gmail", "com"].join(".");
  return `${localPart}@${domain}`;
}

function initContactIdentity() {
  const email = getContactEmail();

  const emailDisplay = document.getElementById("email-display");
  if (emailDisplay) {
    emailDisplay.textContent = email;
  }

  const form = document.getElementById("contact-form");
  if (form) {
    form.action = `https://formsubmit.co/${email}`;
  }

  const emailCard = document.getElementById("email-card");
  if (emailCard) {
    emailCard.addEventListener("click", () => window.copyEmailToClipboard());
    emailCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.copyEmailToClipboard();
      }
    });
  }
}
window.copyEmailToClipboard = async function () {
  const email = getContactEmail();
  const btn = document.getElementById("copy-email-btn");
  const originalBtnClasses = btn ? btn.className : "";
  const copyIcon = btn ? btn.querySelector(".copy-icon") : null;
  const checkIcon = btn ? btn.querySelector(".copy-check-icon") : null;

  try {
    await navigator.clipboard.writeText(email);

    showToast("toast_email_copied", "success");
    if (btn) {
      if (copyIcon) copyIcon.classList.add("hidden");
      if (checkIcon) checkIcon.classList.remove("hidden");
      setTimeout(() => {
        if (btn) {
          btn.className = originalBtnClasses;
        }
        if (copyIcon) copyIcon.classList.remove("hidden");
        if (checkIcon) checkIcon.classList.add("hidden");
      }, 1200);
    }
  } catch (err) {
    console.error("Failed to copy:", err);
    showToast("toast_email_error", "error");

  }
};

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    document.body.classList.add("fonts-loaded");
  });
} else {
  document.body.classList.add("fonts-loaded");
}


@param   { string } lang


@returns   { string }



function _getValidLanguage(lang) {
  const normalizedLang = (lang || "").toLowerCase();
  if (normalizedLang === "pt") {
    return "pt-br";
  }
  if (normalizedLang !== "en" && normalizedLang !== "pt-br") {
    return "en";
  }
  return normalizedLang;
}

LANG = _getValidLanguage(LANG);

function applyDocumentLanguage() {
  const html = document.documentElement;
  html.setAttribute("lang", LANG === "pt-br" ? "pt-BR" : "en");
}

async function loadTranslations(lang, isInitialLoad = false) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`i18n/${lang}.json?v=${timestamp}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar tradução: ${response.statusText}`);
    }
    TRANSLATIONS = await response.json();
    translatePage(isInitialLoad);
  } catch (error) {
    console.error(error);
  }
}

let translationTimeline = null;

function translatePage(isInitialLoad = false) {
  const textElements = document.querySelectorAll("[data-translate]");

  const heroChildren = document.querySelectorAll("#hero > *");

  const aboutSection = document.getElementById("about");
  const aboutDivider = aboutSection?.querySelector(".section-divider");
  const aboutContent = [
    aboutSection.querySelector("h2")?.parentElement,
    aboutSection.querySelector(".about-photo-card"),
    ...aboutSection.querySelectorAll(".spotlight-card"),
  ];

  const marqueeSection = document.querySelector(".marquee-container")?.closest("section");

  const timelineSection = document.getElementById("timeline");
  const timelineDivider = timelineSection?.querySelector(".section-divider");
  const timelineContent = [
    timelineSection?.querySelector("h2")?.parentElement,
    document.getElementById("timeline-mobile"),
    document.getElementById("timeline-desktop"),
  ];

  const projectsSection = document.getElementById("projects");
  const projectsDivider = projectsSection?.querySelector(".section-divider");
  const projectsContent = [
    projectsSection.querySelector("h2")?.parentElement,
    projectsSection.querySelector(".accordion-container"),
  ];

  const contactSection = document.getElementById("contact");
  const contactDivider = contactSection?.querySelector(".section-divider");
  const contactContent = [
    contactSection.querySelector(".grid.grid-cols-1"),
  ];

  const footer = document.querySelector("footer");
  const footerAnalyticsNotice = footer?.querySelector("p");

  let orderedTargets = [
    ...heroChildren,
    aboutDivider,
    ...aboutContent,
    marqueeSection,
    timelineDivider,
    ...timelineContent,
    projectsDivider,
    ...projectsContent,
    contactDivider,
    ...contactContent,
    footerAnalyticsNotice,
  ].filter((el) => el);


  if (DeviceDetector.isMobile) {
    orderedTargets = orderedTargets.filter((el) => {
      if (el.id === "language-toggle-hero") return false;
      if (typeof el.querySelector === "function") {
        if (el.querySelector("#language-toggle-hero")) return false;
      }
      return true;
    });
  }

  const STAGGER_DELAY = 0.018;
  const ANIM_DURATION = 0.32;

  function updateContent() {
    textElements.forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (TRANSLATIONS[key]) {
        if (element.hasAttribute("placeholder")) {
          element.placeholder = TRANSLATIONS[key];
        } else if (element.tagName === "META") {
          element.content = TRANSLATIONS[key];
        } else {
          element.innerHTML = TRANSLATIONS[key];
        }
      }
    });

    if (window.renderProjects) window.renderProjects();

    const modal = document.getElementById("project-modal");
    if (modal && modal.classList.contains("active")) {
      renderModalContent(currentProjectIndex);
    }

    requestAnimationFrame(() => {
      if (typeof gsap !== "undefined" && gsap.globalTimeline) {
        gsap.getTweensOf("*").forEach((tween) => {
          if (tween.scrollTrigger) tween.scrollTrigger.refresh();
        });
      }
    });
  }

  if (MotionPreferences.prefersReducedMotion) {
    updateContent();
    updateLanguageToggle();
    return;
  }

  if (translationTimeline) {
    translationTimeline.kill();
    gsap.set(document.body, { clearProps: "pointerEvents" });
  }

  const timelineGridElements = document.querySelectorAll(
    "#timeline .grid > div, #timeline .timeline-dot, #timeline .timeline-line",
  );

  const safeTargets = orderedTargets.filter(
    (el) => !Array.from(timelineGridElements).includes(el),
  );

  gsap.killTweensOf(safeTargets);

  if (navbarHighlight) {
    navbarHighlight._onScroll();
    const active = navbarHighlight.activeElement;
    if (active) navbarHighlight.setActive(active);
  }

  if (isInitialLoad) {
    updateContent();
    animateHeroEntrance();
    return;
  }

  translationTimeline = gsap.timeline({
    onComplete: () => {
      gsap.set(document.body, { clearProps: "pointerEvents" });

      if (languageHighlight) {
        languageHighlight.updateHighlight();
      }
    },
  });

  const timeline = translationTimeline;

  timeline.add("start");

  timeline.set(document.body, { pointerEvents: "none" }, "start");
  timeline.set(orderedTargets, { transition: "none" }, "start");

  if (navbarHighlight) {
    timeline.add(navbarHighlight.hide(), "start");
  }
  if (languageHighlight && !DeviceDetector.isMobile) {
    timeline.add(languageHighlight.hide(), "start");
  }

  orderedTargets.forEach((el, index) => {
    const t = `start+=${index * STAGGER_DELAY}`;
    timeline.to(el, {
      opacity: 0,
      duration: ANIM_DURATION,
      ease: "power2.in",
    }, t);
  });

  timeline.call(updateContent);

  timeline.add("enter", ">+0.06");

  timeline.add(() => {
    if (!navbarHighlight) return;
    navbarHighlight._onScroll();
    const active = navbarHighlight.activeElement;
    if (active) navbarHighlight.setActive(active);
  }, "enter");

  if (navbarHighlight) {
    timeline.add(navbarHighlight.show(), "enter");
  }
  if (languageHighlight && !DeviceDetector.isMobile) {
    timeline.add(languageHighlight.show(), "enter");
  }

  orderedTargets.forEach((el, index) => {
    const t = `enter+=${index * STAGGER_DELAY}`;
    timeline.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.42,
        ease: "power2.out",
        clearProps: "opacity,transition",
      },
      t,
    );
  });

  updateLanguageToggle();
}


function animateHeroEntrance() {
  if (MotionPreferences.prefersReducedMotion) return;
  const hero = document.getElementById("hero");
  if (!hero) return;

  const targets = [
    hero.querySelector('[data-translate="hero_status"]')?.parentElement,
    hero.querySelector('[data-translate="hero_title_1"]'),
    hero.querySelector('[data-translate="hero_title_2"]'),
  ].filter((el) => el);

  gsap.set(targets, { opacity: 0, y: 30 });

  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out",
    clearProps: "all",
  });
}

function setLanguage(lang) {
  const targetLang = _getValidLanguage(lang);

  if (LANG === targetLang) {
    updateLanguageToggle();
    return;
  }

  LANG = targetLang;
  localStorage.setItem("lang", LANG);
  applyDocumentLanguage();
  loadTranslations(LANG);

  trackEvent("language_switch", {
    event_category: "ui",
    event_label: targetLang,
  });

  const desktopToggle = document.getElementById("language-toggle");
  const activeDesktopBtn = desktopToggle?.querySelector(
    `[data-lang="${targetLang}"]`,
  );
  if (activeDesktopBtn && languageHighlight) {
    languageHighlight.setActive(activeDesktopBtn);
  }

  const heroToggle = document.getElementById("language-toggle-hero");
  const activeHeroBtn = heroToggle?.querySelector(`[data-lang="${targetLang}"]`);
  if (activeHeroBtn && heroLanguageHighlight) {
    heroLanguageHighlight.setActive(activeHeroBtn);
  }
}

function updateLanguageToggle() {
  const desktopToggle = document.getElementById("language-toggle");
  if (desktopToggle) {
    desktopToggle.setAttribute("data-active-lang", LANG);

    if (languageHighlight) {
      const activeBtn = desktopToggle.querySelector(`[data-lang="${LANG}"]`);
      if (activeBtn) {
        languageHighlight.activeElement = activeBtn;
        languageHighlight.updateHighlight();
      }
    }
  }

  document.querySelectorAll(".js-lang-btn[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === LANG);
  });

  document
    .querySelectorAll('[data-language-toggle="tubelight"]')
    .forEach((toggle) => toggle.setAttribute("data-active-lang", LANG));

  if (heroLanguageHighlight) {
    const heroToggle = document.getElementById("language-toggle-hero");
    const activeBtn = heroToggle?.querySelector(`[data-lang="${LANG}"]`);
    if (activeBtn) {
      heroLanguageHighlight.activeElement = activeBtn;
      heroLanguageHighlight.updateHighlight();
    }
  }
}

class BaseHighlight {
  constructor() {
    this.container = null;
    this.items = [];
    this.hoverOutline = null;
    this.isTranslating = false;
    this.hoveredElement = null;

    this.isTouchDevice = DeviceDetector.isTouchDevice;
  }

  _getAnimationTargets() {
    throw new Error("_getAnimationTargets() must be implemented by subclass");
  }

  onHoverStart(element) {
    if (this.isTranslating || this.isTouchDevice) return;
    this.hoveredElement = element;
    this._animateHoverOutline(element, 0.2);
  }

  onHoverEnd() {
    if (this.isTranslating || this.isTouchDevice) return;
    this.hoveredElement = null;
    this._hideHoverOutline();
  }

  hide() {
    this.isTranslating = true;
    this._hideHoverOutline();

    const targets = this._getAnimationTargets();

    if (this.isTouchDevice || !this._shouldSlideOnHide()) {
      return gsap.to(targets, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onStart: () => {
          if (this.isTouchDevice) {
            targets.forEach((target) => {
              target.style.pointerEvents = "none";
            });
          }
        },
      });
    }

    return gsap.to(targets, {
      y: this._getHideDirection(),
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });
  }

  show() {
    const targets = this._getAnimationTargets();

    if (this.isTouchDevice) {
      return gsap.to(targets, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          targets.forEach((target) => {
            target.style.pointerEvents = "";
          });
          this.isTranslating = false;
        },
      });
    }

    return gsap.to(targets, {
      y: "0%",
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        this.isTranslating = false;
      },
    });
  }

  _getAdaptiveDuration(element, baseDuration = 0.35, options = {}) {
    const min = options.min || 0.15;
    const max = options.max || baseDuration;

    if (!this.lamp || !element || !this.lamp.getBoundingClientRect) {
      return baseDuration;
    }

    const lampRect = this.lamp.getBoundingClientRect();
    const targetRect = element.getBoundingClientRect();
    const containerRect =
      (this.container && this.container.getBoundingClientRect()) || null;

    if (
      !lampRect.width ||
      !targetRect.width ||
      !containerRect ||
      !containerRect.width
    ) {
      return baseDuration;
    }
    const fullSpan = containerRect.width;

    const leftCurrent = lampRect.left;
    const rightCurrent = lampRect.right;
    const leftTarget = targetRect.left;
    const rightTarget = targetRect.right;

    const maxEdgeDistance = Math.max(
      Math.abs(leftTarget - leftCurrent),
      Math.abs(rightTarget - rightCurrent),
    );

    if (!maxEdgeDistance || !fullSpan) {
      return baseDuration;
    }

    const relative = Math.min(1, maxEdgeDistance / fullSpan);

    let duration = baseDuration * relative;

    if (typeof gsap !== "undefined" && gsap.utils?.clamp) {
      duration = gsap.utils.clamp(min, max, duration);
    } else {
      duration = Math.max(min, Math.min(max, duration));
    }

    return duration;
  }

  _calculatePosition(element) {
    element.offsetHeight;
    return {
      left: element.offsetLeft,
      width: element.offsetWidth,
    };
  }

  _animateHoverOutline(element, duration = 0.2) {
    if (!this.hoverOutline) return;
    const pos = this._calculatePosition(element);
    gsap.to(this.hoverOutline, {
      left: pos.left,
      width: pos.width,
      opacity: 1,
      duration,
      ease: "power2.out",
    });
  }

  _hideHoverOutline() {
    if (!this.hoverOutline) return;
    gsap.to(this.hoverOutline, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  _getHideDirection() {
    return "-150%";
  }

  _shouldSlideOnHide() {
    return true;
  }

  _setupHoverListeners() {
    this.items.forEach((item) => {
      if (!this.isTouchDevice) {
        item.addEventListener("mouseenter", () => this.onHoverStart(item));
        item.addEventListener("mouseleave", () => this.onHoverEnd());
      }

      item.addEventListener(
        "click",
        (e) => {
          if (this.isTranslating) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        },
        true,
      );
    });

    if (!this.isTouchDevice && this.container) {
      this.container.addEventListener("mouseleave", () => this.onHoverEnd());
    }
  }
}

class NavbarHighlight extends BaseHighlight {
  constructor() {
    super();
    this.activeElement = null;
    this.lamp = null;
    this.navbarContainers = [];
    this.observer = null;
    this.visibleSections = new Map();
    this.sectionElements = [];
    this.sectionIdToNavLink = new Map();
    this._onScroll = this._onScroll.bind(this);
  }

  init() {
    const mainNav = document.querySelector("nav.tubelight-nav");
    this.container = mainNav;
    this.items = mainNav ? Array.from(mainNav.querySelectorAll(".nav-item")) : [];

    const mainNavContainer = mainNav?.parentElement || null;
    this.navbarContainers = mainNavContainer ? [mainNavContainer] : [];
    this.lamp = document.getElementById("nav-lamp");
    this.hoverOutline = document.getElementById("nav-hover-outline");

    if (
      !this.container ||
      !this.items.length ||
      !this.lamp ||
      !this.hoverOutline
    ) {
      console.warn("NavbarHighlight: Missing required elements");
      return;
    }

    this._setupHoverListeners();
    this._setupScrollSpy();
    this._initializePosition();
  }

  _getAnimationTargets() {
    return this.navbarContainers;
  }

  setActive(element) {
    if (!element) return;

    this.activeElement = element;
    this.items.forEach((item) => item.classList.remove("active"));
    element.classList.add("active");

    this._animateToElement(element);
  }

  updateHighlight() {
    if (this.activeElement) {
      this.activeElement.offsetHeight;

      const pos = this._calculatePosition(this.activeElement);
      gsap.set(this.lamp, {
        left: pos.left,
        width: pos.width,
        opacity: 1,
        scaleX: 1,
      });
    }
  }

  refreshActiveState() {
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    let currentSection = null;

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const triggerLine = viewportHeight * 0.25;
    const docHeight = document.documentElement.scrollHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    const isNearBottom = scrollY + viewportHeight >= docHeight - 2;

    if (isNearBottom) {
      currentSection = sections[sections.length - 1];
    } else {
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
          currentSection = section;
          break;
        }
      }
    }

    if (currentSection) {
      const navLink = document.querySelector(`a[href="#${currentSection.id}"]`);
      if (navLink && navLink !== this.activeElement) {
        this.activeElement = navLink;
        this.items.forEach((item) => item.classList.remove("active"));
        navLink.classList.add("active");
      }
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener("scroll", this._onScroll);
  }

  _onScroll() {
    if (!this.sectionElements.length) return;

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    const isNearBottom = scrollY + viewportHeight >= docHeight - 10;
    if (isNearBottom) {
      const lastSection =
        this.sectionElements[this.sectionElements.length - 1];
      const navLink = this.sectionIdToNavLink.get(lastSection.id);
      if (navLink && navLink !== this.activeElement) {
        this.setActive(navLink);
      }
      return;
    }

    const triggerLine = viewportHeight * 0.35;

    let currentSection = null;
    for (const section of this.sectionElements) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
        currentSection = section;
        break;
      }
    }

    if (!currentSection) return;

    const navLink = this.sectionIdToNavLink.get(currentSection.id);
    if (navLink && navLink !== this.activeElement) {
      this.setActive(navLink);
    }
  }

  _setupScrollSpy() {
    this.sectionElements = [];
    this.sectionIdToNavLink.clear();
    document.querySelectorAll("section[id]").forEach((section) => {
      const navLink = document.querySelector(`a[href="#${section.id}"]`);
      if (navLink) {
        this.sectionElements.push(section);
        this.sectionIdToNavLink.set(section.id, navLink);
      }
    });

    window.addEventListener("scroll", this._onScroll, { passive: true });
    window.addEventListener("resize", this._onScroll);

    this._onScroll();
  }

  _initializePosition() {
    const firstItem = this.items[0];
    if (firstItem) {
      this.activeElement = firstItem;
      firstItem.classList.add("active");



      if (!this.isTouchDevice) {
        const pos = this._calculatePosition(firstItem);
        gsap.set(this.lamp, {
          left: pos.left,
          width: pos.width,
          opacity: 1,
          scaleX: 1,
        });
      }
    }
  }

  _animateToElement(element, duration = 0.4) {
    const adaptiveDuration = this._getAdaptiveDuration(element, duration, {
      min: 0.18,
      max: duration,
    });

    const pos = this._calculatePosition(element);
    gsap.to(this.lamp, {
      left: pos.left,
      width: pos.width,
      opacity: 1,
      duration: adaptiveDuration,
      ease: "power2.out",
    });
  }

  _hideHoverOutline() {
    gsap.to(this.hoverOutline, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  }
}

const navbarHighlight = new NavbarHighlight();

function initNavbar() {
  navbarHighlight.init();
  languageHighlight.init();
  heroLanguageHighlight.init();
}

class LanguageHighlight extends BaseHighlight {



  @param   { { containerId ?: string, lampId ?: string, hoverOutlineId ?: string } } [opts]



constructor(opts = {}) {
  super();
  this.containerId = opts.containerId || "language-toggle";
  this.lampId = opts.lampId || "lang-lamp";
  this.hoverOutlineId = opts.hoverOutlineId || "lang-hover-outline";
  this.wrapper = null;
  this.lamp = null;
  this.activeElement = null;
}

init() {
  this.container = document.getElementById(this.containerId);
  if (!this.container) return;

  this.wrapper = this.container.parentElement;
  this.container.setAttribute("data-active-lang", LANG);

  this.items = Array.from(this.container.querySelectorAll(".lang-btn"));
  this.hoverOutline = document.getElementById(this.hoverOutlineId);
  this.lamp = document.getElementById(this.lampId);

  if (!this.items.length || !this.hoverOutline || !this.lamp) {
    console.warn("LanguageHighlight: Missing required elements");
    return;
  }

  this._setupHoverListeners();
  this._initializePosition();
}

_getAnimationTargets() {
  return [this.wrapper];
}

_shouldSlideOnHide() {
  const bottomLayoutQuery = window.matchMedia(
    "(max-width: 880px), (max-height: 540px)",
  );
  return !bottomLayoutQuery.matches;
}

setActive(element) {
  if (!element || this.isTranslating) return;

  this.activeElement = element;
  this._animateToElement(element);
}

updateHighlight() {
  if (!this.lamp || !this.activeElement) return;

  this.activeElement.offsetHeight;

  const pos = this._calculatePosition(this.activeElement);
  gsap.set(this.lamp, {
    left: pos.left,
    width: pos.width,
    opacity: 1,
  });
}

_initializePosition() {
  const activeLang = LANG || this.container.getAttribute("data-active-lang");
  const activeBtn = this.container.querySelector(
    `[data-lang="${activeLang}"]`,
  );

  if (activeBtn) {
    this.activeElement = activeBtn;
    const pos = this._calculatePosition(activeBtn);
    gsap.set(this.lamp, {
      left: pos.left,
      width: pos.width,
      opacity: 1,
    });
  }
}

_animateToElement(element, duration = 0.3) {
  const adaptiveDuration = this._getAdaptiveDuration(element, duration, {
    min: 0.16,
    max: duration,
  });

  const pos = this._calculatePosition(element);
  gsap.to(this.lamp, {
    left: pos.left,
    width: pos.width,
    opacity: 1,
    duration: adaptiveDuration,
    ease: "power2.out",
  });
}
}

const languageHighlight = new LanguageHighlight();
const heroLanguageHighlight = new LanguageHighlight({
  containerId: "language-toggle-hero",
  lampId: "lang-lamp-hero",
  hoverOutlineId: "lang-hover-outline-hero",
});

const initThreeJS = () => {
  if (MotionPreferences.prefersReducedMotion) return;
  const canvas = document.getElementById("webgl-canvas");
  if (!canvas) {
    console.error("WebGL Canvas not found!");
    return;
  }

  if (typeof THREE === "undefined") {
    console.error("Three.js is not loaded!");
    return;
  }


  const layout = DeviceDetector.layout;
  const isMobile = layout === "mobile";
  const isTablet = layout === "tablet";
  const isDesktop = layout === "desktop";

  let particleCount;
  if (isMobile) {
    particleCount = 60;
  } else if (isTablet) {
    particleCount = 75;
  } else {
    particleCount = 120;
  }

  const particleSize = isMobile ? 0.05 : 0.04;

  let targetFPS;
  if (isMobile) {
    targetFPS = 45;
  } else if (isTablet) {
    targetFPS = 50;
  } else {
    targetFPS = 60;
  }
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;

  const speedMult = isMobile ? 1.3 : 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: isDesktop,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 5;

  let visibleHeight, visibleWidth;

  const updateBounds = () => {
    const vFOV = (camera.fov * Math.PI) / 180;
    visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
    visibleWidth = visibleHeight * camera.aspect;
  };
  updateBounds();

  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  const spawnArea = 2.0;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * visibleWidth * spawnArea;
    positions[i * 3 + 1] = (Math.random() - 0.5) * visibleHeight * spawnArea;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    velocities.push({
      x: (Math.random() - 0.5) * 0.005 * speedMult,
      y: (Math.random() - 0.5) * 0.005 * speedMult,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: particleSize,
    color: 0x888888,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  const particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  const animate = (currentTime) => {
    window.threeRafId = requestAnimationFrame(animate);

    const delta = currentTime - lastFrameTime;
    if (delta < frameInterval) return;
    lastFrameTime = currentTime - (delta % frameInterval);

    const posAttribute = geometry.attributes.position;

    const xLimit = (visibleWidth * spawnArea) / 2;
    const yLimit = (visibleHeight * spawnArea) / 2;

    for (let i = 0; i < particleCount; i++) {
      let x = posAttribute.getX(i);
      let y = posAttribute.getY(i);

      x += velocities[i].x;
      y += velocities[i].y;

      if (x > xLimit) x = -xLimit;
      if (x < -xLimit) x = xLimit;
      if (y > yLimit) y = -yLimit;
      if (y < -yLimit) y = yLimit;

      posAttribute.setXYZ(i, x, y, posAttribute.getZ(i));
    }
    posAttribute.needsUpdate = true;

    const rotSpeed = isMobile ? 2.0 : 1.0;
    particlesMesh.rotation.y += 0.0003 * rotSpeed;
    particlesMesh.rotation.x += 0.0001 * rotSpeed;

    renderer.render(scene, camera);
  };

  animate(0);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateBounds();
  });
};

const modal = document.getElementById("project-modal");
const modalContent = document.getElementById("modal-content");
const body = document.body;
let lastFocusedElementBeforeModal = null;

let modalLenis;
let modalRafId;
let modalSettleTimeoutId = null;

let currentProjectIndex = 0;
let currentMediaIndex = 0;
const totalProjects = projectsData.length;
let isNavigating = false;
let keyPressed = {};

function clearModalSettleTimer() {
  if (modalSettleTimeoutId) {
    clearTimeout(modalSettleTimeoutId);
    modalSettleTimeoutId = null;
  }
}

function markModalSettled() {
  if (!modal) return;
  if (!modal.classList.contains("active")) return;
  modal.classList.add("is-settled");
}

function unmarkModalSettled() {
  if (!modal) return;
  modal.classList.remove("is-settled");
}

function scheduleModalSettled() {
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

function renderMedia(media, title) {
  if (media.type === "youtube") {
    return `
      <div class="yt-wrapper w-full h-full">
        <iframe
          src="https://www.youtube.com/embed/${media.src}?autoplay=1&mute=1&loop=1&playlist=${media.src}&playsinline=1&controls=1&modestbranding=1&rel=0"
          class="yt-iframe w-full h-full cursor-hide"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      </div>
    `;
  }
  if (media.type === "vimeo") {
    return `
      <div class="vimeo-wrapper w-full h-full">
        <iframe
          src="https://player.vimeo.com/video/${media.src}?autoplay=1&muted=1&loop=1&playsinline=1"
          class="vimeo-iframe w-full h-full cursor-hide"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>
      </div>
    `;
  }
  return `<img src="${media.src}" class="w-full h-full object-cover" alt="${title}" loading="lazy">`;
}

function initVideoTouchInteractivity() {
  if (!DeviceDetector.isTouchDevice) return;

  const wrappers = document.querySelectorAll(
    "#media-container .yt-wrapper, #media-container .vimeo-wrapper",
  );
  wrappers.forEach((wrapper) => {
    if (wrapper.dataset.videoTouchBound === "true") return;

    wrapper.addEventListener(
      "touchstart",
      () => {
        wrapper.classList.add("interacting");
      },
      { passive: true },
    );

    wrapper.dataset.videoTouchBound = "true";
  });
}

window.navigateMedia = function (direction) {
  const p = projectsData[currentProjectIndex];
  currentMediaIndex = (currentMediaIndex + direction + p.media.length) % p.media.length;

  const mediaInner = document.querySelector("#media-container .media-inner");
  if (mediaInner) {
    mediaInner.innerHTML = renderMedia(p.media[currentMediaIndex], p.title);
  }

  updateMediaDots();

  if (typeof lucide !== "undefined") lucide.createIcons();

  initVideoTouchInteractivity();
  requestCursorSync();
}

window.goToMedia = function (index) {
  currentMediaIndex = index;
  const p = projectsData[currentProjectIndex];
  const mediaInner = document.querySelector("#media-container .media-inner");
  if (mediaInner) {
    mediaInner.innerHTML = renderMedia(p.media[currentMediaIndex], p.title);
  }
  updateMediaDots();

  initVideoTouchInteractivity();
  requestCursorSync();
}

function updateMediaDots() {
  const dots = document.querySelectorAll(".media-dot");

  dots.forEach((dot, index) => {
    if (index === currentMediaIndex) {
      dot.classList.add("is-active");
    } else {
      dot.classList.remove("is-active");
    }
  });
}

function initMediaSwipe() {
  const container = document.getElementById("media-container");
  if (!container) return;

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        navigateMedia(1);
      } else {
        navigateMedia(-1);
      }
    }
  }
}

function renderModalContent(index) {
  const p = projectsData[index];
  currentMediaIndex = 0;

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
  requestCursorSync();
}

function _renderModalHeader(project, index) {
  let badgesHtml = "";
  if (project.badges && project.badges.length) {
    const currentLang = LANG || "en";
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
          let dotClasses =
            "inline-block h-1.5 w-1.5 rounded-full bg-emerald-400";

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
            <div class="text-sm font-mono text-muted mb-2">${TRANSLATIONS["modal_case_study"] || "CASE STUDY"}_0${index + 1}</div>
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">${project.title}</h1>
            ${badgesHtml}
        </div>
    `;
}

function _renderModalMediaSection(project, index) {
  return `
        <div class="w-full mb-6">
            <div class="modal-media-wrapper relative w-full aspect-video rounded-3xl border border-white/10 shadow-2xl bg-black/50 overflow-hidden">
                <div id="media-container" class="relative w-full h-full rounded-3xl overflow-hidden">
                    <div class="media-inner w-full h-full">
                        ${renderMedia(project.media[0], project.title)}
                    </div>
                    ${project.media.length > 1
      ? `
                    <!-- Desktop: overlay media navigation (controlled via CSS media queries) -->
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
            ${project.media.length > 1 ? `
            <div class="media-controls flex items-center justify-center gap-4 mt-4">
                <!-- Touch / non-desktop: arrows live in the bottom bar -->
                <button onclick="navigateMedia(-1)" class="media-nav-btn media-bottom-nav-btn flex items-center justify-center" aria-label="Previous media">
                    <i data-lucide="chevron-left" class="w-5 h-5 md:w-6 md:h-6"></i>
                </button>
                <div class="flex items-center justify-center gap-2">
                    ${project.media.map((_, i) => `
                        <button onclick="goToMedia(${i})" class="media-dot ${i === 0 ? 'is-active' : ''}" aria-label="Go to media ${i + 1}"></button>
                    `).join('')}
                </div>
                <button onclick="navigateMedia(1)" class="media-nav-btn media-bottom-nav-btn flex items-center justify-center" aria-label="Next media">
                    <i data-lucide="chevron-right" class="w-5 h-5 md:w-6 md:h-6"></i>
                </button>
            </div>
            ` : ""}
        </div>
    `;
}

function _renderModalDescription(project, index) {
  return `
        <p class="text-muted leading-relaxed text-lg mb-8">${TRANSLATIONS["project" + (index + 1) + "_description"] || project.description[LANG] || project.description.en}</p>
        <h2 class="text-2xl font-bold mb-4 text-white">${TRANSLATIONS["modal_challenge"] || "The Challenge"}</h2>
        <p class="text-muted leading-relaxed text-lg mb-8">${TRANSLATIONS["project" + (index + 1) + "_challenge"] || ""}</p>
    `;
}

function _renderModalFeatures(project, index) {
  return `
        <h2 class="text-2xl font-bold mb-4 text-white">${TRANSLATIONS["modal_features"] || "Key Features"}</h2>
        <ul class="space-y-3 mb-8">
            ${(TRANSLATIONS["project" + (index + 1) + "_features"] || project.features[LANG] || project.features.en).map((f) => `<li class="flex items-center gap-3 text-gray-300"><i data-lucide="check-circle" class="w-5 h-5 shrink-0 text-white"></i> ${f}</li>`).join("")}
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
        <!-- CodeSnap Style Container -->
        <div class="rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-white/5 group/code">
            <!-- Window Header -->
            <div class="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <!-- Code Content -->
            <div class="p-6 overflow-x-auto">
                <pre class="!bg-transparent !m-0 !p-0"><code class="language-${project.language || "clike"} font-mono text-sm leading-relaxed">${code}</code></pre>
            </div>
        </div>
    `;
}

function _renderModalTechStack(project) {
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

  const platformInlineStyle =
    "";

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
              style="${platformInlineStyle}"
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

function bindProjectCTAAnalytics() {
  const cta = document.querySelector("#project-modal [data-project-cta='primary']");
  if (!cta) return;

  const title = cta.dataset.projectTitle || "Unknown Project";
  const destinationType = cta.dataset.projectDestination || "unknown";
  const destinationUrl = cta.dataset.projectUrl || cta.href;

  cta.removeEventListener("click", cta._gaClickHandler || (() => { }));

  const handler = () => {
    trackEvent("project_outbound_click", {
      event_category: "projects",
      event_label: title,
      destination_type: destinationType,
      destination: destinationUrl,
    });

    if (destinationUrl) {
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  cta._gaClickHandler = handler;
  cta.addEventListener("click", handler);
}

function getModalFocusableElements() {
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
    (el) => !el.hasAttribute("disabled"),
  );
}

function handleModalFocusTrap(e) {
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

function openProject(index) {
  currentProjectIndex = index;
  if (!modalContent) return;

  isNavigating = false;
  keyPressed = {};

  lastFocusedElementBeforeModal = document.activeElement;

  renderModalContent(index);

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
  body.style.overflow = "hidden";

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

function navigateProject(direction) {
  if (isNavigating) {
    return;
  }
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

  currentProjectIndex =
    (currentProjectIndex + direction + totalProjects) % totalProjects;

  modalContent.classList.add("transitioning");

  setTimeout(() => {
    renderModalContent(currentProjectIndex);

    const scrollContainer = document.getElementById("modal-scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    setTimeout(() => {
      modalContent.classList.remove("transitioning");

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

function closeProject() {
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

  document.removeEventListener("keydown", handleModalFocusTrap);
  if (
    lastFocusedElementBeforeModal &&
    typeof lastFocusedElementBeforeModal.focus === "function"
  ) {
    lastFocusedElementBeforeModal.focus();
  }
  lastFocusedElementBeforeModal = null;

  requestCursorSync();
}

document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("active")) return;

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


function requestCursorSync() {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new CustomEvent("cursor:sync"));
}

@returns   { void}

function initCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor) {
    console.warn("Cursor element not found in DOM");
    return;
  }

  const hasMouse = !DeviceDetector.isTouchDevice;
  if (!hasMouse) {
    cursor.style.display = "none";
    return;
  }

  const cards = document.querySelectorAll(".spotlight-card");

  let mouseX = 0;
  let mouseY = 0;
  let isRenderScheduled = false;
  let hiddenByCursorHide = false;
  let revealOnNextMove = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isRenderScheduled) {
      isRenderScheduled = true;
      requestAnimationFrame(updateCursor);
    }
  });

  let cardRects = [];
  let isDirty = true;

  function updateRects() {
    cardRects = Array.from(cards).map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        element: card,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    });
    isDirty = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      isDirty = true;
    },
    { passive: true },
  );
  window.addEventListener(
    "resize",
    () => {
      isDirty = true;
    },
    { passive: true },
  );

  function updateCursor() {
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";

    if (isDirty) updateRects();

    cardRects.forEach((rect) => {
      if (
        mouseX >= rect.left &&
        mouseX <= rect.left + rect.width &&
        mouseY >= rect.top &&
        mouseY <= rect.top + rect.height
      ) {
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        rect.element.style.setProperty("--mouse-x", `${x}px`);
        rect.element.style.setProperty("--mouse-y", `${y}px`);
      }
    });

    if (revealOnNextMove) {
      hiddenByCursorHide = false;
      revealOnNextMove = false;
      cursor.style.opacity = "1";
    }

    syncCursorState();
    isRenderScheduled = false;
  }

  const CLICKABLE_SELECTORS = [
    "a[href]",
    "button",
    '[role="button"]',
    'input[type="submit"]',
    'input[type="button"]',
    "[onclick]",
    ".hover-trigger",
  ].join(", ");

  const shouldHideCursor = (target) => {
    if (!target) return false;
    return (
      target.matches("input, textarea, .cursor-hide") ||
      !!target.closest("input, textarea, .cursor-hide")
    );
  };

  const syncCursorState = () => {
    const target = document.elementFromPoint(mouseX, mouseY);
    const hide = shouldHideCursor(target);
    if (hide) {
      cursor.style.opacity = "0";
      hiddenByCursorHide = true;
      revealOnNextMove = false;
      cursor.classList.remove("hovered");
      return;
    }

    if (hiddenByCursorHide) {
      revealOnNextMove = true;
      cursor.style.opacity = "0";
      cursor.classList.remove("hovered");
      return;
    }

    cursor.style.opacity = "1";

    if (target && target.closest(CLICKABLE_SELECTORS)) {
      cursor.classList.add("hovered");
    } else {
      cursor.classList.remove("hovered");
    }
  };

  document.addEventListener("cursor:sync", () => {
    requestAnimationFrame(syncCursorState);
  });

  document.body.addEventListener("mouseover", (e) => {
    if (shouldHideCursor(e.target)) {
      cursor.style.opacity = "0";
      hiddenByCursorHide = true;
      revealOnNextMove = false;
      return;
    }

    if (e.target.closest(CLICKABLE_SELECTORS)) {
      cursor.classList.add("hovered");
    }
  });

  document.body.addEventListener("mouseout", (e) => {
    if (shouldHideCursor(e.target)) {
      cursor.style.opacity = "1";
      hiddenByCursorHide = false;
      revealOnNextMove = false;
      return;
    }

    if (e.target.closest(CLICKABLE_SELECTORS)) {
      cursor.classList.remove("hovered");
    }
  });
}

@returns   { void}

function initInteractiveEffects() {
  if (MotionPreferences.prefersReducedMotion) return;
  const hasMouse = !DeviceDetector.isTouchDevice;
  const isTablet = DeviceDetector.isTablet;

  if (!hasMouse || isTablet) return;

  const tiltCards = document.querySelectorAll(".spotlight-card");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;


      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      gsap.to(card, {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });


  const magnets = document.querySelectorAll(".magnetic-btn");
  magnets.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
      });
    });
  });
}
function initPulseAnimations() {
  if (MotionPreferences.prefersReducedMotion) return;

  const hasHoverCapability = !DeviceDetector.isTouchDevice;


  if (!hasHoverCapability) {
    return;
  }

  const pulseElements = document.querySelectorAll(
    ".pulse-btn, button:not(.modal-nav-btn):not(#modal-close-btn):not(.lang-btn):not(.js-lang-btn), a.js-smooth-scroll",
  );

  pulseElements.forEach((el) => {
    let isHovering = false;
    let isAnimating = false;

    function playPulse() {
      isAnimating = true;

      el.classList.add("pulse-active");


      setTimeout(() => {
        el.classList.remove("pulse-active");
        isAnimating = false;

        if (isHovering) {

          setTimeout(() => {
            if (isHovering) {
              playPulse();
            }
          }, 50);
        }
      }, 1200);
    }

    el.addEventListener("mouseenter", function () {
      isHovering = true;

      if (!isAnimating) {
        playPulse();
      }
    });

    el.addEventListener("mouseleave", function () {
      isHovering = false;
    });
  });
}


function initTimelineAnimation() {
  if (MotionPreferences.prefersReducedMotion) return;
  const timelineSection = document.getElementById("timeline");
  if (!timelineSection || typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  if (typeof window.__timelineAnimationHasPlayed === "undefined") {
    window.__timelineAnimationHasPlayed = false;
  }

  ScrollTrigger.matchMedia({

    "(min-width: 1024px)": function () {
      const desktopContainer = document.getElementById("timeline-desktop");
      if (!desktopContainer) return;

      const dots = Array.from(
        desktopContainer.querySelectorAll(".timeline-dot"),
      );
      const lines = Array.from(
        desktopContainer.querySelectorAll(".timeline-line"),
      );


      const contentGroups = Array.from(
        desktopContainer.querySelectorAll(".group"),
      );

      const tagContainers = Array.from(
        desktopContainer.querySelectorAll(
          ".col-start-2 .flex, .col-start-3 .flex",
        ),
      ).filter((el) => !el.closest(".group"));
      const tagGroups = Array.from(
        desktopContainer.querySelectorAll(
          ".col-start-1 .flex, .col-start-2 .flex, .col-start-3 .flex",
        ),
      ).filter((el) => {
        return !el.closest(".group");
      });

      if (window.__timelineAnimationHasPlayed) {
        gsap.set(dots, {
          opacity: 1,
          scale: 1,
          clearProps: "transform",
        });
        gsap.set(lines, {
          scaleY: 1,
          opacity: 1,
          clearProps: "transform",
        });
        gsap.set(contentGroups, {
          opacity: 1,
          x: 0,
          clearProps: "all",
        });
        gsap.set(tagGroups, {
          opacity: 1,
          x: 0,
          clearProps: "all",
        });
        return;
      }

      gsap.set(dots, { opacity: 0, scale: 0 });
      gsap.set(lines, { scaleY: 0, opacity: 0, transformOrigin: "top center" });
      gsap.set(contentGroups, { opacity: 0, x: -20 });
      gsap.set(tagGroups, { opacity: 0, x: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: desktopContainer,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
        },
        onComplete: () => {
          window.__timelineAnimationHasPlayed = true;
        },
      });

      dots.forEach((dot, index) => {
        const line = lines[index];
        const content = contentGroups[index];
        const tags = tagGroups[index];
        const startTime = index === 0 ? 0 : ">-0.1";

        tl.to(
          dot,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(2)",
            clearProps: "transform",
          },
          startTime,
        );
        if (content) {
          tl.to(
            content,
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
            "<+=0.1",
          );
        }
        if (tags) {
          tl.to(
            tags,
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
            "<+=0.1",
          );
        }
        if (line) {
          tl.to(
            line,
            { scaleY: 1, opacity: 1, duration: 0.3, ease: "none" },
            ">",
          );
        }
      });


      const clearActive = () => {
        dots.forEach((dot) => dot.classList.remove("is-active"));
      };

      const setActiveIndex = (index) => {
        clearActive();
        if (index < 0) return;
        const dot = dots[index];
        if (dot) dot.classList.add("is-active");
      };

      const bindHover = (el, index) => {
        if (!el || el.dataset.timelineHoverBound) return;
        el.dataset.timelineHoverBound = "true";
        el.addEventListener("mouseenter", () => setActiveIndex(index));
        el.addEventListener("mouseleave", () => setActiveIndex(-1));
      };

      contentGroups.forEach((el, index) => bindHover(el, index));
      tagGroups.forEach((el, index) => bindHover(el, index));
    },


    "(max-width: 1023px)": function () {
      const mobileContainer = document.getElementById("timeline-mobile");
      if (!mobileContainer) return;

      const dots = Array.from(
        mobileContainer.querySelectorAll(".timeline-dot"),
      );
      const lines = Array.from(
        mobileContainer.querySelectorAll(".timeline-line"),
      );
      const contentGroups = Array.from(
        mobileContainer.querySelectorAll(".timeline-content"),
      );
      const tagContainers = Array.from(
        mobileContainer.querySelectorAll(".timeline-tags"),
      );




      if (window.__timelineAnimationHasPlayed) {
        gsap.set(dots, {
          opacity: 1,
          scale: 1,
          clearProps: "transform",
        });
        gsap.set(lines, {
          scaleY: 1,
          opacity: 1,
          clearProps: "transform",
        });
        gsap.set(contentGroups, {
          opacity: 1,
          x: 0,
          clearProps: "all",
        });
        gsap.set(tagContainers, {
          opacity: 1,
          x: 0,
          clearProps: "all",
        });
        return;
      }


      gsap.set(dots, { opacity: 0, scale: 0 });
      gsap.set(lines, { scaleY: 0, opacity: 0, transformOrigin: "top center" });
      gsap.set(contentGroups, { opacity: 0, x: -20 });
      gsap.set(tagContainers, { opacity: 0, x: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: mobileContainer,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
        },
        onComplete: () => {
          window.__timelineAnimationHasPlayed = true;
        },
      });

      dots.forEach((dot, index) => {
        const line = lines[index];
        const content = contentGroups[index];
        const tags = tagContainers[index];
        const startTime = index === 0 ? 0 : ">-0.1";

        tl.to(
          dot,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(2)",
            clearProps: "transform",
          },
          startTime,
        );

        if (content) {
          tl.to(
            content,
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
            "<+=0.1",
          );
        }
        if (tags) {
          tl.to(
            tags,
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
            "<+=0.1",
          );
        }
        if (line) {
          tl.to(
            line,
            { scaleY: 1, opacity: 1, duration: 0.3, ease: "none" },
            ">",
          );
        }
      });
    },
  });
}

let marqueeTimeline = null;
let marqueeResizeObserver = null;
let marqueeRefreshRaf = null;

function initMarquee() {
  const container = document.querySelector(".marquee-container");
  if (!container) return;


  if (marqueeTimeline) {
    marqueeTimeline.kill();
    marqueeTimeline = null;
  }
  if (marqueeResizeObserver) {
    marqueeResizeObserver.disconnect();
    marqueeResizeObserver = null;
  }
  if (marqueeRefreshRaf) {
    cancelAnimationFrame(marqueeRefreshRaf);
    marqueeRefreshRaf = null;
  }


  container.innerHTML = "";

  const reducedMotion = MotionPreferences.prefersReducedMotion;
  if (reducedMotion) {
    container.classList.add("flex-wrap", "justify-center");
  }

  const tools = [
    { name: "Photon", icon: "zap" },
    { name: "DOTween", icon: "activity" },
    { name: "ScriptableObjects", icon: "layers" },
    { name: "Cinemachine", icon: "video" },
    { name: "Animator", icon: "sparkles" },
    { name: "NavMesh", icon: "map" },
    { name: "Physics", icon: "atom" },
    { name: "UnityEditor", icon: "wrench" },
  ];

  const createItem = (tool) => {
    const item = document.createElement("div");
    item.className =
      "flex items-center gap-2 md:gap-3 px-4 py-2 md:px-11 md:py-3 " +
      "bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-full " +
      "shrink-0 shadow-md md:shadow-lg hover:border-white/40 transition-colors duration-300 " +
      "pointer-events-none select-none";

    item.innerHTML = `
      <i data-lucide="${tool.icon}" class="w-4 h-4 md:w-6 md:h-6 text-white drop-shadow-md"></i>
      <span class="text-sm md:text-lg font-mono text-white font-bold tracking-wide drop-shadow-sm">${tool.name}</span>
    `;
    return item;
  };

  for (let i = 0; i < (reducedMotion ? 1 : 2); i++) {
    tools.forEach((tool) => container.appendChild(createItem(tool)));
  }

  container.dataset.marqueeSets = String(reducedMotion ? 1 : 2);

  if (typeof lucide !== "undefined") lucide.createIcons();

  if (reducedMotion) return;

  const startMarquee = () => {
    if (typeof gsap === "undefined") return;

    gsap.set(container, { x: 0 });
    container.offsetHeight;

    const items = Array.from(container.children);
    const setSize = tools.length;
    if (items.length < setSize * 2) return;

    const firstItem = items[0];
    const secondSetFirstItem = items[setSize];
    const cycleWidth = Math.round(
      secondSetFirstItem.getBoundingClientRect().left -
      firstItem.getBoundingClientRect().left,
    );

    if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;

    const viewportWidth = Math.round(
      (container.parentElement?.getBoundingClientRect().width ?? window.innerWidth) || window.innerWidth,
    );
    const neededSets = Math.max(2, Math.ceil(viewportWidth / cycleWidth) + 1);
    const currentSets = Number(container.dataset.marqueeSets) || 2;

    if (neededSets > currentSets) {
      for (let s = currentSets; s < neededSets; s++) {
        tools.forEach((tool) => container.appendChild(createItem(tool)));
      }
      container.dataset.marqueeSets = String(neededSets);
      if (typeof lucide !== "undefined") lucide.createIcons();
      requestAnimationFrame(startMarquee);
      return;
    }

    const pxPerSecond = 80;
    const duration = Math.max(8, cycleWidth / pxPerSecond);

    if (marqueeTimeline) {
      marqueeTimeline.kill();
      marqueeTimeline = null;
    }

    marqueeTimeline = gsap.to(container, {
      x: `-=${cycleWidth}`,
      duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const v = parseFloat(x) || 0;
          const wrapped = v % cycleWidth;
          return `${wrapped}px`;
        },
      },
    });
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(startMarquee);
      });
    });
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(startMarquee);
    });
  }

  if (typeof ResizeObserver !== "undefined") {
    marqueeResizeObserver = new ResizeObserver(() => {
      if (marqueeRefreshRaf) cancelAnimationFrame(marqueeRefreshRaf);
      marqueeRefreshRaf = requestAnimationFrame(() => {
        marqueeRefreshRaf = null;
        startMarquee();
      });
    });
    marqueeResizeObserver.observe(container);
  } else {
    window.addEventListener(
      "resize",
      () => {
        if (marqueeRefreshRaf) cancelAnimationFrame(marqueeRefreshRaf);
        marqueeRefreshRaf = requestAnimationFrame(() => {
          marqueeRefreshRaf = null;
          startMarquee();
        });
      },
      { passive: true },
    );
  }
}

class ScrollManager {
  constructor() {
    this.lenis = null;
    this.rafId = null;
  }

  init() {
    if (MotionPreferences.prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = "auto";
      return;
    }
    if (typeof Lenis === "undefined") {
      console.warn("Lenis not loaded, falling back to native scroll.");
      document.documentElement.style.scrollBehavior = "smooth";
      return;
    }

    this._initLenis();
    this._setupScrollbarFix();
    this._setupAnchorLinks();
  }

  _initLenis() {
    if (this.lenis) return;
    if (DeviceDetector.isTouchDevice || DeviceDetector.layout === "mobile") {
      document.documentElement.style.scrollBehavior = "smooth";
      this.lenis = null;
      window.lenis = null;
      return;
    }

    this.lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      autoResize: true,
      orientation: "vertical",
    });

    window.lenis = this.lenis;

    const raf = (time) => {
      if (!this.lenis) return;
      this.lenis.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };
    this.rafId = requestAnimationFrame(raf);
  }

  _setupScrollbarFix() {
    window.addEventListener("mousedown", (e) => {

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;



      if (
        scrollbarWidth > 0 &&
        e.clientX >= document.documentElement.clientWidth
      ) {

        if (this.lenis) {
          this.lenis.scrollTo(window.scrollY, { immediate: true });
        }
      }
    });
  }

  pauseForModal() {
    if (this.lenis && typeof this.lenis.destroy === "function") {
      this.lenis.destroy();
    }
    this.lenis = null;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    window.lenis = null;
  }

  resumeAfterModal() {
    this._initLenis();
  }

  _setupAnchorLinks() {
    document
      .querySelectorAll(".nav-item, .js-smooth-scroll")
      .forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          const href = anchor.getAttribute("href");
          if (!href || !href.startsWith("#")) return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();

          const isTouchDevice = DeviceDetector.isTouchDevice;
          const rect = target.getBoundingClientRect();
          const viewportHeight =
            window.innerHeight || document.documentElement.clientHeight;
          const currentScrollY =
            window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
          const nav = document.querySelector("nav.tubelight-nav");
          const navHeight = nav ? nav.offsetHeight : 0;

          let targetY;

          if (rect.height < viewportHeight) {
            const sectionCenterY = currentScrollY + rect.top + rect.height / 2;
            targetY = sectionCenterY - viewportHeight / 2;
          } else {
            const marginTop = viewportHeight * 0.05;
            targetY = currentScrollY + rect.top - navHeight - marginTop;
          }

          if (this.lenis && !isTouchDevice) {
            this.lenis.scrollTo(targetY, {
              duration: 1.5,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
          } else {
            window.scrollTo({
              top: targetY,
              behavior: "smooth",
            });
          }
        });
      });
  }
}

function initCVDownload() {
  const buttons = [];

  const headerBtn = document.getElementById("header-cv-btn");
  if (headerBtn) {
    buttons.push({ element: headerBtn, label: "header_cv_button" });
  }

  const heroBtn = document.getElementById("hero-cv-btn");
  if (heroBtn) {
    buttons.push({ element: heroBtn, label: "hero_cv_button" });
  }

  const bentoBtn = document.getElementById("download-cv-btn");
  if (bentoBtn) {
    buttons.push({ element: bentoBtn, label: "about_cv_card" });
  }

  if (!buttons.length) return;

  buttons.forEach(({ element, label }) => {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentLang = (localStorage.getItem("lang") || "en").toLowerCase();
      const fileName =
        currentLang === "pt-br"
          ? "MarcioRosendoResumePtbr.pdf"
          : "MarcioRosendoResumeEn.pdf";

      showToast("toast_cv_downloading", "info");

      trackEvent("cv_download", {
        event_category: "engagement",
        event_label: label,
        lang: currentLang,
      });

      const link = document.createElement("a");
      link.href = fileName;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
}

function initScrollAnimations() {
  if (MotionPreferences.prefersReducedMotion) {
    document.querySelectorAll(".fade-in-section").forEach((section) => {
      section.classList.add("is-visible");
    });
    return;
  }
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in-section").forEach((section) => {
    observer.observe(section);
  });
}

function initProjectCardsAccessibility() {
  const cards = document.querySelectorAll(
    ".accordion-card[data-project-index]",
  );
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
  });
}

const CONTACT_MIN_SUBMIT_MS = 900;
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  if (!form.action) {
    form.action = `https://formsubmit.co/${getContactEmail()}`;
  }
  form.addEventListener("submit", handleContactSubmit);
}
async function handleContactSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.getElementById("contact-submit-btn");
  if (!btn) return;
  const btnText = btn.querySelector(".btn-text");

  if (!btnText) return;

  btn.disabled = true;
  btn.classList.add("cursor-not-allowed", "opacity-80", "is-sending");
  btnText.setAttribute("data-translate", "contact_btn_sending");
  const sendingKey = "contact_btn_sending";
  if (TRANSLATIONS[sendingKey]) {
    btnText.textContent = TRANSLATIONS[sendingKey];
  } else {
    btnText.textContent = "Transmitting...";
  }
  try {
    const formData = new FormData(form);
    const startTime = performance.now();
    let response;

    try {
      response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
    } catch (fetchError) {
      const elapsed = performance.now() - startTime;
      if (elapsed < CONTACT_MIN_SUBMIT_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONTACT_MIN_SUBMIT_MS - elapsed),
        );
      }
      throw fetchError;
    }

    const elapsed = performance.now() - startTime;
    if (elapsed < CONTACT_MIN_SUBMIT_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONTACT_MIN_SUBMIT_MS - elapsed),
      );
    }

    if (response.ok) {

      trackEvent("contact_submit", {
        event_category: "engagement",
        event_label: "contact_form",
        status: "success",
      });

      form.reset();

      btn.classList.remove("is-sending");
      btn.classList.add("is-success");

      btnText.setAttribute("data-translate", "contact_btn_success");
      const successKey = "contact_btn_success";
      if (TRANSLATIONS[successKey]) {
        btnText.textContent = TRANSLATIONS[successKey];
      } else {
        btnText.textContent = "Transmitted!";
      }


      const successOverlay = document.getElementById("contact-success");
      if (successOverlay) {
        successOverlay.classList.remove("hidden");
        requestAnimationFrame(() => {
          successOverlay.classList.remove("opacity-0");
          successOverlay.classList.add("opacity-100");
        });
      }


      showToast("contact_success_message", "success");

      setTimeout(() => {
        btn.classList.remove("is-success");
        btn.disabled = false;
        btn.classList.remove("cursor-not-allowed", "opacity-80");
        btnText.setAttribute("data-translate", "contact_btn_send");
        const key = "contact_btn_send";
        if (TRANSLATIONS[key]) {
          btnText.textContent = TRANSLATIONS[key];
        } else {
          btnText.textContent = "Send Message";
        }
      }, 1800);
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    trackEvent("contact_submit", {
      event_category: "engagement",
      event_label: "contact_form",
      status: "error",
    });
    alert("Connection Error. Please try again or email directly.");
    btn.disabled = false;
    btn.classList.remove("cursor-not-allowed", "opacity-80", "is-sending", "is-success");
    btnText.setAttribute("data-translate", "contact_btn_send");
    const key = "contact_btn_send";
    if (TRANSLATIONS[key]) {
      btnText.textContent = TRANSLATIONS[key];
    } else {
      btnText.textContent = "Send Message";
    }
  }
}

window.resetContactForm = function () {
  const form = document.getElementById("contact-form");
  const successOverlay = document.getElementById("contact-success");
  const btn = document.getElementById("contact-submit-btn");
  const btnText = btn?.querySelector(".btn-text");

  if (successOverlay) {
    successOverlay.classList.remove("opacity-100");
    successOverlay.classList.add("opacity-0");
    setTimeout(() => {
      successOverlay.classList.add("hidden");
    }, 500);
  }

  if (form) {
    form.reset();
  }

  if (btn) {
    btn.disabled = false;
    btn.classList.remove("is-success", "is-sending", "cursor-not-allowed", "opacity-80");

    if (btnText) {
      btnText.setAttribute("data-translate", "contact_btn_send");
      const key = "contact_btn_send";
      if (TRANSLATIONS[key]) {
        btnText.textContent = TRANSLATIONS[key];
      } else {
        btnText.textContent = "Send Message";
      }
    }
  }
};

function initContactAnalytics() {
  const contactLinks = document.querySelectorAll("[data-analytics^='contact-']");
  if (!contactLinks.length) return;

  contactLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const type = link.dataset.analytics.replace("contact-", "");

      trackEvent("contact_click", {
        event_category: "engagement",
        event_label: type,
        destination: link.dataset.destination || link.getAttribute("href") || "",
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {



  applyDocumentLanguage();
  await loadTranslations(LANG, true);


  initNavbar();
  initContactIdentity();

  if (MotionPreferences.prefersReducedMotion) {
    document.documentElement.classList.add("reduced-motion");
  } else {
    initCursor();
    initInteractiveEffects();
  }
  initMarquee();
  initScrollAnimations();
  if (!MotionPreferences.prefersReducedMotion) {
    initTimelineAnimation();
    initPulseAnimations();
  }
  initProjectCardsAccessibility();
  initCVDownload();
  initContactForm();
  initContactAnalytics();

  updateLanguageToggle();

  document.querySelectorAll(".js-lang-btn[data-lang]").forEach((button) => {
    button.addEventListener("click", () =>
      setLanguage(button.getAttribute("data-lang")),
    );
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    const navLamp = document.getElementById("nav-lamp");
    const langLamp = document.getElementById("lang-lamp");
    const heroLangLamp = document.getElementById("lang-lamp-hero");

    if (typeof gsap !== "undefined") {
      if (navLamp) {
        gsap.to(navLamp, { opacity: 0, duration: 0.15, overwrite: true });
      }
      if (langLamp) {
        gsap.to(langLamp, { opacity: 0, duration: 0.15, overwrite: true });
      }
      if (heroLangLamp) {
        gsap.to(heroLangLamp, { opacity: 0, duration: 0.15, overwrite: true });
      }
    }

    resizeTimeout = setTimeout(() => {
      const nav = document.querySelector("nav.tubelight-nav");
      if (nav) {
        nav.scrollLeft = 0;
      }

      if (navbarHighlight) {
        navbarHighlight.updateHighlight();
      }
      if (languageHighlight) {
        languageHighlight.updateHighlight();
      }
      if (heroLanguageHighlight) {
        heroLanguageHighlight.updateHighlight();
      }

      if (typeof gsap !== "undefined") {
        if (navLamp) {
          gsap.to(navLamp, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        }
        if (langLamp) {
          gsap.to(langLamp, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        }
        if (heroLangLamp) {
          gsap.to(heroLangLamp, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      }
    }, 200);
  });
});

window.addEventListener("load", () => {
  initThreeJS();
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.warn("Lucide icons not loaded!");
  }

  const scrollManager = new ScrollManager();
  scrollManager.init();
  window.scrollManager = scrollManager;
});
