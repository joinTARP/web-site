import { gsap, reducedMotion, ScrollTrigger, SplitText } from './animation';

function initReveals() {
  ScrollTrigger.batch('[data-reveal]:not([data-faq-reveal])', {
    start: 'top 94%',
    once: true,
    onEnter: (elements) =>
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'expo.out',
        stagger: 0.04,
        overwrite: true,
      }),
  });
}

function initFaqReveals() {
  gsap.utils.toArray<HTMLElement>('[data-faq-reveal]').forEach((element) => {
    // 小幅位移跟随视口入口进度，完成后保持可读，不逐字拆分或成批弹出。
    const reveal = gsap.fromTo(
      element,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top 96%',
          end: 'top 72%',
          scrub: 0.55,
          once: true,
        },
      },
    );
    element.addEventListener('focusin', () => {
      reveal.scrollTrigger?.disable(false);
      reveal.progress(1).pause();
    });
  });
}

function initSplitHeadings() {
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((element) => {
    SplitText.create(element, {
      type: 'lines,chars',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        gsap.set(element, { visibility: 'visible' });
        return gsap.from(self.chars, {
          yPercent: 100,
          duration: 0.65,
          ease: 'expo.out',
          stagger: 0.012,
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      },
    });
  });
}

document.documentElement.dataset.motionReady = '';

if (!reducedMotion) {
  initReveals();
  initFaqReveals();
  document.fonts.ready.then(initSplitHeadings);
}
