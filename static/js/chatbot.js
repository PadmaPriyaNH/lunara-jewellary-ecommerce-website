/*
Author: N H Padma Priya
Year: 2025
*/

// static/js/chatbot.js
(function(){
  const AVATAR_URL = '/static/images/lunara-bot.gif';

  function el(tag, props={}, children=[]) {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).filter(Boolean).forEach(c => e.appendChild(c));
    return e;
  }

  function currentUserInfo() {
    try {
      const saved = localStorage.getItem('lunaraCurrentUser');
      if (saved) {
        const u = JSON.parse(saved);
        return { name: u.name || '', email: u.email || '' };
      }
    } catch(e) {}
    return { name: '', email: '' };
  }

  function sentimentHint(text) {
    const neg = ['bad','worse','worst','angry','annoyed','upset','frustrated','disappointed','hate','terrible','awful','useless','broken','late','delay','delayed','never','refund','cancel','damaged','problem','issue','complaint','scam','cheat','unhappy','ridiculous','stupid','slow','poor','unacceptable','disgusting','rude'];
    const t = (text||'').toLowerCase();
    return neg.some(w => t.includes(w)) ? 'negative' : 'neutral';
  }

  function createWidget() {
    // Inject extra styles for suggestions and CTA
    if (!document.getElementById('lunara-chatbot-extra-styles')) {
      const style = document.createElement('style');
      style.id = 'lunara-chatbot-extra-styles';
      style.textContent = `
.lunara-suggestions { padding: 8px 12px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
.lunara-suggestions-title { font-size: .85rem; color: #334155; margin-bottom: 6px; font-weight: 600; }
.lunara-suggestions-list { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
.lunara-chip { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; border-radius: 999px; padding: 6px 10px; font-size: .85rem; cursor: pointer; white-space: nowrap; }
.lunara-chip:hover { background: #f8fafc; }
.lunara-chatbot-cta { padding: 6px 10px; background: transparent; border-top: none; border-bottom: none; font-size: .8rem; color: #475569; text-align: center; }
.lunara-chatbot-cta a { color: #1e40af; font-weight: 500; text-decoration: underline; }
/* layout overrides for better usability */
.lunara-chatbot-panel { width: 400px; max-height: 85vh; }
.lunara-chatbot-messages { flex: 1; height: auto; min-height: 180px; }
      `;
      document.head.appendChild(style);
    }
    const btn = el('button', { class: 'lunara-chatbot-button', title: 'Chat with Lunara' });
    btn.appendChild(el('img', { src: AVATAR_URL, alt: 'Lunara Bot' }));

    const panel = el('div', { class: 'lunara-chatbot-panel' });

    const header = el('div', { class: 'lunara-chatbot-header' }, [
      el('div', { class: 'lunara-chatbot-header-info' }, [
        el('img', { src: AVATAR_URL, alt: 'Lunara Bot' }),
        el('div', { class: 'lunara-chatbot-title', html: '<strong>Lunara Assistant</strong><span>Ask about shipping, orders, returns, and more</span>' })
      ]),
      el('button', { class: 'lunara-chatbot-close', title: 'Close' }, [el('span', { html: '&times;' })])
    ]);

    const messages = el('div', { class: 'lunara-chatbot-messages' });
    const suggestions = el('div', { class: 'lunara-suggestions' });
    const cta = el('div', { class: 'lunara-chatbot-cta', html: "<strong>Still not resolved?</strong> Email us at <a href='mailto:hello@lunara.com'>hello@lunara.com</a>. We'll get back to you shortly." });

    function renderSuggestions(items) {
      suggestions.innerHTML = '';
      if (!items || !items.length) return;
      const title = el('div', { class: 'lunara-suggestions-title', html: 'Quick questions' });
      const list = el('div', { class: 'lunara-suggestions-list' });
      (items.slice ? items.slice(0, 8) : items).forEach(f => {
        const text = (typeof f === 'string') ? f : (f.question || '');
        if (!text) return;
        const chip = el('button', { class: 'lunara-chip', type: 'button' });
        chip.textContent = text;
        chip.addEventListener('click', () => {
          // Simulate asking this question
          const nameVal = nameInput.value.trim();
          const emailVal = emailInput.value.trim();
          addUser(text);
          const stopTyping = addTyping();
          fetch('/api/chatbot/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, name: nameVal, email: emailVal })
          })
          .then(r => r.json())
          .then(data => {
            stopTyping();
            if (data && data.reply) {
              addBot(data.reply);
            } else {
              addBot('Sorry, I had trouble responding. Please try again.');
            }
          })
          .catch(() => {
            stopTyping();
            addBot('Network issue. Please try again.');
          });
        });
        list.appendChild(chip);
      });
      suggestions.appendChild(title);
      suggestions.appendChild(list);
    }

    function initSuggestions() {
      fetch('/api/faqs')
        .then(r => r.json())
        .then(data => {
          const items = (data && data.faqs) ? data.faqs : [];
          if (items.length) { renderSuggestions(items); return; }
          throw new Error('No items');
        })
        .catch(() => {
          const fallback = [
            'Do you ship internationally?',
            'What is your return policy?',
            'How long does shipping take?',
            'How do I track my order?',
            'Are your products hypoallergenic?',
            'Do you offer gift wrapping?',
            'What materials do you use?',
            'How can I contact support?'
          ];
          renderSuggestions(fallback);
        });
    }

    const form = el('form', { class: 'lunara-chatbot-input' });
    const input = el('input', { type: 'text', placeholder: 'Type your question...', required: 'required' });
    const send = el('button', { type: 'submit', class: 'lunara-send-btn' }, [el('i', { class: 'fas fa-paper-plane' })]);
    form.appendChild(input);
    form.appendChild(send);

    const idBox = el('div', { class: 'lunara-identify' });
    const { name: savedName, email: savedEmail } = currentUserInfo();
    const nameInput = el('input', { type: 'text', placeholder: 'Your name (optional)', value: savedName || '' });
    const emailInput = el('input', { type: 'email', placeholder: 'Email for follow-up (optional)', value: savedEmail || '' });
    idBox.appendChild(nameInput);
    idBox.appendChild(emailInput);

    panel.appendChild(header);
    panel.appendChild(suggestions);
    panel.appendChild(messages);
    panel.appendChild(idBox);
    panel.appendChild(form);
    panel.appendChild(cta);

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addBot(text) {
      const row = el('div', { class: 'lunara-msg bot' });
      const avatar = el('img', { src: AVATAR_URL, alt: 'Bot' });
      const bubble = el('div', { class: 'bubble' });
      bubble.textContent = text;
      row.appendChild(avatar);
      row.appendChild(bubble);
      messages.appendChild(row);
      scrollToBottom();
    }

    function addUser(text) {
      const row = el('div', { class: 'lunara-msg user' });
      const bubble = el('div', { class: 'bubble' });
      bubble.textContent = text;
      row.appendChild(bubble);
      messages.appendChild(row);
      scrollToBottom();
    }

    function addTyping() {
      const row = el('div', { class: 'lunara-msg bot typing' });
      const avatar = el('img', { src: AVATAR_URL, alt: 'Bot' });
      const bubble = el('div', { class: 'bubble' });
      bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
      row.appendChild(avatar);
      row.appendChild(bubble);
      messages.appendChild(row);
      scrollToBottom();
      return () => { row.remove(); };
    }

    // Startup greeting
    addBot('Hi! I\'m your Lunara assistant. Ask me about shipping, returns, product care, payments, and more.');
    initSuggestions();

    // Events
    btn.addEventListener('click', () => {
      panel.classList.toggle('open');
    });
    header.querySelector('.lunara-chatbot-close').addEventListener('click', () => panel.classList.remove('open'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addUser(text);
      const stopTyping = addTyping();
      input.value = '';

      const payload = {
        message: text,
        name: nameInput.value.trim(),
        email: emailInput.value.trim()
      };

      // Simple local sentiment hint for instant escalation UI (server does final)
      const localSent = sentimentHint(text);
      if (localSent === 'negative') {
        // Could visually indicate escalation
        panel.classList.add('escalate');
        setTimeout(() => panel.classList.remove('escalate'), 1200);
      }

      fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(data => {
        stopTyping();
        if (data && data.reply) {
          addBot(data.reply);
        } else {
          addBot('Sorry, I had trouble responding. Please try again.');
        }
      })
      .catch(() => {
        stopTyping();
        addBot('Network issue. Please try again.');
      });
    });
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
