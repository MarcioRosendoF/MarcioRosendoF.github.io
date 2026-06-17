import { DeviceDetector, MotionPreferences, LayoutCache } from "./device-detector.js";

export class ScrollManager {
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
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0 && e.clientX >= document.documentElement.clientWidth) {
        if (this.lenis) {
          this.lenis.scrollTo(window.scrollY, { immediate: true });
        }
      }
    });
  }

  pauseForModal() {
    if (this.lenis) {
      this.lenis.stop();
    }
  }

  resumeAfterModal() {
    if (this.lenis) {
      this.lenis.start();
    }
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
          const data = LayoutCache.get(target);
          if (!data) return;

          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
          const nav = document.querySelector("nav.tubelight-nav");
          const navHeight = nav ? (LayoutCache.get(nav)?.offsetHeight || 0) : 0;

          let targetY;
          if (href === "#hero") {
            targetY = 0;
          } else {
            targetY = Math.max(0, data.top - navHeight - 20);
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
