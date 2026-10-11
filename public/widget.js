(function() {
  const API_URL = "https://fiverr-shopify-agent.vercel.app/api/agent";
  let conversation = [];
  
  function createWidget() {
    const style = document.createElement('style');
    style.innerHTML = `
      #ai-agent-bubble { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 99999; font-size: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
      #ai-agent-window { position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); z-index: 99999; display: none; flex-direction: column; overflow: hidden; font-family: sans-serif; }
      #ai-agent-header { background: #000; color: #fff; padding: 16px; font-weight: bold; display: flex; justify-content: space-between; }
      #ai-agent-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
      .msg-user { align-self: flex-end; background: #000; color: #fff; padding: 10px 14px; border-radius: 18px 18px 4px 18px; max-width: 80%; }
      .msg-bot { align-self: flex-start; background: #f1f1f1; color: #000; padding: 10px 14px; border-radius: 18px 18px 18px 4px; max-width: 80%; }
      #ai-agent-input-area { display: flex; padding: 12px; border-top: 1px solid #eee; gap: 8px; }
      #ai-agent-input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 10px 14px; outline: none; }
      #ai-agent-send { background: #000; color: #fff; border: none; border-radius: 50%; width: 38px; height: 38px; cursor: pointer; }
    `;
    document.head.appendChild(style);

    const bubble = document.createElement('div');
    bubble.id = 'ai-agent-bubble';
    bubble.innerHTML = '💬';
    document.body.appendChild(bubble);

    const win = document.createElement('div');
    win.id = 'ai-agent-window';
    win.innerHTML = `
      <div id="ai-agent-header"><span>AI Assistant</span><span id="ai-agent-close" style="cursor:pointer">✕</span></div>
      <div id="ai-agent-messages"><div class="msg-bot">Hi! How can I help you today? 😊</div></div>
      <div id="ai-agent-input-area"><input id="ai-agent-input" placeholder="Type a message..." /><button id="ai-agent-send">➤</button></div>
    `;
    document.body.appendChild(win);

    bubble.onclick = () => { win.style.display = win.style.display === 'flex' ? 'none' : 'flex'; win.style.flexDirection = 'column'; };
    win.querySelector('#ai-agent-close').onclick = () => win.style.display = 'none';

    const input = win.querySelector('#ai-agent-input');
    const sendBtn = win.querySelector('#ai-agent-send');
    const messagesDiv = win.querySelector('#ai-agent-messages');

    async function sendMessage() {
      const text = input.value.trim();
      if(!text) return;
      const userDiv = document.createElement('div');
      userDiv.className = 'msg-user'; userDiv.textContent = text;
      messagesDiv.appendChild(userDiv);
      conversation.push({role:'user', content: text});
      input.value = '';
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      const botDiv = document.createElement('div');
      botDiv.className = 'msg-bot'; botDiv.textContent = 'Typing...';
      messagesDiv.appendChild(botDiv);

      try {
        const products = window.ShopifyAnalytics ? [] : [];
        let storeProducts = [];
        try {
          const res = await fetch('/products.json?limit=10');
          const data = await res.json();
          storeProducts = data.products || [];
        } catch(e) {}
        
        const resp = await fetch(API_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            message: text,
            conversation: conversation,
            storeInfo: { name: document.title, url: window.location.origin, products: storeProducts }
          })
        });
        const data = await resp.json();
        botDiv.textContent = data.reply;
        conversation.push({role:'assistant', content: data.reply});
      } catch(e) {
        botDiv.textContent = 'Sorry, connection error.';
      }
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createWidget);
  else createWidget();
})();
