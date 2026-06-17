import { DeviceDetector, LayoutCache } from "./device-detector.js";
import { getLanguage, onLanguageChange, registerTransitionHook } from "./i18n.js";

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

    if (!this.lamp || !element) {
      return baseDuration;
    }

    const lampData = LayoutCache.get(this.lamp);
    const targetData = LayoutCache.get(element);
    const containerData = this.container ? LayoutCache.get(this.container) : null;

    if (!lampData || !targetData || !containerData) {
      return baseDuration;
    }
    const fullSpan = containerData.width;

    const leftCurrent = lampData.left;
    const rightCurrent = lampData.right;
    const leftTarget = targetData.left;
    const rightTarget = targetData.right;

    const maxEdgeDistance = Math.max(
      Math.abs(leftTarget - leftCurrent),
      Math.abs(rightTarget - rightCurrent)
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
    const data = LayoutCache.get(element);
    if (!data) return { left: 0, width: 0 };
    return {
      left: data.offsetLeft,
      width: data.offsetWidth,
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
        true
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
    this._onSectionIntersect = this._onSectionIntersect.bind(this);
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
    this._setupIntersectSpy();
    this._initializePosition();
  }

  _getAnimationTargets() {
    return this.navbarContainers;
  }

  _shouldSlideOnHide() {
    const bottomLayoutQuery = window.matchMedia(
      "(max-width: 820px), (max-height: 540px)"
    );
    return !bottomLayoutQuery.matches;
  }

  setActive(element) {
    if (!element) return;

    this.activeElement = element;
    this.items.forEach((item) => item.classList.remove("active"));
    element.classList.add("active");

    this._animateToElement(element);
  }

  updateHighlight() {
    if (this.activeElement && this.lamp) {
      const pos = this._calculatePosition(this.activeElement);
      gsap.set(this.lamp, {
        left: pos.left,
        width: pos.width,
        opacity: 1,
        scaleX: 1,
      });
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  _onSectionIntersect(entries) {
    entries.forEach((entry) => {
      this.visibleSections.set(entry.target.id, {
        isIntersecting: entry.isIntersecting,
        ratio: entry.intersectionRatio,
        rect: entry.boundingClientRect,
      });
    });

    this._updateActiveSection();
  }

  _updateActiveSection() {
    const viewportHeight = window.innerHeight;
    const triggerLine = viewportHeight * 0.35;

    let bestSection = null;

    const docHeight = document.documentElement.scrollHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    const isNearBottom = scrollY + viewportHeight >= docHeight - 100;

    if (isNearBottom) {
      bestSection = this.sectionElements[this.sectionElements.length - 1];
    } else {
      for (const section of this.sectionElements) {
        const data = this.visibleSections.get(section.id);
        if (!data || !data.isIntersecting || !data.rect) continue;

        const rect = data.rect;
        if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
          bestSection = section;
          break;
        }
      }
    }

    if (bestSection) {
      const navLink = this.sectionIdToNavLink.get(bestSection.id);
      if (navLink && navLink !== this.activeElement) {
        this.setActive(navLink);
      }
    }
  }

  _setupIntersectSpy() {
    if (this.observer) this.observer.disconnect();

    this.sectionElements = [];
    this.sectionIdToNavLink.clear();

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => {
      const navLink = document.querySelector(`a[href="#${section.id}"]`);
      if (navLink) {
        this.sectionElements.push(section);
        this.sectionIdToNavLink.set(section.id, navLink);
      }
    });

    this.observer = new IntersectionObserver(this._onSectionIntersect, {
      root: null,
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    });

    this.sectionElements.forEach((section) => this.observer.observe(section));
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
    if (!this.lamp) return;
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
}

class LanguageHighlight extends BaseHighlight {
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
    this.container.setAttribute("data-active-lang", getLanguage());

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
      "(max-width: 880px), (max-height: 540px)"
    );
    return !bottomLayoutQuery.matches;
  }

  setActive(element) {
    if (!element) return;

    this.activeElement = element;
    this._animateToElement(element);
  }

  updateHighlight() {
    if (!this.lamp || !this.activeElement) return;

    const pos = this._calculatePosition(this.activeElement);
    gsap.set(this.lamp, {
      left: pos.left,
      width: pos.width,
      opacity: 1,
    });
  }

  _initializePosition() {
    const activeLang = getLanguage() || this.container.getAttribute("data-active-lang");
    const activeBtn = this.container.querySelector(
      `[data-lang="${activeLang}"]`
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
    if (!this.lamp) return;
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

export const navbarHighlight = new NavbarHighlight();
export const languageHighlight = new LanguageHighlight();
export const footerLanguageHighlight = new LanguageHighlight({
  containerId: "language-toggle-footer",
  lampId: "lang-lamp-footer",
  hoverOutlineId: "lang-hover-outline-footer",
});

let mobileFabScrollHandler = null;
let mobileFabOutsideClickHandler = null;

function initMobileFab() {
  const trigger = document.getElementById("mobile-fab-trigger");
  const menu = document.getElementById("mobile-fab-menu");
  if (!trigger || !menu) return;

  const menuIcon = trigger.querySelector(".fab-icon-menu");
  const closeIcon = trigger.querySelector(".fab-icon-close");

  if (mobileFabScrollHandler) {
    window.removeEventListener("scroll", mobileFabScrollHandler);
  }
  if (mobileFabOutsideClickHandler) {
    document.removeEventListener("click", mobileFabOutsideClickHandler);
  }

  const closeMenu = () => {
    menu.classList.remove("active");
    trigger.classList.remove("active");
    window.removeEventListener("scroll", mobileFabScrollHandler);
  };

  mobileFabScrollHandler = () => {
    if (menu.classList.contains("active")) {
      closeMenu();
    }
  };

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = menu.classList.toggle("active");
    trigger.classList.toggle("active", isActive);
    if (isActive) {
      window.addEventListener("scroll", mobileFabScrollHandler, { passive: true });
    } else {
      window.removeEventListener("scroll", mobileFabScrollHandler);
    }
  });

  menu.querySelectorAll(".fab-menu-item").forEach(item => {
    item.addEventListener("click", () => {
      closeMenu();
    });
  });

  mobileFabOutsideClickHandler = (e) => {
    if (!trigger.contains(e.target) && !menu.contains(e.target)) {
      closeMenu();
    }
  };
  document.addEventListener("click", mobileFabOutsideClickHandler);
}

export function initNavbar() {
  navbarHighlight.init();
  languageHighlight.init();
  footerLanguageHighlight.init();
  initMobileFab();
}

export function updateLanguageToggle(lang, animate = false) {
  const currentLang = lang || getLanguage();
  const desktopToggle = document.getElementById("language-toggle");
  if (desktopToggle) {
    desktopToggle.setAttribute("data-active-lang", currentLang);

    if (languageHighlight) {
      const activeBtn = desktopToggle.querySelector(`[data-lang="${currentLang}"]`);
      if (activeBtn) {
        if (animate) {
          languageHighlight.setActive(activeBtn);
        } else {
          languageHighlight.activeElement = activeBtn;
          languageHighlight.updateHighlight();
        }
      }
    }
  }

  document.querySelectorAll(".js-lang-btn[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === currentLang);
  });

  document
    .querySelectorAll('[data-language-toggle="tubelight"]')
    .forEach((toggle) => toggle.setAttribute("data-active-lang", currentLang));

  if (footerLanguageHighlight) {
    const footerToggle = document.getElementById("language-toggle-footer");
    const activeBtn = footerToggle?.querySelector(`[data-lang="${currentLang}"]`);
    if (activeBtn) {
      if (animate) {
        footerLanguageHighlight.setActive(activeBtn);
      } else {
        footerLanguageHighlight.activeElement = activeBtn;
        footerLanguageHighlight.updateHighlight();
      }
    }
  }

  if (navbarHighlight && navbarHighlight.container) {
    navbarHighlight.updateHighlight();
  }
}

onLanguageChange((lang) => {
  if (navbarHighlight) {
    navbarHighlight._updateActiveSection();
    const active = navbarHighlight.activeElement;
    if (active) navbarHighlight.setActive(active);
  }
  updateLanguageToggle(lang, true);
});

registerTransitionHook({
  hide: () => {
    const timeline = gsap.timeline();
    if (navbarHighlight) timeline.add(navbarHighlight.hide(), 0);
    if (languageHighlight) timeline.add(languageHighlight.hide(), 0);
    return timeline;
  },
  show: () => {
    const timeline = gsap.timeline();
    timeline.add(() => {
      if (!navbarHighlight) return;
      navbarHighlight._updateActiveSection();
      const active = navbarHighlight.activeElement;
      if (active) navbarHighlight.setActive(active);
    }, 0);
    if (navbarHighlight) timeline.add(navbarHighlight.show(), 0);
    if (languageHighlight) timeline.add(languageHighlight.show(), 0);
    return timeline;
  }
});
