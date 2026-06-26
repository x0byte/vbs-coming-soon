(() => {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const navLinks = document.querySelectorAll('.primary-nav a');
  if (!header || !hero) return;

  // Build section list from nav hrefs
  const sections = [];
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ el, link: a });
  });

  const onScroll = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle('is-scrolled', heroBottom <= 0);

    // Find which section is most visible
    let best = null;
    let bestDist = Infinity;
    const vh = window.innerHeight;
    const mid = vh / 2;

    sections.forEach(({ el, link }) => {
      const rect = el.getBoundingClientRect();
      // Distance from viewport midpoint to section midpoint
      const dist = Math.abs(rect.top + rect.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = link;
      }
    });

    navLinks.forEach(a => a.classList.toggle('is-active', a === best));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
