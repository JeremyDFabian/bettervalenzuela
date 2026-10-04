import { expect, test } from 'vitest';
import { featuredEvents, sortedTimeline } from './history';

const ev = (year: number, featured = false) => ({
  year,
  title: `Y${year}`,
  description: 'd',
  featured,
  sources: [],
});

test('sortedTimeline orders by year without mutating its input', () => {
  const input = [ev(1998), ev(1623), ev(1960)];
  expect(sortedTimeline(input).map((e) => e.year)).toEqual([1623, 1960, 1998]);
  expect(input[0]?.year).toBe(1998);
});

test('featuredEvents returns featured events in year order, at most three by default', () => {
  const list = [ev(2000, true), ev(1623, true), ev(1700), ev(1998, true), ev(2010, true)];
  expect(featuredEvents(list).map((e) => e.year)).toEqual([1623, 1998, 2000]);
});

test('featuredEvents is empty when nothing is featured', () => {
  expect(featuredEvents([ev(1623)])).toEqual([]);
});
