import { expect, test } from 'vitest';
import { mergeSources } from './sources';

const s = (url: string) => ({ title: url, url, accessed: new Date('2026-10-01') });

test('dedupes sources by URL and reports the oldest lastVerified', () => {
  const merged = mergeSources([
    { sources: [s('https://a.ph/'), s('https://b.ph/')], lastVerified: new Date('2026-10-03') },
    { sources: [s('https://a.ph/')], lastVerified: new Date('2026-09-01') },
  ]);
  expect(merged.sources.map((x) => x.url)).toEqual(['https://a.ph/', 'https://b.ph/']);
  expect(merged.lastVerified?.toISOString().slice(0, 10)).toBe('2026-09-01');
});

test('no entries gives no sources and no date', () => {
  expect(mergeSources([])).toEqual({ sources: [], lastVerified: undefined });
});
