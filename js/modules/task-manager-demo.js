import { getTranslations } from "./i18n.js";

let tasks = null;
let currentFilter = "all";
let editingTaskId = null;
let nextId = 4;

function getDefaultTasks() {
  const t = getTranslations();
  return [
    { id: 1, text: t["task_manager_demo_default_1"] || "Estudar Hooks e State", completed: false },
    { id: 2, text: t["task_manager_demo_default_2"] || "Fazer o front do Task Manager", completed: true },
    { id: 3, text: t["task_manager_demo_default_3"] || "Terminar o projeto", completed: true }
  ];
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderTaskManagerDemo(project) {
  const t = getTranslations();
  const title = t["modal_frontend_preview_title"] || "Web Client Interface (React)";
  const badgeText = t["task_manager_demo_badge"] || "Interactive Live Demo";
  const appTitle = t["task_manager_demo_app_title"] || "Task Manager";
  const labelNewTask = t["task_manager_demo_label"] || "Nova tarefa";
  const placeholder = t["task_manager_demo_placeholder"] || "O que precisa ser feito?";
  const addBtnText = t["task_manager_demo_add"] || "Adicionar";

  return `
    <div class="mt-8 mb-8 task-manager-demo-root" data-project-title="${escapeHtml(project.title)}">
      <div class="flex items-center justify-between gap-4 mb-4">
        <h2 class="text-2xl font-bold text-white">${title}</h2>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          ${badgeText}
        </span>
      </div>

      <div class="w-full rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 shadow-2xl">
        <div class="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span class="text-xs font-mono text-zinc-400 tracking-wide">task-manager-client • React 18</span>
          <div class="w-12"></div>
        </div>

        <div class="p-4 sm:p-6 md:p-8 bg-zinc-900/40">
          <div class="max-w-xl mx-auto bg-white text-zinc-900 rounded-xl p-5 sm:p-7 shadow-xl border border-zinc-200/80">
            <div class="mb-5">
              <h3 class="text-2xl font-bold tracking-tight text-zinc-900">${appTitle}</h3>
              <p class="text-sm text-zinc-500 mt-1 task-manager-counter"></p>
            </div>

            <div class="mb-5">
              <label class="text-xs font-semibold text-zinc-700 block mb-1.5">${labelNewTask}</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  class="task-manager-input flex-1 px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                  placeholder="${placeholder}"
                  maxlength="80"
                />
                <button 
                  type="button" 
                  class="task-manager-add-btn px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  ${addBtnText}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm font-medium border-b border-zinc-100 pb-2.5 mb-3.5 task-manager-tabs">
            </div>

            <div class="task-manager-list space-y-2 mb-4">
            </div>

            <div class="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span class="font-mono text-[11px] text-zinc-400">React State Management</span>
              <button 
                type="button" 
                class="task-manager-reset-btn text-xs text-zinc-500 hover:text-zinc-800 font-medium underline underline-offset-2 transition-colors cursor-pointer"
              >
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initTaskManagerDemo(rootElement) {
  if (!rootElement) return;

  tasks = getDefaultTasks();
  currentFilter = "all";
  editingTaskId = null;
  nextId = 4;

  const inputEl = rootElement.querySelector(".task-manager-input");
  const addBtn = rootElement.querySelector(".task-manager-add-btn");
  const resetBtn = rootElement.querySelector(".task-manager-reset-btn");
  const tabsContainer = rootElement.querySelector(".task-manager-tabs");
  const listContainer = rootElement.querySelector(".task-manager-list");
  const counterEl = rootElement.querySelector(".task-manager-counter");

  function updateView() {
    const t = getTranslations();

    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    if (counterEl) {
      if (completed === 1) {
        counterEl.textContent = (t["task_manager_demo_counter_singular"] || "1 de {total} concluída").replace("{total}", total);
      } else {
        counterEl.textContent = (t["task_manager_demo_counter_plural"] || "{completed} de {total} concluídas")
          .replace("{completed}", completed)
          .replace("{total}", total);
      }
    }

    if (resetBtn) {
      resetBtn.textContent = t["task_manager_demo_reset"] || "Restaurar tarefas padrão";
    }

    if (tabsContainer) {
      const filters = [
        { key: "all", label: t["task_manager_demo_filter_all"] || "Todas" },
        { key: "active", label: t["task_manager_demo_filter_active"] || "Ativas" },
        { key: "completed", label: t["task_manager_demo_filter_completed"] || "Concluídas" }
      ];

      tabsContainer.innerHTML = filters.map(f => {
        const isActive = currentFilter === f.key;
        const activeClass = isActive 
          ? "text-blue-600 font-semibold cursor-default" 
          : "text-zinc-500 hover:text-zinc-800 cursor-pointer";
        return `<button type="button" data-filter="${f.key}" class="${activeClass} transition-colors">${escapeHtml(f.label)}</button>`;
      }).join("");
    }

    if (listContainer) {
      const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
      });

      if (filteredTasks.length === 0) {
        listContainer.innerHTML = `
          <div class="py-6 text-center text-sm text-zinc-400">
            ${escapeHtml(t["task_manager_demo_empty"] || "Nenhuma tarefa nesta visualização.")}
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filteredTasks.map(task => {
        const isEditing = editingTaskId === task.id;

        if (isEditing) {
          return `
            <div class="border border-blue-400 bg-blue-50/40 rounded-lg p-2.5 flex items-center gap-2">
              <input 
                type="text" 
                class="task-edit-input flex-1 px-2.5 py-1 text-sm bg-white border border-blue-500 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                value="${escapeHtml(task.text)}"
                data-id="${task.id}"
                maxlength="80"
              />
              <button type="button" data-action="save" data-id="${task.id}" class="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 cursor-pointer">
                ${escapeHtml(t["task_manager_demo_save"] || "Salvar")}
              </button>
              <button type="button" data-action="cancel" class="text-xs font-medium text-zinc-400 hover:text-zinc-600 px-1 py-1 cursor-pointer">
                ${escapeHtml(t["task_manager_demo_cancel"] || "Cancelar")}
              </button>
            </div>
          `;
        }

        const textClass = task.completed 
          ? "line-through text-zinc-400 font-normal" 
          : "text-zinc-800 font-normal";

        return `
          <div class="border border-zinc-200/80 rounded-lg p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white hover:border-zinc-300 transition-all group">
            <label class="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
              <input 
                type="checkbox" 
                data-id="${task.id}" 
                class="task-toggle-checkbox w-4 h-4 rounded border-zinc-300 text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" 
                ${task.completed ? "checked" : ""} 
              />
              <span class="text-sm leading-snug break-words ${textClass}">${escapeHtml(task.text)}</span>
            </label>
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" data-action="edit" data-id="${task.id}" class="text-xs text-zinc-500 hover:text-blue-600 font-medium px-1.5 py-0.5 transition-colors cursor-pointer">
                ${escapeHtml(t["task_manager_demo_edit"] || "Editar")}
              </button>
              <button type="button" data-action="delete" data-id="${task.id}" class="text-xs text-red-600 hover:text-red-700 font-medium px-1.5 py-0.5 transition-colors cursor-pointer">
                ${escapeHtml(t["task_manager_demo_delete"] || "Excluir")}
              </button>
            </div>
          </div>
        `;
      }).join("");

      const activeEditInput = listContainer.querySelector(".task-edit-input");
      if (activeEditInput) {
        activeEditInput.focus();
        activeEditInput.select();
      }
    }
  }

  function handleAddTask() {
    if (!inputEl) return;
    const value = inputEl.value.trim();
    if (!value) return;
    tasks.push({
      id: nextId++,
      text: value,
      completed: false
    });
    inputEl.value = "";
    updateView();
  }

  function saveEdit(id, newText) {
    const trimmed = newText.trim();
    if (trimmed) {
      const target = tasks.find(item => item.id === id);
      if (target) target.text = trimmed;
    }
    editingTaskId = null;
    updateView();
  }

  if (addBtn) {
    addBtn.addEventListener("click", handleAddTask);
  }

  if (inputEl) {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTask();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      tasks = getDefaultTasks();
      editingTaskId = null;
      nextId = 4;
      updateView();
    });
  }

  if (tabsContainer) {
    tabsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      currentFilter = btn.dataset.filter;
      updateView();
    });
  }

  if (listContainer) {
    listContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("task-toggle-checkbox")) {
        const id = Number(e.target.dataset.id);
        const target = tasks.find(item => item.id === id);
        if (target) {
          target.completed = e.target.checked;
          updateView();
        }
      }
    });

    listContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);

      if (action === "delete") {
        tasks = tasks.filter(item => item.id !== id);
        if (editingTaskId === id) editingTaskId = null;
        updateView();
      } else if (action === "edit") {
        editingTaskId = id;
        updateView();
      } else if (action === "save") {
        const input = listContainer.querySelector(`.task-edit-input[data-id="${id}"]`);
        if (input) saveEdit(id, input.value);
      } else if (action === "cancel") {
        editingTaskId = null;
        updateView();
      }
    });

    listContainer.addEventListener("keydown", (e) => {
      if (e.target.classList.contains("task-edit-input")) {
        const id = Number(e.target.dataset.id);
        if (e.key === "Enter") {
          e.preventDefault();
          saveEdit(id, e.target.value);
        } else if (e.key === "Escape") {
          editingTaskId = null;
          updateView();
        }
      }
    });
  }

  updateView();
}
