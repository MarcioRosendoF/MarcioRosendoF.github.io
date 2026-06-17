import { DeviceDetector, LayoutCache, MotionPreferences } from "./device-detector.js";
import { loadScript } from "./utils.js";

async function loadScrollTrigger() {
  if (typeof window.ScrollTrigger !== "undefined") return;
  try {
    await loadScript("./assets/vendor/ScrollTrigger.min.js");
    if (typeof gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
      gsap.registerPlugin(window.ScrollTrigger);
    }
  } catch (e) {
    console.warn("Failed to load ScrollTrigger", e);
  }
}

function setupCanvasVisibilityObserver(canvas, onVisible, onInvisible) {
  if (!canvas) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        onVisible();
      } else {
        onInvisible();
      }
    });
  }, { threshold: 0 });
  observer.observe(canvas);
}

export const initThreeJS = async () => {
  if (MotionPreferences.prefersReducedMotion) return;
  const canvas = document.getElementById("canvas-3d");
  if (!canvas) {
    console.error("WebGL Canvas not found!");
    return;
  }

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

  const layout = DeviceDetector.layout;
  const isMobile = "mobile" === layout;
  const isTablet = "tablet" === layout;
  const isDesktop = "desktop" === layout;
  let particleCount = isTablet ? 75 : 120;
  let fpsLimit = isMobile ? 45 : isTablet ? 50 : 60;
  const fpsInterval = 1000 / fpsLimit;
  let lastFrameTime = 0;
  const speedMultiplier = isMobile ? 1.3 : 1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: isDesktop,
    powerPreference: "high-performance",
  });
  let viewHeight, viewWidth;
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 5;

  const updateViewSize = () => {
    const fovRad = (camera.fov * Math.PI) / 180;
    viewHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
    viewWidth = viewHeight * camera.aspect;
  };
  updateViewSize();

  const positions = new Float32Array(3 * particleCount);
  const velocities = [];
  for (let i = 0; i < particleCount; i++) {
    positions[3 * i] = (Math.random() - 0.5) * viewWidth * 2;
    positions[3 * i + 1] = (Math.random() - 0.5) * viewHeight * 2;
    positions[3 * i + 2] = 10 * (Math.random() - 0.5);
    velocities.push({
      x: 0.005 * (Math.random() - 0.5) * speedMultiplier,
      y: 0.005 * (Math.random() - 0.5) * speedMultiplier,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.04,
    color: 8947848,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let threeRafId = null;
  const animateThree = (currentTime) => {
    threeRafId = requestAnimationFrame(animateThree);

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < fpsInterval) return;
    lastFrameTime = currentTime - (elapsed % fpsInterval);
    const positionAttr = geometry.attributes.position;
    const limitX = (2 * viewWidth) / 2;
    const limitY = (2 * viewHeight) / 2;
    for (let i = 0; i < particleCount; i++) {
      let posX = positionAttr.getX(i);
      let posY = positionAttr.getY(i);
      posX += velocities[i].x;
      posY += velocities[i].y;
      if (posX > limitX) posX = -limitX;
      if (posX < -limitX) posX = limitX;
      if (posY > limitY) posY = -limitY;
      if (posY < -limitY) posY = limitY;
      positionAttr.setXYZ(i, posX, posY, positionAttr.getZ(i));
    }
    positionAttr.needsUpdate = true;
    const speed = isMobile ? 2 : 1;
    points.rotation.y += 3e-4 * speed;
    points.rotation.x += 1e-4 * speed;
    renderer.render(scene, camera);
  };

  gsap.set(canvas, { opacity: 0 });
  setTimeout(() => {
    setupCanvasVisibilityObserver(
      canvas,
      () => {
        if (!threeRafId) {
          threeRafId = requestAnimationFrame(animateThree);
        }
      },
      () => {
        if (threeRafId) {
          cancelAnimationFrame(threeRafId);
          threeRafId = null;
        }
      }
    );
    gsap.to(canvas, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, 400);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (threeRafId) {
        cancelAnimationFrame(threeRafId);
        threeRafId = null;
      }
    } else {
      const projectModal = document.getElementById("project-modal");
      if (!projectModal || !projectModal.classList.contains("active")) {
        if (!threeRafId) {
          threeRafId = requestAnimationFrame(animateThree);
        }
      }
    }
  });

  const projectModal = document.getElementById("project-modal");
  if (projectModal) {
    const modalObserver = new MutationObserver(() => {
      const isOpen = projectModal.classList.contains("active");
      if (isOpen) {
        if (threeRafId) {
          cancelAnimationFrame(threeRafId);
          threeRafId = null;
        }
      } else if (!document.hidden) {
        if (!threeRafId) {
          threeRafId = requestAnimationFrame(animateThree);
        }
      }
    });
    modalObserver.observe(projectModal, { attributes: true, attributeFilter: ["class"] });
  }

  window.addEventListener("resize", () => {
    if (void 0 !== renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateViewSize();
    }
  });
};

export const initMobileParticles = () => {
  const canvas = document.getElementById("canvas-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const particles = [];
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < 18; i++) {
    const speedFactor = 0.6 * Math.random() + 0.4;
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0.35 * (Math.random() - 0.5) * speedFactor,
      vy: 0.35 * (Math.random() - 0.5) * speedFactor,
      size: 1.7 * Math.random() + 0.8,
    });
  }

  let mobileRafId = null;
  const animateParticles = () => {
    mobileRafId = requestAnimationFrame(animateParticles);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(136, 136, 136, 0.4)";
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  gsap.set(canvas, { opacity: 0 });
  setTimeout(() => {
    setupCanvasVisibilityObserver(
      canvas,
      () => {
        if (!mobileRafId) {
          mobileRafId = requestAnimationFrame(animateParticles);
        }
      },
      () => {
        if (mobileRafId) {
          cancelAnimationFrame(mobileRafId);
          mobileRafId = null;
        }
      }
    );
    gsap.to(canvas, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, 400);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (mobileRafId) {
        cancelAnimationFrame(mobileRafId);
        mobileRafId = null;
      }
    } else {
      if (!mobileRafId) {
        mobileRafId = requestAnimationFrame(animateParticles);
      }
    }
  });
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

  if (typeof ScrollTrigger !== "undefined") {
    const oldSt = ScrollTrigger.getById("timeline-trigger");
    if (oldSt) {
      oldSt.kill();
    }
  }

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
      mobileContainer.classList.add("timeline-animated");
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
              mobileContainer.classList.add("timeline-animated");
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

            tl.to(dot, { opacity: 1, scale: 1, force3D: true, duration: 0.6, ease: "back.out(1.2)", clearProps: "transform" }, startTime);
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

    if (window.__timelineAnimationHasPlayed) {
      gsap.set(dots, { opacity: 1, scale: 1, clearProps: "transform" });
      gsap.set(lines, { scaleY: 1, opacity: 1, clearProps: "transform" });
      gsap.set(contentGroups, { opacity: 1, x: 0, clearProps: "all" });
      gsap.set(tagGroups, { opacity: 1, x: 0, clearProps: "all" });
      desktopContainer.classList.add("timeline-animated");
      contentGroups.forEach((el, index) => bindHover(el, index));
      tagGroups.forEach((el, index) => bindHover(el, index));
      return;
    }

    gsap.set(dots, { opacity: 0, scale: 0 });
    gsap.set(lines, { scaleY: 0, opacity: 0, transformOrigin: "top center" });
    gsap.set(contentGroups, { opacity: 0, x: -20 });
    gsap.set(tagGroups, { opacity: 0, x: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "timeline-trigger",
        trigger: desktopContainer,
        start: "top 75%",
        toggleActions: "play none none none",
        once: true,
      },
      onComplete: () => {
        window.__timelineAnimationHasPlayed = true;
        desktopContainer.classList.add("timeline-animated");
      },
    });

    dots.forEach((dot, index) => {
      const line = lines[index];
      const content = contentGroups[index];
      const tags = tagGroups[index];
      const startTime = index === 0 ? 0 : ">-0.1";

      tl.to(dot, { opacity: 1, scale: 1, force3D: true, duration: 0.6, ease: "back.out(1.2)", clearProps: "transform" }, startTime);
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

    contentGroups.forEach((el, index) => bindHover(el, index));
    tagGroups.forEach((el, index) => bindHover(el, index));
  };

  const mql = window.matchMedia("(min-width: 1024px)");
  let isCurrentlyDesktop = mql.matches;

  if (isCurrentlyDesktop) {
    initDesktop();
  } else {
    initMobile();
  }

  const onBreakpointChange = (e) => {
    if (e.matches && !isCurrentlyDesktop) {
      isCurrentlyDesktop = true;
      if (nativeTimelineObserver) {
        nativeTimelineObserver.disconnect();
        nativeTimelineObserver = null;
      }
      initDesktop();
    } else if (!e.matches && isCurrentlyDesktop) {
      isCurrentlyDesktop = false;
      if (typeof ScrollTrigger !== "undefined") {
        const oldSt = ScrollTrigger.getById("timeline-trigger");
        if (oldSt) {
          oldSt.kill();
        }
      }
      initMobile();
    }
  };

  if (mql.addEventListener) {
    mql.addEventListener("change", onBreakpointChange);
  } else {
    mql.addListener(onBreakpointChange);
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

      const x = e.pageX - data.left;
      const y = e.pageY - data.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  const magnets = document.querySelectorAll(".magnetic-btn");
  magnets.forEach((btn) => {
    const quickX = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power2.out" });
    const quickY = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power2.out" });

    btn.addEventListener("mousemove", (e) => {
      const data = LayoutCache.get(btn);
      if (!data) return;

      const x = e.pageX - data.left - data.width / 2;
      const y = e.pageY - data.top - data.height / 2;

      quickX(x * 0.3);
      quickY(y * 0.3);
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    });
  });
}
