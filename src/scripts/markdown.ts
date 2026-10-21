let pageController: AbortController | undefined;
let pendingFrame = 0;

function enhanceMarkdown() {
  pageController?.abort();
  cancelAnimationFrame(pendingFrame);
  pageController = new AbortController();
  const { signal } = pageController;
  document
    .querySelectorAll<HTMLTableElement>('.doc-prose table')
    .forEach((table) => {
      if (table.parentElement?.classList.contains('doc-table-scroll')) return;
      const wrapper = document.createElement('div');
      wrapper.className =
        'doc-table-scroll my-6 max-w-full overflow-x-auto rounded-md border border-line [scrollbar-width:thin] [scrollbar-color:var(--color-line)_transparent]';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', '表格，可横向滚动');
      table.before(wrapper);
      wrapper.append(table);
      table.dataset.scrollWrapped = '';
    });

  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.doc-prose :is(h2, h3)[id], [data-doc-heading]',
    ),
  );
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-docs-outline] a'),
  );
  if (!headings.length || !links.length) return;
  const syncOutline = () => {
    pendingFrame = 0;
    let current = headings[0];
    const atEnd =
      window.scrollY > 0 &&
      Math.ceil(window.scrollY + window.innerHeight) >=
        document.documentElement.scrollHeight - 4;
    if (atEnd) {
      current = headings[headings.length - 1];
    } else {
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > 112) break;
        current = heading;
      }
    }
    for (const link of links) {
      if (decodeURIComponent(link.hash.slice(1)) === current.id)
        link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const queueOutline = () => {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(syncOutline);
  };
  window.addEventListener('scroll', queueOutline, { passive: true, signal });
  window.addEventListener('resize', queueOutline, { passive: true, signal });
  syncOutline();
}

enhanceMarkdown();
document.addEventListener('astro:page-load', enhanceMarkdown);
document.addEventListener('astro:before-swap', () => {
  pageController?.abort();
  cancelAnimationFrame(pendingFrame);
});
