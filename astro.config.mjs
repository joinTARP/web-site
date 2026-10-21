import react from '@astrojs/react';
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
  integrations: [astroExpressiveCode(), react()],
  vite: { plugins: [tailwindcss()] },
});
