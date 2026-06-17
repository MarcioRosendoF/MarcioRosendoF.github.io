import { getTranslations } from "./i18n.js";

const TOAST_CLASSES =
  "js-toast pointer-events-auto rounded-full border bg-zinc-900/90 backdrop-blur px-4 py-2.5 text-xs md:text-sm shadow-[0_20px_45px_rgba(0,0,0,0.45)] flex items-center gap-2 transition-all duration-200 border-white/15 text-muted";
const DOT_CLASSES = "js-toast-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0";

let toastTimeoutId = null;

export function getToastContainer() {
  let container = document.getElementById("toast-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-root";
    container.className =
      "fixed top-6 left-1/2 -translate-x-1/2 lg:top-auto lg:bottom-6 lg:right-6 lg:left-auto lg:translate-x-0 z-[11000] flex flex-col items-center lg:items-end gap-3 pointer-events-none will-change-transform";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(messageKeyOrText, type = "info") {
  const container = getToastContainer();
  if (!container) return;

  const TRANSLATIONS = getTranslations();
  const message = (TRANSLATIONS && TRANSLATIONS[messageKeyOrText]) || messageKeyOrText;

  let toast = container.querySelector(".js-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = TOAST_CLASSES;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const dot = document.createElement("span");
    dot.className = DOT_CLASSES;

    const textEl = document.createElement("span");
    textEl.className = "js-toast-text font-mono tracking-tight";

    toast.appendChild(dot);
    toast.appendChild(textEl);
    container.appendChild(toast);
  }

  const textEl = toast.querySelector(".js-toast-text");
  const dotEl = toast.querySelector(".js-toast-dot");
  if (textEl) {
    textEl.textContent = message;
  }

  toast.className = TOAST_CLASSES;

  if (dotEl) {
    dotEl.className = DOT_CLASSES;
  }

  requestAnimationFrame(() => {
    toast.classList.add("is-active");
  });

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("is-active");
  }, 2800);
}

export async function copyEmailToClipboard() {
  const email = "contact@marciorosendo.com";
  const btn = document.getElementById("copy-email-btn");
  const originalBtnClasses = btn ? btn.className : "";
  const copyIcon = btn ? btn.querySelector(".copy-icon") : null;
  const checkIcon = btn ? btn.querySelector(".copy-check-icon") : null;

  try {
    await navigator.clipboard.writeText(email);

    showToast("toast_email_copied", "success");
    if (btn) {
      if (copyIcon) copyIcon.classList.add("hidden");
      if (checkIcon) checkIcon.classList.remove("hidden");
      setTimeout(() => {
        if (btn) {
          btn.className = originalBtnClasses;
        }
        if (copyIcon) copyIcon.classList.remove("hidden");
        if (checkIcon) checkIcon.classList.add("hidden");
      }, 1200);
    }
  } catch (err) {
    console.error("Failed to copy:", err);
    showToast("toast_email_error", "error");
  }
}
