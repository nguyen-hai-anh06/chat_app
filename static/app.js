/**
 * AI Chat Studio — Client Application
 * Author: Nguyễn Hải Anh
 * Style: SaaS B2B Minimalism & Bento Grid
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const messagesContainer = document.getElementById('messagesContainer');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const newChatBtn = document.getElementById('newChatBtn');
  const exportChatBtn = document.getElementById('exportChatBtn');
  const bgOpacitySlider = document.getElementById('bgOpacitySlider');
  const bgOpacityLabel = document.getElementById('bgOpacityLabel');
  const authorBgLayer = document.getElementById('authorBgLayer');

  // State
  let sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
  let isGenerating = false;
  let chatHistory = [];

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Load Saved Background Opacity
  const savedOpacity = localStorage.getItem('ha_chat_bg_opacity');
  if (savedOpacity !== null) {
    bgOpacitySlider.value = savedOpacity;
    updateBgOpacity(savedOpacity);
  }

  function updateBgOpacity(val) {
    const decimal = (val / 100).toFixed(2);
    authorBgLayer.style.opacity = decimal;
    bgOpacityLabel.textContent = `${val}%`;
    localStorage.setItem('ha_chat_bg_opacity', val);
  }

  bgOpacitySlider?.addEventListener('input', (e) => {
    updateBgOpacity(e.target.value);
  });

  // Configure Marked renderer for Custom Code Blocks
  const renderer = new marked.Renderer();
  
  renderer.code = function({ text, lang }) {
    const language = (lang || 'code').toLowerCase();
    const validLang = hljs.getLanguage(language) ? language : 'plaintext';
    let highlighted;
    try {
      highlighted = hljs.highlight(text, { language: validLang }).value;
    } catch (e) {
      highlighted = text;
    }

    const uniqueId = 'code_' + Math.random().toString(36).substring(2, 9);

    return `
      <div class="code-block-container my-3" id="${uniqueId}">
        <div class="code-block-header">
          <span>${language}</span>
          <button class="code-copy-btn" onclick="copyCodeBlock('${uniqueId}')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span class="copy-text">Sao chép</span>
          </button>
        </div>
        <pre><code class="hljs language-${validLang}">${highlighted}</code></pre>
      </div>
    `;
  };

  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
  });

  // Global helper for copying code blocks
  window.copyCodeBlock = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const code = container.querySelector('code')?.innerText || '';
    const btn = container.querySelector('.code-copy-btn');
    const textSpan = container.querySelector('.copy-text');

    navigator.clipboard.writeText(code).then(() => {
      btn.classList.add('copied');
      textSpan.textContent = 'Đã sao chép! ✓';
      setTimeout(() => {
        btn.classList.remove('copied');
        textSpan.textContent = 'Sao chép';
      }, 2000);
    });
  };

  // Auto-resize input textarea
  function autoResizeInput() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 140) + 'px';
  }

  messageInput.addEventListener('input', autoResizeInput);

  // Handle keyboard shortcuts (Enter to send, Shift+Enter for newline)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && messageInput.value.trim()) {
        chatForm.dispatchEvent(new Event('submit'));
      }
    }
  });

  // Quick Prompt buttons
  document.querySelectorAll('.quick-prompt-card, .quick-feature-item').forEach(card => {
    card.addEventListener('click', () => {
      const prompt = card.getAttribute('data-prompt');
      if (prompt && !isGenerating) {
        messageInput.value = prompt;
        autoResizeInput();
        messageInput.focus();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // New Chat Action
  newChatBtn?.addEventListener('click', async () => {
    if (isGenerating) return;
    if (chatHistory.length > 0 && !confirm('Bạn có muốn bắt đầu cuộc trò chuyện mới?')) {
      return;
    }

    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
    } catch (e) {
      console.warn('Reset error:', e);
    }

    sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    chatHistory = [];
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(welcomeScreen);
    welcomeScreen.style.display = 'block';
    messageInput.value = '';
    autoResizeInput();
    messageInput.focus();
    if (window.lucide) window.lucide.createIcons();
  });

  // Export Chat
  exportChatBtn?.addEventListener('click', () => {
    if (chatHistory.length === 0) {
      alert('Chưa có nội dung cuộc trò chuyện để xuất.');
      return;
    }

    let markdown = `# Cuộc trò chuyện với AI Chat Studio\n`;
    markdown += `**Tác giả ứng dụng:** Nguyễn Hải Anh\n`;
    markdown += `**Thời gian:** ${new Date().toLocaleString('vi-VN')}\n\n---\n\n`;

    chatHistory.forEach(msg => {
      const role = msg.role === 'user' ? '👤 Người dùng' : '🤖 Trợ lý AI (Hải Anh Studio)';
      markdown += `### ${role}:\n\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Chat Form Submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = messageInput.value.trim();
    if (!userText || isGenerating) return;

    // Hide welcome screen
    if (welcomeScreen && welcomeScreen.parentNode) {
      welcomeScreen.style.display = 'none';
    }

    // Append User Message to UI
    appendUserMessage(userText);
    chatHistory.push({ role: 'user', content: userText });

    // Reset input
    messageInput.value = '';
    autoResizeInput();
    setGeneratingState(true);

    // Create AI Placeholder Bubble
    const aiBubble = createAIBubble();
    messagesContainer.appendChild(aiBubble);
    scrollToBottom();

    const contentDiv = aiBubble.querySelector('.ai-content-body');
    const statusDiv = aiBubble.querySelector('.ai-status-indicator');

    try {
      // Stream response using Fetch + ReadableStream
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last partial line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace('data:', '').trim();

          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              accumulatedText = `⚠️ **Lỗi:** ${parsed.error}`;
              renderMarkdown(contentDiv, accumulatedText);
              break;
            }

            if (parsed.type === 'start') {
              if (statusDiv) statusDiv.textContent = `Đang kết nối: ${parsed.model || 'Gemini'}...`;
            } else if (parsed.type === 'chunk' && parsed.text) {
              if (statusDiv && statusDiv.parentNode) {
                statusDiv.remove();
              }
              accumulatedText += parsed.text;
              renderMarkdown(contentDiv, accumulatedText);
              scrollToBottom();
            }
          } catch (err) {
            // Non-JSON token
          }
        }
      }

      if (accumulatedText) {
        chatHistory.push({ role: 'assistant', content: accumulatedText });
      }

      // Final cleanup
      if (statusDiv && statusDiv.parentNode) {
        statusDiv.remove();
      }

    } catch (err) {
      console.error('Fetch stream failed, falling back to standard POST:', err);
      // Fallback to standard /api/chat
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            session_id: sessionId
          })
        });
        const json = await fallbackRes.json();
        const reply = json.reply || 'Không nhận được phản hồi từ AI.';
        renderMarkdown(contentDiv, reply);
        chatHistory.push({ role: 'assistant', content: reply });
        if (statusDiv && statusDiv.parentNode) statusDiv.remove();
      } catch (fallbackErr) {
        renderMarkdown(contentDiv, `⚠️ **Không thể kết nối đến máy chủ:** ${err.message || fallbackErr.message}`);
        if (statusDiv && statusDiv.parentNode) statusDiv.remove();
      }
    } finally {
      setGeneratingState(false);
      scrollToBottom();
      if (window.lucide) window.lucide.createIcons();
    }
  });

  function setGeneratingState(generating) {
    isGenerating = generating;
    sendBtn.disabled = generating;
    messageInput.disabled = generating;
    if (!generating) {
      messageInput.focus();
    }
  }

  function appendUserMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-end mb-4 animate-fade-in';
    wrapper.innerHTML = `
      <div class="max-w-[85%] md:max-w-[75%] rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-xs text-sm leading-relaxed border border-slate-800">
        <div class="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-end gap-1">
          <span>Bạn</span>
          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <div class="whitespace-pre-wrap break-words">${escapeHTML(text)}</div>
      </div>
    `;
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
  }

  function createAIBubble() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-start gap-3 mb-6 animate-fade-in';
    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden shadow-xs">
        <img src="/static/background_author.png" alt="AI Avatar" class="w-full h-full object-cover">
      </div>
      <div class="flex-1 max-w-[90%] md:max-w-[82%]">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-xs font-semibold text-slate-900">Hải Anh Studio AI</span>
          <span class="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Gemini</span>
        </div>
        <div class="bento-card p-4 text-slate-800 bg-white">
          <div class="ai-status-indicator flex items-center gap-2 text-xs text-slate-500 py-1">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="ml-1 text-[11px] text-slate-400">Đang suy nghĩ câu trả lời...</span>
          </div>
          <div class="ai-content-body markdown-body"></div>
        </div>
      </div>
    `;
    return wrapper;
  }

  function renderMarkdown(element, rawText) {
    if (!element) return;
    const sanitizedHtml = DOMPurify.sanitize(marked.parse(rawText));
    element.innerHTML = sanitizedHtml;
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
