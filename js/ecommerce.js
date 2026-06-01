/* =============================================
   LUXE — js/ecommerce.js
   State, Catalog, Cart, Wishlist, Login, Checkout
   ============================================= */

// =============================================
// PRODUCT DATA
// =============================================
const PRODUCTS = [
  {
    id: 1,
    name: "Venezia Cashmere Coat",
    category: "Women",
    price: 1280,
    oldPrice: null,
    description: "Draped in 100% Grade-A Mongolian cashmere, the Venezia coat is a study in effortless refinement. Features a hand-stitched lining and mother-of-pearl buttons. Made in Italy.",
    badge: "new",
    sizes: ["XS", "S", "M", "L", "XL"],
    stars: 5,
    img: "assets/images/product-1.jpg",
  },
  {
    id: 2,
    name: "Avorio Silk Dress",
    category: "Women",
    price: 890,
    oldPrice: 1200,
    description: "Featherlight ivory silk crepe de chine, cut on the bias for a fluid silhouette that moves with you. Hand-finished seams. Dry clean only.",
    badge: "sale",
    sizes: ["XS", "S", "M", "L"],
    stars: 4.5,
    img: "assets/images/product-2.jpg",
  },
  {
    id: 3,
    name: "Milano Leather Bag",
    category: "Accessories",
    price: 1650,
    oldPrice: null,
    description: "Structured in full-grain Italian calfskin, the Milano bag features a suede interior, gold-tone hardware, and includes a dust bag and authenticity card.",
    badge: "limited",
    sizes: ["One Size"],
    stars: 5,
    img: "assets/images/product-3.jpg",
  },
  {
    id: 4,
    name: "Atelier Wool Blazer",
    category: "Men",
    price: 1120,
    oldPrice: null,
    description: "Tailored from superfine 120s wool, this single-breasted blazer delivers precision fit and classic Italian tailoring. Fully canvassed. Available in multiple fits.",
    badge: "new",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stars: 4.5,
    img: "assets/images/product-4.jpg",
  },
  {
    id: 5,
    name: "Celeste Silk Blouse",
    category: "Women",
    price: 480,
    oldPrice: null,
    description: "Featherlight mulberry silk with a subtle pearl lustre. Fluid drape with French seams and a concealed back placket.",
    badge: null,
    sizes: ["XS", "S", "M", "L"],
    stars: 5,
    img: "assets/images/product-5.png",
  },
  {
    id: 6,
    name: "Lux Oxford Shirt",
    category: "Men",
    price: 320,
    oldPrice: 420,
    description: "Woven from 2-ply Egyptian cotton in a classic Oxford weave. Mother-of-pearl buttons, single-needle stitching throughout.",
    badge: "sale",
    sizes: ["S", "M", "L", "XL"],
    stars: 4,
    img: "assets/images/product-6.jpg",
  },
  {
    id: 7,
    name: "Sorrento Silk Scarf",
    category: "Accessories",
    price: 295,
    oldPrice: null,
    description: "Hand-printed twill silk scarf featuring an exclusive LUXE archival print. Rolled by hand in our Milan atelier. 90x90cm.",
    badge: null,
    sizes: ["One Size"],
    stars: 5,
    img: "assets/images/product-7.jpg",
  },
  {
    id: 8,
    name: "Palazzo Wide Trousers",
    category: "Women",
    price: 620,
    oldPrice: null,
    description: "Cut from a silk-wool blend with an ultra-wide leg and a high-rise waist. A statement of modern tailoring.",
    badge: "new",
    sizes: ["XS", "S", "M", "L", "XL"],
    stars: 4.5,
    img: "assets/images/product-8.jpg",
  },
];

// =============================================
// CART SYSTEM
// =============================================
let cart = [];

function addToCart(productId, size = "M") {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId && item.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1, size });
  }

  updateCartUI();
  animateCartBadge();

  // Show mini notification
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-header-count").textContent = `(${count})`;
  document.getElementById("cart-subtotal").textContent =
    "$" + total.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const itemsContainer = document.getElementById("cart-items");
  const footer = document.getElementById("cart-footer");

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Your cart is empty</p>
        <a href="#products" class="btn-primary" id="start-shopping-btn">Start Shopping</a>
      </div>`;
    footer.style.display = "none";
    document.getElementById("start-shopping-btn")?.addEventListener("click", closeCart);
  } else {
    footer.style.display = "block";
    itemsContainer.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item-img" style="background-image: url('${item.img}'); background-size: cover; background-position: center;"></div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Size: ${item.size} · Qty: ${item.qty}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>`
      )
      .join("");
  }
}

function animateCartBadge() {
  const badge = document.getElementById("cart-count");
  badge.classList.remove("pop");
  void badge.offsetWidth;
  badge.classList.add("pop");
}

function openCart() {
  document.getElementById("cart-sidebar").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
  document.body.classList.add("locked");
}

function closeCart() {
  document.getElementById("cart-sidebar").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
  document.body.classList.remove("locked");
}

// =============================================
// CATALOG CARD RENDERER
// =============================================
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = product.id;

  const starsHtml = getStarsHtml(product.stars);
  const badgeHtml = product.badge
    ? `<span class="product-badge ${product.badge}">${product.badge.toUpperCase()}</span>`
    : "";
  const oldPriceHtml = product.oldPrice
    ? `<span class="product-price-old">$${product.oldPrice.toLocaleString()}</span>`
    : "";

  card.innerHTML = `
    <div class="product-img-wrap">
      <div class="product-img" style="background-image: url('${product.img}'); background-size: cover; background-position: center;"></div>
      ${badgeHtml}
      <div class="product-overlay">
        <button class="product-action-btn quick-view-btn" title="Quick View" data-id="${product.id}">
          <i class="fa-regular fa-eye"></i>
        </button>
        <button class="product-action-btn add-to-cart-btn" title="Add to Cart" data-id="${product.id}">
          <i class="fa-solid fa-bag-shopping"></i>
        </button>
      </div>
    </div>
    <div class="product-info">
      <span class="product-category">${product.category}</span>
      <div class="product-stars">${starsHtml}</div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-desc">${product.description.slice(0, 80)}...</p>
      <div class="product-price-row">
        <span class="product-price">$${product.price.toLocaleString()}</span>
        ${oldPriceHtml}
      </div>
    </div>
  `;

  card.querySelector(".quick-view-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(product.id);
  });
  card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(product.id);
  });

  return card;
}

function getStarsHtml(stars) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(stars)) html += '<i class="fa-solid fa-star"></i>';
    else if (i === Math.ceil(stars) && stars % 1 !== 0)
      html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

// =============================================
// PRODUCT DETAILS QUICK VIEW MODAL
// =============================================
let currentModal = null;

function openModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  currentModal = product;

  document.getElementById("modal-category").textContent = product.category;
  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-price").textContent =
    "$" + product.price.toLocaleString();
  document.getElementById("modal-description").textContent = product.description;
  document.getElementById("modal-img").style.backgroundImage = `url('${product.img}')`;
  document.getElementById("modal-img").style.backgroundSize = "cover";
  document.getElementById("modal-img").style.backgroundPosition = "center";

  const sizesContainer = document.getElementById("modal-sizes");
  sizesContainer.innerHTML = product.sizes
    .map(
      (s, i) =>
        `<button class="size-btn ${i === 1 ? "selected" : ""}" onclick="selectSize(this, '${s}')">${s}</button>`
    )
    .join("");

  document.getElementById("modal-overlay").classList.add("open");
  document.getElementById("product-modal").classList.add("open");
  document.body.classList.add("locked");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.getElementById("product-modal").classList.remove("open");
  document.body.classList.remove("locked");
  currentModal = null;
}

function selectSize(btn, size) {
  document.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

// Set up add to cart in product details modal
if (document.getElementById("modal-add-cart")) {
  document.getElementById("modal-add-cart").addEventListener("click", () => {
    if (!currentModal) return;
    const selectedSize = document.querySelector(".size-btn.selected")?.textContent || "M";
    addToCart(currentModal.id, selectedSize);
    closeModal();
    openCart();
  });
}

// =============================================
// WISHLIST SYSTEM
// =============================================
let wishlist = JSON.parse(localStorage.getItem("luxe_wishlist") || "[]");

function toggleWishlist(productId) {
  const idx = wishlist.findIndex((id) => id === productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(productId);
    showToast("❤️ Saved to wishlist");
  }
  localStorage.setItem("luxe_wishlist", JSON.stringify(wishlist));
  updateWishlistUI();
}

function isWishlisted(productId) {
  return wishlist.includes(productId);
}

function updateWishlistUI() {
  const count = wishlist.length;
  const badge = document.getElementById("wishlist-count");

  if (count > 0) {
    badge.style.display = "flex";
    badge.textContent = count;
  } else {
    badge.style.display = "none";
  }

  const container = document.getElementById("wishlist-items");
  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-regular fa-heart"></i>
        <p>Your wishlist is empty</p>
        <p class="cart-empty-sub">Save items you love</p>
      </div>`;
  } else {
    container.innerHTML = wishlistProducts.map((p) => `
      <div class="wishlist-item">
        <div class="wishlist-item-img" style="background-image:url('${p.img}'); background-size:cover; background-position:center;"></div>
        <div class="wishlist-item-details">
          <div class="wishlist-item-name">${p.name}</div>
          <div class="wishlist-item-price">$${p.price.toLocaleString()}</div>
          <div class="wishlist-item-actions">
            <button class="wishlist-add-cart" onclick="addToCart(${p.id}); showToast('${p.name} added to cart');">Add to Cart</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="toggleWishlist(${p.id})">
          <i class="fa-solid fa-heart" style="color:#c06060;"></i>
        </button>
      </div>`).join("");
  }

  // Update wishlist btn in modal if open
  updateModalWishlistBtn();
}

function updateModalWishlistBtn() {
  const btn = document.getElementById("modal-wishlist-btn");
  if (!btn || !currentModal) return;
  const wishlisted = isWishlisted(currentModal.id);
  btn.innerHTML = wishlisted
    ? '<i class="fa-solid fa-heart" style="color:#c9a96e;"></i>'
    : '<i class="fa-regular fa-heart"></i>';
}

function initWishlist() {
  const wishlistBtn = document.getElementById("wishlist-btn");
  const wishlistOverlay = document.getElementById("wishlist-overlay");
  const wishlistClose = document.getElementById("wishlist-close");
  const wishlistSidebar = document.getElementById("wishlist-sidebar");

  wishlistBtn.addEventListener("click", () => {
    wishlistSidebar.classList.add("open");
    wishlistOverlay.classList.add("open");
    document.body.classList.add("locked");
  });
  wishlistClose.addEventListener("click", () => {
    wishlistSidebar.classList.remove("open");
    wishlistOverlay.classList.remove("open");
    document.body.classList.remove("locked");
  });
  wishlistOverlay.addEventListener("click", () => {
    wishlistSidebar.classList.remove("open");
    wishlistOverlay.classList.remove("open");
    document.body.classList.remove("locked");
  });

  // Modal wishlist button
  document.getElementById("modal-wishlist-btn").addEventListener("click", () => {
    if (!currentModal) return;
    toggleWishlist(currentModal.id);
    updateModalWishlistBtn();
  });
}

// =============================================
// LOGIN & REGISTRATION SYSTEM
// =============================================
let currentUser = null;

function loadUserState() {
  const saved = localStorage.getItem("luxe_user");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateLoginUI();
  }
}

function updateLoginUI() {
  const loginBtn = document.getElementById("login-btn");
  if (currentUser) {
    loginBtn.title = `${currentUser.name} — Sign Out`;
    loginBtn.querySelector("i").style.color = "var(--gold)";
  } else {
    loginBtn.title = "Sign In";
    loginBtn.querySelector("i").style.color = "";
  }
}

function initLogin() {
  const loginBtn = document.getElementById("login-btn");
  const loginOverlay = document.getElementById("login-overlay");
  const loginModal = document.getElementById("login-modal");
  const loginClose = document.getElementById("login-close");

  loginBtn.addEventListener("click", () => {
    if (currentUser) {
      // Sign out
      currentUser = null;
      localStorage.removeItem("luxe_user");
      updateLoginUI();
      showToast("Signed out successfully");
      return;
    }
    loginOverlay.classList.add("open");
    loginModal.classList.add("open");
    document.body.classList.add("locked");
  });

  const closeLogin = () => {
    loginOverlay.classList.remove("open");
    loginModal.classList.remove("open");
    document.body.classList.remove("locked");
  };
  loginClose.addEventListener("click", closeLogin);
  loginOverlay.addEventListener("click", closeLogin);

  // Tab switching
  document.querySelectorAll(".login-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".login-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.tab;
      document.getElementById("signin-form").classList.toggle("hidden", mode !== "signin");
      document.getElementById("signup-form").classList.toggle("hidden", mode !== "signup");
    });
  });

  // Sign in
  document.getElementById("signin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signin-email").value;
    currentUser = { name: email.split("@")[0], email };
    localStorage.setItem("luxe_user", JSON.stringify(currentUser));
    updateLoginUI();
    closeLogin();
    showToast(`Welcome back, ${currentUser.name}! ✨`);
  });

  // Sign up
  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fname = document.getElementById("signup-fname").value;
    const lname = document.getElementById("signup-lname").value;
    const email = document.getElementById("signup-email").value;
    currentUser = { name: `${fname} ${lname}`, email };
    localStorage.setItem("luxe_user", JSON.stringify(currentUser));
    updateLoginUI();
    closeLogin();
    showToast(`Welcome to LUXE, ${fname}! ✨`);
  });
}

// =============================================
// TOAST NOTIFICATION
// =============================================
function showToast(message) {
  const existing = document.querySelector(".luxe-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "luxe-toast";
  toast.style.cssText = `
    position: fixed; bottom: 6rem; left: 50%; transform: translateX(-50%);
    background: rgba(26,26,26,0.95); backdrop-filter: blur(20px);
    border: 1px solid rgba(201,169,110,0.3); border-radius: 50px;
    padding: 0.7rem 1.5rem; font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem; color: #f5f0ea;
    display: flex; align-items: center; gap: 0.6rem;
    z-index: 9000; white-space: nowrap;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: toastIn 0.4s ease;
  `;
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#c9a96e"></i> ${message}`;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
    @keyframes toastOut { from { opacity:1; } to { opacity:0; transform:translateX(-50%) translateY(10px); } }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.4s ease forwards";
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// =============================================
// PRODUCT SEARCH INTERFACE
// =============================================
function initSearch() {
  const overlay = document.getElementById("search-overlay");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  document.getElementById("search-btn").addEventListener("click", () => {
    overlay.classList.add("open");
    setTimeout(() => input.focus(), 400);
  });
  document.getElementById("search-close").addEventListener("click", () => {
    overlay.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.remove("open");
  });

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { results.innerHTML = ""; return; }

    const matches = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );

    results.innerHTML = matches.length
      ? matches
          .map(
            (p) => `
          <div class="search-result-card" onclick="openModal(${p.id}); document.getElementById('search-overlay').classList.remove('open');">
            <div class="search-result-img" style="background-image: url('${p.img}'); background-size: cover; background-position: center;"></div>
            <div class="search-result-info">
              <div class="search-result-name">${p.name}</div>
              <div class="search-result-price">$${p.price.toLocaleString()}</div>
            </div>
          </div>`
          )
          .join("")
      : `<p style="color:var(--muted); font-size:0.85rem; grid-column:span 3;">No results found for "${input.value}"</p>`;
  });
}

window.searchFor = function (term) {
  document.getElementById("search-input").value = term;
  document.getElementById("search-input").dispatchEvent(new Event("input"));
};

// =============================================
// NEWSLETTER
// =============================================
function initNewsletter() {
  document.getElementById("newsletter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email").value;
    if (email) {
      showToast("Welcome to LUXE! Check your inbox.");
      document.getElementById("newsletter-email").value = "";
    }
  });
}

// =============================================
// 4-STEP CHECKOUT PROCESSOR
// =============================================
let currentCheckoutStep = 1;

window.goCheckoutStep = function (step) {
  // Mark old step done
  document.getElementById(`step-ind-${currentCheckoutStep}`).classList.remove("active");
  document.getElementById(`step-ind-${currentCheckoutStep}`).classList.add("done");
  document.getElementById(`checkout-step-${currentCheckoutStep}`).classList.remove("active");

  // Activate new step
  currentCheckoutStep = step;
  document.getElementById(`step-ind-${step}`).classList.add("active");
  document.getElementById(`step-ind-${step}`).classList.remove("done");
  document.getElementById(`checkout-step-${step}`).classList.add("active");
};

window.placeOrder = function () {
  const orderNum = "LUXE-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  document.getElementById("success-order-num").textContent = `Order #${orderNum}`;
  goCheckoutStep(4);
  // Clear cart after order
  setTimeout(() => {
    cart = [];
    updateCartUI();
  }, 500);
};

window.closeCheckout = function () {
  document.getElementById("checkout-overlay").classList.remove("open");
  document.getElementById("checkout-modal").classList.remove("open");
  document.body.classList.remove("locked");
  closeCart();
  // Reset steps
  currentCheckoutStep = 1;
  document.querySelectorAll(".checkout-step").forEach((s) => {
    s.classList.remove("active", "done");
  });
  document.getElementById("step-ind-1").classList.add("active");
  document.querySelectorAll(".checkout-step-content").forEach((c) => c.classList.remove("active"));
  document.getElementById("checkout-step-1").classList.add("active");
};

let activeDiscount = 0;
let activePromoCode = "";

function openCheckout() {
  // Reset promo state on checkout open
  activeDiscount = 0;
  activePromoCode = "";
  const promoInput = document.getElementById("promo-input");
  if (promoInput) promoInput.value = "";
  const discountRow = document.getElementById("promo-discount-row");
  if (discountRow) discountRow.style.display = "none";

  // Populate checkout items
  const container = document.getElementById("checkout-order-items");
  container.innerHTML = cart.map((item) => `
    <div class="checkout-order-item">
      <div class="checkout-item-img" style="background-image:url('${item.img}');background-size:cover;background-position:center;"></div>
      <div class="checkout-item-details">
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-meta">Size: ${item.size} · Qty: ${item.qty}</div>
      </div>
      <div class="checkout-item-price">$${(item.price * item.qty).toLocaleString()}</div>
    </div>`).join("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("co-subtotal").textContent = "$" + total.toLocaleString("en-US", { minimumFractionDigits: 2 });
  document.getElementById("co-total").textContent = "$" + total.toLocaleString("en-US", { minimumFractionDigits: 2 });

  closeCart();
  document.getElementById("checkout-overlay").classList.add("open");
  document.getElementById("checkout-modal").classList.add("open");
  document.body.classList.add("locked");
}

function applyPromoCode() {
  const input = document.getElementById("promo-input");
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast("Please enter a promo code");
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (code === "LUXE20") {
    activeDiscount = subtotal * 0.20;
    activePromoCode = "LUXE20";
  } else if (code === "GOLD50") {
    activeDiscount = subtotal * 0.50;
    activePromoCode = "GOLD50";
  } else {
    showToast("Invalid promo code");
    return;
  }

  // Update UI elements
  const discountRow = document.getElementById("promo-discount-row");
  const discountCodeSpan = document.getElementById("promo-discount-code");
  const discountValueSpan = document.getElementById("co-discount");
  const totalSpan = document.getElementById("co-total");

  if (discountRow && discountCodeSpan && discountValueSpan && totalSpan) {
    discountCodeSpan.textContent = activePromoCode;
    discountValueSpan.textContent = "-$" + activeDiscount.toLocaleString("en-US", { minimumFractionDigits: 2 });
    discountRow.style.display = "flex";

    const finalTotal = subtotal - activeDiscount;
    totalSpan.textContent = "$" + finalTotal.toLocaleString("en-US", { minimumFractionDigits: 2 });

    showToast(`Code ${activePromoCode} applied! Saved $${activeDiscount.toLocaleString()}`);
  }
}

function initPaymentOptions() {
  document.querySelectorAll(".payment-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      const val = opt.querySelector("input").value;
      const cardFields = document.getElementById("card-fields");
      cardFields.classList.toggle("hidden", val !== "card");
    });
  });

  // Card number formatting
  const cardInput = document.getElementById("card-num");
  if (cardInput) {
    cardInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 16);
      e.target.value = val.replace(/(.{4})/g, "$1 ").trim();
    });
  }
  const expiryInput = document.getElementById("card-expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (val.length >= 2) val = val.slice(0, 2) + " / " + val.slice(2);
      e.target.value = val;
    });
  }
}

// =============================================
// DIALOG & DRAWER EVENT LISTENERS
// =============================================
function initEventListeners() {
  // Checkout
  document.getElementById("checkout-btn")?.addEventListener("click", openCheckout);
  document.getElementById("checkout-close")?.addEventListener("click", closeCheckout);
  document.getElementById("checkout-overlay")?.addEventListener("click", closeCheckout);

  // Promo Code
  document.getElementById("promo-apply-btn")?.addEventListener("click", applyPromoCode);

  // Cart
  document.getElementById("cart-btn").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("continue-shopping-btn")?.addEventListener("click", closeCart);

  // Modal
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", closeModal);

  // Escape key close handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
      document.getElementById("chatbot-wrapper").classList.remove("open");
      document.getElementById("login-overlay").classList.remove("open");
      document.getElementById("login-modal").classList.remove("open");
      document.getElementById("checkout-overlay").classList.remove("open");
      document.getElementById("checkout-modal").classList.remove("open");
      document.getElementById("wishlist-sidebar").classList.remove("open");
      document.getElementById("wishlist-overlay").classList.remove("open");
      document.body.classList.remove("locked");
    }
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
