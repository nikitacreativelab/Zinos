import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroScene, initBottleScene } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

// Subtle, continuous reveal-on-scroll for sections (Klimt-style restraint).
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  items.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });
}

// Hero WebGL background.
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) initHeroScene(canvas);
}

// One Three.js scene per product panel canvas.
function initBottleScenes() {
  document.querySelectorAll('[data-bottle-canvas]').forEach((canvas) => {
    const src = canvas.getAttribute('data-src');
    if (src) initBottleScene(canvas, src);
  });
}

// Jump-tabs: smooth scroll to a panel + scrollspy to keep the active pill in sync.
function initJumpTabs() {
  const pills = Array.from(document.querySelectorAll('.pill[data-target]'));
  const panels = pills
    .map((p) => document.getElementById(p.getAttribute('data-target')))
    .filter(Boolean);

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const target = document.getElementById(pill.getAttribute('data-target'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const setActive = (id) => {
    pills.forEach((p) => {
      const active = p.getAttribute('data-target') === id;
      p.classList.toggle('active', active);
      if (active) {
        p.style.background = p.dataset.accent;
        p.style.color = '#fff';
      } else {
        p.style.background = '';
        p.style.color = '';
      }
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  panels.forEach((panel) => io.observe(panel));
}

function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 8 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initBottleScenes();
  initJumpTabs();
  initScrollReveal();
  initNav();
});
