import type { APIRoute } from 'astro';
import { site } from '../site.config';
import { t } from '../i18n/t';
import { byTitle, getPublished } from '../lib/content';
import { barangayHref, serviceHref } from '../lib/routes';

export const GET: APIRoute = async ({ site: astroSite }) => {
  const base = astroSite ?? new URL(site.url);
  const link = (label: string, path: string) => `- [${label}](${new URL(path, base)})`;
  const services = (await getPublished('services')).sort(byTitle);
  const barangays = (await getPublished('barangays')).sort((a, b) =>
    a.data.name.localeCompare(b.data.name, 'en'),
  );
  const hasHistory = (await getPublished('history')).length > 0;

  const lines = [
    `# ${site.portalName}`,
    '',
    `> ${t('site.description')}`,
    '',
    '## Sections',
    '',
    link(t('nav.services'), '/services/'),
    link(t('nav.hotlines'), '/hotlines/'),
    link(t('nav.item.officials'), '/government/'),
    link(t('nav.item.barangays'), '/barangays/'),
    ...(hasHistory ? [link(t('nav.item.history'), '/history/')] : []),
    link(t('nav.about'), '/about/'),
    '',
  ];
  if (services.length > 0) {
    lines.push(
      '## Services',
      '',
      ...services.map(
        (s) => `${link(s.data.title, serviceHref(s.data.category.id, s.id))}: ${s.data.summary}`,
      ),
      '',
    );
  }
  if (barangays.length > 0) {
    lines.push(
      '## Barangays',
      '',
      ...barangays.map((b) => link(b.data.name, barangayHref(b.id))),
      '',
    );
  }
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
