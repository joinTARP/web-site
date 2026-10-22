let dispose: (() => void) | undefined;
function initHeader() {
  dispose?.();

  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;
  let menuFrame = 0;
  let menuTimer = 0;
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const toggle =
    document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const shortScreen = window.matchMedia('(max-height: 800px)');
  let ticking = false;
  let menuOpen = false;
  let previousY = window.scrollY;
  let direction = 0;
  let travel = 0;

  function showHeader(hidden: boolean) {
    header?.toggleAttribute('data-hidden', hidden);
    document.documentElement.toggleAttribute('data-header-hidden', hidden);
  }

  function update() {
    const y = Math.max(
      0,
      Math.min(
        window.scrollY,
        document.documentElement.scrollHeight - innerHeight,
      ),
    );
    header?.toggleAttribute('data-scrolled', y > 24);
    const focused = header?.querySelector(':focus-visible');
    if (!shortScreen.matches || y < 96 || menuOpen || focused) {
      showHeader(false);
      travel = 0;
      direction = 0;
    } else {
      const delta = y - previousY;
      const nextDirection = Math.sign(delta);
      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        travel = 0;
      }
      travel += delta;
      // 留出方向阈值，避免触控板小幅抖动反复开合。
      if (travel >= 24) showHeader(true);
      if (travel <= -12) showHeader(false);
    }
    previousY = y;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      frame = requestAnimationFrame(update);
    },
    { passive: true, signal },
  );
  shortScreen.addEventListener('change', update, { signal });
  window.addEventListener('resize', update, { signal });
  header.addEventListener(
    'focusin',
    () => {
      showHeader(false);
      travel = 0;
      previousY = window.scrollY;
    },
    { signal },
  );
  [
    ...header.querySelectorAll<HTMLAnchorElement>('nav a'),
    ...(menu?.querySelectorAll<HTMLAnchorElement>('nav a') ?? []),
  ].forEach((link) => {
    const active = location.pathname.startsWith(new URL(link.href).pathname);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  update();
  if (!header.hasAttribute('data-ready')) {
    header.getBoundingClientRect();
    header.setAttribute('data-ready', '');
  }

  function setMenu(open: boolean) {
    if (!toggle || !menu) return;
    menuOpen = open;
    if (open) showHeader(false);
    document.documentElement.toggleAttribute('data-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    if (open) {
      menu.hidden = false;
      menuFrame = requestAnimationFrame(() =>
        menu.toggleAttribute('data-open', true),
      );
    } else {
      menu.removeAttribute('data-open');
      menuTimer = window.setTimeout(() => {
        if (!menuOpen) menu.hidden = true;
      }, 700);
    }
  }

  const wide = window.matchMedia('(min-width: 1024px)');
  wide.addEventListener(
    'change',
    (event) => {
      if (event.matches && menuOpen) setMenu(false);
    },
    { signal },
  );

  toggle?.addEventListener('click', () => setMenu(!menuOpen), { signal });
  menu?.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => setMenu(false), { signal });
  });
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && menuOpen) setMenu(false);
    },
    { signal },
  );

  dispose = () => {
    controller.abort();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(menuFrame);
    clearTimeout(menuTimer);
    document.documentElement.removeAttribute('data-menu-open');
    document.documentElement.removeAttribute('data-header-hidden');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', '打开菜单');
    if (menu) {
      menu.hidden = true;
      menu.removeAttribute('data-open');
    }
  };
}
initHeader();
document.addEventListener('astro:after-swap', initHeader);
document.addEventListener('astro:before-swap', () => {
  dispose?.();
  dispose = undefined;
});
