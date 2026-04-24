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
let musicStarted = false;

if (musicToggle && bgMusic) {
  musicToggle.addEventListener('click', () => {
    if (!musicStarted) {
      bgMusic.volume = 0.35;
      bgMusic.play().then(() => {
        musicStarted = true;
        musicToggle.classList.add('playing');
        musicToggle.querySelector('.music-icon').textContent = '♫';
      }).catch(() => {});
    } else if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.add('playing');
      musicToggle.querySelector('.music-icon').textContent = '♫';
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
      musicToggle.querySelector('.music-icon').textContent = '♪';
    }
  });
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
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // TODO: Replace with your Mailchimp or ConvertKit form action URL
    // Mailchimp: action="https://voxelinkstudios.us21.list-manage.com/subscribe/post?u=XXXX&id=XXXX"
    // ConvertKit: action="https://app.convertkit.com/forms/XXXX/subscriptions"
    const FORM_ACTION = 'REPLACE_WITH_EMAIL_SERVICE_URL';

    if (FORM_ACTION.startsWith('REPLACE')) {
      // Dev mode: show success without posting
      setTimeout(() => showSuccess(), 600);
      return;
    }

    try {
      const body = new FormData();
      body.append('EMAIL', email);
      await fetch(FORM_ACTION, { method: 'POST', body, mode: 'no-cors' });
      showSuccess();
    } catch {
      showSuccess(); // show success regardless (no-cors means we can't read the response)
    }
  });

  function showSuccess() {
    signupForm.hidden = true;
    signupSuccess.hidden = false;
  }
}
