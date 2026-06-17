import { DeviceDetector, MotionPreferences } from "./device-detector.js";
import { tools } from "../projects-data.js";

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

  const createItem = (tool) => {
    const item = document.createElement("div");
    item.className = "marquee-item";
    item.innerHTML = `
      <i data-lucide="${tool.icon}"></i>
      <span>${tool.name}</span>
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
