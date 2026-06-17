import { DeviceDetector } from "./device-detector.js";
import { projectsData } from "../projects-data.js";
import { getCurrentProjectIndex } from "./projects.js";

export let currentMediaIndex = 0;

export function setCurrentMediaIndex(index) {
  currentMediaIndex = index;
}

export function renderMedia(media, title) {
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

export function initVideoTouchInteractivity() {
  if (!DeviceDetector.isTouchDevice) return;

  const wrappers = document.querySelectorAll(
    "#media-container .yt-wrapper, #media-container .vimeo-wrapper"
  );
  wrappers.forEach((wrapper) => {
    if (wrapper.dataset.videoTouchBound === "true") return;

    wrapper.addEventListener(
      "touchstart",
      () => {
        wrapper.classList.add("interacting");
      },
      { passive: true }
    );

    wrapper.dataset.videoTouchBound = "true";
  });
}

export function updateMediaDots() {
  const dots = document.querySelectorAll(".media-dot");
  dots.forEach((dot, index) => {
    if (index === currentMediaIndex) {
      dot.classList.add("is-active");
    } else {
      dot.classList.remove("is-active");
    }
  });
}

export function navigateMedia(direction) {
  const currentProjectIndex = getCurrentProjectIndex();
  const p = projectsData[currentProjectIndex];
  currentMediaIndex = (currentMediaIndex + direction + p.media.length) % p.media.length;

  const mediaInner = document.querySelector("#media-container .media-inner");
  if (mediaInner) {
    mediaInner.innerHTML = renderMedia(p.media[currentMediaIndex], p.title);
  }

  updateMediaDots();

  if (typeof lucide !== "undefined") lucide.createIcons();

  initVideoTouchInteractivity();
}

export function goToMedia(index) {
  currentMediaIndex = index;
  const currentProjectIndex = getCurrentProjectIndex();
  const p = projectsData[currentProjectIndex];
  const mediaInner = document.querySelector("#media-container .media-inner");
  if (mediaInner) {
    mediaInner.innerHTML = renderMedia(p.media[currentMediaIndex], p.title);
  }
  updateMediaDots();

  initVideoTouchInteractivity();
}

export function initMediaSwipe() {
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

