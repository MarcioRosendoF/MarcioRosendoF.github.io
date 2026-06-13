import { trackEvent } from "./device-detector.js";
import { getTranslations } from "./i18n.js";

let toastTimeoutId = null;

export function getToastContainer() {
  let container = document.getElementById("toast-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-root";
    container.className =
      "fixed bottom-6 right-4 md:right-6 z-[11000] flex flex-col items-end gap-3 pointer-events-none";
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
    toast.className =
      "js-toast pointer-events-auto rounded-full border bg-zinc-900/90 backdrop-blur px-4 py-2.5 text-xs md:text-sm shadow-[0_20px_45px_rgba(0,0,0,0.45)] flex items-center gap-2 translate-y-4 opacity-0 transition-all duration-200 border-white/15 text-muted";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const dot = document.createElement("span");
    dot.className = "js-toast-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-400";

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

  toast.className =
    "js-toast pointer-events-auto rounded-full border bg-zinc-900/90 backdrop-blur px-4 py-2.5 text-xs md:text-sm shadow-[0_20px_45px_rgba(0,0,0,0.45)] flex items-center gap-2 translate-y-4 opacity-0 transition-all duration-200 border-white/15 text-muted";

  if (dotEl) {
    dotEl.className = "js-toast-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-400";
  }

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-4", "opacity-0");
  }, 2800);
}

export function getContactEmail() {
  return "contact@marciorosendo.com";
}

const FORMSUBMIT_ACTION_ID = "745f01047216c630f11b06726d99c0f1";

export function getFormSubmitAction() {
  return `https://formsubmit.co/${FORMSUBMIT_ACTION_ID}`;
}

export function initContactIdentity() {
  const email = getContactEmail();

  const emailDisplay = document.getElementById("email-display");
  if (emailDisplay) {
    emailDisplay.textContent = email;
  }

  const form = document.getElementById("contact-form");
  if (form) {
    form.action = getFormSubmitAction();
  }

  const emailCard = document.getElementById("email-card");
  if (emailCard) {
    emailCard.addEventListener("click", () => copyEmailToClipboard());
    emailCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyEmailToClipboard();
      }
    });
  }
}

export async function copyEmailToClipboard() {
  const email = getContactEmail();
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

export function initCVDownload() {
  const buttons = [];

  const headerBtn = document.getElementById("header-cv-btn");
  if (headerBtn) {
    buttons.push({ element: headerBtn, label: "header_cv_button" });
  }

  const heroBtn = document.getElementById("hero-cv-btn");
  if (heroBtn) {
    buttons.push({ element: heroBtn, label: "hero_cv_button" });
  }

  const bentoBtn = document.getElementById("download-cv-btn");
  if (bentoBtn) {
    buttons.push({ element: bentoBtn, label: "about_cv_card" });
  }

  if (!buttons.length) return;

  buttons.forEach(({ element, label }) => {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentLang = (localStorage.getItem("lang") || "en").toLowerCase();
      const fileName =
        currentLang === "pt-br"
          ? "MarcioRosendoResumePtbr.pdf"
          : "MarcioRosendoResumeEn.pdf";

      showToast("toast_cv_downloading", "info");

      trackEvent("cv_download", {
        event_category: "engagement",
        event_label: label,
        lang: currentLang,
      });

      const link = document.createElement("a");
      link.href = fileName;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
}

const CONTACT_MIN_SUBMIT_MS = 900;

export function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  if (!form.action) {
    form.action = getFormSubmitAction();
  }
  form.addEventListener("submit", handleContactSubmit);
}

async function handleContactSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.getElementById("contact-submit-btn");
  if (!btn) return;
  const btnText = btn.querySelector(".btn-text");

  if (!btnText) return;

  btn.disabled = true;
  btn.classList.add("cursor-not-allowed", "opacity-80", "is-sending");
  btnText.setAttribute("data-translate", "contact_btn_sending");
  const TRANSLATIONS = getTranslations();
  const sendingKey = "contact_btn_sending";
  if (TRANSLATIONS[sendingKey]) {
    btnText.textContent = TRANSLATIONS[sendingKey];
  } else {
    btnText.textContent = "Transmitting...";
  }
  try {
    const formData = new FormData(form);
    const startTime = performance.now();
    let response;

    try {
      response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
    } catch (fetchError) {
      const elapsed = performance.now() - startTime;
      if (elapsed < CONTACT_MIN_SUBMIT_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONTACT_MIN_SUBMIT_MS - elapsed)
        );
      }
      throw fetchError;
    }

    const elapsed = performance.now() - startTime;
    if (elapsed < CONTACT_MIN_SUBMIT_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONTACT_MIN_SUBMIT_MS - elapsed)
      );
    }

    if (response.ok) {
      trackEvent("contact_submit", {
        event_category: "engagement",
        event_label: "contact_form",
        status: "success",
      });

      form.reset();

      btn.classList.remove("is-sending");
      btn.classList.add("is-success");

      btnText.setAttribute("data-translate", "contact_btn_success");
      const successKey = "contact_btn_success";
      if (TRANSLATIONS[successKey]) {
        btnText.textContent = TRANSLATIONS[successKey];
      } else {
        btnText.textContent = "Transmitted!";
      }

      const successOverlay = document.getElementById("contact-success");
      if (successOverlay) {
        successOverlay.classList.remove("hidden");
        requestAnimationFrame(() => {
          successOverlay.classList.remove("opacity-0");
          successOverlay.classList.add("opacity-100");
        });
      }

      showToast("contact_success_message", "success");

      setTimeout(() => {
        btn.classList.remove("is-success");
        btn.disabled = false;
        btn.classList.remove("cursor-not-allowed", "opacity-80");
        btnText.setAttribute("data-translate", "contact_btn_send");
        const key = "contact_btn_send";
        if (TRANSLATIONS[key]) {
          btnText.textContent = TRANSLATIONS[key];
        } else {
          btnText.textContent = "Send Message";
        }
      }, 1800);
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    trackEvent("contact_submit", {
      event_category: "engagement",
      event_label: "contact_form",
      status: "error",
    });
    alert("Connection Error. Please try again or email directly.");
    btn.disabled = false;
    btn.classList.remove("cursor-not-allowed", "opacity-80", "is-sending", "is-success");
    btnText.setAttribute("data-translate", "contact_btn_send");
    const key = "contact_btn_send";
    if (TRANSLATIONS[key]) {
      btnText.textContent = TRANSLATIONS[key];
    } else {
      btnText.textContent = "Send Message";
    }
  }
}

export function resetContactForm() {
  const form = document.getElementById("contact-form");
  const successOverlay = document.getElementById("contact-success");
  const btn = document.getElementById("contact-submit-btn");
  const btnText = btn?.querySelector(".btn-text");

  if (successOverlay) {
    successOverlay.classList.remove("opacity-100");
    successOverlay.classList.add("opacity-0");
    setTimeout(() => {
      successOverlay.classList.add("hidden");
    }, 500);
  }

  if (form) {
    form.reset();
  }

  if (btn) {
    btn.disabled = false;
    btn.classList.remove("is-success", "is-sending", "cursor-not-allowed", "opacity-80");

    if (btnText) {
      btnText.setAttribute("data-translate", "contact_btn_send");
      const TRANSLATIONS = getTranslations();
      const key = "contact_btn_send";
      if (TRANSLATIONS[key]) {
        btnText.textContent = TRANSLATIONS[key];
      } else {
        btnText.textContent = "Send Message";
      }
    }
  }
}

export function initContactAnalytics() {
  const contactLinks = document.querySelectorAll("[data-analytics^='contact-']");
  if (!contactLinks.length) return;

  contactLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const type = link.dataset.analytics.replace("contact-", "");

      trackEvent("contact_click", {
        event_category: "engagement",
        event_label: type,
        destination: link.dataset.destination || link.getAttribute("href") || "",
      });
    });
  });
}

window.copyEmailToClipboard = copyEmailToClipboard;
window.resetContactForm = resetContactForm;
