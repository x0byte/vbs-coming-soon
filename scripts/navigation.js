(() => {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const navLinks = document.querySelectorAll('.primary-nav a');
  if (!header || !hero) return;

  // Sections to spy on — map href → section element
  const sections = [];
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ el, link: a });
  });

  // Toggle scrolled state
  const onScroll = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle('is-scrolled', heroBottom <= 0);
  };

  // IntersectionObserver for active link
  const observer = new IntersectionObserver(entries => {
    let best = null;
    let bestRatio = 0;
    entries.forEach(entry => {
      if (entry.intersectionRatio > bestRatio) {
        bestRatio = entry.intersectionRatio;
        best = entry.target;
      }
    });
    navLinks.forEach(a => a.classList.remove('is-active'));
    if (best) {
      const match = navLinks.find(a => a.getAttribute('href') === '#' + best.id);
      if (match) match.classList.add('is-active');
    }
  }, { threshold: [0, .25, .5, .75, 1] });

  sections.forEach(s => observer.observe(s.el));

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
