export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", name, params);
}

export const MotionPreferences = {
  get prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
};


export const DeviceDetector = {
  get isTouchDevice() {
    return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  },
  get isMobilePortrait() {
    return window.matchMedia(
      "(max-width: 820px) and (orientation: portrait)"
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
  }
};

export const LayoutCache = {
  _cache: new Map(),
  _scheduled: false,

  get(el) {
    if (!el) return null;
    let entry = this._cache.get(el);
    if (!entry) {
      entry = this.update(el);
    }
    return entry;
  },

  update(el) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const pageX = window.pageXOffset || window.scrollX || 0;
    const pageY = window.pageYOffset || window.scrollY || 0;
    const entry = {
      left: rect.left + pageX,
      top: rect.top + pageY,
      right: rect.right + pageX,
      bottom: rect.bottom + pageY,
      width: rect.width,
      height: rect.height,
      offsetLeft: el.offsetLeft,
      offsetTop: el.offsetTop,
      offsetWidth: el.offsetWidth,
      offsetHeight: el.offsetHeight,
      paddingRight: style.paddingRight,
      timestamp: performance.now()
    };
    this._cache.set(el, entry);
    return entry;
  },

  invalidate(el) {
    if (el) {
      this._cache.delete(el);
    } else {
      this._cache.clear();
    }
  },

  refreshAll() {
    for (const el of this._cache.keys()) {
      this.update(el);
    }
  },

  scheduleRefresh() {
    if (this._scheduled) return;
    this._scheduled = true;
    requestAnimationFrame(() => {
      this.refreshAll();
      this._scheduled = false;
    });
  }
};

window.addEventListener("resize", () => LayoutCache.scheduleRefresh(), { passive: true });
