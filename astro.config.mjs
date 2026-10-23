import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import astroExpressiveCode from 'astro-expressive-code';
// @ts-check
import { defineConfig } from 'astro/config';
import { desktopVersion } from './src/data/site';
import desktopVersionPlugin from './src/lib/desktop-version-plugin.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://jointarp.party',
  output: 'static',
  markdown: {
    processor: satteri({
      mdastPlugins: [desktopVersionPlugin({ version: desktopVersion })],
    }),
  },
  integrations: [
    astroExpressiveCode(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
