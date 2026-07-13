let activeTimeouts = [];

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
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
}

function simulateRabbitMQFlow(routeKey, endpoint, contentArea) {
  const method = endpoint.method;
  const path = routeKey.substring(routeKey.indexOf(" ") + 1);
  const isPost = routeKey.startsWith("POST");
  const isAmqp = routeKey.startsWith("AMQP");

  let cmdText = `curl -X ${method} ${path}`;
  if (isAmqp) {
    cmdText = `amqp-publish --exchange=order.exchange --key=order.created.key`;
  }

  const removeLoader = () => {
    const loader = contentArea.querySelector(".terminal-step-loader");
    if (loader) loader.remove();
  };

  const appendLog = (htmlContent) => {
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    while (div.firstChild) {
      contentArea.appendChild(div.firstChild);
    }
    contentArea.scrollTop = contentArea.scrollHeight;
  };

  // Step 1: Prompt & Loader
  contentArea.innerHTML = `
    <div class="terminal-prompt">
      <span class="text-[#34d399]">guest@marcio.dev</span>:<span class="text-[#60a5fa]">~</span>$ <span class="terminal-prompt-cmd">${cmdText}</span>
    </div>
    <div class="terminal-loader terminal-step-loader">
      <span class="terminal-loader-spinner"></span>
      <span>${isAmqp ? 'Publishing raw message to broker...' : 'Sending request...'}</span>
    </div>
  `;
  contentArea.scrollTop = contentArea.scrollHeight;

  // Step 2: Response & Loading next step (400ms)
  const t1 = setTimeout(() => {
    removeLoader();

    const isSuccess = endpoint.responseStatus.startsWith("2") || endpoint.responseStatus === "ACKNOWLEDGED";
    const statusClass = isSuccess ? "terminal-status-success" : "terminal-status-error";
    const statusIcon = isSuccess ? "check-circle" : "alert-circle";
    const customStyle = isAmqp ? 'style="color: #ff6600; background: rgba(255, 102, 0, 0.1); border-color: rgba(255, 102, 0, 0.2);"' : '';

    appendLog(`
      <div class="terminal-response">
        <div class="terminal-status ${statusClass}" ${customStyle}>
          <i data-lucide="${statusIcon}" class="w-4 h-4 shrink-0"></i>
          <span>${endpoint.responseStatus}</span>
        </div>
        <pre class="terminal-json-output font-mono text-xs">${colorizeJson(endpoint.responseBody)}</pre>
      </div>
      <div class="terminal-step-loader mt-4 text-[#71717a] font-mono text-[11px] flex items-center gap-2 animate-pulse">
        <span class="terminal-loader-spinner !w-3 !h-3"></span>
        <span>${isPost ? '[RabbitMQ] Dispatching event: OrderCreatedEvent...' : isAmqp ? '[RabbitMQ] Delivering payload to registered consumers...' : '[Hibernate] Executing database query...'}</span>
      </div>
    `);
    if (typeof lucide !== "undefined") lucide.createIcons();

    // Step 3 (600ms)
    const t2 = setTimeout(() => {
      removeLoader();

      if (isPost) {
        appendLog(`
          <div class="mt-4 text-[#ff6600] font-mono text-[11px] leading-relaxed">
            [RabbitMQ] [PRODUCER] ➔ Published 'order.created' event to exchange 'order.exchange'
            <br>&nbsp;&nbsp;└─ Routing Key: order.created.key
          </div>
          <div class="terminal-step-loader mt-2 text-[#71717a] font-mono text-[11px] flex items-center gap-2 animate-pulse">
            <span class="terminal-loader-spinner !w-3 !h-3"></span>
            <span>[RabbitMQ] Routing message to queue 'notification.queue'...</span>
          </div>
        `);
      } else if (isAmqp) {
        appendLog(`
          <div class="mt-4 text-[#ff6600] font-mono text-[11px] leading-relaxed">
            [RabbitMQ] [BROKER] ➔ Message delivered to exchange (342 bytes)
            <br>&nbsp;&nbsp;└─ Queue status: notification.queue (1 message pending)
          </div>
          <div class="terminal-step-loader mt-2 text-[#71717a] font-mono text-[11px] flex items-center gap-2 animate-pulse">
            <span class="terminal-loader-spinner !w-3 !h-3"></span>
            <span>[RabbitMQ] Pushing event to active consumer...</span>
          </div>
        `);
      } else { // GET
        appendLog(`
          <div class="mt-4 text-[#a78bfa] font-mono text-[11px] leading-relaxed">
            [Hibernate] <span class="text-zinc-400">select n1_0.id, n1_0.order_id, n1_0.type, n1_0.message, n1_0.sent_at</span>
            <br>[Hibernate] <span class="text-zinc-400">from notification n1_0</span>
            <br>[Hibernate] <span class="text-zinc-400">where n1_0.order_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';</span>
            <br><span class="text-emerald-400 font-bold">➔ Found 1 record. Query time: 4ms.</span>
          </div>
        `);
        return; // End for GET
      }

      // Step 4 (600ms)
      const t3 = setTimeout(() => {
        removeLoader();

        if (isPost) {
          appendLog(`
            <div class="mt-2 text-[#ff6600] font-mono text-[11px] leading-relaxed">
              [RabbitMQ] [BROKER] ➔ Routed event to queue 'notification.queue' [ACK]
            </div>
            <div class="mt-2 text-[#60a5fa] font-mono text-[11px] leading-relaxed">
              [RabbitMQ] [CONSUMER] ➔ Picked up by Worker 'NotificationConsumer-1'
              <br>&nbsp;&nbsp;└─ Payload matches OrderCreatedEvent schema
            </div>
            <div class="terminal-step-loader mt-2 text-[#71717a] font-mono text-[11px] flex items-center gap-2 animate-pulse">
              <span class="terminal-loader-spinner !w-3 !h-3"></span>
              <span>[Service] Sending email notification to customer...</span>
            </div>
          `);
        } else if (isAmqp) {
          const amqpPayload = {
            eventId: "evt_728391823",
            timestamp: "2026-07-13T14:45:00Z",
            payload: {
              orderId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
              status: "PENDING"
            }
          };
          appendLog(`
            <div class="mt-2 text-[#60a5fa] font-mono text-[11px] leading-relaxed">
              [RabbitMQ] [CONSUMER] ➔ Worker-1 consumed message:
              <pre class="terminal-json-output font-mono text-[10px] mt-1 bg-white/5 p-2 rounded border border-white/10 text-zinc-300">${colorizeJson(amqpPayload)}</pre>
            </div>
            <div class="terminal-step-loader mt-2 text-[#71717a] font-mono text-[11px] flex items-center gap-2 animate-pulse">
              <span class="terminal-loader-spinner !w-3 !h-3"></span>
              <span>[Service] Processing email task asynchronously...</span>
            </div>
          `);
        }

        // Step 5 (700ms)
        const t4 = setTimeout(() => {
          removeLoader();

          if (isPost) {
            appendLog(`
              <div class="mt-2 text-[#34d399] font-mono text-[11px] leading-relaxed">
                [Service] [WORKER] ➔ Success: Email notification sent to customer!
              </div>
              <div class="mt-2 text-[#a78bfa] font-mono text-[11px] leading-relaxed">
                [Database] [JPA] ➔ Saved NotificationEntity to PostgreSQL database.
              </div>
            `);
          } else if (isAmqp) {
            appendLog(`
              <div class="mt-2 text-[#34d399] font-mono text-[11px] leading-relaxed">
                [Service] [WORKER] ➔ Success: Email notification sent. Queue empty.
              </div>
            `);
          }
        }, 700);
        activeTimeouts.push(t4);

      }, 600);
      activeTimeouts.push(t3);

    }, 600);
    activeTimeouts.push(t2);

  }, 400);
  activeTimeouts.push(t1);
}

export function simulateRequest(routeKey, project, contentArea) {
  clearActiveTerminalTimeout();
  const endpoints = project.simulatedEndpoints || {};
  const endpoint = endpoints[routeKey];
  if (!endpoint) return;

  if (project.title === "Order Notification Service") {
    simulateRabbitMQFlow(routeKey, endpoint, contentArea);
    return;
  }

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

  const t1 = setTimeout(() => {
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
  activeTimeouts.push(t1);
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

    let cmdText = `curl -X ${ep.method} ${firstKey.substring(firstKey.indexOf(" ") + 1)}`;
    if (ep.method === "AMQP") {
      cmdText = `amqp-publish --exchange=order.exchange --key=order.created.key`;
    }

    initialContentHtml = `
      <div class="terminal-prompt">
        <span class="text-[#34d399]">guest@marcio.dev</span>:<span class="text-[#60a5fa]">~</span>$ <span class="terminal-prompt-cmd">${cmdText}</span>
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
