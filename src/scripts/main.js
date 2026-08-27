import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { initHeroScene, initBottleScene } from './scene.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ---------------------------------------------------------------------------
// Intro: preloader → curtain reveal (Klimt Wine–style entrance).
// A hard fail-safe guarantees the page is never stuck hidden if anything
// in the animated sequence throws or a browser drops a frame.
// ---------------------------------------------------------------------------
function initIntro() {
  const preloader = document.getElementById('preloader');
  const curtain = document.getElementById('curtain');
  const fill = document.querySelector('.preloader-fill');
  if (!preloader || !curtain) return;

  document.documentElement.classList.add('is-loading');

  const reveal = () => {
    preloader.style.display = 'none';
    curtain.style.display = 'none';
    document.documentElement.classList.remove('is-loading');
  };

  const failSafe = setTimeout(reveal, 4000);

  try {
    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(failSafe);
        reveal();
        ScrollTrigger.refresh();
      },
    });

    tl.to(fill, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
      .to(preloader, { opacity: 0, duration: 0.4, ease: 'power1.out' }, '+=0.1')
      .to(curtain, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '-=0.15')
      .from('.nav', { y: -16, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.55');
  } catch (err) {
    clearTimeout(failSafe);
    reveal();
  }
}

// Subtle, continuous reveal-on-scroll for regular sections (Klimt-style restraint).
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

// Hero WebGL background (ambient drifting glow orbs).
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) initHeroScene(canvas);
}

// ---------------------------------------------------------------------------
// Pinned hero timeline: eyebrow fade-in → letter-by-letter typewriter
// headline → bottle drop-and-settle → secondary paragraph + CTAs fade in.
// Everything is scrubbed to scroll position, exactly like klimtwine.com's
// "wine-transform-scroll-timeline" pinned hero.
// ---------------------------------------------------------------------------
function initHeroTimeline() {
  const hero = document.querySelector('.hero');
  const chars = document.querySelectorAll('#hero-headline .char');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const bottle = document.querySelector('.hero-bottle');
  const secondary = document.querySelector('.hero-secondary');
  const ctas = document.querySelector('.hero-ctas');
  const scrollHint = document.querySelector('.scroll-hint');
  if (!hero || !chars.length) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    gsap.set(chars, { opacity: 0 });
    gsap.set(eyebrow, { opacity: 0, y: 12 });
    gsap.set(bottle, { y: '-120%', rotate: -18, opacity: 0 });
    gsap.set(secondary, { opacity: 0, y: 20 });
    gsap.set(ctas, { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'hero-scroll-timeline',
        trigger: hero,
        start: 'top top',
        end: '+=160%',
        scrub: 0.6,
        pin: true,
        pinSpacing: true,
      },
    });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 })
      .to(scrollHint, { opacity: 0, duration: 0.3 }, '<')
      .to(chars, { opacity: 1, stagger: 0.035, duration: 0.01 }, '-=0.15')
      .to(bottle, { y: '0%', rotate: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }, '<0.15')
      .to(secondary, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
      .to(ctas, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');

    return () => tl.scrollTrigger && tl.scrollTrigger.kill();
  });

  mm.add('(max-width: 899px)', () => {
    // No scroll-jacking on small screens: a quick, simple entrance instead.
    gsap.set([eyebrow, bottle, secondary, ctas], { clearProps: 'all' });
    gsap.set(chars, { opacity: 1 });
    gsap.set(scrollHint, { display: 'none' });
    const tl = gsap.timeline();
    tl.from(eyebrow, { opacity: 0, y: 12, duration: 0.5 })
      .from(bottle, { opacity: 0, y: -60, duration: 0.7, ease: 'power2.out' }, '-=0.2')
      .from(secondary, { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
      .from(ctas, { opacity: 0, y: 16, duration: 0.4 }, '-=0.2');
  });
}

// ---------------------------------------------------------------------------
// Pinned product carousel: the section stays fixed in the viewport while
// scrolling drives which product panel is active — mirrors klimtwine.com's
// "carousel-motion" pinned section, adapted to zino's four products.
// ---------------------------------------------------------------------------
function initCarousel() {
  const section = document.getElementById('carousel-pin');
  const panels = Array.from(document.querySelectorAll('.carousel-panel'));
  const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));
  if (!section || !panels.length) return;

  const n = panels.length;

  const scenes = panels.map((panel) => {
    const canvas = panel.querySelector('[data-bottle-canvas]');
    const src = canvas?.getAttribute('data-src');
    return src ? initBottleScene(canvas, src) : null;
  });

  let activeIndex = 0;

  function setActive(i, immediate = false) {
    if (i === activeIndex && !immediate) return;
    const prev = panels[activeIndex];
    const next = panels[i];

    gsap.to(prev, { opacity: 0, y: -24, duration: immediate ? 0 : 0.4, ease: 'power1.inOut' });
    gsap.to(next, { opacity: 1, y: 0, duration: immediate ? 0 : 0.4, ease: 'power1.inOut' });

    dots[activeIndex]?.classList.remove('active');
    dots[i]?.classList.add('active');
    if (dots[i]) dots[i].style.background = dots[i].dataset.accent;
    if (dots[activeIndex] && activeIndex !== i) dots[activeIndex].style.background = '';

    scenes[activeIndex]?.stop();
    scenes[i]?.start();
    activeIndex = i;
  }

  gsap.set(panels, { opacity: 0, y: 24 });
  gsap.set(panels[0], { opacity: 1, y: 0 });
  dots[0]?.classList.add('active');
  if (dots[0]) dots[0].style.background = dots[0].dataset.accent;
  scenes[0]?.start();

  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    const st = ScrollTrigger.create({
      id: 'carousel-motion',
      trigger: section,
      start: 'top top',
      end: () => `+=${n * 90}%`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(n - 1, Math.floor(self.progress * n));
        setActive(idx);
      },
    });

    return () => st.kill();
  });

  mm.add('(max-width: 899px)', () => {
    // Mobile: no pin/scroll-jacking — reveal each panel normally as you scroll past it.
    panels.forEach((panel, i) => {
      gsap.set(panel, { position: 'relative', opacity: 1, y: 0, marginBottom: '48px' });
      ScrollTrigger.create({
        trigger: panel,
        start: 'top 60%',
        onEnter: () => setActive(i),
      });
    });
    setActive(0, true);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const trigger = ScrollTrigger.getById('carousel-motion');
      if (!trigger) {
        panels[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const targetProgress = (i + 0.5) / n;
      const scrollPos = trigger.start + (trigger.end - trigger.start) * targetProgress;
      gsap.to(window, { scrollTo: scrollPos, duration: 0.9, ease: 'power2.inOut' });
    });
  });
}

function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 8 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initHero();
  initHeroTimeline();
  initCarousel();
  initScrollReveal();
  initNav();
});
