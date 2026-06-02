# LUXE — Where Desire Meets Design ✨

![LUXE Cover](https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop)

**LUXE** is a cinematic, immersive luxury e-commerce platform built for the modern era. Designed with a curated dark-slate and gold aesthetic, it leverages modern scrolling physics and features a **Dual-Engine AI Concierge** capable of directly executing shopping actions (such as adding items to the cart, navigating to checkout, or recommending products) through natural language dialogue.

### 🌐 Live Deployment
**Frontend (Vercel):** [Visit LUXE Live](https://luxe-store-hd8wpl06d-satyamshiv0079s-projects.vercel.app/)  
**Backend API (Render):** `https://luxe-store-ev96.onrender.com`

---

## 🏗️ Cloud Architecture

LUXE is engineered using a robust, decoupled modern web stack:

- **Frontend (Vanilla HTML/CSS/JS):** A lightning-fast static frontend utilizing GSAP for scroll-driven animations and Lenis for buttery-smooth scrolling physics.
- **Backend (Python Flask & Socket.IO):** A powerful Python API serving RESTful endpoints and real-time WebSocket connections. It utilizes `eventlet` for asynchronous non-blocking IO.
- **Database (Supabase PostgreSQL):** A fully managed relational database handling users, products, and order history, secured with strict **Row Level Security (RLS)** policies and JWT authentication.
- **AI Brain (Groq API):** The AI Concierge is powered by Groq's LPU Inference Engine, delivering sub-second natural language processing for the integrated chat agent.
- **PDF Generation:** Automated invoice generation using `reportlab`.

## ⚙️ Project Structure

```text
LUXE-Store/
├── index.html                # The primary SPA interface
├── assets/                   # High-res offline-capable fashion graphics
├── css/
│   └── style.css             # Unified dark luxury styling & structural layouts
├── js/
│   ├── animations.js         # GSAP ScrollTriggers, Lenis scrolling, mobile nav
│   ├── ecommerce.js          # Cart, wishlist, authentication, and checkout flow
│   └── chatbot.js            # Real-time Socket.IO chat, Groq API integration
└── backend/
    ├── api/
    │   ├── app.py            # Main Flask/Socket.IO Server
    │   └── receipt_mailer.py # Email and PDF generation services
    ├── dialog_service/       # Conversation state and intent handling
    ├── nlp_service/          # Lightweight NLP Fallback models
    └── requirements.txt      # Python dependencies
```

## 🚀 Running Locally

If you want to run the full stack locally on your machine:

### 1. Start the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
pip install pyjwt bcrypt flask-socketio reportlab
```

Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_key
JWT_SECRET=luxe-super-secret-jwt-key
ALLOWED_ORIGINS=*
```

Start the server:
```bash
python api/app.py
```

### 2. Start the Frontend
Since the frontend is completely static, you can use any live server. Using Python:
```bash
# In the root LUXE-Store directory
python -m http.server 5000
```
Navigate to `http://localhost:5000` in your browser. *(Note: You will need to update the API endpoints in `js/ecommerce.js` and `js/chatbot.js` back to `http://localhost:8000` for local testing).*

---
*© 2026 LUXE. All rights reserved.*
