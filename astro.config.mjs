import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import astroExpressiveCode from 'astro-expressive-code';
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://jointarp.party',
  output: 'static',
  integrations: [astroExpressiveCode(), react()],
  vite: { plugins: [tailwindcss()] },
});
