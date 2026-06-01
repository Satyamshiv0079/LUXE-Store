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
│   ├── ecommerce.js          # Cart, wishlist, currency, reviews, location state, and checkout
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
*   **Parallax & Staggered Offsets**: Cinematic 0.4x slow-motion scroll vectors bound to collection covers and alternating vertical column offsets for editorial grids, replicating high-fashion web layouts.
*   **Lenis Smooth Scrolling**: Decoupled, physics-based smooth scrolling providing an organic scroll sensation.
*   **Scroll-Bound Counters**: Viewport-triggered statistics counters counting up dynamically to brand metrics.
*   **Magnetic Vectors**: Springs interactive buttons organically toward mouse positions on hover.

### 3. Integrated Global Commerce Upgrade
*   **VIP Member Dashboard & Secure Auth**: Full registration and authentication system with a slide-out drawer fetching your real-time SQLite order history and account details directly from the local Python backend.
*   **3D Product Viewer (Interactive WebGL)**: Embedded `<model-viewer>` engine allowing users to toggle from standard 2D imagery into an interactive, zoomable, and rotatable 3D product view directly within the quick-view modal.
*   **Advanced Algorithmic Filtering**: High-end two-column search layout featuring a draggable price scale and category checkboxes. Powered by custom GSAP stagger animations that instantly filter and render the active catalog.
*   **Global Multicurrency Switcher**: A gold-trimmed selector in the navbar dropdown offering instantaneous conversions between **USD ($)**, **EUR (€)**, **INR (₹)**, and **GBP (£)**, recalculating catalog prices, active cart subtotals, wishlist drawers, and checkout calculations instantly. Saves your active currency in `localStorage`.
*   **Product Review & Testimonial Engine**: A tabbed modal interface dividing Description from Reviews. Displays rating analytics summaries (e.g. *5.0 based on 2 reviews*), dynamic star inputs, user submissions forms, and pre-loaded premium customer history logs. Integrates with session-safe `localStorage`.
*   **Location Auto-Fill (Simulated GPS)**: A gold **`Auto-Detect Current Location`** button in the checkout. When clicked, it activates a 1.2-second high-tech crosshair loading spin to simulate real-time satellite lookups, automatically filling delivery fields with a mock Milan fashion district location and alerting the user via gold toast banners.
*   **Promo Discount Engine**: Supports case-insensitive coupon entries in Checkout Step 1. Codes:
    *   `LUXE20`: Instantly applies a **20%** subtotal discount.
    *   `GOLD50`: Instantly applies a **50%** subtotal discount.
    *   Clears and resets cleanly when checkout panels are closed or re-opened.
*   **"Complete the Look" Styling Recommendations (Cross-Sell Engine)**: Curation grid inside the Quick-View modal presenting curated accessory pairings. Allows quick-view switching by clicking matches, or single-click addition of the entire styled bundle to the cart with an integrated **10% discount**.
*   **Signature LUXE Gift Packaging & Handwritten Card (Commerce Upgrade)**: Checkout Step 1 selection (+$15 USD dynamically converted based on active currency), sliding color-coded ribbon picker (Midnight Black, Archival Gold, Satin White), and card message textarea. Recalculates subtotal/total summaries and details active packaging inside success receipts.
*   **Dynamic Size-Specific Stock Alerts (UI/UX Upgrade)**: Live size-bound inventory tracking inside the details modal. Selecting different sizes dynamically updates a pulsing stock status indicator (e.g. orange for *Low Stock*, red for *Out of Stock*, green for *In Stock*) and auto-disables buttons with luxury strikethrough states.
*   **Stripe Simulated Gateway & 3D Secure Verification**: An interactive checkout experience featuring a glassmorphic Stripe Sandbox element, and a realistic 3D Secure payment processing modal with rotating animations.
*   **Full-Stack AJAX SQLite Tracking**: Checkouts perform live REST API POST requests to the local Flask backend. All transactions, subtotal arrays, and custom gift note data are persisted seamlessly in a lightweight local SQLite database.

### 4. Interactive Concierge AI & RAG Pipeline
*   **Dual-Engine Selector**: Slide-up settings dashboard to toggle between Google's **Gemini 1.5 Flash** cloud model or a custom, locally-hosted **NovaMind** Flask server.
*   **Store Policy RAG**: The backend intercepts keywords (e.g., "shipping", "returns", "sizing") and dynamically injects `store_policies.md` context into the LLM system prompt, allowing the AI to answer complex, store-specific factual questions accurately.
*   **Secure API Manager**: Secured local storage (`localStorage`) locker to save Gemini API keys and local authorization tokens.
*   **Concierge Command Interceptor**: Intercepts structural actions inside conversational text (e.g. `[ACTION: ADD_TO_CART, ID: 2]`) to trigger browser cart drawers, load modals, and complete purchases on the user's screen.

### 5. Advanced Backend Architecture & Security
*   **Secure Admin Portal**: Hidden role-based portal that unlocks for users registered with "admin" in their email. Fetches protected lists of all registered users and global orders.
*   **Persistent Wishlists**: Cross-session heart icon tracking that automatically syncs to a JSON column in the SQLite database and restores upon login.
*   **Production-Grade Authentication**: User passwords are cryptographically salted and hashed using **Bcrypt**. Sessions are authorized via cryptographically signed JSON Web Tokens (**JWTs**), not plain cookies.
*   **Local Email Spooler & PDF Receipts**: Completing an authenticated checkout generates a beautiful HTML receipt simulating an SMTP mailer, saved directly to the backend filesystem. Additionally, a dynamic **PDF Invoice** is generated using `reportlab` and is downloadable from the VIP dashboard.

### 6. The Ultimate Upgrade (Phase 4 Additions)
*   **Real-Time WebSockets Streaming**: Migrated the AI Concierge to `Flask-SocketIO`, enabling character-by-character text streaming mimicking ChatGPT's real-time experience.
*   **Dynamic AI Translations (i18n)**: Integrated a frontend language selector (EN, FR, IT, JP) that queries a `/translate` route powered by Llama-3.1 via Groq. Translates DOM text nodes natively on-the-fly without page reloads.
*   **Emulated Stripe Checkout**: A simulated asynchronous payment flow mimicking 3D Secure verification via a mock backend `PaymentIntent` generator.
*   **Native Android App Wrapper**: Used the Android CLI to package the HTML/CSS/JS frontend into a native Android APK using a `WebView` configuration.

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
Maintains catalog variables, persistent local storage, product quick-view panels, currency switchers, review forms, GPS auto-fills, and checkout formatting loops. It works elastically with visual elements.

### `js/chatbot.js`
Interprets server APIs, formats chat logs, sets up local fallbacks, executes concierge overrides, and houses the central `DOMContentLoaded` event listener which coordinates page loads.
