// VoxelInk Studios — Main JS

// ── MOBILE NAV ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '64px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = '#0d0d1a';
    navLinks.style.padding = '16px 24px 24px';
    navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    navToggle.textContent = isOpen ? '☰' : '✕';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.style.display = 'none';
      navToggle.textContent = '☰';
    });
  });
}

// ── ACTIVE NAV ON SCROLL ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) current = section.getAttribute('id');
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? '#f0f0f8' : '';
  });
}, { passive: true });

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.book-card, .why-card, .bundle-inner, .signup-inner').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── AMBIENT MUSIC TOGGLE ──
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

if (musicToggle && bgMusic) {
  bgMusic.volume = 0.35;

  function setPlaying(playing) {
    musicToggle.classList.toggle('playing', playing);
    musicToggle.querySelector('.music-icon').textContent = playing ? '♫' : '♪';
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      setPlaying(true); // immediate visual feedback
      bgMusic.play().catch(() => setPlaying(false)); // revert if it fails
    } else {
      bgMusic.pause();
      setPlaying(false);
    }
  });

  // Attempt autoplay - works on mobile and permissive browsers
  bgMusic.play().then(() => setPlaying(true)).catch(() => {});
}

// ── EMAIL SIGNUP FORM ──
const signupForm = document.getElementById('signupForm');
const signupSuccess = document.getElementById('signupSuccess');

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value.trim();
    if (!email) return;

    const btn = signupForm.querySelector('.signup-btn');
    const originalLabel = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Posts through our Netlify function -> Kit v3 API. Direct form posts
    // get quarantined by Kit's bot guard; the API path does not, and it
    // gives us a real answer instead of a blind no-cors fire-and-forget.
    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        showSuccess();
      } else {
        showError();
      }
    } catch {
      showError();
    }

    function showError() {
      btn.textContent = originalLabel;
      btn.disabled = false;
      let err = signupForm.querySelector('.signup-error');
      if (!err) {
        err = document.createElement('p');
        err.className = 'signup-note signup-error';
        err.style.color = '#ff8fab';
        signupForm.appendChild(err);
      }
      err.textContent = "Hmm, that didn't go through - please check the address and try again.";
    }
  });

  function showSuccess() {
    signupForm.style.display = 'none';
    signupSuccess.classList.add('visible');
  }
}

// ── AUTO-FLIP BOOK COVERS ON TOUCH DEVICES ──
// Desktop users flip covers by hovering; touch screens get a staggered
// auto-flip while the books section is on screen.
const flipInners = document.querySelectorAll('.book-flip-inner');
const booksSection = document.getElementById('books');
const touchOnly = window.matchMedia('(hover: none)').matches;
const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (flipInners.length && booksSection && touchOnly && !prefersStill) {
  let flipTimer = null;
  let flipIndex = 0;

  const startFlipping = () => {
    if (flipTimer) return;
    flipTimer = setInterval(() => {
      flipInners[flipIndex % flipInners.length].classList.toggle('flipped');
      flipIndex++;
    }, 1800);
  };
  const stopFlipping = () => {
    clearInterval(flipTimer);
    flipTimer = null;
  };

  const flipObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? startFlipping() : stopFlipping()));
  }, { threshold: 0.15 });
  flipObserver.observe(booksSection);
}

// ── DUMPLING EASTER EGG ──
// Tap The Dumpling icon 5 times to unlock a secret bonus page.
const dumpling = document.getElementById('dumplingIcon');
if (dumpling) {
  let taps = 0;
  let lastTap = 0;
  const CONFETTI_COLORS = ['#e91e8c', '#4ade80', '#f5b301', '#4a9df8', '#ff8fab', '#9b6bf3'];

  dumpling.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    taps = now - lastTap < 3000 ? taps + 1 : 1;
    lastTap = now;
    // little squish per tap for feedback
    dumpling.style.transform = 'scale(0.85)';
    setTimeout(() => { dumpling.style.transform = ''; }, 120);
    if (taps >= 5) {
      taps = 0;
      throwConfetti();
      showEggModal();
    }
  });

  function throwConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('div');
      c.className = 'pixel-confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.8 + 's';
      c.style.animationDelay = Math.random() * 0.6 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }
  }

  function showEggModal() {
    if (document.querySelector('.egg-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'egg-overlay';
    overlay.innerHTML =
      '<div class="egg-modal" role="dialog" aria-modal="true" aria-label="Secret unlocked">' +
      '<button type="button" class="egg-close" aria-label="Close">×</button>' +
      '<h3>You found The Dumpling’s secret!</h3>' +
      '<p>Shhh... only true fans get this one. A secret bonus coloring page, just for finders like you.</p>' +
      '<div class="egg-actions">' +
      '<a class="btn btn-primary" href="images/bonus-boba.jpg" download="secret-squishy-page.jpg">Download the Secret Page</a>' +
      '<a class="btn btn-etsy" href="/color">Color The Dumpling Online</a>' +
      '</div></div>';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('egg-close')) overlay.remove();
    });
    document.body.appendChild(overlay);
  }
}
