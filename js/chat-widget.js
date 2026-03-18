/**
 * ═══════════════════════════════════════════════════════════
 * AI Chat Widget — Embeddable Floating Chat Component
 *
 * Drop this script + the CSS into any page to get a premium
 * AI-powered chat widget. Supports streaming via SSE.
 *
 * Usage:
 *   <link rel="stylesheet" href="/chat-widget.css">
 *   <script src="/chat-widget.js"
 *     data-api-url="https://your-api.com"
 *     data-bot-name="Assistant"
 *     data-accent-color="#6366f1"
 *     data-position="bottom-right"
 *     data-welcome-message="Hi! How can I help?"
 *     data-theme="dark">
 *   </script>
 * ═══════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  // ─── Read Config from Script Tag ───────────────────────
  const scriptTag = document.currentScript;
  const CONFIG = {
    apiUrl: scriptTag?.getAttribute("data-api-url") || "",
    botName: scriptTag?.getAttribute("data-bot-name") || "AI Assistant",
    accentColor: scriptTag?.getAttribute("data-accent-color") || "#6366f1",
    position: scriptTag?.getAttribute("data-position") || "bottom-right",
    welcomeMessage:
      scriptTag?.getAttribute("data-welcome-message") ||
      "Hi! How can I help you today?",
    theme: scriptTag?.getAttribute("data-theme") || "auto",
    logoUrl: scriptTag?.getAttribute("data-logo-url") || "",
    bubbleIcon: scriptTag?.getAttribute("data-bubble-icon") || "chat",
    maxHeight: scriptTag?.getAttribute("data-max-height") || "600px",
  };

  // Resolve theme
  function resolveTheme() {
    if (CONFIG.theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return CONFIG.theme;
  }

  // ─── SVG Icons ─────────────────────────────────────────
  const ICONS = {
    chat: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`,
    bot: `<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13zm9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5zM9 18h6v1H9v-1z"/></svg>`,
    help: `<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    minimize: `<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    copy: `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
    botSmall: `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/></svg>`,
  };

  // ─── State ─────────────────────────────────────────────
  let isOpen = false;
  let messages = [];
  let isStreaming = false;
  let summarySent = false;

  // ─── Build DOM ─────────────────────────────────────────
  function createWidget() {
    const widget = document.createElement("div");
    widget.id = "ai-chat-widget";
    widget.setAttribute("data-position", CONFIG.position);
    widget.setAttribute("data-theme", resolveTheme());

    // Apply accent color as CSS custom property
    const accent = CONFIG.accentColor;
    widget.style.setProperty("--acw-accent", accent);
    widget.style.setProperty("--acw-accent-hover", lightenColor(accent, 20));
    widget.style.setProperty(
      "--acw-accent-glow",
      hexToRGBA(accent, 0.35)
    );

    // Set max height
    widget.style.setProperty("--acw-panel-max-height", CONFIG.maxHeight);

    widget.innerHTML = `
      <!-- Chat Bubble -->
      <button class="acw-bubble" data-open="false" aria-label="Open chat">
        <span class="acw-icon-chat">${ICONS[CONFIG.bubbleIcon] || ICONS.chat}</span>
        <span class="acw-icon-close">${ICONS.close}</span>
        <span class="acw-badge" data-visible="false"></span>
      </button>

      <!-- Chat Panel -->
      <div class="acw-panel" data-open="false" role="dialog" aria-label="Chat with ${CONFIG.botName}">
        <!-- Header -->
        <div class="acw-header">
          <div class="acw-header-avatar">
            ${CONFIG.logoUrl
              ? `<img src="${CONFIG.logoUrl}" alt="${CONFIG.botName}" />`
              : ICONS.botSmall
            }
          </div>
          <div class="acw-header-info">
            <div class="acw-header-name">${CONFIG.botName}</div>
            <div class="acw-header-status">Online</div>
          </div>
          <div class="acw-header-actions">
            <button class="acw-header-btn acw-btn-reset" aria-label="Reset conversation" title="New conversation">
              ${ICONS.refresh}
            </button>
            <button class="acw-header-btn acw-btn-minimize" aria-label="Minimize chat" title="Minimize">
              ${ICONS.minimize}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="acw-messages" role="log" aria-live="polite">
          <div class="acw-welcome">
            <div class="acw-welcome-icon">${ICONS.botSmall}</div>
            <h3>${CONFIG.botName}</h3>
            <p>${CONFIG.welcomeMessage}</p>
          </div>
        </div>

        <!-- Input Area -->
        <div class="acw-input-area">
          <div class="acw-input-wrap">
            <textarea
              class="acw-input"
              placeholder="Type a message..."
              rows="1"
              aria-label="Chat message"
            ></textarea>
          </div>
          <button class="acw-send-btn" aria-label="Send message" disabled>
            ${ICONS.send}
          </button>
        </div>

        <div class="acw-footer">
          Powered by Tacanni
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    return widget;
  }

  // ─── Event Listeners ──────────────────────────────────
  function initEvents(widget) {
    const bubble = widget.querySelector(".acw-bubble");
    const panel = widget.querySelector(".acw-panel");
    const input = widget.querySelector(".acw-input");
    const sendBtn = widget.querySelector(".acw-send-btn");
    const resetBtn = widget.querySelector(".acw-btn-reset");
    const minimizeBtn = widget.querySelector(".acw-btn-minimize");
    const messagesEl = widget.querySelector(".acw-messages");

    // Toggle panel
    bubble.addEventListener("click", () => togglePanel(widget));
    minimizeBtn.addEventListener("click", () => togglePanel(widget));

    // Send message
    sendBtn.addEventListener("click", () => handleSend(widget));

    // Input handling
    input.addEventListener("input", () => {
      // Auto-resize textarea
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";

      // Enable/disable send button
      sendBtn.disabled = !input.value.trim() || isStreaming;
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.value.trim() && !isStreaming) {
          handleSend(widget);
        }
      }
    });

    // Reset conversation
    resetBtn.addEventListener("click", () => {
      // Send summary before resetting if enough conversation
      maybeSendSummary();
      messages = [];
      summarySent = false;
      const welcomeHTML = `
        <div class="acw-welcome">
          <div class="acw-welcome-icon">${ICONS.botSmall}</div>
          <h3>${CONFIG.botName}</h3>
          <p>${CONFIG.welcomeMessage}</p>
        </div>
      `;
      messagesEl.innerHTML = welcomeHTML;
    });

    // Keyboard: Escape to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        togglePanel(widget);
      }
    });

    // Auto-detect theme changes
    if (CONFIG.theme === "auto") {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          widget.setAttribute("data-theme", e.matches ? "dark" : "light");
        });
    }
  }

  // ─── Panel Toggle ──────────────────────────────────────
  function togglePanel(widget) {
    isOpen = !isOpen;
    const bubble = widget.querySelector(".acw-bubble");
    const panel = widget.querySelector(".acw-panel");
    const input = widget.querySelector(".acw-input");
    const badge = widget.querySelector(".acw-badge");

    bubble.setAttribute("data-open", isOpen.toString());
    panel.setAttribute("data-open", isOpen.toString());

    if (isOpen) {
      badge.setAttribute("data-visible", "false");
      setTimeout(() => input.focus(), 350);
    } else {
      // Send summary when panel is closed after enough conversation
      maybeSendSummary();
    }
  }

  // ─── Send Summary to Backend ──────────────────────────
  function maybeSendSummary() {
    if (summarySent || !CONFIG.apiUrl) return;
    // Need at least 4 user messages to be a real conversation
    const userMessages = messages.filter(m => m.role === "user");
    if (userMessages.length < 4) return;

    summarySent = true;
    fetch(`${CONFIG.apiUrl}/api/send-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }).catch(() => { /* silent fail */ });
  }

  // ─── Send Message ──────────────────────────────────────
  async function handleSend(widget) {
    const input = widget.querySelector(".acw-input");
    const sendBtn = widget.querySelector(".acw-send-btn");
    const messagesEl = widget.querySelector(".acw-messages");
    const text = input.value.trim();

    if (!text || isStreaming) return;

    // Clear welcome if first message
    const welcome = messagesEl.querySelector(".acw-welcome");
    if (welcome) welcome.remove();

    // Add user message
    messages.push({ role: "user", content: text });
    appendMessage(messagesEl, "user", text);

    // Clear input
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;

    // Show typing indicator
    const typingEl = showTyping(messagesEl);
    isStreaming = true;

    try {
      if (CONFIG.apiUrl) {
        await streamResponse(messagesEl, typingEl);
      } else {
        // Demo mode — no API configured
        removeTyping(typingEl);
        const demoReply =
          "I'm running in **demo mode** because no `data-api-url` is configured. Set the `data-api-url` attribute on the script tag to connect me to your backend! 🚀";
        messages.push({ role: "assistant", content: demoReply });
        appendMessage(messagesEl, "bot", renderMarkdown(demoReply));
      }
    } catch (error) {
      removeTyping(typingEl);
      const errorMsg =
        "Sorry, something went wrong. Please try again in a moment.";
      appendMessage(messagesEl, "bot", errorMsg);
    }

    isStreaming = false;
    sendBtn.disabled = !input.value.trim();
  }

  // ─── Stream Response via SSE ───────────────────────────
  async function streamResponse(messagesEl, typingEl) {
    return new Promise((resolve, reject) => {
      fetch(`${CONFIG.apiUrl}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          removeTyping(typingEl);

          // Create bot message bubble for streaming
          const msgEl = appendMessage(messagesEl, "bot", "");
          const contentEl = msgEl.querySelector(".acw-message-content");
          let fullText = "";

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          function readChunk() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  messages.push({
                    role: "assistant",
                    content: fullText,
                  });
                  // Render final markdown
                  contentEl.innerHTML = renderMarkdown(fullText);
                  addCopyButtons(contentEl);
                  scrollToBottom(messagesEl);
                  resolve();
                  return;
                }

                const text = decoder.decode(value, { stream: true });
                const lines = text.split("\n");

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6));

                      if (data.type === "chunk") {
                        fullText += data.content;
                        // Show raw text while streaming (faster)
                        contentEl.textContent = fullText;
                        scrollToBottom(messagesEl);
                      } else if (data.type === "done") {
                        messages.push({
                          role: "assistant",
                          content: fullText,
                        });
                        contentEl.innerHTML = renderMarkdown(fullText);
                        addCopyButtons(contentEl);
                        scrollToBottom(messagesEl);
                        resolve();
                        return;
                      } else if (data.type === "error") {
                        contentEl.textContent =
                          data.content ||
                          "Something went wrong. Please try again.";
                        resolve();
                        return;
                      }
                    } catch {
                      // Skip malformed JSON
                    }
                  }
                }

                readChunk();
              })
              .catch(reject);
          }

          readChunk();
        })
        .catch(reject);
    });
  }

  // ─── DOM Helpers ───────────────────────────────────────
  function appendMessage(container, type, content) {
    const div = document.createElement("div");
    div.className = `acw-message acw-message--${type}`;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    div.innerHTML = `
      <div class="acw-message-content">${
        type === "user" ? escapeHTML(content) : content
      }</div>
      <div class="acw-message-time">${time}</div>
    `;

    container.appendChild(div);
    scrollToBottom(container);

    if (type === "bot") {
      addCopyButtons(div.querySelector(".acw-message-content"));
    }

    return div;
  }

  function showTyping(container) {
    const div = document.createElement("div");
    div.className = "acw-typing";
    div.innerHTML = `
      <div class="acw-typing-dot"></div>
      <div class="acw-typing-dot"></div>
      <div class="acw-typing-dot"></div>
    `;
    container.appendChild(div);
    scrollToBottom(container);
    return div;
  }

  function removeTyping(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function scrollToBottom(el) {
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }

  // ─── Markdown Rendering (lightweight) ─────────────────
  function renderMarkdown(text) {
    let html = escapeHTML(text);

    // Code blocks (``` ... ```)
    html = html.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_, lang, code) =>
        `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Unordered lists
    html = html.replace(/^[\s]*[-•]\s+(.+)/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\s*)+)/g, "<ul>$1</ul>");

    // Ordered lists
    html = html.replace(/^[\s]*\d+\.\s+(.+)/gm, "<li>$1</li>");

    // Paragraphs (double newline)
    html = html.replace(/\n\n/g, "</p><p>");
    html = `<p>${html}</p>`;

    // Single newlines → <br>
    html = html.replace(/\n/g, "<br>");

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/<p>\s*<br>\s*<\/p>/g, "");

    return html;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Copy Buttons for Code Blocks ─────────────────────
  function addCopyButtons(contentEl) {
    if (!contentEl) return;
    const pres = contentEl.querySelectorAll("pre");
    pres.forEach((pre) => {
      if (pre.querySelector(".acw-copy-btn")) return;

      const btn = document.createElement("button");
      btn.className = "acw-copy-btn";
      btn.innerHTML = ICONS.copy;
      btn.title = "Copy code";

      btn.addEventListener("click", () => {
        const code = pre.querySelector("code")?.textContent || pre.textContent;
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = ICONS.check;
          setTimeout(() => {
            btn.innerHTML = ICONS.copy;
          }, 2000);
        });
      });

      pre.style.position = "relative";
      pre.appendChild(btn);
    });
  }

  // ─── Color Utilities ──────────────────────────────────
  function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function lightenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    const g = Math.min(
      255,
      ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)
    );
    const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b)
      .toString(16)
      .slice(1)}`;
  }

  // ─── Initialize ───────────────────────────────────────
  function init() {
    // Load Inter font if not already present
    if (!document.querySelector('link[href*="Inter"]')) {
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(fontLink);
    }

    const widget = createWidget();
    initEvents(widget);

    // Send summary on page unload if conversation happened
    window.addEventListener("beforeunload", () => {
      maybeSendSummary();
    });
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
