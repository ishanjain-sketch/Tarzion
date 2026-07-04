/* ============================================================
   AADIHWAR RIVIERA — Luxury Real Estate Website
   Premium JavaScript — Production Ready
   ============================================================ */

'use strict';

/* ---- UTILITIES ---- */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* ============================================================
   1. NAVIGATION
   ============================================================ */
(function initNav() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#navLinks');

  /* Scroll behaviour — glass effect on scroll */
  let lastY = 0;
  on(window, 'scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });

  /* Mobile hamburger */
  on(hamburger, 'click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close mobile menu on link click */
  qsa('.nav-link, .nav-cta', navLinks).forEach(link => {
    on(link, 'click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  on(document, 'click', e => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* Smooth scroll for anchor links */
  qsa('a[href^="#"]').forEach(anchor => {
    on(anchor, 'click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
})();

/* ============================================================
   2. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const options = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  qsa('.reveal').forEach(el => observer.observe(el));
})();

/* ============================================================
   3. COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const counters = qsa('.stat-num[data-target]');
  if (!counters.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuart(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   4. HERO PARALLAX
   ============================================================ */
(function initParallax() {
  const heroBg = qs('.hero-bg');
  if (!heroBg) return;

  let ticking = false;

  on(window, 'scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.35;
        heroBg.style.transform = `translateY(${rate}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ============================================================
   5. TESTIMONIAL SLIDER
   ============================================================ */
(function initTestimonials() {
  const track  = qs('#testimonialTrack');
  const dots   = qsa('.t-dot');
  const prev   = qs('#tPrev');
  const next   = qs('#tNext');
  if (!track) return;

  let current = 0;
  const total = qsa('.testimonial-card', track).length;
  let autoTimer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(${-current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('t-dot--active', i === current);
    });
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  on(prev, 'click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  on(next, 'click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => {
    on(dot, 'click', () => { stopAuto(); goTo(i); startAuto(); });
  });

  /* Touch/swipe */
  let startX = 0;
  on(track, 'touchstart', e => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  on(track, 'touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  startAuto();
})();

/* ============================================================
   6. GALLERY LIGHTBOX
   ============================================================ */
(function initGallery() {
  const lightbox    = qs('#lightbox');
  const lbOverlay   = qs('#lightboxOverlay');
  const lbClose     = qs('#lightboxClose');
  const lbImg       = qs('#lightboxImg');
  const lbLabel     = qs('#lightboxLabel');
  const items       = qsa('.gallery-item');

  if (!lightbox) return;

  function openLightbox(item) {
    const svg   = item.querySelector('.gallery-svg');
    const label = item.dataset.label || '';
    lbImg.innerHTML   = svg ? svg.outerHTML : '';
    lbLabel.textContent = label;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    on(item, 'click', () => openLightbox(item));
    on(item, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(item); });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  on(lbClose, 'click', closeLightbox);
  on(lbOverlay, 'click', closeLightbox);
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

/* ============================================================
   7. FORM VALIDATION
   ============================================================ */
(function initForm() {
  const form        = qs('#visitForm');
  if (!form) return;

  const fields = {
    fullName:  { el: qs('#fullName'),  err: qs('#nameErr'),  msg: 'Please enter your full name.' },
    phone:     { el: qs('#phone'),     err: qs('#phoneErr'), msg: 'Please enter a valid 10-digit phone number.' },
    email:     { el: qs('#email'),     err: qs('#emailErr'), msg: 'Please enter a valid email address.' },
    visitDate: { el: qs('#visitDate'), err: qs('#dateErr'),  msg: 'Please select a preferred visit date.' },
  };

  const successEl = qs('#formSuccess');

  function validateField(key) {
    const { el, err, msg } = fields[key];
    let valid = true;
    let message = '';

    const val = el.value.trim();

    if (!val) {
      valid = false;
      message = msg;
    } else if (key === 'phone') {
      const digits = val.replace(/[\s\-\+]/g, '');
      if (!/^\d{10,13}$/.test(digits)) { valid = false; message = msg; }
    } else if (key === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { valid = false; message = msg; }
    } else if (key === 'visitDate') {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) { valid = false; message = 'Please choose a future date.'; }
    }

    el.classList.toggle('error', !valid);
    err.textContent = message;
    return valid;
  }

  /* Live validation on blur */
  Object.keys(fields).forEach(key => {
    on(fields[key].el, 'blur', () => validateField(key));
    on(fields[key].el, 'input', () => {
      if (fields[key].el.classList.contains('error')) validateField(key);
    });
  });

  on(form, 'submit', e => {
    e.preventDefault();
    const valid = Object.keys(fields).map(validateField).every(Boolean);
    if (!valid) return;

    /* Simulate submission */
    const btn = qs('#submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span>Submitting…</span>';

    setTimeout(() => {
      form.reset();
      successEl.classList.add('visible');
      btn.disabled = false;
      btn.innerHTML = `<span>Schedule My Visit</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12,5 19,12 12,19"/>
        </svg>`;
      Object.keys(fields).forEach(k => {
        fields[k].el.classList.remove('error');
        fields[k].err.textContent = '';
      });
      setTimeout(() => successEl.classList.remove('visible'), 6000);
    }, 1500);
  });
})();

/* ============================================================
   8. BACK TO TOP
   ============================================================ */
(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  on(window, 'scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   9. NAVBAR ACTIVE LINK HIGHLIGHTING
   ============================================================ */
(function initActiveSections() {
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.style.color = href === `#${id}` ? 'var(--gold)' : '';
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   10. MASTER PLAN — ZOOM CONTROLS
   ============================================================ */
(function initMasterplan() {
  const wrap = qs('.masterplan-visual');
  const svg  = qs('#masterPlanSVG');
  if (!wrap || !svg) return;

  /* The hover zoom is handled by CSS; JS adds cursor UX */
  on(wrap, 'mouseenter', () => { wrap.style.overflow = 'visible'; });
  on(wrap, 'mouseleave', () => { wrap.style.overflow = 'hidden'; });
})();

/* ============================================================
   11. SCROLL INDICATOR HIDE ON SCROLL
   ============================================================ */
(function initScrollIndicator() {
  const indicator = qs('#scrollIndicator');
  if (!indicator) return;
  on(window, 'scroll', () => {
    indicator.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
})();

/* ============================================================
   12. AMENITY CARD STAGGER (enhanced reveal)
   ============================================================ */
(function initAmenityStagger() {
  const cards = qsa('.amenity-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--delay', `${i * 0.04}s`);
  });
})();

/* ============================================================
   13. PERFORMANCE: Defer non-critical tasks
   ============================================================ */
(function initDeferredEnhancements() {
  /* Set minimum date for visit form */
  const dateInput = qs('#visitDate');
  if (dateInput) {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  /* Animate gold divider lines in about section on scroll */
  const featureItems = qsa('.feature-item');
  const featureObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, i * 80);
        featureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  featureItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    featureObserver.observe(item);
  });
})();