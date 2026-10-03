import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.config.ts';

export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  // Build tests write to separate folders; everything else uses dist/.
  outDir: process.env.ASTRO_OUT_DIR ?? 'dist',
  // Keep every script and stylesheet external so the CSP can stay at script-src 'self'.
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [sitemap()],
});
