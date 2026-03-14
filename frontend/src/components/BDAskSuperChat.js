class BDAskSuperChat {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.apiUrl = options.apiUrl || '/api/agent';
    this.conversationId = options.conversationId || null;
    this.workspaceRoot = options.workspaceRoot || null;
    this.enableTools = options.enableTools !== false;
    this.language = options.language || 'auto'; // 'bn', 'en', 'auto'

    this.messages = [];
    this.isProcessing = false;
    this.currentTool = null;

    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="bdask-super-chat">
        <div class="chat-header">
          <div class="chat-title">
            <span class="logo">🚀</span>
            <span>BDAsk Super AI</span>
          </div>
          <div class="chat-status" id="status-indicator">
            <span class="status-dot online"></span>
            <span>Ready</span>
          </div>
        </div>

        <div class="chat-messages" id="messages-container">
          <div class="welcome-message">
            <h3>স্বাগতম! Welcome to BDAsk Super AI</h3>
            <p>I can help you with:</p>
            <ul>
              <li>💻 Coding and file operations</li>
              <li>🔍 Web search and research</li>
              <li>⚡ Task automation</li>
              <li>🌐 Bengali and English support</li>
            </ul>
            <p class="hint">Try: "Create a React component" or "ক্রিকেট স্কোর দেখাও"</p>
          </div>
        </div>

        <div class="tool-status" id="tool-status" style="display: none;">
          <div class="tool-spinner"></div>
          <span id="tool-text">Thinking...</span>
        </div>

        <div class="chat-input-container">
          <div class="input-wrapper">
            <textarea 
              id="message-input" 
              placeholder="Type your message... (মেসেজ লিখুন...)"
              rows="1"
            ></textarea>
            <button id="send-btn" class="send-button" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="input-hints">
            <span>Shift+Enter for new line</span>
            <span class="tools-toggle">
              <input type="checkbox" id="tools-toggle" ${this.enableTools ? 'checked' : ''}>
              <label for="tools-toggle">Enable Tools</label>
            </span>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('bdask-super-chat-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'bdask-super-chat-styles';
    styles.textContent = `
      .bdask-super-chat {
        display: flex;
        flex-direction: column;
        height: 600px;
        max-height: 80vh;
        background: var(--bg-color, #ffffff);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        overflow: hidden;
        font-family: 'Hind Siliguri', 'Kalpurush', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(135deg, #006a4e 0%, #00523c 100%);
        color: white;
      }

      .chat-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;
      }

      .chat-title .logo {
        font-size: 20px;
      }

      .chat-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        opacity: 0.9;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffc107;
      }

      .status-dot.online {
        background: #4caf50;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: var(--chat-bg, #f8f9fa);
      }

      .welcome-message {
        text-align: center;
        padding: 20px;
        color: var(--text-color, #333);
      }

      .welcome-message h3 {
        margin-bottom: 12px;
        color: #006a4e;
      }

      .welcome-message ul {
        text-align: left;
        display: inline-block;
        margin: 12px 0;
      }

      .welcome-message li {
        margin: 6px 0;
      }

      .welcome-message .hint {
        color: #666;
        font-size: 14px;
        margin-top: 16px;
        padding: 8px 16px;
        background: rgba(0, 106, 78, 0.1);
        border-radius: 20px;
        display: inline-block;
      }

      .message {
        margin-bottom: 16px;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .message-user {
        display: flex;
        justify-content: flex-end;
      }

      .message-user .message-content {
        background: #006a4e;
        color: white;
        border-radius: 18px 18px 4px 18px;
      }

      .message-assistant {
        display: flex;
        justify-content: flex-start;
      }

      .message-assistant .message-content {
        background: white;
        color: #333;
        border-radius: 18px 18px 18px 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }

      .message-content {
        max-width: 80%;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .message-content pre {
        background: #f4f4f4;
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 8px 0;
      }

      .message-content code {
        font-family: 'Fira Code', monospace;
        font-size: 13px;
      }

      .tool-calls {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(0,0,0,0.1);
        font-size: 12px;
        color: #666;
      }

      .tool-call-item {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 4px 0;
      }

      .tool-call-item.success {
        color: #4caf50;
      }

      .tool-call-item.error {
        color: #f44336;
      }

      .tool-status {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: rgba(0, 106, 78, 0.05);
        border-top: 1px solid rgba(0, 106, 78, 0.1);
        font-size: 13px;
        color: #006a4e;
      }

      .tool-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 106, 78, 0.2);
        border-top-color: #006a4e;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .chat-input-container {
        padding: 12px 16px;
        background: white;
        border-top: 1px solid var(--border-color, #e0e0e0);
      }

      .input-wrapper {
        display: flex;
        gap: 8px;
        background: var(--input-bg, #f5f5f5);
        border-radius: 24px;
        padding: 4px;
        border: 1px solid transparent;
        transition: border-color 0.2s;
      }

      .input-wrapper:focus-within {
        border-color: #006a4e;
        background: white;
      }

      .input-wrapper textarea {
        flex: 1;
        border: none;
        background: transparent;
        padding: 10px 16px;
        font-size: 14px;
        resize: none;
        outline: none;
        font-family: inherit;
        max-height: 120px;
      }

      .send-button {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: #006a4e;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .send-button:hover:not(:disabled) {
        background: #00523c;
        transform: scale(1.05);
      }

      .send-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .input-hints {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 11px;
        color: #999;
      }

      .tools-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .tools-toggle input {
        cursor: pointer;
      }

      .tools-toggle label {
        cursor: pointer;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .bdask-super-chat {
          --bg-color: #1a1a1a;
          --chat-bg: #121212;
          --text-color: #e0e0e0;
          --border-color: #333;
          --input-bg: #2a2a2a;
        }

        .message-assistant .message-content {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        .chat-input-container {
          background: #1a1a1a;
        }
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .bdask-super-chat {
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
        }

        .message-content {
          max-width: 90%;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  attachEventListeners() {
    const input = this.container.querySelector('#message-input');
    const sendBtn = this.container.querySelector('#send-btn');

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim() || this.isProcessing;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.value.trim() && !this.isProcessing) {
          this.sendMessage();
        }
      }
    });

    sendBtn.addEventListener('click', () => this.sendMessage());
  }

  async sendMessage() {
    const input = this.container.querySelector('#message-input');
    const message = input.value.trim();

    if (!message || this.isProcessing) return;

    this.isProcessing = true;
    input.value = '';
    input.style.height = 'auto';

    // Add user message
    this.addMessage('user', message);

    // Show tool status
    this.showToolStatus('Thinking...');

    try {
      const toolsToggle = this.container.querySelector('#tools-toggle');
      const enableTools = toolsToggle ? toolsToggle.checked : true;

      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          conversation_id: this.conversationId,
          enable_tools: enableTools,
          workspace_root: this.workspaceRoot
        })
      });

      const data = await response.json();

      if (data.success) {
        this.conversationId = data.conversation_id;
        this.addMessage('assistant', data.response, data.tool_calls);
      } else {
        this.addMessage('assistant', data.error || 'An error occurred');
      }

    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage('assistant', 'Sorry, I could not connect to the server. Please try again.');
    } finally {
      this.isProcessing = false;
      this.hideToolStatus();
      this.container.querySelector('#send-btn').disabled = false;
    }
  }

  addMessage(role, content, toolCalls = null) {
    const container = this.container.querySelector('#messages-container');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;

    let toolCallsHtml = '';
    if (toolCalls && toolCalls.length > 0) {
      toolCallsHtml = `
        <div class="tool-calls">
          ${toolCalls.map(t => `
            <div class="tool-call-item ${t.status}">
              <span>${t.status === 'success' ? '✓' : '✗'}</span>
              <span>${t.summary}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Convert markdown-like code blocks to HTML
    let formattedContent = this.formatContent(content);

    messageDiv.innerHTML = `
      <div class="message-content">
        ${formattedContent}
        ${toolCallsHtml}
      </div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    this.messages.push({ role, content, toolCalls });
  }

  formatContent(content) {
    // Simple markdown formatting
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  showToolStatus(text) {
    const statusEl = this.container.querySelector('#tool-status');
    const textEl = this.container.querySelector('#tool-text');
    const sendBtn = this.container.querySelector('#send-btn');

    textEl.textContent = text;
    statusEl.style.display = 'flex';
    sendBtn.disabled = true;

    // Update header status
    const headerStatus = this.container.querySelector('#status-indicator');
    headerStatus.innerHTML = `
      <span class="tool-spinner"></span>
      <span>Processing...</span>
    `;
  }

  hideToolStatus() {
    const statusEl = this.container.querySelector('#tool-status');
    const headerStatus = this.container.querySelector('#status-indicator');

    statusEl.style.display = 'none';
    headerStatus.innerHTML = `
      <span class="status-dot online"></span>
      <span>Ready</span>
    `;
  }

  // Streaming support
  async sendMessageStream(message) {
    // Implementation for streaming would go here
    // Similar to sendMessage but using EventSource or fetch with reader
  }

  clear() {
    this.messages = [];
    this.conversationId = null;
    const container = this.container.querySelector('#messages-container');
    container.innerHTML = `
      <div class="welcome-message">
        <h3>স্বাগতম! Welcome to BDAsk Super AI</h3>
        <p>Chat cleared. How can I help you?</p>
      </div>
    `;
  }
}

  clearChat() {
    const messagesContainer = this.container.querySelector('#chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    this.conversationId = null;
    this.messages = [];
    localStorage.removeItem('bdask_conversation_id');
    this.loadConversation();
  }

  loadConversation() {
    const savedId = localStorage.getItem('bdask_conversation_id');
    if (savedId) {
      this.conversationId = savedId;
      // Optionally fetch conversation history from server
    }
  }

  startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD'; // Bengali (Bangladesh)
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = this.container.querySelector('#message-input');
      if (input) {
        input.value = transcript;
        input.dispatchEvent(new Event('input'));
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BDAskSuperChat;
}
