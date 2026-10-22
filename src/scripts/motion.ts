import {
  gsap,
  reducedMotion,
  ScrollTrigger,
  SplitText,
  onPageAnimation,
} from './animation';

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
    // 进入视口后播放一次，回滚时保持可读。
    const reveal = gsap.fromTo(
      element,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 96%',
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

onPageAnimation((context) => {
  const body = document.body;
  document.documentElement.dataset.motionReady = '';
  if (!reducedMotion) {
    document.documentElement.classList.add('motion');
    initReveals();
    initFaqReveals();
    document.fonts.ready.then(() => {
      if (body.isConnected) context.add(initSplitHeadings);
    });
  }
});
