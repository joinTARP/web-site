let controller: AbortController | undefined;
document.addEventListener('astro:page-load', () => {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document
    .querySelectorAll<HTMLAnchorElement>('[data-module-import]')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const article = link.closest('article');
        const help = article?.querySelector<HTMLElement>(
          '[data-module-import-help]',
        );
        if (help) help.hidden = false;
        const menu = link.closest('details');
        if (menu) menu.open = false;
      });
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-copy-repository]')
    .forEach((button) => {
      button.addEventListener('click', async () => {
        const result = button
          .closest('[data-module-import-help]')
          ?.querySelector('[data-module-copy-result]');
        try {
          await navigator.clipboard.writeText(button.dataset.copyRepository!);
          if (result)
            result.textContent = '已复制，可在桌面端“导入模组 → Git”中粘贴。';
        } catch {
          if (result)
            result.textContent = `请手动复制：${button.dataset.copyRepository}`;
        }
      });
    });
  document
    .querySelectorAll<HTMLImageElement>(
      '[data-module-cover], [data-module-avatar]',
    )
    .forEach((image) => {
      const fallback = () => {
        image.hidden = true;
      };
      image.addEventListener('error', fallback);
      if (image.complete && image.naturalWidth === 0) fallback();
    });
  const menus =
    document.querySelectorAll<HTMLDetailsElement>('[data-module-menu]');
  menus.forEach((menu) => {
    menu.addEventListener('toggle', () => {
      if (menu.open)
        menus.forEach((other) => {
          if (other !== menu) other.open = false;
        });
    });
  });
  document.addEventListener(
    'click',
    (event) => {
      menus.forEach((menu) => {
        if (event.target instanceof Node && !menu.contains(event.target))
          menu.open = false;
      });
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return;
      menus.forEach((menu) => {
        if (!menu.open) return;
        menu.open = false;
        menu.querySelector('summary')?.focus();
      });
    },
    { signal },
  );
});
document.addEventListener('astro:before-swap', () => controller?.abort());
