import { DeviceDetector, MotionPreferences, LayoutCache } from "./device-detector.js";

const transitionHooks = [];
export function registerTransitionHook(hook) {
  transitionHooks.push(hook);
}
export function getTransitionHooks() {
  return transitionHooks;
}

let TRANSLATIONS = {};
let LANG = localStorage.getItem("lang");

if (!LANG) {
  const browserLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  LANG = browserLang.startsWith("pt") ? "pt-br" : "en";
} else {
  LANG = LANG.toLowerCase();
}

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

export function getLanguage() {
  return LANG;
}

export function getTranslations() {
  return TRANSLATIONS;
}

export function applyDocumentLanguage() {
  const html = document.documentElement;
  html.setAttribute("lang", LANG === "pt-br" ? "pt-BR" : "en");
}

const listeners = [];

export function onLanguageChange(callback) {
  listeners.push(callback);
}

function notifyLanguageChange() {
  listeners.forEach((cb) => cb(LANG));
}



let translationTimeline = null;

export async function loadTranslations(lang, isInitialLoad = false) {
  try {
    const response = await fetch(`i18n/${lang}.json?v=2.8`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar tradução: ${response.statusText}`);
    }
    TRANSLATIONS = await response.json();
    translatePage(isInitialLoad);
  } catch (error) {
    console.error(error);
    translatePage(isInitialLoad);
  }
}

export function setLanguage(lang) {
  const targetLang = _getValidLanguage(lang);

  if (LANG === targetLang) {
    notifyLanguageChange();
    return;
  }

  LANG = targetLang;
  localStorage.setItem("lang", LANG);
  applyDocumentLanguage();
  loadTranslations(LANG);

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "language_switch", {
      event_category: "ui",
      event_label: targetLang,
    });
  }
}

function translatePage(isInitialLoad = false) {
  const textElements = document.querySelectorAll("[data-translate]");
  const heroChildren = document.querySelectorAll("#hero > *");

  const aboutSection = document.getElementById("about");
  const aboutDivider = aboutSection?.querySelector(".section-divider");
  const aboutContent = [
    aboutSection?.querySelector("h2")?.parentElement,
    aboutSection?.querySelector(".about-photo-card"),
  ];
  if (aboutSection) {
    aboutContent.push(...aboutSection.querySelectorAll(".spotlight-card"));
  }

  const marqueeSection = document.querySelector(".marquee-container")?.closest("section");

  const timelineSection = document.getElementById("timeline");
  const timelineDivider = timelineSection?.querySelector(".section-divider");
  const timelineContent = [
    timelineSection?.querySelector("h2")?.parentElement,
    document.getElementById("timeline-container"),
  ];

  const projectsSection = document.getElementById("projects");
  const projectsDivider = projectsSection?.querySelector(".section-divider");
  const projectsContent = [
    projectsSection?.querySelector("h2")?.parentElement,
    ...(projectsSection ? Array.from(projectsSection.querySelectorAll("h3, .project-grid-container")) : []),
  ];

  const contactSection = document.getElementById("contact");
  const contactDivider = contactSection?.querySelector(".section-divider");
  const contactContent = [
    contactSection?.querySelector(".grid.grid-cols-1"),
  ];

  const footer = document.querySelector("footer");
  const footerAnalyticsNotice = footer?.querySelector("p");

  const headerCvBtn = document.getElementById("header-cv-btn");
  const navItems = document.querySelectorAll(".nav-item");
  const languageToggle = document.getElementById("language-toggle");
  const languageToggleFooter = document.getElementById("language-toggle-footer");

  let orderedTargets = [
    headerCvBtn,
    languageToggle,
    ...Array.from(navItems),
    ...heroChildren,
    projectsDivider,
    ...projectsContent,
    aboutDivider,
    ...aboutContent,
    marqueeSection,
    timelineDivider,
    ...timelineContent,
    contactDivider,
    ...contactContent,
    languageToggleFooter,
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
    orderedTargets.reverse();
  } else {
    orderedTargets = orderedTargets.filter((el) => el !== languageToggle && el !== languageToggleFooter);
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
          const val = TRANSLATIONS[key];
          if (val.indexOf("<") === -1) {
            element.textContent = val;
          } else {
            element.innerHTML = val;
          }
        }
      }
    });

    const ariaElements = document.querySelectorAll("[data-translate-aria-label]");
    ariaElements.forEach((element) => {
      const key = element.getAttribute("data-translate-aria-label");
      if (TRANSLATIONS[key]) {
        element.setAttribute("aria-label", TRANSLATIONS[key]);
      }
    });

    LayoutCache.invalidate();

    requestAnimationFrame(() => {
      if (typeof ScrollTrigger !== "undefined" && !DeviceDetector.isMobile) {
        ScrollTrigger.refresh();
      }
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });
  }

  if (MotionPreferences.prefersReducedMotion) {
    updateContent();
    notifyLanguageChange();
    document.documentElement.classList.remove("lang-loading");
    return;
  }

  if (translationTimeline) {
    translationTimeline.kill();
    gsap.set(document.body, { clearProps: "pointerEvents" });
  }

  const timelineGridElements = document.querySelectorAll(
    "#timeline .grid > div, #timeline .timeline-dot, #timeline .timeline-line"
  );

  const safeTargets = orderedTargets.filter(
    (el) => !Array.from(timelineGridElements).includes(el)
  );

  gsap.killTweensOf(safeTargets);

  if (isInitialLoad) {
    updateContent();
    notifyLanguageChange();
    document.documentElement.classList.remove("lang-loading");
    animateHeroEntrance();
    return;
  }

  notifyLanguageChange();

  translationTimeline = gsap.timeline({
    onComplete: () => {
      gsap.set(document.body, { clearProps: "pointerEvents" });
    },
  });

  const timeline = translationTimeline;

  timeline.add("start");
  timeline.set(document.body, { pointerEvents: "none" }, "start");
  timeline.set(orderedTargets, { transition: "none" }, "start");

  getTransitionHooks().forEach((hook) => {
    if (typeof hook.hide === "function") {
      const anim = hook.hide();
      if (anim) timeline.add(anim, "start");
    }
  });

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

  getTransitionHooks().forEach((hook) => {
    if (typeof hook.show === "function") {
      const anim = hook.show();
      if (anim) timeline.add(anim, "enter");
    }
  });

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
      t
    );
  });
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
