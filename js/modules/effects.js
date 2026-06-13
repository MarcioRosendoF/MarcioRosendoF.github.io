import { DeviceDetector, LayoutCache, MotionPreferences } from "./device-detector.js";

const loadExternalScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
};

const loadScript = (src) => {
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
};

async function loadScrollTrigger() {
  if (typeof window.ScrollTrigger !== "undefined") return;
  try {
    await loadExternalScript("./assets/vendor/ScrollTrigger.min.js");
    if (typeof gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
      gsap.registerPlugin(window.ScrollTrigger);
    }
  } catch (e) {
    console.warn("Failed to load ScrollTrigger", e);
  }
}

let isCanvasVisible = true;

function setupCanvasVisibilityObserver(canvas) {
  if (!canvas) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isCanvasVisible = entry.isIntersecting;
    });
  }, { threshold: 0 });
  observer.observe(canvas);
}

export const initThreeJS = async () => {
  if (MotionPreferences.prefersReducedMotion) return;
  const canvas = document.getElementById("webgl-canvas");
  if (!canvas) {
    console.error("WebGL Canvas not found!");
    return;
  }

  setupCanvasVisibilityObserver(canvas);

  try {
    if (typeof THREE === "undefined") {
      await loadScript("./assets/vendor/three.min.js");
    }
  } catch (err) {
    console.error("Failed to load Three.js dynamically:", err);
    return;
  }

  if (typeof THREE === "undefined") {
    console.error("Three.js is not loaded even after dynamic pull!");
    return;
  }

  const t = DeviceDetector.layout;
  const n = "mobile" === t;
  const i = "tablet" === t;
  const o = "desktop" === t;
  let a = i ? 75 : 120;
  let r = n ? 45 : i ? 50 : 60;
  const s = 1000 / r;
  let l = 0;
  const c = n ? 1.3 : 1;
  const d = new THREE.Scene();
  const u = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const m = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: o,
    powerPreference: "high-performance",
  });
  let h, g;
  m.setClearColor(0, 0);
  m.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  m.setSize(window.innerWidth, window.innerHeight);
  u.position.z = 5;

  const p = () => {
    const e = (u.fov * Math.PI) / 180;
    h = 2 * Math.tan(e / 2) * u.position.z;
    g = h * u.aspect;
  };
  p();

  const f = new Float32Array(3 * a);
  const v = [];
  for (let e = 0; e < a; e++) {
    f[3 * e] = (Math.random() - 0.5) * g * 2;
    f[3 * e + 1] = (Math.random() - 0.5) * h * 2;
    f[3 * e + 2] = 10 * (Math.random() - 0.5);
    v.push({
      x: 0.005 * (Math.random() - 0.5) * c,
      y: 0.005 * (Math.random() - 0.5) * c,
    });
  }

  const y = new THREE.BufferGeometry();
  y.setAttribute("position", new THREE.BufferAttribute(f, 3));
  const w = new THREE.PointsMaterial({
    size: 0.04,
    color: 8947848,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const b = new THREE.Points(y, w);
  d.add(b);

  const E = (e) => {
    window.threeRafId = requestAnimationFrame(E);
    if (!isCanvasVisible) return;

    const t = e - l;
    if (t < s) return;
    l = e - (t % s);
    const i = y.attributes.position;
    const o = (2 * g) / 2;
    const r = (2 * h) / 2;
    for (let e = 0; e < a; e++) {
      let t = i.getX(e);
      let n = i.getY(e);
      t += v[e].x;
      n += v[e].y;
      if (t > o) t = -o;
      if (t < -o) t = o;
      if (n > r) n = -r;
      if (n < -r) n = r;
      i.setXYZ(e, t, n, i.getZ(e));
    }
    i.needsUpdate = true;
    const c = n ? 2 : 1;
    b.rotation.y += 3e-4 * c;
    b.rotation.x += 1e-4 * c;
    m.render(d, u);
  };

  gsap.set(canvas, { opacity: 0 });
  setTimeout(() => {
    requestAnimationFrame(E);
    gsap.to(canvas, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, 400);

  window.addEventListener("resize", () => {
    if (void 0 !== m) {
      u.aspect = window.innerWidth / window.innerHeight;
      u.updateProjectionMatrix();
      m.setSize(window.innerWidth, window.innerHeight);
      p();
    }
  });
};

export const initMobileParticles = () => {
  const canvas = document.getElementById("webgl-canvas");
  if (!canvas) return;

  setupCanvasVisibilityObserver(canvas);

  const t = canvas.getContext("2d");
  if (!t) return;
  const n = [];
  const i = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", i);
  i();

  for (let t = 0; t < 18; t++) {
    const t = 0.6 * Math.random() + 0.4;
    n.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0.35 * (Math.random() - 0.5) * t,
      vy: 0.35 * (Math.random() - 0.5) * t,
      size: 1.7 * Math.random() + 0.8,
    });
  }

  const o = () => {
    window.mobileRafId = requestAnimationFrame(o);
    if (!isCanvasVisible) return;

    t.clearRect(0, 0, canvas.width, canvas.height);
    t.fillStyle = "rgba(136, 136, 136, 0.4)";
    n.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0) n.x = canvas.width;
      if (n.x > canvas.width) n.x = 0;
      if (n.y < 0) n.y = canvas.height;
      if (n.y > canvas.height) n.y = 0;
      t.beginPath();
      t.arc(n.x, n.y, n.size, 0, 2 * Math.PI);
      t.fill();
    });
  };

  gsap.set(canvas, { opacity: 0 });
  setTimeout(() => {
    requestAnimationFrame(o);
    gsap.to(canvas, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, 400);
};

export function initScrollAnimations() {
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

let nativeTimelineObserver = null;

export function initTimelineAnimation() {
  if (MotionPreferences.prefersReducedMotion) return;
  const timelineSection = document.getElementById("timeline");
  if (!timelineSection || typeof gsap === "undefined") return;

  const initMobile = () => {
    const mobileContainer = document.getElementById("timeline-mobile");
    if (!mobileContainer) return;

    if (nativeTimelineObserver) {
      nativeTimelineObserver.disconnect();
      nativeTimelineObserver = null;
    }

    if (window.__timelineAnimationHasPlayed) {
      gsap.set("#timeline-mobile .timeline-dot", { opacity: 1, scale: 1, clearProps: "transform" });
      gsap.set("#timeline-mobile .timeline-line", { scaleY: 1, opacity: 1, clearProps: "transform" });
      gsap.set("#timeline-mobile .timeline-content", { opacity: 1, x: 0, clearProps: "all" });
      gsap.set("#timeline-mobile .timeline-tags", { opacity: 1, x: 0, clearProps: "all" });
      return;
    }

    gsap.set("#timeline-mobile .timeline-dot", { opacity: 0, scale: 0 });
    gsap.set("#timeline-mobile .timeline-line", { scaleY: 0, opacity: 0, transformOrigin: "top center" });
    gsap.set("#timeline-mobile .timeline-content", { opacity: 0, x: -20 });
    gsap.set("#timeline-mobile .timeline-tags", { opacity: 0, x: 20 });

    nativeTimelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !window.__timelineAnimationHasPlayed) {
          const dots = Array.from(mobileContainer.querySelectorAll(".timeline-dot"));
          const lines = Array.from(mobileContainer.querySelectorAll(".timeline-line"));
          const contentGroups = Array.from(mobileContainer.querySelectorAll(".timeline-content"));
          const tagContainers = Array.from(mobileContainer.querySelectorAll(".timeline-tags"));

          const tl = gsap.timeline({
            onComplete: () => {
              window.__timelineAnimationHasPlayed = true;
              if (nativeTimelineObserver) {
                nativeTimelineObserver.disconnect();
                nativeTimelineObserver = null;
              }
            },
          });

          dots.forEach((dot, index) => {
            const line = lines[index];
            const content = contentGroups[index];
            const tags = tagContainers[index];
            const startTime = index === 0 ? 0 : ">-0.1";

            tl.to(dot, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", clearProps: "transform" }, startTime);
            if (content) tl.to(content, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "<+=0.1");
            if (tags) tl.to(tags, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "<+=0.1");
            if (line) tl.to(line, { scaleY: 1, opacity: 1, duration: 0.3, ease: "none" }, ">");
          });
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px"
    });

    nativeTimelineObserver.observe(mobileContainer);
  };

  const initDesktop = async () => {
    if (nativeTimelineObserver) {
      nativeTimelineObserver.disconnect();
      nativeTimelineObserver = null;
    }

    await loadScrollTrigger();
    if (typeof window.ScrollTrigger === "undefined") return;

    window.ScrollTrigger.matchMedia({
      "(min-width: 1024px)": function () {
        const desktopContainer = document.getElementById("timeline-desktop");
        if (!desktopContainer) return;

        const dots = Array.from(desktopContainer.querySelectorAll(".timeline-dot"));
        const lines = Array.from(desktopContainer.querySelectorAll(".timeline-line"));
        const contentGroups = Array.from(desktopContainer.querySelectorAll(".group"));

        const tagGroups = Array.from(
          desktopContainer.querySelectorAll(
            ".col-start-1 .flex, .col-start-2 .flex, .col-start-3 .flex"
          )
        ).filter((el) => {
          return !el.closest(".group");
        });

        if (window.__timelineAnimationHasPlayed) {
          gsap.set(dots, { opacity: 1, scale: 1, clearProps: "transform" });
          gsap.set(lines, { scaleY: 1, opacity: 1, clearProps: "transform" });
          gsap.set(contentGroups, { opacity: 1, x: 0, clearProps: "all" });
          gsap.set(tagGroups, { opacity: 1, x: 0, clearProps: "all" });
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

          tl.to(dot, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", clearProps: "transform" }, startTime);
          if (content) {
            tl.to(content, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "<+=0.1");
          }
          if (tags) {
            tl.to(tags, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "<+=0.1");
          }
          if (line) {
            tl.to(line, { scaleY: 1, opacity: 1, duration: 0.3, ease: "none" }, ">");
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
    });
  };

  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  if (isDesktop) {
    initDesktop();
  } else {
    initMobile();
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        window.removeEventListener("resize", onResize);
        initDesktop();
      }
    };
    window.addEventListener("resize", onResize, { passive: true });
  }
}

export function initPulseAnimations() {
  if (MotionPreferences.prefersReducedMotion) return;
  const hasHoverCapability = !DeviceDetector.isTouchDevice;
  if (!hasHoverCapability) return;

  const pulseElements = document.querySelectorAll(
    ".pulse-btn, button:not(.modal-nav-btn):not(#modal-close-btn):not(.lang-btn):not(.js-lang-btn), a.js-smooth-scroll"
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

let marqueeTimeline = null;
let marqueeResizeObserver = null;
let marqueeRefreshRaf = null;

export function initMarquee() {
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
      secondSetFirstItem.getBoundingClientRect().left - firstItem.getBoundingClientRect().left
    );

    if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;

    const viewportWidth = Math.round(
      (container.parentElement?.getBoundingClientRect().width ?? window.innerWidth) || window.innerWidth
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

    const marqueeSection = container.closest("section");
    if (marqueeSection) {
      const isMobile = DeviceDetector.isMobile;

      if (isMobile) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              marqueeTimeline.play();
            } else {
              marqueeTimeline.pause();
            }
          });
        }, {
          threshold: 0,
          rootMargin: "0px"
        });

        observer.observe(marqueeSection);
      } else if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: marqueeSection,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => marqueeTimeline.play(),
          onLeave: () => marqueeTimeline.pause(),
          onEnterBack: () => marqueeTimeline.play(),
          onLeaveBack: () => marqueeTimeline.pause(),
        });
      }
    }
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
    window.addEventListener("resize", () => {
      if (marqueeRefreshRaf) cancelAnimationFrame(marqueeRefreshRaf);
      marqueeRefreshRaf = requestAnimationFrame(() => {
        marqueeRefreshRaf = null;
        startMarquee();
      });
    });
  }
}

export function initInteractiveEffects() {
  if (MotionPreferences.prefersReducedMotion) return;
  const hasMouse = !DeviceDetector.isTouchDevice;
  const isTablet = DeviceDetector.isTablet;

  if (!hasMouse || isTablet) return;

  const tiltCards = document.querySelectorAll(".spotlight-card");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const data = LayoutCache.get(card);
      if (!data) return;

      const x = e.clientX - data.left;
      const y = e.clientY - data.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      const centerX = data.width / 2;
      const centerY = data.height / 2;
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
        y: 0,
      });
    });
  });
}
