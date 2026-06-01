/* =============================================
   LUXE — js/chatbot.js
   Dual-Engine AI Chatbot, Settings Panel, Support Fallbacks
   ============================================= */

// =============================================
// CHATBOT — DUAL MODE CONFIG
// =============================================
const CHATBOT_CONFIG = {
  support: {
    greeting: "Hello! I'm your LUXE Support Assistant. How can I help you today?",
    quickReplies: ["Track my order", "Return policy", "Size guide", "Contact us", "Shipping info"],
    responses: {
      "track": "You can track your order at any time by visiting **My Orders** in your account. Tracking updates are sent via email within 24 hours of shipment.",
      "return": "We offer a **30-day hassle-free return policy**. Items must be unworn and in original packaging. We'll send a prepaid shipping label.",
      "size": "Our **Size Guide** is on every product page. Measure your bust, waist, and hips and compare to the chart. Need help? Share your measurements!",
      "ship": "We offer **free global shipping** on all orders. Standard: 5–10 business days. Express (2–4 days) available at checkout.",
      "contact": "Our luxury concierge team is available:\n📧 **hello@luxe.com**\n📞 +91 98765 43210\n🕐 Mon–Sat, 10AM–8PM IST",
      "payment": "We accept credit/debit cards, UPI, Apple Pay, and bank transfers. All secured with 256-bit SSL encryption.",
    },
  },
  assistant: {
    greeting: "Hi! I'm your LUXE Personal Shopping Assistant. I can recommend products, compare items, and curate your perfect wardrobe. What are you looking for?",
    quickReplies: ["Compare top coats", "Best sellers", "Gift ideas", "Style my outfit", "Under $600"],
    responses: {
      "gift": "For gifts:\n• **Sorrento Silk Scarf** — $295 (timeless)\n• **Milano Leather Bag** — $1,650 (statement)\n• **Celeste Silk Blouse** — $480 (elegant)\n\nAll come in a LUXE gift box with a handwritten card. ✨",
      "budget": "Finest picks under $600:\n• Sorrento Silk Scarf — $295\n• Celeste Silk Blouse — $480\n• Lux Oxford Shirt — $320 (sale!)\n\nShall I add any to your cart?",
      "style": "I'd love to style you! Tell me:\n1. **Occasion**? (everyday, event, work)\n2. **Style**? (classic, contemporary, minimalist)\n3. **Colours** you love?\n\nI'll curate a complete outfit! ✨",
    },
  },
};

// =============================================
// GEMINI API — LIVE AI CHATBOT
// =============================================
// 🔑 PASTE YOUR NEW API KEY BETWEEN THE QUOTES BELOW:
const GEMINI_API_KEY = "PASTE_YOUR_KEY_HERE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const LUXE_SYSTEM_PROMPT = `You are LUXE AI — the intelligent assistant for LUXE, a premium luxury fashion brand. Be elegant, warm, helpful, and on-brand. Use luxury vocabulary but stay approachable.

OUR PRODUCTS:
1. Venezia Cashmere Coat — $1,280 | Women | 100% Mongolian cashmere, Made in Italy | XS–XL | ★★★★★ | NEW
2. Avorio Silk Dress — $890 (was $1,200) | Women | Pure ivory silk crepe de chine, bias cut | XS–L | ★★★★½ | SALE
3. Milano Leather Bag — $1,650 | Accessories | Full-grain Italian calfskin, gold hardware | One Size | ★★★★★ | LIMITED
4. Atelier Wool Blazer — $1,120 | Men | Superfine 120s wool, fully canvassed | S–XXL | ★★★★½ | NEW
5. Celeste Silk Blouse — $480 | Women | Mulberry silk, French seams | XS–L | ★★★★★
6. Lux Oxford Shirt — $320 (was $420) | Men | Egyptian cotton Oxford weave | S–XL | ★★★★ | SALE
7. Sorrento Silk Scarf — $295 | Accessories | Hand-printed twill silk, 90x90cm | ★★★★★
8. Palazzo Wide Trousers — $620 | Women | Silk-wool blend, wide leg | XS–XL | ★★★★½ | NEW

POLICIES: Free global shipping | 30-day returns | 2-year warranty | hello@luxe.com | +91 98765 43210

CONCIERGE COMMANDS:
You have direct control to execute actions on the user's screen. If the user explicitly asks you to add an item to their cart, remove an item from their cart, open/show their cart or wishlist, clear their cart, or proceed to checkout, you MUST append the correct command tag at the very end of your final sentence.
Available Command Tags:
- Add a product to cart: [ACTION: ADD_TO_CART, ID: <number>] (e.g., [ACTION: ADD_TO_CART, ID: 2] for Avorio Silk Dress)
- Remove a product from cart: [ACTION: REMOVE_FROM_CART, ID: <number>]
- Open the shopping cart: [ACTION: OPEN_CART]
- Close the shopping cart: [ACTION: CLOSE_CART]
- Open the wishlist sidebar: [ACTION: OPEN_WISHLIST]
- Proceed to checkout: [ACTION: OPEN_CHECKOUT]
- Clear the entire cart: [ACTION: CLEAR_CART]

Include ONLY ONE action command tag per response if requested. Put it at the very end of your message. The user will not see this tag; our front-end intercepts it, executes it in real-time, and strips it before rendering.
Example: "Certainly! I've added the Avorio Silk Dress to your cart. [ACTION: ADD_TO_CART, ID: 2]"

RULES:
- Keep responses concise (2–4 sentences unless listing products)
- Use **bold** for product names and prices
- Be warm and personal, never robotic
- Don't make up products not listed above
- Current mode: {{MODE}}`;

let chatHistory = [];
let chatMode = "support";
let isTyping = false;

// 🤖 Query Gemini API
async function callGeminiAPI(userMessage) {
  const customKey = localStorage.getItem("GEMINI_API_KEY") || "";
  const apiKeyToUse = customKey || GEMINI_API_KEY;

  if (!apiKeyToUse || apiKeyToUse === "PASTE_YOUR_KEY_HERE" || apiKeyToUse.startsWith("PASTE")) {
    if (!customKey) {
      console.warn("Gemini API key is not set or placeholder is active. Using local fallback.");
      return null;
    }
  }

  const systemInstruction = LUXE_SYSTEM_PROMPT.replace("{{MODE}}", chatMode.toUpperCase());
  
  const contents = [];
  chatHistory.forEach(item => {
    contents.push({
      role: item.role === "model" ? "model" : "user",
      parts: [{ text: item.text }]
    });
  });
  
  contents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 350
    }
  };

  const dynamicUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeyToUse}`;

  try {
    const response = await fetch(dynamicUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error("Empty candidate response");
    }

    chatHistory.push({ role: "user", text: userMessage });
    chatHistory.push({ role: "model", text: replyText });
    
    if (chatHistory.length > 14) {
      chatHistory = chatHistory.slice(-14);
    }

    return replyText;
  } catch (error) {
    console.error("Failed to query Gemini API:", error);
    return null; // Fallback to keyword mock system
  }
}

// 🧠 Query local NovaMind Chatbot API
async function callNovaMindAPI(userMessage) {
  const endpoint = localStorage.getItem("NOVAMIND_ENDPOINT") || "http://localhost:8000/chat";
  const token = localStorage.getItem("NOVAMIND_TOKEN") || "";
  let sessionId = localStorage.getItem("NOVAMIND_SESSION_ID") || "";

  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestBody = {
    message: userMessage,
    mode: chatMode === "support" ? "support_engine" : "novamind_ai"
  };
  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NovaMind API Error:", errorText);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.session_id) {
      localStorage.setItem("NOVAMIND_SESSION_ID", data.session_id);
    }
    
    return data.bot_response || "";
  } catch (error) {
    console.error("Failed to query NovaMind API:", error);
    return null;
  }
}

// ⚙️ Setup Chatbot Settings Panel
function initChatbotSettings() {
  const settingsBtn = document.getElementById("chatbot-settings-btn");
  const settingsPanel = document.getElementById("chatbot-settings-panel");
  const settingsClose = document.getElementById("chatbot-settings-close");
  
  const engineSelect = document.getElementById("ai-engine-select");
  const geminiArea = document.getElementById("gemini-config-area");
  const novamindArea = document.getElementById("novamind-config-area");
  
  const geminiInput = document.getElementById("gemini-key-input");
  const toggleGeminiBtn = document.getElementById("toggle-gemini-key");
  
  const endpointInput = document.getElementById("novamind-endpoint-input");
  const tokenInput = document.getElementById("novamind-token-input");
  
  const saveBtn = document.getElementById("save-settings-btn");
  const clearBtn = document.getElementById("clear-settings-btn");

  if (!settingsBtn || !settingsPanel) return;

  // Load saved state
  const savedEngine = localStorage.getItem("LUXE_AI_ENGINE") || "gemini";
  if (engineSelect) {
    engineSelect.value = savedEngine;
  }
  
  if (savedEngine === "gemini") {
    if (geminiArea) geminiArea.style.display = "block";
    if (novamindArea) novamindArea.style.display = "none";
  } else {
    if (geminiArea) geminiArea.style.display = "none";
    if (novamindArea) novamindArea.style.display = "block";
  }

  const savedGeminiKey = localStorage.getItem("GEMINI_API_KEY") || "";
  if (geminiInput) geminiInput.value = savedGeminiKey;

  const savedEndpoint = localStorage.getItem("NOVAMIND_ENDPOINT") || "http://localhost:8000/chat";
  if (endpointInput) endpointInput.value = savedEndpoint;

  const savedToken = localStorage.getItem("NOVAMIND_TOKEN") || "";
  if (tokenInput) tokenInput.value = savedToken;

  // Toggle visible configurations on select change
  if (engineSelect) {
    engineSelect.addEventListener("change", () => {
      if (engineSelect.value === "gemini") {
        if (geminiArea) geminiArea.style.display = "block";
        if (novamindArea) novamindArea.style.display = "none";
      } else {
        if (geminiArea) geminiArea.style.display = "none";
        if (novamindArea) novamindArea.style.display = "block";
      }
    });
  }

  // Toggle settings panel
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle("open");
  });

  settingsClose.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPanel.classList.remove("open");
  });

  // Toggle password visibility
  if (toggleGeminiBtn && geminiInput) {
    toggleGeminiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isPassword = geminiInput.type === "password";
      geminiInput.type = isPassword ? "text" : "password";
      toggleGeminiBtn.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  }

  // Save Config
  saveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const activeEngine = engineSelect ? engineSelect.value : "gemini";
    localStorage.setItem("LUXE_AI_ENGINE", activeEngine);

    if (activeEngine === "gemini") {
      const val = geminiInput ? geminiInput.value.trim() : "";
      if (!val) {
        showToast("Please enter a Gemini API Key");
        return;
      }
      if (!val.startsWith("AIzaSy")) {
        showToast("Invalid key format. Key should start with AIzaSy");
        return;
      }
      localStorage.setItem("GEMINI_API_KEY", val);
      showToast("Gemini AI settings saved!");
      
      clearMessages();
      addBotMessage("✨ **Live Gemini AI Mode Activated!**\n\nI am now connected directly to Google's **Gemini 1.5 Flash** model. Ask me anything, or let me manage your shopping cart for you! 🛍️");
    } else {
      const endpoint = endpointInput ? endpointInput.value.trim() : "http://localhost:8000/chat";
      const token = tokenInput ? tokenInput.value.trim() : "";
      if (!endpoint) {
        showToast("Please enter local server endpoint");
        return;
      }
      localStorage.setItem("NOVAMIND_ENDPOINT", endpoint);
      localStorage.setItem("NOVAMIND_TOKEN", token);
      showToast("NovaMind local AI settings saved!");
      
      clearMessages();
      addBotMessage("🧠 **NovaMind Local AI Mode Activated!**\n\nI am now successfully connected to your local **NovaMind API server** (`" + endpoint + "`). Ask me anything, and I will route requests through your custom Llama3 support brain! 🚀");
    }

    settingsPanel.classList.remove("open");
    renderQuickReplies(CHATBOT_CONFIG[chatMode].quickReplies);
  });

  // Clear Saved Keys
  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    localStorage.removeItem("GEMINI_API_KEY");
    localStorage.removeItem("NOVAMIND_TOKEN");
    if (geminiInput) geminiInput.value = "";
    if (tokenInput) tokenInput.value = "";
    showToast("Saved API credentials removed. Local fallbacks active.");
    
    settingsPanel.classList.remove("open");
    clearMessages();
    
    let greeting = CHATBOT_CONFIG[chatMode].greeting;
    if (chatMode === "assistant") {
      greeting = "Hi! I'm your **LUXE Personal Shopping Assistant**. 🛍️\n\nI can recommend products, compare items, and curate your perfect wardrobe.\n\n⚠️ **Live AI Mode Offline**: Click the **Settings Gear Icon** in the header to enter your Gemini API Key or activate your local **NovaMind AI** to unlock real-time fashion consulting!\n\nIn the meantime, I am running in **Support Fallback Mode**. Try asking 'compare top coats' or 'best sellers'!";
    }
    addBotMessage(greeting);
    renderQuickReplies(CHATBOT_CONFIG[chatMode].quickReplies);
  });
}

function initChatbot() {
  const wrapper = document.getElementById("chatbot-wrapper");
  const panel = document.getElementById("chatbot-panel");
  const fab = document.getElementById("chatbot-fab");
  const closeBtn = document.getElementById("chatbot-close");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-input");

  // Open/close
  fab.addEventListener("click", () => {
    const isOpen = wrapper.classList.toggle("open");
    if (isOpen) {
      initChatSession();
    }
  });

  // Open from nav
  document.getElementById("chatbot-open-btn").addEventListener("click", () => {
    wrapper.classList.add("open");
    initChatSession();
  });

  closeBtn.addEventListener("click", () => {
    wrapper.classList.remove("open");
    document.getElementById("chatbot-settings-panel")?.classList.remove("open");
  });

  // Mode toggle
  document.getElementById("mode-support").addEventListener("click", () => switchMode("support"));
  document.getElementById("mode-assistant").addEventListener("click", () => switchMode("assistant"));

  // Send
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

  function getAssistantGreeting() {
    const activeEngine = localStorage.getItem("LUXE_AI_ENGINE") || "gemini";
    const hasCustomKey = localStorage.getItem("GEMINI_API_KEY");
    const hasNovaMind = activeEngine === "novamind" && localStorage.getItem("NOVAMIND_ENDPOINT");
    
    if (activeEngine === "novamind" && hasNovaMind) {
      return "Hi! I'm your **LUXE Personal Shopping Assistant** powered by your local **NovaMind AI**! 🧠🛍️\n\nI can recommend products, style outfits, and manage your shopping cart in real-time. Ask me anything!";
    } else if (activeEngine === "gemini" && hasCustomKey) {
      return "Hi! I'm your **LUXE Personal Shopping Assistant** powered by **Gemini 1.5 Flash**! ✨🛍️\n\nI can recommend products, style outfits, and manage your shopping cart in real-time. Ask me anything!";
    } else {
      return "Hi! I'm your **LUXE Personal Shopping Assistant**. 🛍️\n\nI can recommend products, compare items, and curate your perfect wardrobe.\n\n⚠️ **Live AI Mode Offline**: Click the **Settings Gear Icon** in the header to enter your Gemini API Key or activate your local **NovaMind AI** to unlock real-time fashion consulting!\n\nIn the meantime, I am running in **Support Fallback Mode**. Try asking 'compare top coats' or 'best sellers'!";
    }
  }

  let initialized = false;
  function initChatSession() {
    if (initialized) return;
    initialized = true;
    
    let greeting = chatMode === "assistant" ? getAssistantGreeting() : CHATBOT_CONFIG[chatMode].greeting;
    addBotMessage(greeting);
    renderQuickReplies(CHATBOT_CONFIG[chatMode].quickReplies);
  }

  // Bind settings listeners
  initChatbotSettings();
}

function switchMode(mode) {
  chatMode = mode;
  document.querySelectorAll(".mode-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });

  clearMessages();
  
  let greeting = mode === "assistant" ? getAssistantGreeting() : CHATBOT_CONFIG[mode].greeting;
  
  addBotMessage(greeting);
  renderQuickReplies(CHATBOT_CONFIG[mode].quickReplies);
}

function clearMessages() {
  document.getElementById("chatbot-messages").innerHTML = "";
}

function addBotMessage(text, extraContent = null) {
  const messages = document.getElementById("chatbot-messages");
  const wrapper = document.createElement("div");
  wrapper.className = "chat-msg bot";

  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  wrapper.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-wand-magic-sparkles" style="font-size:0.7rem;"></i></div>
    <div>
      <div class="chat-bubble">${formattedText}</div>
      ${extraContent || ""}
    </div>
  `;
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function addUserMessage(text) {
  const messages = document.getElementById("chatbot-messages");
  const wrapper = document.createElement("div");
  wrapper.className = "chat-msg user";
  wrapper.innerHTML = `
    <div class="msg-avatar"><i class="fa-regular fa-user" style="font-size:0.7rem;"></i></div>
    <div class="chat-bubble">${text}</div>
  `;
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function showTypingIndicator() {
  const messages = document.getElementById("chatbot-messages");
  const indicator = document.createElement("div");
  indicator.className = "chat-msg bot";
  indicator.id = "typing-indicator-wrapper";
  indicator.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-wand-magic-sparkles" style="font-size:0.7rem;"></i></div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messages.appendChild(indicator);
  messages.scrollTop = messages.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById("typing-indicator-wrapper")?.remove();
}

function renderQuickReplies(replies) {
  const container = document.getElementById("quick-replies");
  container.innerHTML = replies
    .map(
      (r) =>
        `<button class="quick-reply-btn" onclick="handleQuickReply('${r}')">${r}</button>`
    )
    .join("");
}

window.handleQuickReply = function (text) {
  addUserMessage(text);
  document.getElementById("quick-replies").innerHTML = "";
  processMessage(text);
};

function sendMessage() {
  const input = document.getElementById("chatbot-input");
  const text = input.value.trim();
  if (!text || isTyping) return;

  addUserMessage(text);
  input.value = "";
  document.getElementById("quick-replies").innerHTML = "";
  processMessage(text);
}

async function processMessage(text) {
  isTyping = true;
  const lower = text.toLowerCase();
  showTypingIndicator();

  // Attempt live AI call based on active engine
  const activeEngine = localStorage.getItem("LUXE_AI_ENGINE") || "gemini";
  let reply = null;
  if (activeEngine === "gemini") {
    reply = await callGeminiAPI(text);
  } else {
    reply = await callNovaMindAPI(text);
  }

  removeTypingIndicator();
  isTyping = false;

  if (reply) {
    // Live reply successful!
    let cleanReply = reply;
    const actionRegex = /\[ACTION:\s*([A-Z_]+)(?:,\s*ID:\s*(\d+))?\]/i;
    const match = reply.match(actionRegex);
    
    if (match) {
      const action = match[1].toUpperCase();
      const id = match[2] ? parseInt(match[2], 10) : null;
      
      // Clean the reply by removing the action tag
      cleanReply = reply.replace(actionRegex, "").trim();
      
      // Execute UI action (executeChatbotAction is defined below)
      executeChatbotAction(action, id);
    }

    // Auto-detect if any product from our inventory was mentioned in response or query
    const matched = [];
    if (typeof PRODUCTS !== "undefined") {
      PRODUCTS.forEach((p) => {
        const firstWord = p.name.toLowerCase().split(" ")[0];
        if (cleanReply.toLowerCase().includes(firstWord) || lower.includes(firstWord)) {
          if (!matched.find((m) => m.id === p.id)) {
            matched.push(p);
          }
        }
      });
    }

    const cardsHtml = matched.length > 0 ? renderChatProductCards(matched.slice(0, 3)) : null;
    addBotMessage(cleanReply, cardsHtml);

    // Provide relevant quick replies based on mode
    const quicks = chatMode === "support"
      ? ["Track my order", "Return policy", "Size guide", "Shipping info", "Contact us"]
      : ["Compare top coats", "Best sellers", "Gift ideas", "Style my outfit", "Under $600"];
    renderQuickReplies(quicks);
  } else {
    // API failed or key missing — use local keyword fallback
    if (chatMode === "support") {
      processSupportMessage(lower, text);
    } else {
      processAssistantMessage(lower, text);
    }
  }
}

function executeChatbotAction(action, id) {
  console.log("LUXE Concierge executing action:", action, "ID:", id);
  switch (action) {
    case "ADD_TO_CART":
      if (id && typeof addToCart === "function") {
        addToCart(id);
        setTimeout(openCart, 600);
      }
      break;
    case "REMOVE_FROM_CART":
      if (id && typeof removeFromCart === "function") {
        removeFromCart(id);
      }
      break;
    case "OPEN_CART":
      if (typeof openCart === "function") openCart();
      break;
    case "CLOSE_CART":
      if (typeof closeCart === "function") closeCart();
      break;
    case "OPEN_WISHLIST":
      document.getElementById("wishlist-sidebar").classList.add("open");
      document.getElementById("wishlist-overlay").classList.add("open");
      document.body.classList.add("locked");
      break;
    case "OPEN_CHECKOUT":
      if (typeof openCheckout === "function") {
        setTimeout(openCheckout, 400);
      }
      break;
    case "CLEAR_CART":
      if (typeof cart !== "undefined" && typeof updateCartUI === "function") {
        cart.length = 0; // Clear array in place
        updateCartUI();
        if (typeof showToast === "function") showToast("Shopping cart cleared");
      }
      break;
    default:
      console.warn("Concierge action not recognized:", action);
  }
}

function processSupportMessage(lower, original) {
  const cfg = CHATBOT_CONFIG.support;

  if (lower.includes("track") || lower.includes("order")) {
    addBotMessage(cfg.responses["track"]);
  } else if (lower.includes("return") || lower.includes("refund")) {
    addBotMessage(cfg.responses["return"]);
  } else if (lower.includes("size") || lower.includes("fit")) {
    addBotMessage(cfg.responses["size"]);
  } else if (lower.includes("ship") || lower.includes("deliver")) {
    addBotMessage(cfg.responses["ship"]);
  } else if (lower.includes("contact") || lower.includes("help") || lower.includes("talk")) {
    addBotMessage(cfg.responses["contact"]);
  } else if (lower.includes("payment") || lower.includes("pay") || lower.includes("upi")) {
    addBotMessage(cfg.responses["payment"]);
  } else {
    addBotMessage(
      "I'd be happy to help! For personalized assistance, please reach out to our concierge team at **hello@luxe.com** or call **+91 98765 43210**.\n\nOr switch to **Assistant Mode** above for product recommendations! ✨"
    );
  }

  renderQuickReplies(["Track my order", "Return policy", "Size guide", "Shipping info", "Contact us"]);
}

function processAssistantMessage(lower, original) {
  if (
    lower.includes("compare") ||
    lower.includes("coat") ||
    lower.includes("vs") ||
    lower.includes("difference")
  ) {
    addBotMessage(
      "Here's a comparison of our top coat and blazer picks for you:"
    );
    // Render product comparison cards
    if (typeof PRODUCTS !== "undefined") {
      const compareProducts = PRODUCTS.filter((p) =>
        ["Venezia Cashmere Coat", "Atelier Wool Blazer"].includes(p.name)
      );
      const cardsHtml = renderChatProductCards(compareProducts);
      addBotMessage(
        "Both are handcrafted in Italy. The **Venezia** is more formal and opulent; the **Atelier Blazer** is versatile for work to evening. Which speaks to you?",
        cardsHtml
      );
    }
  } else if (
    lower.includes("best seller") ||
    lower.includes("popular") ||
    lower.includes("top")
  ) {
    if (typeof PRODUCTS !== "undefined") {
      const topProducts = PRODUCTS.filter((p) => p.stars >= 4.5).slice(0, 3);
      const cardsHtml = renderChatProductCards(topProducts);
      addBotMessage(
        "Here are our **top-rated bestsellers** — handpicked by our LUXE curators:",
        cardsHtml
      );
      addBotMessage("Want more details or shall I add any to your cart? 🛍️");
    }
  } else if (lower.includes("gift") || lower.includes("present")) {
    addBotMessage(CHATBOT_CONFIG.assistant.responses["gift"]);
  } else if (
    lower.includes("budget") ||
    lower.includes("under") ||
    lower.includes("affordable") ||
    lower.includes("₹") ||
    lower.includes("$")
  ) {
    addBotMessage(CHATBOT_CONFIG.assistant.responses["budget"]);
  } else if (
    lower.includes("style") ||
    lower.includes("outfit") ||
    lower.includes("wear")
  ) {
    addBotMessage(CHATBOT_CONFIG.assistant.responses["style"]);
  } else if (lower.includes("open cart") || lower.includes("show cart") || lower.includes("view cart")) {
    if (typeof openCart === "function") openCart();
    addBotMessage("Certainly! I have opened your shopping cart sidebar for you.");
  } else if (lower.includes("close cart") || lower.includes("hide cart")) {
    if (typeof closeCart === "function") closeCart();
    addBotMessage("I've closed your shopping cart.");
  } else if (lower.includes("checkout") || lower.includes("pay")) {
    if (typeof cart !== "undefined" && cart.length === 0) {
      addBotMessage("Your shopping cart is currently empty. Please add some items before checking out!");
    } else {
      if (typeof openCheckout === "function") {
        setTimeout(openCheckout, 400);
        addBotMessage("Opening the checkout panel for you. I'm here if you need any assistance with your details!");
      }
    }
  } else if (lower.includes("clear cart") || lower.includes("empty cart")) {
    if (typeof cart !== "undefined" && typeof updateCartUI === "function") {
      cart.length = 0;
      updateCartUI();
      if (typeof showToast === "function") showToast("Shopping cart cleared");
      addBotMessage("I've emptied your shopping cart for you.");
    }
  } else if (lower.includes("remove") && (lower.includes("cart") || lower.includes("delete"))) {
    // Try to find a product to remove
    if (typeof PRODUCTS !== "undefined" && typeof removeFromCart === "function") {
      const found = PRODUCTS.find((p) => lower.includes(p.name.toLowerCase().split(" ")[0]));
      if (found) {
        removeFromCart(found.id);
        addBotMessage(`I've removed the **${found.name}** from your cart.`);
      } else {
        addBotMessage("Which product would you like me to remove from your cart?");
      }
    }
  } else if (lower.includes("cart") || lower.includes("add")) {
    // Try to match a product
    if (typeof PRODUCTS !== "undefined" && typeof addToCart === "function" && typeof openCart === "function") {
      const found = PRODUCTS.find((p) => lower.includes(p.name.toLowerCase().split(" ")[0]));
      if (found) {
        addToCart(found.id);
        setTimeout(openCart, 600);
        addBotMessage(`... I've added **${found.name}** to your cart and opened it so you can review! Anything else I can assist with?`);
      } else {
        addBotMessage(
          "Which product would you like to add? You can tell me the product name, or I can show you our bestsellers."
        );
      }
    }
  } else if (lower.includes("silk") || lower.includes("dress")) {
    if (typeof PRODUCTS !== "undefined") {
      const products = PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes("silk") || p.category === "Women"
      ).slice(0, 3);
      addBotMessage("Here are our silk and women's pieces you might love:", renderChatProductCards(products));
    }
  } else if (lower.includes("bag") || lower.includes("accessory") || lower.includes("accessories")) {
    if (typeof PRODUCTS !== "undefined") {
      const products = PRODUCTS.filter((p) => p.category === "Accessories");
      addBotMessage("Our accessories collection, curated for you:", renderChatProductCards(products));
    }
  } else if (lower.includes("men") || lower.includes("man") || lower.includes("him")) {
    if (typeof PRODUCTS !== "undefined") {
      const products = PRODUCTS.filter((p) => p.category === "Men");
      addBotMessage("Our finest menswear collection:", renderChatProductCards(products));
    }
  } else {
    addBotMessage(
      `Great question! Let me help you find something perfect. Could you tell me more about:\n\n• **Who** is it for? (yourself, a gift)\n• **What occasion**? (casual, work, formal event)\n• **Any price range** in mind?\n\nI'll curate the perfect selection! ✨`
    );
  }

  renderQuickReplies(["Compare top coats", "Best sellers", "Gift ideas", "Style my outfit", "Under $600"]);
}

function renderChatProductCards(products) {
  return `<div class="chat-product-cards">
    ${products
      .map(
        (p) => `
      <div class="chat-product-card" onclick="openModal(${p.id})" style="cursor:default;">
        <div class="chat-product-card-img" style="background-image: url('${p.img}'); background-size: cover; background-position: center;"></div>
        <div class="chat-product-card-info">
          <div class="chat-product-card-name">${p.name}</div>
          <div class="chat-product-card-price">$${p.price.toLocaleString()}</div>
        </div>
      </div>`
      )
      .join("")}
  </div>`;
}

// =============================================
// GLOBAL PAGE INITIALIZATION
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initLoader === "function") initLoader();
  if (typeof initCursor === "function") initCursor();
  if (typeof initNav === "function") initNav();
  if (typeof initMobileNav === "function") initMobileNav();
  if (typeof initEventListeners === "function") initEventListeners();
  if (typeof initSearch === "function") initSearch();
  if (typeof initNewsletter === "function") initNewsletter();
  if (typeof initChatbot === "function") initChatbot();
  if (typeof initWishlist === "function") initWishlist();
  if (typeof initLogin === "function") initLogin();
  if (typeof initPaymentOptions === "function") initPaymentOptions();
  if (typeof updateCartUI === "function") updateCartUI();
  if (typeof updateWishlistUI === "function") updateWishlistUI();
  if (typeof loadUserState === "function") loadUserState();
});
