import { describe, expect, test } from 'vitest';
import { menu, menuLinks } from './nav';

describe('menu', () => {
  test('has the five approved top-level items in order', () => {
    expect(menu.map((m) => m.labelKey)).toEqual([
      'nav.services',
      'nav.government',
      'nav.safety',
      'nav.discover',
      'nav.about',
    ]);
  });

  test('pages that are not built yet have no link (shown as Coming soon)', () => {
    const items = menu.flatMap((m) => m.groups?.flatMap((g) => g.items) ?? []);
    const comingSoon = items.filter((i) => i.comingSoon);
    expect(comingSoon.length).toBeGreaterThan(0);
    for (const item of comingSoon) expect(item.href, item.labelKey).toBeUndefined();
    for (const item of items.filter((i) => !i.comingSoon))
      expect(item.href, item.labelKey).toMatch(/^\/.*\/$/);
  });

  test('a top-level item links only when it has a built page', () => {
    expect(menu.find((m) => m.labelKey === 'nav.about')?.href).toBe('/about/');
    expect(menu.find((m) => m.labelKey === 'nav.government')?.href).toBeUndefined();
  });

  test('menuLinks lists every linked path exactly once', () => {
    const links = menuLinks();
    expect(new Set(links).size).toBe(links.length);
    expect(links).toContain('/hotlines/');
    expect(links).toContain('/government/');
  });
});
