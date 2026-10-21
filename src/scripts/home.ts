import { gsap, reducedMotion, ScrollTrigger } from './animation';

function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  gsap.to(hero.querySelectorAll('[data-intro]'), {
    opacity: 1,
    y: 0,
    duration: 0.85,
    ease: 'expo.out',
    stagger: 0.075,
  });
}

async function initHeroScreenshot() {
  const screenshot = document.querySelector<HTMLElement>(
    '[data-hero-screenshot]',
  );
  const container = screenshot?.parentElement;
  if (!screenshot || !container) return;

  // 初始倾斜由组件样式提供；图片就绪后才允许滚动触发翻正。
  await Promise.all([
    document.fonts.ready,
    ...Array.from(screenshot.querySelectorAll('img'))
      .filter((image) => getComputedStyle(image).display !== 'none')
      .map((image) => image.decode().catch(() => undefined)),
  ]);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const flip = gsap.to(screenshot, {
      rotationX: 0,
      scale: 1,
      y: 0,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        // 大屏上截图已在首屏内，也要向下滚动后才触发。
        start: () =>
          Math.max(
            96,
            container.getBoundingClientRect().top +
              window.scrollY -
              window.innerHeight * 0.8,
          ),
        once: true,
      },
    });
    // 已恢复到触发点之后时，直接呈现终态，再显示图片。
    if (flip.scrollTrigger && window.scrollY >= flip.scrollTrigger.start) {
      flip.progress(1);
    }
    gsap.set(screenshot, { visibility: 'visible' });
  });
}

function initHeroSpotlight() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const light = hero?.querySelector<HTMLElement>('[data-hero-light]');
  const ambient = hero?.querySelector<HTMLElement>('[data-hero-ambient]');
  if (!hero || !light || !ambient) return;

  gsap
    .matchMedia()
    .add(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        const xTo = gsap.quickTo(light, 'x', {
          duration: 0.85,
          ease: 'power3.out',
        });
        const yTo = gsap.quickTo(light, 'y', {
          duration: 0.85,
          ease: 'power3.out',
        });
        const ambientXTo = gsap.quickTo(ambient, 'x', {
          duration: 1.2,
          ease: 'power3.out',
        });
        const ambientYTo = gsap.quickTo(ambient, 'y', {
          duration: 1.2,
          ease: 'power3.out',
        });
        const reset = () => {
          xTo(0);
          yTo(0);
          ambientXTo(0);
          ambientYTo(0);
        };
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
            return;
          const rect = hero.getBoundingClientRect();
          if (event.clientY < rect.top || event.clientY > rect.bottom) {
            reset();
            return;
          }
          // 光晕跟随大范围位置，光带只做小幅偏移；仅更新 transform。
          const x = event.clientX - rect.left - rect.width * 0.5;
          const y = event.clientY - rect.top - rect.height * 0.35;
          xTo(x * 0.8);
          yTo(y * 0.65);
          ambientXTo(x * 0.08);
          ambientYTo(y * 0.04);
        };
        window.addEventListener('pointermove', move, { passive: true });
        document.documentElement.addEventListener('pointerleave', reset);
        window.addEventListener('blur', reset);
        window.addEventListener('resize', reset);
        return () => {
          window.removeEventListener('pointermove', move);
          document.documentElement.removeEventListener('pointerleave', reset);
          window.removeEventListener('blur', reset);
          window.removeEventListener('resize', reset);
        };
      },
    );
}

// 正文在 HTML 中完整输出；动效只改写视觉副本，读屏不逐字播报。
function createCompanionDialogue(section: HTMLElement) {
  const text = section.querySelector<HTMLElement>('[data-companion-dialogue]');
  const bubble = text?.closest<HTMLElement>('.companion-character-quote');
  if (!text || !bubble) return;
  const fullText = text.dataset.dialogueText || text.textContent || '';
  const characters = Array.from(fullText);
  let timer = 0;
  let started = false;
  let cursor = 0;
  const stop = () => {
    window.clearTimeout(timer);
    bubble.removeAttribute('data-typing');
    text.removeAttribute('data-typing');
  };
  const reset = () => {
    stop();
    started = false;
    cursor = 0;
    text.textContent = '';
  };
  const type = () => {
    const character = characters[cursor++];
    text.textContent = characters.slice(0, cursor).join('');
    if (cursor >= characters.length) {
      stop();
      return;
    }
    timer = window.setTimeout(type, /[，。！？]/.test(character) ? 180 : 65);
  };
  reset();
  return {
    play() {
      if (started) return;
      started = true;
      bubble.setAttribute('data-typing', '');
      text.setAttribute('data-typing', '');
      type();
    },
    reset,
    dispose() {
      stop();
      text.textContent = fullText;
    },
  };
}

function initCompanionAssembly() {
  const media = gsap.matchMedia();
  media.add(
    {
      desktop: '(min-width: 768px)',
      mobile: '(max-width: 767px)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      if (!context.conditions?.motion) return;
      const desktop = context.conditions.desktop;
      const dialogueDisposers: Array<() => void> = [];
      gsap.utils
        .toArray<HTMLElement>('[data-companion-assembly]')
        .forEach((section) => {
          const visual = section.querySelector<HTMLElement>(
            '[data-companion-visual]',
          );
          const copy = section.querySelector<HTMLElement>(
            '[data-companion-copy]',
          );
          const glow = section.querySelector<HTMLElement>(
            '[data-companion-glow]',
          );
          const portrait = section.querySelector<HTMLElement>(
            '[data-companion-portrait]',
          );
          const quote = section.querySelector<HTMLElement>(
            '[data-companion-quote]',
          );

          const dialogue = createCompanionDialogue(section);
          if (dialogue) dialogueDisposers.push(() => dialogue.dispose());

          // 分层登场：苏棠立绘携同源模糊光晕浮现，随后弹出聊天气泡并逐字输出台词。
          const timeline = gsap.timeline({ paused: true });

          if (copy) {
            const copyItems = copy.querySelectorAll<HTMLElement>('h2, p, a');
            timeline.fromTo(
              copyItems.length ? copyItems : copy,
              {
                opacity: 0,
                y: 24,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.44,
                stagger: 0.07,
                ease: 'power2.out',
              },
              0,
            );
          }

          if (portrait) {
            timeline.fromTo(
              portrait,
              {
                opacity: 0,
                x: desktop ? 24 : 10,
                y: desktop ? 48 : 32,
                scale: 0.93,
                transformOrigin: '50% 90%',
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.72,
                ease: 'power2.out',
              },
              0.06,
            );
          }

          if (glow) {
            timeline.fromTo(
              glow,
              { opacity: 0, scale: 0.78 },
              { opacity: 1, scale: 1, duration: 0.78, ease: 'sine.out' },
              0.12,
            );
          }

          if (quote) {
            timeline.fromTo(
              quote,
              {
                opacity: 0,
                x: desktop ? 16 : 0,
                y: 24,
                scale: 0.92,
                transformOrigin: '24% 0%',
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.48,
                ease: 'back.out(1.4)',
              },
              0.42,
            );
          }

          // 台词气泡入场后即开始打字，兼容锚点跳转与刷新恢复位置。
          const updateDialogue = () => {
            const progress = timeline.progress();
            if (progress >= 0.62) dialogue?.play();
            else if (
              progress <= 0.08 &&
              (timeline.scrollTrigger?.progress || 0) <= 0.08
            )
              dialogue?.reset();
          };
          timeline.eventCallback('onUpdate', updateDialogue);
          // 先组装完整动画，再绑定滚动，避免恢复到区域下方时初始样式覆盖终态。
          const trigger = ScrollTrigger.create({
            animation: timeline,
            trigger: visual || section,
            start: 'top 88%',
            end: desktop ? 'top 24%' : 'top 36%',
            scrub: 0.65,
            onRefresh(self) {
              self.getTween()?.progress(1);
              timeline.progress(self.progress);
              updateDialogue();
            },
          });
          // pageshow 后一帧读取浏览器恢复的位置，包括前进、后退恢复。
          let frame = 0;
          const syncRestoredPosition = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => trigger.refresh());
          };
          window.addEventListener('pageshow', syncRestoredPosition);
          if (document.readyState === 'complete') syncRestoredPosition();
          dialogueDisposers.push(() => {
            cancelAnimationFrame(frame);
            window.removeEventListener('pageshow', syncRestoredPosition);
          });
          updateDialogue();
        });
      return () => dialogueDisposers.forEach((dispose) => dispose());
    },
  );
}

function initCompanionDetails() {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const cleanup: Array<() => void> = [];
    gsap.utils
      .toArray<HTMLElement>('[data-companion-detail]')
      .forEach((detail) => {
        const fade = gsap.fromTo(
          detail,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: { trigger: detail, start: 'top 90%', once: true },
          },
        );
        // 键盘聚焦时立即展示，避免焦点落在尚未显现的控件上。
        const showForFocus = () => {
          fade.scrollTrigger?.disable(false);
          fade.progress(1).pause();
        };
        detail.addEventListener('focusin', showForFocus);
        cleanup.push(() => detail.removeEventListener('focusin', showForFocus));
      });
    return () => cleanup.forEach((dispose) => dispose());
  });
}

function initFaq() {
  let refreshTimer = 0;
  document.querySelectorAll('[data-faq] details').forEach((details) => {
    details.addEventListener('toggle', () => {
      // 切换问题会同时触发打开和关闭；答案过渡结束后只刷新一次布局。
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 420);
    });
  });
}

initHeroScreenshot();
initHeroSpotlight();
initCompanionAssembly();
initCompanionDetails();

if (!reducedMotion) {
  document.fonts.ready.then(() => {
    initHero();
    initFaq();
    ScrollTrigger.refresh();
  });
}
