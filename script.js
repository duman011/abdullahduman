/* ============================================================
   PORTFOLIO — script.js
   Abdullah Duman
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// 1. DEVICE DETECTION
// ─────────────────────────────────────────────────────────────
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────────────────────
// 2. PARTICLE CANVAS BACKGROUND
// ─────────────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = randomY ? Math.random() * canvas.height : canvas.height + 5;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.4 + 0.4;
      this.alpha = Math.random() * 0.45 + 0.08;
      this.hue = Math.random() > 0.5 ? '34, 211, 238' : '168, 85, 247';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.hue}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = Math.max(40, Math.min(Math.floor(window.innerWidth / 14), 90));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawLines() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.10;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    raf = requestAnimationFrame(animate);
  }

  resize();
  buildParticles();
  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildParticles(); }, 200);
  }, { passive: true });

  // Pause when tab is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else animate();
  });
})();


// ─────────────────────────────────────────────────────────────
// 3. CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────
(function initCursor() {
  if (isTouchDevice) return;

  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mx = -200, my = -200;
  let fx = -200, fy = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  }, { passive: true });

  // Smooth follower with lerp
  (function lerp() {
    fx += (mx - fx) * 0.11;
    fy += (my - fy) * 0.11;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(lerp);
  })();

  // Hover state on interactive elements
  const interactives = 'a, button, .bento-card, .skill-card, .info-card, .contact-link, .tech-pill, input, textarea';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovered'); follower.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovered'); follower.classList.remove('hovered'); });
  });
})();


// ─────────────────────────────────────────────────────────────
// 4. SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const total    = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? Math.min((scrolled / total) * 100, 100) : 0) + '%';
  }, { passive: true });
})();


// ─────────────────────────────────────────────────────────────
// 5. NAVIGATION
// ─────────────────────────────────────────────────────────────
(function initNav() {
  const nav       = document.getElementById('nav');
  const navLinks  = document.querySelectorAll('.nav-link');
  const indicator = document.getElementById('navIndicator');
  const menuBtn   = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const themeBtn  = document.getElementById('themeBtn');

  // ── Scrolled class ──
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.pageYOffset > 40);
  }, { passive: true });

  // ── Sliding indicator ──
  function moveIndicator(link) {
    if (!indicator || !link) return;
    const container = document.querySelector('.nav-links');
    const cRect = container.getBoundingClientRect();
    const lRect = link.getBoundingClientRect();
    indicator.style.left  = (lRect.left - cRect.left) + 'px';
    indicator.style.width = lRect.width + 'px';
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
    link.addEventListener('mouseleave', () => {
      const active = document.querySelector('.nav-link.active');
      if (active) moveIndicator(active);
    });
  });

  // Position indicator on page load
  requestAnimationFrame(() => {
    const active = document.querySelector('.nav-link.active');
    if (active) moveIndicator(active);
  });

  // ── Active section via IntersectionObserver ──
  const allSections = document.querySelectorAll('section[id]');

  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', isActive);
          if (isActive) moveIndicator(link);
        });
        document.querySelectorAll('.mobile-link').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.25, rootMargin: '-8% 0px -60% 0px' });

  allSections.forEach(s => sectionObs.observe(s));

  // ── Mobile menu ──
  function openMenu() {
    mobileNav.classList.add('show');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.querySelectorAll('.mobile-link').forEach(a => a.setAttribute('tabindex', '0'));
  }

  function closeMenu() {
    mobileNav.classList.remove('show');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.querySelectorAll('.mobile-link').forEach(a => a.setAttribute('tabindex', '-1'));
  }

  menuBtn.addEventListener('click', () => {
    mobileNav.classList.contains('show') ? closeMenu() : openMenu();
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !mobileNav.contains(e.target)) closeMenu();
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  }, { passive: true });

  // ── Theme toggle ──
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');

  if (saved === 'light') {
    root.classList.add('light');
    themeBtn.innerHTML = '<i class="fa-regular fa-sun"></i>';
  }

  themeBtn.addEventListener('click', () => {
    const isLight = root.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeBtn.innerHTML = isLight
      ? '<i class="fa-regular fa-sun"></i>'
      : '<i class="fa-regular fa-moon"></i>';
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Keyboard: Escape closes menu ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('show')) closeMenu();
  });
})();


// ─────────────────────────────────────────────────────────────
// 6. TYPEWRITER EFFECT
// ─────────────────────────────────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el || prefersReducedMotion) {
    if (el) el.textContent = 'Flutter Geliştirici';
    return;
  }

  const phrases = [
    'Flutter Geliştirici',
    'Android Geliştirici',
    '.NET / C# Geliştirici',
    'Web Geliştirici',
    'Bilgisayar Mühendisi',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;

  function tick() {
    const current = phrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = current.slice(0, charIndex);

    let delay = deleting ? 45 : 95;

    if (!deleting && charIndex === current.length) {
      delay    = 2200;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting    = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay       = 350;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 800);
})();


// ─────────────────────────────────────────────────────────────
// 7. SCROLL-REVEAL ANIMATIONS
// ─────────────────────────────────────────────────────────────
(function initReveal() {
  // Generic .reveal elements
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Skill cards with stagger delay
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0');
        setTimeout(() => entry.target.classList.add('visible'), delay);
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.skill-card').forEach(el => skillObs.observe(el));

  // Bento cards with stagger
  const bentoGrid = document.getElementById('bentoGrid');
  if (bentoGrid) {
    const cards = bentoGrid.querySelectorAll('.bento-card');

    // Set initial hidden state
    cards.forEach(card => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = 'opacity 0.55s ease, transform 0.55s ease, border-color 0.35s, box-shadow 0.35s';
    });

    const bentoObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, i * 70);
        });
        bentoObs.unobserve(bentoGrid);
      }
    }, { threshold: 0.05 });

    bentoObs.observe(bentoGrid);
  }
})();


// ─────────────────────────────────────────────────────────────
// 8. COUNTER ANIMATION
// ─────────────────────────────────────────────────────────────
(function initCounters() {
  function animateNum(el, target, duration) {
    if (prefersReducedMotion) { el.textContent = target; return; }
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { el.textContent = target; clearInterval(timer); }
      else el.textContent = Math.floor(current);
    }, 16);
  }

  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(num => {
          animateNum(num, parseInt(num.dataset.target, 10), 1100);
        });
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stats-row, .hero-stats-mobile, .cv-stats-grid').forEach(el => {
    counterObs.observe(el);
  });
})();


// ─────────────────────────────────────────────────────────────
// 9. 3D TILT — Hero card only (desktop)
// ─────────────────────────────────────────────────────────────
(function initTilt() {
  if (isTouchDevice || prefersReducedMotion) return;

  const card = document.querySelector('.hero-card-main');
  if (!card) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left)  / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)   / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    card.style.transition = 'transform 0.08s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.45s ease';
  });
})();


// ─────────────────────────────────────────────────────────────
// 10. CONTACT FORM
// ─────────────────────────────────────────────────────────────
(function initContact() {
  // Copy email button
  const copyBtn = document.getElementById('copyMailBtn');
  const EMAIL   = 'dduman.abdulla2003@gmail.com';

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Kopyalandı!';
      copyBtn.style.color       = '#10b981';
      copyBtn.style.borderColor = '#10b981';
      setTimeout(() => {
        copyBtn.innerHTML = orig;
        copyBtn.style.color       = '';
        copyBtn.style.borderColor = '';
      }, 2500);
    } catch {
      // Fallback: select text
      const tmp = document.createElement('textarea');
      tmp.value = EMAIL;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    }
  });

  // Anti-spam honeypot
  const form = document.getElementById('contactForm');
  if (form) {
    const hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'company';
    hp.style.display = 'none'; hp.tabIndex = -1; hp.autocomplete = 'off';
    form.appendChild(hp);
  }
})();


// ─────────────────────────────────────────────────────────────
// 11. LAZY IMAGE LOADING
// ─────────────────────────────────────────────────────────────
(function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;
  const imgObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; imgObs.unobserve(img); }
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => imgObs.observe(img));
})();


// ─────────────────────────────────────────────────────────────
// READY
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-loaded');
});

console.log('%c Abdullah Duman Portfolio 🚀 ', 'background:#22d3ee;color:#060b18;font-weight:bold;padding:4px 8px;border-radius:4px;');
