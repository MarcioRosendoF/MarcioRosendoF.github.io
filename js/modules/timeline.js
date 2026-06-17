import { timelineData } from "../projects-data.js";
import { onLanguageChange, getTranslations } from "./i18n.js";
import { initTimelineAnimation } from "./effects.js";

function buildTagsHtml(tags, translations) {
  return tags.map(tagKey => {
    const tagText = translations[tagKey] || "";
    return `<span class="px-3 py-1 rounded-full bg-zinc-800/80 border border-white/10 text-xs text-white font-mono">${tagText}</span>`;
  }).join("");
}

function renderMobileItem(job, translations) {
  const title = translations[job.titleKey] || "";
  const date = translations[job.dateKey] || "";
  const desc = translations[job.descKey] || "";
  const tagsHtml = buildTagsHtml(job.tags, translations);

  return `
        <div class="timeline-item group">
            <div class="timeline-marker-col">
                <div class="timeline-line"></div>
                <div class="timeline-dot"></div>
            </div>
            <div class="timeline-content-col">
                <div class="timeline-content">
                    <h3 class="text-xl font-bold text-white group-hover:text-white transition-colors">${title}</h3>
                    <div class="text-muted font-mono text-xs mb-3">${date}</div>
                    <p class="text-muted text-sm leading-relaxed bg-white/5 p-4 rounded-lg">${desc}</p>
                </div>
                <div class="timeline-tags flex flex-wrap gap-2 mt-4">${tagsHtml}</div>
            </div>
        </div>
      `;
}

function renderDesktopItem(job, index, translations, isLast) {
  const title = translations[job.titleKey] || "";
  const date = translations[job.dateKey] || "";
  const desc = translations[job.descKey] || "";
  const tagsHtml = buildTagsHtml(job.tags, translations);
  const lineHtml = isLast ? "" : `<div class="timeline-line absolute top-[12px] h-full w-[2px] bg-zinc-700"></div>`;
  const mbClass = isLast ? "" : "lg:mb-16";

  if (index % 2 === 0) {
    return `
          <div class="col-start-1 text-right pr-8 group timeline-content-group ${mbClass}">
              <h3 class="text-xl lg:text-2xl font-bold text-white group-hover:text-white transition-colors">${title}</h3>
              <div class="text-muted font-mono text-xs lg:text-sm mb-3">${date}</div>
              <p class="text-muted text-sm lg:text-base leading-relaxed bg-white/5 lg:bg-transparent p-4 lg:p-0 rounded-lg">${desc}</p>
          </div>
          <div class="col-start-2 timeline-marker relative flex flex-col items-center h-full">
              ${lineHtml}
              <div class="timeline-dot relative z-10 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-500 mt-1 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
          </div>
          <div class="col-start-3 pl-8 timeline-tags-group ${mbClass}">
              <div class="flex flex-wrap gap-2 items-start">${tagsHtml}</div>
          </div>
        `;
  } else {
    return `
          <div class="col-start-1 text-right pr-8 flex justify-end timeline-tags-group ${mbClass}">
              <div class="flex flex-wrap gap-2 items-start justify-end">${tagsHtml}</div>
          </div>
          <div class="col-start-2 timeline-marker relative flex flex-col items-center h-full">
              ${lineHtml}
              <div class="timeline-dot relative z-10 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-500 mt-1 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
          </div>
          <div class="col-start-3 pl-8 group timeline-content-group ${mbClass}">
              <h3 class="text-xl lg:text-2xl font-bold text-white group-hover:text-white transition-colors">${title}</h3>
              <div class="text-muted font-mono text-xs lg:text-sm mb-3">${date}</div>
              <p class="text-muted text-sm lg:text-base leading-relaxed bg-white/5 lg:bg-transparent p-4 lg:p-0 rounded-lg">${desc}</p>
          </div>
        `;
  }
}

export function renderTimeline(translations) {
  const timelineContainer = document.getElementById("timeline-container");
  if (timelineContainer && timelineData) {
    let mobileHtml = `<div id="timeline-mobile" class="flex flex-col gap-0 lg:hidden">`;
    let desktopHtml = `<div id="timeline-desktop" class="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] w-full relative">`;

    timelineData.forEach((job, index) => {
      const isLast = index === timelineData.length - 1;
      mobileHtml += renderMobileItem(job, translations);
      desktopHtml += renderDesktopItem(job, index, translations, isLast);
    });

    mobileHtml += `</div>`;
    desktopHtml += `</div>`;
    timelineContainer.innerHTML = mobileHtml + desktopHtml;
  }
}

export function initTimeline() {
  renderTimeline(getTranslations());
  onLanguageChange(() => {
    renderTimeline(getTranslations());
    initTimelineAnimation();
  });
}
