/* ============================================
   TACANNI — Main JavaScript
   Nav, Scroll Animations, Contact Form
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimations();
  initContactForm();
  setActiveNav();
});

/* --- Mobile Navigation --- */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close on link click (mobile)
  links.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.classList.remove('active');
      links.classList.remove('open');
    }
  });
}

/* --- Scroll Animations (IntersectionObserver) --- */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --- Contact Form (Formspree) --- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');
    const originalText = btn.textContent;

    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.style.display = 'block';
        status.style.color = 'var(--gold)';
        status.textContent = '✓ Message sent. I\'ll be in touch shortly.';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      status.style.display = 'block';
      status.style.color = '#ef4444';
      status.textContent = 'Something went wrong. Please email evan@tacanni.com directly.';
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

/* --- Active Nav Link --- */
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('active');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}
