import type { APIRoute } from 'astro';
import { site } from '../site.config';

export const GET: APIRoute = ({ site: astroSite }) => {
  const sitemap = new URL('sitemap-index.xml', astroSite ?? site.url);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
