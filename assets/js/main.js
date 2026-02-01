// Smooth-scroll navigation with offset for fixed header
const header = document.querySelector('header');
const headerOffset = header ? header.offsetHeight : 0;
const scrollLinks = document.querySelectorAll('a[href^="#"]');

scrollLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const targetId = href.slice(1); // remove leading '#'
    const target = document.getElementById(targetId);
    if (!target) return;

    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

    // Close mobile menu after selection
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  });
});

// Intersection Observer for fade-in animations and active link highlighting
const sections = document.querySelectorAll('main section[id]');
const options = { root: null, threshold: 0.3 };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');

      // Highlight all matching nav links (desktop + mobile)
      document.querySelectorAll(`header nav a[href="#${id}"]`).forEach(link => {
        link.classList.add('active');
      });
    } else {
      document.querySelectorAll(`header nav a[href="#${id}"]`).forEach(link => {
        link.classList.remove('active');
      });
    }
  });
}, options);

sections.forEach(section => observer.observe(section));

// Mobile navigation toggle for button #menu-toggle and nav #mobile-menu
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Certifications – modal on cert click
(function () {
  const modal = document.getElementById('cert-modal');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalImage = document.getElementById('cert-modal-image');
  const modalPdfLink = document.getElementById('cert-modal-pdf-link');
  const modalClose = document.getElementById('cert-modal-close');
  const modalOverlay = modal?.querySelector('.cert-modal-overlay');

  function openModal(title, imageSrc, pdfHref) {
    if (!modal || !modalTitle || !modalImage) return;
    modalTitle.textContent = title || 'Certificate';
    modalImage.src = imageSrc || '';
    modalImage.alt = title || '';
    if (pdfHref) {
      modalPdfLink.href = pdfHref;
      modalPdfLink.classList.remove('hidden');
    } else {
      modalPdfLink.classList.add('hidden');
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.cert-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.cert-filter')) return;
      const img = item.querySelector('.cert-image');
      if (!img) return;
      const title = item.getAttribute('data-modal-title') || img.alt || 'Certificate';
      const src = img.src || img.getAttribute('src');
      const pdfHref = item.getAttribute('data-pdf-href') || '';
      openModal(title, src, pdfHref);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();

// Certifications – filter by type (industry | online | awards)
(function () {
  const filters = document.querySelectorAll('.cert-filter');
  const items = document.querySelectorAll('.cert-item');
  if (!filters.length || !items.length) return;

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach((item) => {
        const itemFilter = item.getAttribute('data-filter');
        const show = filter === 'all' || itemFilter === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });
})();

// Optional: Scroll reveal for project cards
const cards = document.querySelectorAll('.card-hover');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

cards.forEach(card => cardObserver.observe(card));

// Skills section: subtle magnetic effect – badges move toward cursor when nearby
(function () {
  const zone = document.getElementById('skills-zone');
  if (!zone) return;
  const badges = zone.querySelectorAll('.skill-badge');
  if (!badges.length) return;

  const radius = 90;
  const strength = 0.2;
  const maxMove = 8;
  let raf = null;
  let mouse = { x: -1e4, y: -1e4 };

  function updateBadges() {
    badges.forEach((badge) => {
      const rect = badge.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let mx = 0, my = 0;
      if (dist < radius && dist > 0) {
        const pull = (1 - dist / radius) * strength;
        mx = Math.max(-maxMove, Math.min(maxMove, dx * pull));
        my = Math.max(-maxMove, Math.min(maxMove, dy * pull));
      }
      badge.style.setProperty('--mx', mx + 'px');
      badge.style.setProperty('--my', my + 'px');
    });
    raf = null;
  }

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (raf == null) raf = requestAnimationFrame(updateBadges);
  }

  function onLeave() {
    mouse.x = -1e4;
    mouse.y = -1e4;
    if (raf == null) raf = requestAnimationFrame(updateBadges);
  }

  zone.addEventListener('mousemove', onMove, { passive: true });
  zone.addEventListener('mouseleave', onLeave);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    zone.removeEventListener('mousemove', onMove);
    zone.removeEventListener('mouseleave', onLeave);
  }
})();

// Typewriter effect – About section (type line → pause → delete → next line)
(function () {
  const el = document.getElementById('typewriter-text');
  const cursor = document.getElementById('typewriter-cursor');
  if (!el || !cursor) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Let\'s build something together!';
    return;
  }

  const lines = [
    "I was in the track & field team in NYP",
    "Tea + code = my favourite combo.",
    "안녕하세요, I am currently learning Korean",
  ];
  let lineIndex = 0;
  let charIndex = 0;
  let isTyping = true;
  const typeSpeed = 60;
  const deleteSpeed = 35;
  const pauseAfterType = 2500;
  const pauseAfterDelete = 600;

  function type() {
    const line = lines[lineIndex];
    if (charIndex < line.length) {
      el.textContent += line[charIndex++];
      setTimeout(type, typeSpeed);
    } else {
      isTyping = false;
      setTimeout(deleteText, pauseAfterType);
    }
  }

  function deleteText() {
    const current = el.textContent;
    if (current.length > 0) {
      el.textContent = current.slice(0, -1);
      setTimeout(deleteText, deleteSpeed);
    } else {
      lineIndex = (lineIndex + 1) % lines.length;
      charIndex = 0;
      isTyping = true;
      setTimeout(type, pauseAfterDelete);
    }
  }

  setTimeout(type, 500);
})();