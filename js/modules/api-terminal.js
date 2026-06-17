let activeTimeout = null;

function colorizeJson(json) {
  if (json === null || json === undefined) return "";
  const jsonString = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  return jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
    let cls = "terminal-json-number";
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = "terminal-json-key";
      } else {
        cls = "terminal-json-string";
      }
    } else if (/true|false/.test(match)) {
      cls = "terminal-json-boolean";
    } else if (/null/.test(match)) {
      cls = "terminal-json-null";
    }
    return '<span class="' + cls + '">' + match + "</span>";
  });
}

export function clearActiveTerminalTimeout() {
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
}

export function simulateRequest(routeKey, project, contentArea) {
  clearActiveTerminalTimeout();
  const endpoints = project.simulatedEndpoints || {};
  const endpoint = endpoints[routeKey];
  if (!endpoint) return;

  const method = endpoint.method;
  const path = routeKey.substring(routeKey.indexOf(" ") + 1);

  contentArea.innerHTML = `
    <div class="terminal-prompt">
      <span class="text-[#34d399]">guest@marcio.dev</span>:<span class="text-[#60a5fa]">~</span>$ <span class="terminal-prompt-cmd">curl -X ${method} ${path}</span>
    </div>
    <div class="terminal-loader">
      <span class="terminal-loader-spinner"></span>
      <span>Sending request...</span>
    </div>
  `;
  contentArea.scrollTop = contentArea.scrollHeight;

  activeTimeout = setTimeout(() => {
    const isSuccess = endpoint.responseStatus.startsWith("2");
    const statusClass = isSuccess ? "terminal-status-success" : "terminal-status-error";
    const statusIcon = isSuccess ? "check-circle" : "alert-circle";

    contentArea.innerHTML = `
      <div class="terminal-prompt">
        <span class="text-[#34d399]">guest@marcio.dev</span>:<span class="text-[#60a5fa]">~</span>$ <span class="terminal-prompt-cmd">curl -X ${method} ${path}</span>
      </div>
      <div class="terminal-response">
        <div class="terminal-status ${statusClass}">
          <i data-lucide="${statusIcon}" class="w-4 h-4 shrink-0"></i>
          <span>${endpoint.responseStatus}</span>
        </div>
        <pre class="terminal-json-output font-mono text-xs">${colorizeJson(endpoint.responseBody)}</pre>
      </div>
    `;
    if (typeof lucide !== "undefined") lucide.createIcons();
    contentArea.scrollTop = contentArea.scrollHeight;
  }, 400);
}

export function initTerminalEvents(terminalEl, project) {
  const sidebar = terminalEl.querySelector(".terminal-sidebar");
  const contentArea = terminalEl.querySelector(".terminal-content");
  if (!sidebar || !contentArea) return;

  const buttons = sidebar.querySelectorAll(".terminal-route-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const routeKey = btn.getAttribute("data-route");
      simulateRequest(routeKey, project, contentArea);
    });
  });
}

export function renderTerminal(project) {
  const endpoints = project.simulatedEndpoints || {};
  const endpointKeys = Object.keys(endpoints);

  const routesHtml = endpointKeys.map((key, i) => {
    const ep = endpoints[key];
    const methodClass = `terminal-method-${ep.method.toLowerCase()}`;
    const activeClass = i === 0 ? "active" : "";
    return `
      <button class="terminal-route-btn ${activeClass}" data-route="${key}">
          <span class="terminal-method-badge ${methodClass}">${ep.method}</span>
          <span class="truncate font-mono">${key.substring(key.indexOf(" ") + 1)}</span>
      </button>
    `;
  }).join("");

  let initialContentHtml = "";
  if (endpointKeys.length > 0) {
    const firstKey = endpointKeys[0];
    const ep = endpoints[firstKey];
    const isSuccess = ep.responseStatus.startsWith("2");
    const statusClass = isSuccess ? "terminal-status-success" : "terminal-status-error";
    const statusIcon = isSuccess ? "check-circle" : "alert-circle";

    initialContentHtml = `
      <div class="terminal-prompt">
        <span class="text-[#34d399]">guest@marcio.dev</span>:<span class="text-[#60a5fa]">~</span>$ <span class="terminal-prompt-cmd">curl -X ${ep.method} ${firstKey.substring(firstKey.indexOf(" ") + 1)}</span>
      </div>
      <div class="terminal-response">
        <div class="terminal-status ${statusClass}">
          <i data-lucide="${statusIcon}" class="w-4 h-4 shrink-0"></i>
          <span>${ep.responseStatus}</span>
        </div>
        <pre class="terminal-json-output font-mono text-xs">${colorizeJson(ep.responseBody)}</pre>
      </div>
    `;
  }

  return `
    <div class="w-full mb-6">
      <div class="api-terminal w-full">
        <div class="terminal-header">
          <div class="flex items-center gap-1.5">
            <span class="terminal-dot terminal-dot-red"></span>
            <span class="terminal-dot terminal-dot-yellow"></span>
            <span class="terminal-dot terminal-dot-green"></span>
          </div>
          <span class="text-xs text-[#a1a1aa] font-mono">guest@marcio.dev:~/api</span>
          <div class="w-12"></div>
        </div>
        <div class="terminal-body">
          <div class="terminal-sidebar">
            <div class="flex flex-col gap-1.5 lg:gap-2">
              ${routesHtml}
            </div>
          </div>
          <div class="terminal-content">
            ${initialContentHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
