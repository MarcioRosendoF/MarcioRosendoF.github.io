import { MotionPreferences, DeviceDetector, LayoutCache } from "./modules/device-detector.js";
import {
  applyDocumentLanguage,
  loadTranslations,
  getLanguage,
  setLanguage,
} from "./modules/i18n.js";
import {
  initNavbar,
  navbarHighlight,
  languageHighlight,
  footerLanguageHighlight,
  updateLanguageToggle,
} from "./modules/navbar.js";
import {
  initContactIdentity,
  initContactForm,
  initContactAnalytics,
  initCVDownload,
} from "./modules/contact.js";
import {
  initThreeJS,
  initMobileParticles,
  initScrollAnimations,
  initTimelineAnimation,
  initPulseAnimations,
  initInteractiveEffects,
} from "./modules/effects.js";
import { initMarquee } from "./modules/marquee.js";
import { ScrollManager } from "./modules/scroll-manager.js";
import { initProjectCardsAccessibility } from "./modules/projects.js";
import { initTimeline } from "./modules/timeline.js";

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

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    document.body.classList.add("fonts-loaded");
  });
} else {
  document.body.classList.add("fonts-loaded");
}

document.addEventListener("DOMContentLoaded", async () => {
  applyDocumentLanguage();
  await loadTranslations(getLanguage(), true);

  initNavbar();
  initTimeline();
  initContactIdentity();

  if (MotionPreferences.prefersReducedMotion) {
    document.documentElement.classList.add("reduced-motion");
  } else {
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
      setLanguage(button.getAttribute("data-lang"))
    );
  });

  const navLamp = document.getElementById("nav-lamp");
  const langLamp = document.getElementById("lang-lamp");
  const footerLangLamp = document.getElementById("lang-lamp-footer");
  const nav = document.querySelector("nav.tubelight-nav");

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    if (typeof gsap !== "undefined") {
      if (navLamp) {
        gsap.to(navLamp, { opacity: 0, duration: 0.15, overwrite: true });
      }
      if (langLamp) {
        gsap.to(langLamp, { opacity: 0, duration: 0.15, overwrite: true });
      }
      if (footerLangLamp) {
        gsap.to(footerLangLamp, { opacity: 0, duration: 0.15, overwrite: true });
      }
    }

    resizeTimeout = setTimeout(() => {
      if (nav) {
        nav.scrollLeft = 0;
      }

      if (navbarHighlight) {
        navbarHighlight.updateHighlight();
      }
      if (languageHighlight) {
        languageHighlight.updateHighlight();
      }
      if (footerLanguageHighlight) {
        footerLanguageHighlight.updateHighlight();
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
        if (footerLangLamp) {
          gsap.to(footerLangLamp, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      }
    }, 200);
  }, { passive: true });
});

window.addEventListener("load", () => {
  if (!DeviceDetector.isMobile) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => initThreeJS(), { timeout: 2000 });
    } else {
      setTimeout(initThreeJS, 1);
    }
  } else {
    initMobileParticles();
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.warn("Lucide icons not loaded!");
  }

  const scrollManager = new ScrollManager();
  scrollManager.init();
  window.scrollManager = scrollManager;
});
