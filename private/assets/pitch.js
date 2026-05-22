(function () {
  'use strict';

  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const workflow = document.querySelector('.workflow');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));

  function updateWorkflowProgress() {
    if (!workflow) return;
    const rect = workflow.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const total = rect.height + viewport * 0.35;
    const passed = viewport * 0.72 - rect.top;
    const progress = Math.max(0, Math.min(1, passed / total));
    workflow.style.setProperty('--workflow-progress', `${Math.round(progress * 100)}%`);
  }

  updateWorkflowProgress();
  window.addEventListener('scroll', updateWorkflowProgress, { passive: true });
  window.addEventListener('resize', updateWorkflowProgress);
})();
