const revealMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealGroups = [
  '.hero-content > .eyebrow',
  '.hero-content > h1',
  '.hero-content > .button-row',
  '.hero-content > .dashboard-frame',
  '.section-heading',
  '.split-heading',
  '.service-card',
  '.feature-panel',
  '.feature-grid > div',
  '.chat',
  '.process-list > li',
  '[data-prototype]',
  '.cta-content > *',
  '.footer-layout'
];

const revealItems = [...new Set(revealGroups.flatMap((selector) => [...document.querySelectorAll(selector)]))];

function revealElement(element) {
  element.classList.add('is-revealed');
}

if (revealItems.length) {
  revealItems.forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-order', index % 4);
  });

  if (revealMotionQuery.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(revealElement);
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: .12
    });

    revealItems.forEach((element) => revealObserver.observe(element));
  }
}
