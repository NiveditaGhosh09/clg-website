/* ═══════════════════════════════════════════════════════════════
   Techno International New Town — homepage interactions
   Vanilla JavaScript only. No dependencies.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── 1 · Preloader ─────────────────────────────── */
  const preloader = document.getElementById("preloader");
  function hidePreloader() {
    if (preloader && !preloader.classList.contains("done")) {
      preloader.classList.add("done");
      setTimeout(() => preloader.remove(), 700);
      openPopupIfDue(); // show admission popup only after the page is visible
    }
  }
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 3500); // never trap the user if an image stalls

  /* ── 2 · Admission popup (once per day via localStorage) ── */
  const popup = document.getElementById("admissionPopup");
  const popupClose = document.getElementById("popupClose");
  const dontShow = document.getElementById("popupDontShow");
  const POPUP_KEY = "tintAdmissionPopupDismissedOn";

  function todayStamp() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* private mode etc. */ }
  }

  function openPopupIfDue() {
    if (!popup) return;
    if (storageGet(POPUP_KEY) === todayStamp()) return; // already dismissed today
    setTimeout(() => popup.classList.add("show"), 900);
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove("show");
    if (dontShow && dontShow.checked) storageSet(POPUP_KEY, todayStamp());
  }

  if (popupClose) popupClose.addEventListener("click", closePopup);
  if (popup) {
    popup.addEventListener("click", (e) => { if (e.target === popup) closePopup(); });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closePopup(); closeLightbox(); }
  });

  /* ── 3 · Sticky nav state + mobile menu ────────── */
  const nav = document.getElementById("mainNav");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ── 4 · Scroll progress + nav shadow + back-to-top ── */
  const progress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (nav) nav.classList.toggle("scrolled", doc.scrollTop > 10);
    if (backToTop) backToTop.classList.toggle("show", doc.scrollTop > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ── 5 · Hero image slider ─────────────────────── */
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 4500);
  }

  /* ── 6 · Scroll reveal (IntersectionObserver) ──── */
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-right, .section-head, .timeline"
  );

  // Auto-stagger: children of card grids reveal one after another
  const staggerGrids = document.querySelectorAll(
    ".notice-grid, .dept-grid, .rd-grid, .event-grid, .fac-grid, .gallery-grid, .testi-grid, .course-cols"
  );
  staggerGrids.forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      if (child.classList.contains("reveal")) {
        child.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      }
    });
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ── 7 · Animated counters ─────────────────────── */
  const counters = document.querySelectorAll(".stat-num");
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = (c.dataset.count || "0") + (c.dataset.suffix || "")));
  }

  /* ── 8 · Gallery lightbox ──────────────────────── */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove("show");
  }
  document.querySelectorAll(".g-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = btn.dataset.full || btn.querySelector("img").src;
      lightbox.classList.add("show");
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  }

  /* ── 9 · Motion extras (skipped if user prefers reduced motion) ── */
  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Hero headline rises line by line
  const heroH1 = document.querySelector(".hero h1");
  if (motionOK && heroH1) {
    const lines = heroH1.innerHTML.split(/<br\s*\/?>/i);
    heroH1.innerHTML = lines
      .map(
        (line, i) =>
          '<span class="h-line"><span style="animation-delay:' +
          (0.25 + i * 0.18) +
          's">' + line + "</span></span>"
      )
      .join("");
  }

  // Blueprint spotlight follows the cursor across the hero
  const hero = document.getElementById("hero");
  const spotlight = document.getElementById("heroSpotlight");
  if (motionOK && finePointer && hero && spotlight) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      spotlight.style.setProperty("--sx", ((e.clientX - r.left) / r.width) * 100 + "%");
      spotlight.style.setProperty("--sy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  // Gentle hero parallax on scroll
  const gridBg = document.querySelector(".hero-grid-bg");
  const heroVisual = document.querySelector(".hero-visual");
  if (motionOK && hero && gridBg) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          gridBg.style.transform = "translateY(" + y * 0.18 + "px)";
          if (heroVisual) heroVisual.style.transform = "translateY(" + y * -0.06 + "px)";
        }
      },
      { passive: true }
    );
  }

  // 3D tilt on department, notice and event cards
  if (motionOK && finePointer) {
    document.querySelectorAll(".dept-card, .notice-card, .event-card").forEach((card) => {
      card.classList.add("tilt");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        card.style.transform =
          "translateY(-6px) perspective(700px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Magnetic pull on primary buttons
  if (motionOK && finePointer) {
    document.querySelectorAll(".btn-amber").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.18;
        const dy = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy - 3).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }
})();
