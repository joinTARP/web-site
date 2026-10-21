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
    timer = window.setTimeout(type, /[，。！？]/.test(character) ? 220 : 75);
  };
  reset();
  return {
    play() {
      if (started) return;
      started = true;
      bubble.setAttribute('data-typing', '');
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
          const fragments = section.querySelectorAll<HTMLElement>(
            '[data-companion-fragment]',
          );
          // 完整元素随滚动散开、再聚合；主画面向右落定，下方示意缩短位移。
          // 不固定舞台，不切换内容，小屏也保留较轻的散开重组。
          const visual = section.querySelector<HTMLElement>(
            '[data-companion-visual]',
          );
          const copy = section.querySelector<HTMLElement>('.companion-copy');
          const direction =
            section.dataset.assemblyDirection === 'right' ? -1 : 1;
          const travel = () =>
            direction * (desktop && copy ? section.clientWidth * 0.38 : 32);
          const dialogue = createCompanionDialogue(section);
          if (dialogue) dialogueDisposers.push(() => dialogue.dispose());
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: visual || section,
              start: 'top bottom',
              end: desktop ? 'top 20%' : 'top 35%',
              scrub: 0.6,
              invalidateOnRefresh: true,
              onRefresh: (trigger) => {
                if (trigger.progress >= 0.99) dialogue?.play();
              },
              onScrubComplete: (trigger) => {
                if (trigger.progress >= 0.99) dialogue?.play();
              },
            },
          });
          timeline
            .fromTo(
              fragments,
              {
                x: travel,
                y: 0,
                rotation: 0,
              },
              {
                x: (_index, element: HTMLElement) =>
                  travel() * 0.58 +
                  (Number(element.dataset.fragmentX) || 0) *
                    (desktop ? 1 : 0.35),
                y: (_index, element: HTMLElement) =>
                  (Number(element.dataset.fragmentY) || 0) *
                  (desktop ? 1 : 0.5),
                rotation: (_index, element: HTMLElement) =>
                  Number(element.dataset.fragmentRotate) || 0,
                duration: 0.38,
                ease: 'power1.inOut',
              },
            )
            .to(fragments, {
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.62,
              ease: 'power2.inOut',
              stagger: 0.035,
            });
          if (desktop && copy) {
            timeline.fromTo(
              copy,
              {
                opacity: 0,
                y: 14,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: 'power1.out',
              },
              0.72,
            );
          }
          // 完整时间轴建好后再同步，兼容锚点进入和浏览器恢复滚动位置。
          const updateDialogue = () => {
            if (timeline.progress() >= 0.99) dialogue?.play();
            else if (
              timeline.progress() <= 0.08 &&
              (timeline.scrollTrigger?.progress || 0) <= 0.08
            )
              dialogue?.reset();
          };
          timeline.eventCallback('onUpdate', updateDialogue);
          timeline.scrollTrigger?.refresh();
          updateDialogue();
        });
      return () => dialogueDisposers.forEach((dispose) => dispose());
    },
  );
}

function initCompanionDetails() {
  gsap.matchMedia().add(
    {
      desktop: '(min-width: 768px)',
      mobile: '(max-width: 767px)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      if (!context.conditions?.motion) return;
      const desktop = context.conditions.desktop;
      const cleanup: Array<() => void> = [];
      gsap.utils
        .toArray<HTMLElement>('[data-companion-detail]')
        .forEach((detail, index) => {
          const heading = detail.querySelector('.companion-detail-heading');
          const title = heading?.querySelector('h3');
          const description = heading?.querySelector('p');
          const preview = detail.querySelector<HTMLElement>(
            '.companion-settings-preview, .companion-memory-preview',
          );
          if (!title || !description || !preview) return;

          // 每列独立跟随滚动，小屏纵向排列时仍在各自进入视口后展开。
          // 只用 transform 与 opacity，保持两列高度和表单布局稳定。
          const timeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: detail,
              start: 'top 90%',
              end: desktop ? 'top 18%' : 'top 25%',
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .fromTo(
              title,
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, duration: 0.4 },
              0,
            )
            .fromTo(
              description,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4 },
              0.12,
            )
            .fromTo(
              preview,
              {
                opacity: 0,
                x: desktop ? (index === 0 ? -44 : 44) : 0,
                y: 48,
                scale: 0.975,
                transformOrigin: 'center top',
              },
              { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.7 },
              0.18,
            );

          const boundary = detail.querySelector('.companion-memory-boundary');
          const player = detail.querySelector('.companion-player-memory');
          if (boundary && player) {
            const lines = boundary.querySelectorAll('span');
            timeline
              .fromTo(
                lines,
                {
                  scaleX: 0,
                  transformOrigin: (_i: number) =>
                    _i === 0 ? 'right center' : 'left center',
                },
                { scaleX: 1, duration: 0.5 },
                0.42,
              )
              .fromTo(
                boundary.querySelectorAll('svg, p'),
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
                0.5,
              )
              .fromTo(
                player.querySelectorAll('header, li'),
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.35, stagger: 0.13 },
                0.58,
              )
              .fromTo(
                player.querySelector('blockquote'),
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.35 },
                1.12,
              );
          }

          // 键盘进入表单时直接展示全文，避免焦点落在尚未显现的控件上。
          const showForFocus = () => {
            timeline.scrollTrigger?.disable(false);
            timeline.progress(1).pause();
          };
          detail.addEventListener('focusin', showForFocus);
          cleanup.push(() =>
            detail.removeEventListener('focusin', showForFocus),
          );
        });
      return () => cleanup.forEach((dispose) => dispose());
    },
  );
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
