/* =============================================
   LUXE — js/animations.js
   GSAP Animations, Scroll Effects, Custom Cursor, Loader
   ============================================= */

// Register GSAP plugins
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// =============================================
// LOADER
// =============================================
function initLoader() {
  const progress = document.getElementById("loader-progress");
  const count = document.getElementById("loader-count");
  const loader = document.getElementById("loader");
  let pct = 0;

  const interval = setInterval(() => {
    pct += Math.random() * 12 + 3;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      count.textContent = "100%";
      progress.style.width = "100%";
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            loader.style.display = "none";
            document.body.classList.remove("loading");
            initHeroAnims();
          },
        });
      }, 500);
    }
    count.textContent = Math.floor(pct) + "%";
    progress.style.width = pct + "%";
  }, 80);
}

// =============================================
// CURSOR
// =============================================
function initCursor() {
  const cursor = document.getElementById("cursor");
  const follower = document.getElementById("cursor-follower");
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    gsap.set(cursor, { x: mx, y: my });
  });

  function followMouse() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    gsap.set(follower, { x: fx, y: fy });
    requestAnimationFrame(followMouse);
  }
  followMouse();
}

// =============================================
// NAV SCROLL
// =============================================
function initNav() {
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });
}

// =============================================
// HERO ANIMATIONS
// =============================================
function initHeroAnims() {
  // Title lines
  gsap.to(".title-line", {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.15,
    delay: 0.1,
  });

  // Eyebrow
  gsap.to(".hero-eyebrow", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: 0.05,
  });

  // Subtitle & actions
  gsap.to(".hero-subtitle", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: 0.5,
  });
  gsap.to(".hero-actions", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: 0.65,
  });

  // Parallax on scroll
  gsap.to(".hero-orb-1", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.5 },
  });
  gsap.to(".hero-orb-2", {
    yPercent: -20,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 2 },
  });

  initScrollTriggers();
  initHorizontalScroll();
  initCounters();
  initMagneticButtons();
  initLenis();
}

// =============================================
// SCROLL TRIGGERS
// =============================================
function initScrollTriggers() {
  // Reveal generic elements
  const reveals = document.querySelectorAll("[data-reveal]");
  reveals.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => el.classList.add("revealed"),
    });
  });

  // Collection cards stagger
  gsap.from(".collection-card", {
    opacity: 0,
    y: 60,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.15,
    scrollTrigger: {
      trigger: ".collections-grid",
      start: "top 80%",
    },
  });

  // About section
  gsap.from(".about-img-main", {
    opacity: 0,
    x: -60,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about",
      start: "top 75%",
    },
  });
  gsap.from(".about-img-accent", {
    opacity: 0,
    x: 60,
    duration: 1,
    ease: "power3.out",
    delay: 0.2,
    scrollTrigger: {
      trigger: ".about",
      start: "top 75%",
    },
  });
  gsap.from(".about-quote", {
    opacity: 0,
    scale: 0.85,
    duration: 0.8,
    ease: "back.out(1.5)",
    delay: 0.4,
    scrollTrigger: {
      trigger: ".about",
      start: "top 70%",
    },
  });

  // Editorial cards
  gsap.from(".editorial-card", {
    opacity: 0,
    y: 40,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: ".editorial-grid",
      start: "top 80%",
    },
  });

  // Newsletter
  gsap.from(".newsletter-title", {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".newsletter",
      start: "top 80%",
    },
  });
  gsap.from(".newsletter-form", {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".newsletter",
      start: "top 75%",
    },
  });

  // Parallax Cover Reveals
  gsap.utils.toArray(".collection-img").forEach(img => {
    gsap.fromTo(img, 
      { scale: 1.1, yPercent: -10 }, 
      { yPercent: 15, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 0.4 } }
    );
  });

  // Staggered Columns Vertical Offset
  gsap.utils.toArray(".editorial-card").forEach((card, index) => {
    if (window.innerWidth > 768) {
      gsap.to(card, {
        y: index % 2 === 0 ? -40 : 40,
        ease: "none",
        scrollTrigger: {
          trigger: ".editorial-grid",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2
        }
      });
    }
  });

  // Border Draw-In Reveals
  document.querySelectorAll(".section-header").forEach(header => {
    header.style.position = "relative";
    const border = document.createElement("div");
    border.style.position = "absolute";
    border.style.bottom = "-15px";
    border.style.left = "0";
    border.style.width = "0%";
    border.style.height = "2px";
    border.style.backgroundColor = "var(--gold)";
    header.appendChild(border);

    gsap.to(border, {
      width: "100%",
      duration: 1.5,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: header,
        start: "top 85%"
      }
    });
  });
}

// =============================================
// HORIZONTAL SCROLL
// =============================================
function initHorizontalScroll() {
  const track = document.getElementById("h-scroll-track");

  // Render product cards (PRODUCTS and createProductCard are in ecommerce.js)
  if (typeof PRODUCTS !== "undefined" && typeof createProductCard === "function") {
    PRODUCTS.forEach((p) => {
      const card = createProductCard(p);
      track.appendChild(card);
    });
  }

  // GSAP horizontal scroll
  const cards = track;
  const totalWidth = cards.scrollWidth - window.innerWidth + 96; // adjust for padding

  gsap.to(track, {
    x: -totalWidth,
    ease: "none",
    scrollTrigger: {
      trigger: ".h-scroll-section",
      start: "top top",
      end: "+=400%",
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
    },
  });
}

// =============================================
// LENIS SMOOTH SCROLL
// =============================================
function initLenis() {
  if (typeof Lenis === "undefined") return;
  const lenis = new Lenis({
    duration: 1.3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Connect GSAP ScrollTrigger with Lenis
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// =============================================
// TEXT SCRAMBLE EFFECT
// =============================================
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#01ABCDEF";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise((res) => (this.resolve = res));
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = old[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--gold);opacity:0.5">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// =============================================
// NUMBER COUNTERS
// =============================================
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  counters.forEach((counter) => {
    const target = parseInt(counter.dataset.target, 10);
    ScrollTrigger.create({
      trigger: counter,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          counter,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function () {
              counter.textContent = Math.ceil(this.targets()[0].innerText);
            },
          }
        );
      },
    });
  });
}

// =============================================
// MAGNETIC BUTTONS
// =============================================
function initMagneticButtons() {
  const magnets = document.querySelectorAll(".magnetic");
  magnets.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    });
  });
}

// =============================================
// MOBILE NAV
// =============================================
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("mobile-nav-drawer");
  const overlay = document.getElementById("mobile-nav-overlay");
  const closeBtn = document.getElementById("mobile-nav-close");

  function openNav() {
    hamburger.classList.add("open");
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("locked");
  }
  function closeNav() {
    hamburger.classList.remove("open");
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("locked");
  }

  hamburger.addEventListener("click", () => {
    if (drawer.classList.contains("open")) closeNav();
    else openNav();
  });
  closeBtn.addEventListener("click", closeNav);
  overlay.addEventListener("click", closeNav);

  // Close on link click
  document.querySelectorAll("[data-close-mobile]").forEach((el) => {
    el.addEventListener("click", closeNav);
  });
}
