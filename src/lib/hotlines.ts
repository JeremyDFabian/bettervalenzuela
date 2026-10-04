import { t } from '../i18n/t';
import { toTelHref } from './phone';
import { hotlineCategories, type HotlineCategory } from './schemas';

export interface HotlineEntry {
  name: string;
  category: HotlineCategory;
  numbers: string[];
  note?: string | undefined;
}

export interface TickerItem {
  name: string;
  number: string;
  href: string | null;
}

const URGENT = new Set<HotlineCategory>(['emergency', 'police', 'fire', 'medical', 'disaster']);

/** Items for the homepage hotline strip. 911 is always offered, even with no verified data. */
export function tickerItems(entries: readonly HotlineEntry[], limit = 6): TickerItem[] {
  const items: TickerItem[] = [];
  for (const entry of entries) {
    const number = entry.numbers[0];
    if (!URGENT.has(entry.category) || number === undefined) continue;
    items.push({ name: entry.name, number, href: toTelHref(number) });
  }
  // 911 always comes first, so the strip's red emergency link is never another number.
  const index = items.findIndex((item) => item.href === 'tel:911');
  const national: TickerItem =
    index === -1
      ? { name: t('hotlines.national911'), number: '911', href: 'tel:911' }
      : items.splice(index, 1)[0]!;
  return [national, ...items].slice(0, limit);
}

export function groupByCategory(
  entries: readonly HotlineEntry[],
): { category: HotlineCategory; entries: HotlineEntry[] }[] {
  return hotlineCategories
    .map((category) => ({ category, entries: entries.filter((e) => e.category === category) }))
    .filter((group) => group.entries.length > 0);
}
