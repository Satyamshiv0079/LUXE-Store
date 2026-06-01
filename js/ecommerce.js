/* =============================================
   LUXE — js/ecommerce.js
   State, Catalog, Cart, Wishlist, Currency, Reviews, GPS, Inventory, Cross-sell, Gift Wrapping, Checkout
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
    model3d: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF/DamagedHelmet.gltf"
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
// STYLING recommendations ("Complete the Look")
// =============================================
const LOOK_RECOMMENDATIONS = {
  1: [3, 7], // Venezia Cashmere Coat -> Milano Leather Bag, Sorrento Silk Scarf
  2: [7, 8], // Avorio Silk Dress -> Sorrento Silk Scarf, Palazzo Wide Trousers
  3: [1, 7], // Milano Leather Bag -> Venezia Cashmere Coat, Sorrento Silk Scarf
  4: [6, 7], // Atelier Wool Blazer -> Lux Oxford Shirt, Sorrento Silk Scarf
  5: [3, 8], // Celeste Silk Blouse -> Milano Leather Bag, Palazzo Wide Trousers
  6: [4, 3], // Lux Oxford Shirt -> Atelier Wool Blazer, Milano Leather Bag
  7: [1, 3], // Sorrento Silk Scarf -> Venezia Cashmere Coat, Milano Leather Bag
  8: [5, 3]  // Palazzo Wide Trousers -> Celeste Silk Blouse, Milano Leather Bag
};

// =============================================
// DYNAMIC SIZE-SPECIFIC STOCK INVENTORY
// =============================================
const PRODUCT_INVENTORY = {
  1: { XS: 2, S: 1, M: 8, L: 4, XL: 0 },
  2: { XS: 0, S: 2, M: 0, L: 4 },
  3: { "One Size": 3 },
  4: { S: 0, M: 0, L: 5, XL: 2, XXL: 0 },
  5: { XS: 1, S: 0, M: 6, L: 0 },
  6: { S: 5, M: 8, L: 0, XL: 3 },
  7: { "One Size": 1 },
  8: { XS: 2, S: 1, M: 0, L: 0, XL: 4 }
};

// =============================================
// GLOBAL CURRENCY SYSTEM
// =============================================
let currentCurrency = localStorage.getItem("luxe_currency") || "USD";
const CURRENCY_RATES = {
  USD: { symbol: "$", rate: 1.0 },
  EUR: { symbol: "€", rate: 0.92 },
  INR: { symbol: "₹", rate: 83.5 },
  GBP: { symbol: "£", rate: 0.79 }
};

function formatPrice(amount) {
  const curr = CURRENCY_RATES[currentCurrency];
  const converted = amount * curr.rate;
  return curr.symbol + converted.toLocaleString("en-US", { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
}

function initCurrencySwitcher() {
  const select = document.getElementById("currency-select");
  if (!select) return;

  // Load saved state
  select.value = currentCurrency;

  select.addEventListener("change", () => {
    currentCurrency = select.value;
    localStorage.setItem("luxe_currency", currentCurrency);
    
    // Re-render visual listings
    renderCatalog();
    updateCartUI();
    updateWishlistUI();
    
    // Re-populate details modal if open
    if (currentModal) {
      document.getElementById("modal-price").textContent = formatPrice(currentModal.price);
      renderCompleteLookUI(currentModal.id);
    }
    
    // Refresh checkout display if open
    if (document.getElementById("checkout-modal").classList.contains("open")) {
      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      document.getElementById("co-subtotal").textContent = formatPrice(subtotal);
      
      const giftDisplay = document.getElementById("gift-price-display");
      if (giftDisplay) giftDisplay.textContent = formatPrice(15);
      
      const giftSummaryRow = document.getElementById("gift-summary-row");
      if (giftSummaryRow) {
        document.getElementById("co-gift-price").textContent = "+" + formatPrice(15);
      }
      
      recalculateCheckoutTotals();
    }
    
    showToast(`Currency switched to ${currentCurrency}`);
  });
}

function renderCatalog() {
  const track = document.getElementById("h-scroll-track");
  if (track) {
    track.innerHTML = "";
    PRODUCTS.forEach((p) => {
      const card = createProductCard(p);
      track.appendChild(card);
    });
  }
}

// =============================================
// PRODUCT REVIEWS STATE & MOCKS
// =============================================
let localReviews = JSON.parse(localStorage.getItem("luxe_reviews") || "{}");
let reviewRatingInput = 5;

const MOCK_REVIEWS = {
  1: [
    { username: "Matteo V.", rating: 5, comment: "Magnificent quality! The cashmere is exceptionally soft and warm. Perfectly tailored.", date: "May 12, 2026" },
    { username: "Sofia L.", rating: 5, comment: "An exquisite luxury masterpiece. The drape is effortless. Highly recommend Venezia cashmere.", date: "May 28, 2026" }
  ],
  2: [
    { username: "Clara M.", rating: 4, comment: "Beautiful silk crepe, moves gracefully. Fit is perfect, but dry clean only makes it high maintenance.", date: "May 15, 2026" }
  ],
  3: [
    { username: "Isabella R.", rating: 5, comment: "Structured perfection! The full-grain calfskin leather smells superb and hardware shines cleanly.", date: "May 24, 2026" }
  ],
  4: [
    { username: "Lucas A.", rating: 5, comment: "Absolutely impeccable wool tailoring. Single-breasted fits snugly and stays professional.", date: "May 19, 2026" }
  ],
  5: [
    { username: "Elena K.", rating: 5, comment: "Delightful pearl lustre silk. Concealed back placket is a touch of pure design elegance.", date: "May 29, 2026" }
  ],
  6: [
    { username: "Alexander S.", rating: 4, comment: "Egyptian cotton stays exceptionally crisp. High-quality single-needle stitching.", date: "May 20, 2026" }
  ],
  7: [
    { username: "Olivia D.", rating: 5, comment: "Beautiful archival printed silk scarf. Hand-rolled hems are flawlessly premium.", date: "May 26, 2026" }
  ],
  8: [
    { username: "Giulia B.", rating: 5, comment: "Statement Palazzo wide leg drape, feels amazing and high-waisted wool-silk blend fits snugly.", date: "May 18, 2026" }
  ]
};

function getProductReviews(productId) {
  const mock = MOCK_REVIEWS[productId] || [];
  const user = localReviews[productId] || [];
  return [...mock, ...user];
}

function initModalTabs() {
  const descBtn = document.getElementById("tab-desc-btn");
  const reviewsBtn = document.getElementById("tab-reviews-btn");
  const descContent = document.getElementById("modal-tab-desc");
  const reviewsContent = document.getElementById("modal-tab-reviews");

  if (!descBtn || !reviewsBtn) return;

  descBtn.addEventListener("click", () => {
    descBtn.classList.add("active");
    descBtn.style.color = "var(--white)";
    descBtn.style.borderBottom = "2px solid var(--gold)";
    reviewsBtn.classList.remove("active");
    reviewsBtn.style.color = "var(--muted)";
    reviewsBtn.style.borderBottom = "none";

    descContent.style.display = "block";
    reviewsContent.style.display = "none";
  });

  reviewsBtn.addEventListener("click", () => {
    reviewsBtn.classList.add("active");
    reviewsBtn.style.color = "var(--white)";
    reviewsBtn.style.borderBottom = "2px solid var(--gold)";
    descBtn.classList.remove("active");
    descBtn.style.color = "var(--muted)";
    descBtn.style.borderBottom = "none";

    descContent.style.display = "none";
    reviewsContent.style.display = "block";
  });
}

function initStarsInput() {
  const stars = document.querySelectorAll("#review-stars-input i");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.rating, 10);
      reviewRatingInput = rating;
      updateStarsInputUI(rating);
    });
  });
}

function updateStarsInputUI(rating) {
  const stars = document.querySelectorAll("#review-stars-input i");
  stars.forEach((star) => {
    const starVal = parseInt(star.dataset.rating, 10);
    if (starVal <= rating) {
      star.className = "fa-solid fa-star";
    } else {
      star.className = "fa-regular fa-star";
    }
  });
}

function renderReviewsUI(productId) {
  const container = document.getElementById("reviews-list-container");
  if (!container) return;

  const reviews = getProductReviews(productId);
  document.getElementById("modal-reviews-count").textContent = reviews.length;
  document.getElementById("reviews-total-count").textContent = reviews.length;

  const avg = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";
  
  document.getElementById("avg-rating-value").textContent = avg;
  document.getElementById("avg-stars-list").innerHTML = getStarsHtml(parseFloat(avg));

  if (reviews.length === 0) {
    container.innerHTML = `<p style="font-size:0.78rem; color:var(--muted); font-style:italic;">No reviews yet. Be the first to review!</p>`;
  } else {
    container.innerHTML = reviews.map((r) => `
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:0.8rem; display:flex; flex-direction:column; gap:0.4rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-family:var(--font-ui); font-size:0.72rem;">
          <strong style="color:var(--white);">${r.username}</strong>
          <span style="color:var(--muted); font-size:0.65rem;">${r.date}</span>
        </div>
        <div style="display:flex; gap:2px; color:var(--gold); font-size:0.65rem;">
          ${getStarsHtml(r.rating)}
        </div>
        <p style="font-size:0.78rem; color:var(--text); line-height:1.5;">${r.comment}</p>
      </div>
    `).join("");
  }
}

function handleReviewSubmission() {
  const nameInput = document.getElementById("review-username");
  const commentInput = document.getElementById("review-comment");
  const submitBtn = document.getElementById("submit-review-btn");

  if (!submitBtn || !nameInput || !commentInput || !currentModal) return;

  submitBtn.addEventListener("click", () => {
    const username = nameInput.value.trim();
    const comment = commentInput.value.trim();

    if (!username || !comment) {
      showToast("Please enter name and comments");
      return;
    }

    const newReview = {
      username,
      rating: reviewRatingInput,
      comment,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };

    if (!localReviews[currentModal.id]) {
      localReviews[currentModal.id] = [];
    }
    localReviews[currentModal.id].push(newReview);
    localStorage.setItem("luxe_reviews", JSON.stringify(localReviews));

    nameInput.value = "";
    commentInput.value = "";
    reviewRatingInput = 5;
    updateStarsInputUI(5);

    renderReviewsUI(currentModal.id);
    showToast("Review submitted successfully!");
  });
}

// =============================================
// STOCK INVENTORY INDICATORS
// =============================================
function updateStockIndicator(productId, size) {
  const dot = document.getElementById("modal-stock-dot");
  const text = document.getElementById("modal-stock-text");
  const addCartBtn = document.getElementById("modal-add-cart");

  if (!dot || !text || !addCartBtn) return;

  const invMap = PRODUCT_INVENTORY[productId];
  if (!invMap) return;

  const stock = invMap[size] !== undefined ? invMap[size] : 5;

  if (stock === 0) {
    dot.style.background = "#c04040";
    text.textContent = "Out of stock in this size — Restocking soon";
    addCartBtn.disabled = true;
    addCartBtn.style.opacity = "0.5";
    addCartBtn.textContent = "Out of Stock";
  } else if (stock <= 2) {
    dot.style.background = "#c08040";
    text.textContent = `Low stock — Only ${stock} left in atelier`;
    addCartBtn.disabled = false;
    addCartBtn.style.opacity = "1";
    addCartBtn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> Add to Cart`;
  } else {
    dot.style.background = "#40c040";
    text.textContent = "In stock — Available to ship global";
    addCartBtn.disabled = false;
    addCartBtn.style.opacity = "1";
    addCartBtn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> Add to Cart`;
  }
}

// =============================================
// CROSS-SELL ("Complete the Look") UI
// =============================================
function renderCompleteLookUI(productId) {
  const container = document.getElementById("complete-look-products");
  if (!container) return;

  const lookIds = LOOK_RECOMMENDATIONS[productId] || [];
  const lookProducts = PRODUCTS.filter((p) => lookIds.includes(p.id));

  container.innerHTML = lookProducts.map((p) => `
    <div onclick="openModal(${p.id})" style="flex:1; display:flex; gap:0.6rem; align-items:center; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:0.5rem; cursor:none; transition:border-color 0.3s;" onmouseover="this.style.borderColor='var(--gold-dark)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="width:36px; height:48px; border-radius:2px; background-image:url('${p.img}'); background-size:cover; background-position:center; flex-shrink:0;"></div>
      <div style="min-width:0; flex:1;">
        <div style="font-family:var(--font-display); font-size:0.75rem; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
        <div style="font-family:var(--font-ui); font-size:0.65rem; color:var(--gold); font-weight:600;">${formatPrice(p.price)}</div>
      </div>
    </div>
  `).join("");
}

function handleLookBundleAddition() {
  const bundleBtn = document.getElementById("add-look-bundle-btn");
  if (!bundleBtn) return;

  bundleBtn.addEventListener("click", () => {
    if (!currentModal) return;

    const lookIds = LOOK_RECOMMENDATIONS[currentModal.id] || [];
    
    // Add active modal product
    addToCart(currentModal.id);

    // Add both curated recommended accessories
    lookIds.forEach((id) => {
      addToCart(id);
    });

    closeModal();
    openCart();
    showToast("Styled look added to cart with custom 10% bundle discount!");
  });
}

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
  document.getElementById("cart-subtotal").textContent = formatPrice(total);

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
          <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
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
    ? `<span class="product-price-old">${formatPrice(product.oldPrice)}</span>`
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
        <span class="product-price">${formatPrice(product.price)}</span>
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
  document.getElementById("modal-price").textContent = formatPrice(product.price);
  
  // Tab resets
  const descBtn = document.getElementById("tab-desc-btn");
  if (descBtn) descBtn.click(); // Reset tab to Description

  document.getElementById("modal-description").textContent = product.description;
  document.getElementById("modal-img").style.backgroundImage = `url('${product.img}')`;
  document.getElementById("modal-img").style.backgroundSize = "cover";
  document.getElementById("modal-img").style.backgroundPosition = "center";
  
  const toggleWrap = document.getElementById("modal-3d-toggle-wrap");
  const viewer3d = document.getElementById("modal-3d-viewer");
  const btn3d = document.getElementById("modal-3d-btn");
  const imgMain = document.getElementById("modal-img");
  
  if (product.model3d) {
      toggleWrap.style.display = "block";
      viewer3d.src = product.model3d;
      btn3d.onclick = () => {
          if (viewer3d.style.display === "none") {
              imgMain.style.display = "none";
              viewer3d.style.display = "block";
              btn3d.innerHTML = 'View Image <i class="fa-regular fa-image"></i>';
          } else {
              viewer3d.style.display = "none";
              imgMain.style.display = "block";
              btn3d.innerHTML = 'View in 3D <i class="fa-solid fa-cube"></i>';
          }
      };
      viewer3d.style.display = "none";
      imgMain.style.display = "block";
      btn3d.innerHTML = 'View in 3D <i class="fa-solid fa-cube"></i>';
  } else {
      toggleWrap.style.display = "none";
      viewer3d.style.display = "none";
      imgMain.style.display = "block";
  }

  const sizesContainer = document.getElementById("modal-sizes");
  sizesContainer.innerHTML = product.sizes
    .map(
      (s, i) =>
        `<button class="size-btn ${i === 1 ? "selected" : ""}" onclick="selectSize(this, '${s}')">${s}</button>`
    )
    .join("");

  // Update Dynamic Stock Status based on default selected size
  const defaultSize = product.sizes[1] || product.sizes[0] || "M";
  updateStockIndicator(product.id, defaultSize);

  // Render Reviews DB
  renderReviewsUI(product.id);

  // Render Curation Look
  renderCompleteLookUI(product.id);

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

  // Dynamically update stock indicator when size changes!
  if (currentModal) {
    updateStockIndicator(currentModal.id, size);
  }
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

async function toggleWishlist(productId) {
  const idx = wishlist.findIndex((id) => id === productId);
  if (idx !== -1) {
    wishlist.splice(idx, 1);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(productId);
    showToast("❤️ Saved to wishlist");
  }
  localStorage.setItem("luxe_wishlist", JSON.stringify(wishlist));
  updateWishlistUI();

  if (currentUser) {
      try {
          const token = localStorage.getItem("luxe_auth_token") || "";
          await fetch(`http://localhost:8000/auth/wishlist?email=${encodeURIComponent(currentUser.email)}`, {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": token.startsWith("Bearer") ? token : `Bearer ${token}` 
              },
              body: JSON.stringify({ wishlist })
          });
      } catch (e) {
          console.error("Failed to sync wishlist", e);
      }
  }
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
          <div class="wishlist-item-price">${formatPrice(p.price)}</div>
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
  const vipOverlay = document.getElementById("vip-overlay");
  const vipSidebar = document.getElementById("vip-sidebar");

  if(currentUser && document.getElementById("vip-user-name")) {
      document.getElementById("vip-user-name").textContent = currentUser.name;
  }

  loginBtn.addEventListener("click", () => {
    if (currentUser) {
      vipOverlay.classList.add("open");
      vipSidebar.classList.add("open");
      document.body.classList.add("locked");
      loadVIPOrders();
      return;
    }
    loginOverlay.classList.add("open");
    loginModal.classList.add("open");
    document.body.classList.add("locked");
  });

  document.getElementById("vip-close").addEventListener("click", () => {
    vipOverlay.classList.remove("open");
    vipSidebar.classList.remove("open");
    document.body.classList.remove("locked");
  });
  
  document.getElementById("vip-logout-btn").addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("luxe_user");
    localStorage.removeItem("luxe_auth_token");
    updateLoginUI();
    vipOverlay.classList.remove("open");
    vipSidebar.classList.remove("open");
    document.body.classList.remove("locked");
    showToast("Signed out successfully");
  });

  const closeLogin = () => {
    loginOverlay.classList.remove("open");
    loginModal.classList.remove("open");
    document.body.classList.remove("locked");
  };
  loginClose.addEventListener("click", closeLogin);
  loginOverlay.addEventListener("click", closeLogin);

  document.querySelectorAll(".login-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".login-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.tab;
      document.getElementById("signin-form").classList.toggle("hidden", mode !== "signin");
      document.getElementById("signup-form").classList.toggle("hidden", mode !== "signup");
    });
  });

  document.getElementById("signin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;
    
    try {
        const res = await fetch("http://localhost:8000/auth/login", {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (data.success) {
            currentUser = { name: data.user.first_name + " " + data.user.last_name, email: data.user.email };
            localStorage.setItem("luxe_user", JSON.stringify(currentUser));
            localStorage.setItem("luxe_auth_token", data.token);
            if(document.getElementById("vip-user-name")) document.getElementById("vip-user-name").textContent = currentUser.name;
            updateLoginUI();
            closeLogin();
            showToast(`Welcome back, ${data.user.first_name}! ✨`);
            
            // Fetch wishlist
            try {
                const wRes = await fetch(`http://localhost:8000/auth/wishlist?email=${encodeURIComponent(currentUser.email)}`, {
                    headers: { "Authorization": data.token.startsWith("Bearer") ? data.token : `Bearer ${data.token}` }
                });
                const wData = await wRes.json();
                if (wData.success && wData.wishlist.length > 0) {
                    wishlist = [...new Set([...wishlist, ...wData.wishlist])];
                    localStorage.setItem("luxe_wishlist", JSON.stringify(wishlist));
                    updateWishlistUI();
                }
            } catch (e) { console.error("Failed to fetch wishlist", e); }
        } else {
            showToast(data.error || "Login failed");
        }
    } catch(e) {
        console.error(e);
        showToast("Error connecting to server");
    }
  });

  document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fname = document.getElementById("signup-fname").value;
    const lname = document.getElementById("signup-lname").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    
    try {
        const res = await fetch("http://localhost:8000/auth/register", {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password, first_name: fname, last_name: lname})
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Registration successful! Please sign in.`);
            document.getElementById("tab-signin").click();
            document.getElementById("signin-email").value = email;
        } else {
            showToast(data.error || "Registration failed");
        }
    } catch(e) {
        console.error(e);
        showToast("Error connecting to server");
    }
  });
}

async function loadVIPOrders() {
    if (!currentUser) return;
    const list = document.getElementById("vip-orders-list");
    list.innerHTML = `<p style="color:var(--muted); font-size:0.8rem;">Loading...</p>`;
    
    try {
        const token = localStorage.getItem("luxe_auth_token") || "";
        const res = await fetch(`http://localhost:8000/auth/orders?email=${encodeURIComponent(currentUser.email)}`, {
            headers: { "Authorization": token.startsWith("Bearer") ? token : `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.orders.length > 0) {
            list.innerHTML = data.orders.map(o => `
                <div style="background:var(--bg-3); border:1px solid var(--border); border-radius:var(--radius); padding:1rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <strong style="color:var(--gold); font-size:0.8rem;">${o.order_id}</strong>
                        <span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">${o.status}</span>
                    </div>
                    <div style="font-size:0.75rem; color:var(--muted);">ETA: ${o.eta}</div>
                    ${o.details && o.details.subtotal ? `<div style="font-size:0.75rem; color:var(--white); margin-top:0.4rem;">Total: ${formatPrice(o.details.subtotal)}</div>` : ''}
                    <div style="margin-top:0.8rem;">
                        <a href="http://localhost:8000/download/invoice/${o.order_id}" target="_blank" style="font-size:0.7rem; color:var(--gold); border: 1px solid var(--gold); padding: 0.3rem 0.6rem; border-radius: 5px; text-decoration: none;">Download PDF Invoice <i class="fa-solid fa-download"></i></a>
                    </div>
                </div>
            `).join("");
        } else {
            list.innerHTML = `<p style="color:var(--muted); font-size:0.8rem;">No recent orders.</p>`;
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = `<p style="color:var(--gold); font-size:0.8rem;">Failed to load orders.</p>`;
    }
    
    // Toggle Admin Button
    const adminBtn = document.getElementById("admin-portal-btn");
    if (adminBtn) {
        if (currentUser.email.toLowerCase().includes("admin")) {
            adminBtn.style.display = "inline-block";
        } else {
            adminBtn.style.display = "none";
        }
    }
}

function initAdmin() {
    const adminBtn = document.getElementById("admin-portal-btn");
    const adminOverlay = document.getElementById("admin-overlay");
    const adminModal = document.getElementById("admin-modal");
    
    if (adminBtn) {
        adminBtn.addEventListener("click", () => {
            document.getElementById("vip-overlay").classList.remove("open");
            document.getElementById("vip-sidebar").classList.remove("open");
            adminOverlay.classList.add("open");
            adminModal.classList.add("open");
            loadAdminData();
        });
    }
    
    const closeAdmin = () => {
        if(adminOverlay) adminOverlay.classList.remove("open");
        if(adminModal) adminModal.classList.remove("open");
        document.body.classList.remove("locked");
    };
    
    const adminCloseBtn = document.getElementById("admin-close");
    if(adminCloseBtn) adminCloseBtn.addEventListener("click", closeAdmin);
    if(adminOverlay) adminOverlay.addEventListener("click", closeAdmin);
}

async function loadAdminData() {
    const token = localStorage.getItem("luxe_auth_token") || "";
    const headers = { "Authorization": token.startsWith("Bearer") ? token : `Bearer ${token}` };
    
    // Load Orders
    try {
        const res = await fetch("http://localhost:8000/admin/orders", { headers });
        const data = await res.json();
        const oList = document.getElementById("admin-orders-list");
        if(data.success) {
            oList.innerHTML = data.orders.map(o => `
                <div style="padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-2);">
                    <div style="color:var(--white);"><strong>${o.order_id}</strong> - ${o.status}</div>
                    <div style="font-size:0.7rem;">ETA: ${o.eta}</div>
                    <div style="font-size:0.7rem; color:var(--gold);">Email: ${o.user_email || 'Guest'}</div>
                </div>
            `).join("");
        } else {
            oList.innerHTML = "Failed to load.";
        }
    } catch(e) { console.error(e); }
    
    // Load Users
    try {
        const res = await fetch("http://localhost:8000/admin/users", { headers });
        const data = await res.json();
        const uList = document.getElementById("admin-users-list");
        if(data.success) {
            uList.innerHTML = data.users.map(u => `
                <div style="padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-2);">
                    <div style="color:var(--white);"><strong>${u.first_name} ${u.last_name}</strong> ${u.is_admin ? '<span style="color:var(--gold);">(Admin)</span>' : ''}</div>
                    <div style="font-size:0.7rem;">${u.email}</div>
                </div>
            `).join("");
        } else {
            uList.innerHTML = "Failed to load.";
        }
    } catch(e) { console.error(e); }
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
  const slider = document.getElementById("search-price-slider");
  const sliderVal = document.getElementById("search-price-val");
  const catCheckboxes = document.querySelectorAll(".search-cat-filter");

  const filterResults = () => {
    const q = input.value.toLowerCase().trim();
    const maxPrice = parseInt(slider.value, 10);
    const activeCats = Array.from(catCheckboxes).filter(c => c.checked).map(c => c.value);
    
    // Calculate un-converted base price max limit
    const curr = CURRENCY_RATES[currentCurrency];
    const convertedMax = formatPrice(maxPrice / curr.rate).replace(/[^0-9]/g, '');
    sliderVal.textContent = maxPrice;

    const matches = PRODUCTS.filter((p) => {
        const pConvertedPrice = p.price * curr.rate;
        const textMatch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        const priceMatch = pConvertedPrice <= maxPrice;
        const catMatch = activeCats.includes(p.category.toLowerCase());
        
        // Show everything matching categories/price if query is empty, else filter by text too
        return (q ? textMatch : true) && priceMatch && catMatch;
    });

    if (!matches.length) {
        results.innerHTML = `<p style="color:var(--muted); font-size:0.85rem; grid-column:span 3;">No results found.</p>`;
        return;
    }

    results.innerHTML = matches.map((p) => `
      <div class="search-result-card" onclick="openModal(${p.id}); document.getElementById('search-overlay').classList.remove('open');">
        <div class="search-result-img" style="background-image: url('${p.img}'); background-size: cover; background-position: center;"></div>
        <div class="search-result-info">
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-price">${formatPrice(p.price)}</div>
        </div>
      </div>
    `).join("");
      
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(results.children, 
            {opacity: 0, y: 15}, 
            {opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out"}
        );
    }
  };

  document.getElementById("search-btn").addEventListener("click", () => {
    overlay.classList.add("open");
    setTimeout(() => {
        input.focus();
        filterResults(); // Initial render of all products
    }, 400);
  });
  document.getElementById("search-close").addEventListener("click", () => {
    overlay.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.remove("open");
  });

  input.addEventListener("input", filterResults);
  if(slider) slider.addEventListener("input", filterResults);
  if(catCheckboxes) catCheckboxes.forEach(c => c.addEventListener("change", filterResults));
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
let activeDiscount = 0;
let activePromoCode = "";

// Gift Wrapping configurations
let addGiftPackaging = false;
let giftRibbonColor = "Archival Gold";
let giftMessageText = "";
const GIFT_PACKAGING_USD = 15;

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

window.placeOrder = async function () {
  const spinnerOverlay = document.getElementById("stripe-spinner-overlay");
  if (spinnerOverlay) {
    spinnerOverlay.style.display = "flex";
  }

  try {
    // Phase 4.2: Emulated Stripe Integration
    // Simulate creating a PaymentIntent on the backend
    const intentRes = await fetch("http://localhost:8000/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotal: cart.reduce((sum, i) => sum + i.price * i.qty, 0) })
    });
    const intentData = await intentRes.json();
    console.log("Mock Stripe Client Secret:", intentData.client_secret);
    
    // Simulate 3D Secure verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (spinnerOverlay) spinnerOverlay.style.display = "none";
    showToast("Stripe Payment Approved! (Mock)");

    const orderNum = "LUXE-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    document.getElementById("success-order-num").textContent = `Order #${orderNum}`;
    
    // Set up success gift wrapping diagnostics if active
    const successNote = document.getElementById("success-gift-note");
    if (successNote) {
      if (addGiftPackaging) {
        successNote.innerHTML = `<i class="fa-solid fa-gift"></i> Signature luxury packaging active with **${giftRibbonColor}** ribbon.<br/>` +
                                (giftMessageText ? `<em>" ${giftMessageText} "</em>` : "No handwritten message added.");
        successNote.style.display = "block";
      } else {
        successNote.style.display = "none";
      }
    }

    // Full-Stack AJAX Sync
    const items = cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, size: i.size }));
    const details = {
      items: items,
      currency: currentCurrency,
      addGiftPackaging: addGiftPackaging,
      giftRibbonColor: addGiftPackaging ? giftRibbonColor : null,
      giftMessageText: addGiftPackaging ? giftMessageText : null,
      subtotal: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      discount: activeDiscount
    };

    const tokenInput = document.getElementById("novamind-token-input");
    const endpointInput = document.getElementById("novamind-endpoint-input");
    let apiUrl = "http://localhost:8000/orders/new";
    let token = "";
    if (endpointInput && endpointInput.value) {
       try {
         let urlObj = new URL(endpointInput.value);
         apiUrl = urlObj.origin + "/orders/new";
       } catch(e) {}
    }
    if (tokenInput && tokenInput.value) {
       token = tokenInput.value;
    }
    
    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": token.startsWith('Bearer') ? token : `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          order_id: orderNum,
          status: "Processing",
          eta: "3-5 business days",
          details: details
        })
      });
    } catch (e) {
      console.warn("Failed to sync order to local backend", e);
    }

    goCheckoutStep(4);
    // Clear cart after order
    setTimeout(() => {
      cart = [];
      updateCartUI();
    }, 500);
  } catch (error) {
    if (spinnerOverlay) spinnerOverlay.style.display = "none";
    showToast("Payment Failed.");
  }
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

function openCheckout() {
  // Reset promo state on checkout open
  activeDiscount = 0;
  activePromoCode = "";
  const promoInput = document.getElementById("promo-input");
  if (promoInput) promoInput.value = "";
  const discountRow = document.getElementById("promo-discount-row");
  if (discountRow) discountRow.style.display = "none";

  // Reset gift packaging state
  addGiftPackaging = false;
  giftRibbonColor = "Archival Gold";
  giftMessageText = "";
  
  const giftCheckbox = document.getElementById("gift-packaging-checkbox");
  if (giftCheckbox) giftCheckbox.checked = false;
  const giftDetailsPanel = document.getElementById("gift-details-panel");
  if (giftDetailsPanel) giftDetailsPanel.style.display = "none";
  const giftSummaryRow = document.getElementById("gift-summary-row");
  if (giftSummaryRow) giftSummaryRow.style.display = "none";

  const ribbonSelect = document.getElementById("gift-ribbon-select");
  if (ribbonSelect) ribbonSelect.value = "Archival Gold";
  const messageInput = document.getElementById("gift-message-input");
  if (messageInput) messageInput.value = "";

  // Render converted gift wrap price indicator
  const giftDisplay = document.getElementById("gift-price-display");
  if (giftDisplay) giftDisplay.textContent = formatPrice(GIFT_PACKAGING_USD);

  // Populate checkout items
  const container = document.getElementById("checkout-order-items");
  container.innerHTML = cart.map((item) => `
    <div class="checkout-order-item">
      <div class="checkout-item-img" style="background-image:url('${item.img}');background-size:cover;background-position:center;"></div>
      <div class="checkout-item-details">
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-meta">Size: ${item.size} · Qty: ${item.qty}</div>
      </div>
      <div class="checkout-item-price">${formatPrice(item.price * item.qty)}</div>
    </div>`).join("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("co-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("co-total").textContent = formatPrice(subtotal);

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

  if (discountRow && discountCodeSpan && discountValueSpan) {
    discountCodeSpan.textContent = activePromoCode;
    discountValueSpan.textContent = "-" + formatPrice(activeDiscount);
    discountRow.style.display = "flex";

    recalculateCheckoutTotals();
    showToast(`Code ${activePromoCode} applied! Saved ${formatPrice(activeDiscount)}`);
  }
}

function recalculateCheckoutTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const giftCost = addGiftPackaging ? GIFT_PACKAGING_USD : 0;
  
  const finalTotal = subtotal + giftCost - activeDiscount;
  document.getElementById("co-total").textContent = formatPrice(finalTotal);
}

function initGiftWrappingEvents() {
  const checkbox = document.getElementById("gift-packaging-checkbox");
  const detailsPanel = document.getElementById("gift-details-panel");
  const summaryRow = document.getElementById("gift-summary-row");
  const ribbonSelect = document.getElementById("gift-ribbon-select");
  const messageInput = document.getElementById("gift-message-input");

  if (!checkbox || !detailsPanel || !summaryRow) return;

  checkbox.addEventListener("change", () => {
    addGiftPackaging = checkbox.checked;
    
    // Toggle details panels
    detailsPanel.style.display = addGiftPackaging ? "flex" : "none";
    summaryRow.style.display = addGiftPackaging ? "flex" : "none";
    
    // Update summary price
    document.getElementById("co-gift-price").textContent = "+" + formatPrice(GIFT_PACKAGING_USD);

    recalculateCheckoutTotals();
    showToast(addGiftPackaging ? "Added luxury gift packaging!" : "Removed gift packaging");
  });

  if (ribbonSelect) {
    ribbonSelect.addEventListener("change", () => {
      giftRibbonColor = ribbonSelect.value;
    });
  }

  if (messageInput) {
    messageInput.addEventListener("input", () => {
      giftMessageText = messageInput.value.trim();
    });
  }
}

// =============================================
// MOCK GPS LOCATION AUTO-DETECT
// =============================================
function initGpsAutofill() {
  const gpsBtn = document.getElementById("gps-autofill-btn");
  const gpsIcon = document.getElementById("gps-icon");
  const btnText = document.getElementById("gps-btn-text");

  if (!gpsBtn || !gpsIcon || !btnText) return;

  gpsBtn.addEventListener("click", () => {
    gpsBtn.style.pointerEvents = "none";
    gpsBtn.style.opacity = "0.7";
    btnText.textContent = "Detecting Geolocation...";
    gpsIcon.className = "fa-solid fa-location-crosshairs fa-spin";

    setTimeout(() => {
      const addr1 = document.getElementById("del-addr1");
      const addr2 = document.getElementById("del-addr2");
      const city = document.getElementById("del-city");
      const pin = document.getElementById("del-pin");
      const phone = document.getElementById("del-phone");

      if (addr1) addr1.value = "74/A Milan Corso Suite";
      if (addr2) addr2.value = "Atelier Fashion District";
      if (city) city.value = "Milan";
      if (pin) pin.value = "20121";
      if (phone) phone.value = "+39 02 8127 9400";

      // Reset states
      gpsBtn.style.pointerEvents = "all";
      gpsBtn.style.opacity = "1";
      btnText.textContent = "Auto-Detect Current Location";
      gpsIcon.className = "fa-solid fa-location-crosshairs";

      showToast("Detected Location: Milan, Italy 🇮🇹");
    }, 1200);
  });
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
  // Currency Switcher
  initCurrencySwitcher();

  // Modal Review Tabs & Review Rating Input
  initModalTabs();
  initStarsInput();
  handleReviewSubmission();

  // Complete the Look Bundle trigger
  handleLookBundleAddition();

  // Gift Wrapping Event Listeners Setup
  initGiftWrappingEvents();

  // GPS Auto-detect Setup
  initGpsAutofill();

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
      const adminOverlay = document.getElementById("admin-overlay");
      const adminModal = document.getElementById("admin-modal");
      if(adminOverlay) adminOverlay.classList.remove("open");
      if(adminModal) adminModal.classList.remove("open");
      document.body.classList.remove("locked");
    }
  });

  // Init Admin
  if (typeof initAdmin === "function") initAdmin();

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

  // Phase 4.4: Dynamic AI Translations (i18n)
  initTranslations();
}

function initTranslations() {
  const langSelect = document.getElementById("lang-select");
  if (!langSelect) return;

  langSelect.addEventListener("change", async () => {
    const targetLang = langSelect.value;
    if (targetLang === "EN") {
      location.reload(); // Simple reset for English
      return;
    }

    const elements = document.querySelectorAll("[data-i18n]");
    if (elements.length === 0) return;

    showToast(`Translating to ${targetLang}...`);
    langSelect.disabled = true;

    const textsToTranslate = Array.from(elements).map(el => el.textContent.trim());

    try {
      const res = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: textsToTranslate, target: targetLang })
      });
      const data = await res.json();
      
      if (data.success && data.translated_texts) {
        elements.forEach((el, index) => {
          if (data.translated_texts[index]) {
            el.textContent = data.translated_texts[index];
          }
        });
        showToast("Translation complete!");
      } else {
        showToast("Translation failed.");
      }
    } catch (e) {
      console.error(e);
      showToast("Translation error.");
    } finally {
      langSelect.disabled = false;
    }
  });
}
