# LUXE — Where Desire Meets Design

LUXE is a cinematic, immersive luxury e-commerce storefront. Designed with a curated dark-slate and gold aesthetic, it leverages modern scrolling physics, scroll-driven counters, and features a dual-engine AI Concierge capable of directly executing shopping actions (such as adding items to the cart, showing the checkout panel, or clearing the cart) through dialogue.

---

## 📂 Project Structure

LUXE is structured according to professional, decoupled web application standards:

```text
LUXE-Store/
├── assets/
│   └── images/               # 100% Offline-Capable Unsplash fashion graphics
├── css/
│   └── style.css             # Unified dark luxury styling & structural layouts
├── js/
│   ├── animations.js         # GSAP ScrollTriggers, Lenis smooth scrolling, cursors, mobile nav
│   ├── ecommerce.js          # Cart and wishlist persistent state, product details, checkout forms
│   └── chatbot.js            # Dual-mode AI panel (Gemini API / NovaMind API), concierge parser
├── index.html                # Immersive HTML entrance
└── README.md                 # Project documentation
```

---

## ⚡ Technical Highlights

### 1. Unified Visual Design
*   **Curated HSL Palette**: Dominant dark-slate backdrop (`#111`), textured off-whites (`#f5f0ea`), and a sophisticated, reflective gold accent (`#c9a96e`).
*   **Aesthetic Typography**: Editorial Cormorant Garamond serifs paired with clean Space Grotesk and Inter user interface fonts.
*   **Precision Dual-Cursor Follower**: High-performance precision cursor dot coupled with a trailing organic follower circle reacting dynamically to hover triggers.

### 2. Premium Performance & Motion
*   **GSAP + ScrollTrigger**: Beautiful, high-performance scroll triggers staggering collection panels, shifting editorial articles, and animating title reveals.
*   **Lenis Smooth Scrolling**: Decoupled, physics-based smooth scrolling providing an organic scroll sensation.
*   **Scroll-Bound Counters**: Viewport-triggered statistics counters counting up dynamically to brand metrics.
*   **Magnetic Vectors**: Springs interactive buttons organically toward mouse positions on hover.

### 3. State & Commerce Management (Vanilla JS)
*   **Persistent Wishlist**: Wishlist storage backed by browser `localStorage` to save catalog selections and move them to checkout.
*   **Shopping Cart State**: Fully reactive shopping cart arrays recalculating subtotals, showing visual drawer lists, and animating navigation count badges.
*   **4-Step Checkout Flow**:
    1.  *Review*: Item summary, quantities, and calculation reviews.
    2.  *Delivery*: Contact info, address validation, and PIN codes.
    3.  *Payment*: Direct card parsing (with automatic 16-digit spacing and MM/YY slash masking), secure UPI options, or Cash on Delivery.
    4.  *Confirmation*: Instantly generates a unique confirmation receipt ID (`LUXE-XXXXXX`).

### 4. Interactive Concierge AI
*   **Dual-Engine Selector**: Slide-upsettings dashboard to toggle between Google's **Gemini 1.5 Flash** cloud model or a custom, locally-hosted **NovaMind** Flask server.
*   **Secure API Manager**: Secured local storage (`localStorage`) locker to save Gemini API keys and local authorization tokens.
*   **Concierge Command Interceptor**: Intercepts structural actions inside conversational text (e.g. `[ACTION: ADD_TO_CART, ID: 2]`) to trigger browser cart drawers, load modals, and complete purchases on the user's screen.
*   **Offline Fallback Mode**: High-fidelity local keyword parser acting as a fallback to address support inquiries when API servers are offline.

---

## 🚀 Getting Started

### Prerequisites
*   A modern web browser with JavaScript enabled.
*   Python 3.x (to bypass local CORS blockades by serving the client via HTTP).

### Step 1: Launch the Local AI Server (Optional)
If utilizing the local Llama3-powered **NovaMind** server, boot the API backend inside its virtual environment folder:
```bash
# From your NovaMind server folder
.\venv\Scripts\python.exe api/app.py
```
The Flask backend will start listening at `http://localhost:8000`.

### Step 2: Serve the Storefront Client
Serve the directory via Python's built-in HTTP server to prevent browser `file://` origin CORS violations when connecting to local or cloud APIs:
```bash
# Serve on default port 5000
python -m http.server 5000
```

### Step 3: Open in Browser
Open your browser and navigate to:
👉 **`http://localhost:5000`**

---

## 🛠️ Module Breakdowns

### `js/animations.js`
Houses all motion initializers, loader triggers, scrolling triggers, and hover listeners. It has zero external dependencies other than GSAP, ScrollTrigger, and Lenis.

### `js/ecommerce.js`
Maintains catalog variables, persistent local storage, product quick-view panels, and card formatting loops. It works elastically with visual elements.

### `js/chatbot.js`
Interprets server APIs, formats chat logs, sets up local fallbacks, executes concierge overrides, and houses the central `DOMContentLoaded` event listener which coordinates page loads.
