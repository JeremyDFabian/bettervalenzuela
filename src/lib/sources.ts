import type { Source } from './types';

/** One source line for a page built from many entries: unique sources, oldest verification date. */
export function mergeSources(entries: { sources: Source[]; lastVerified: Date }[]): {
  sources: Source[];
  lastVerified: Date | undefined;
} {
  const byUrl = new Map<string, Source>();
  for (const entry of entries)
    for (const source of entry.sources) if (!byUrl.has(source.url)) byUrl.set(source.url, source);
  const dates = entries.map((e) => e.lastVerified.getTime());
  return {
    sources: [...byUrl.values()],
    lastVerified: dates.length ? new Date(Math.min(...dates)) : undefined,
  };
}
