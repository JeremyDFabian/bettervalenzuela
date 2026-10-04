import { describe, expect, test } from 'vitest';
import { summarizeFees } from './fees';

describe('summarizeFees', () => {
  test('reports no fees when none are listed', () => {
    expect(summarizeFees([])).toEqual({ kind: 'none' });
  });

  test('adds fixed amounts into a total, including free items', () => {
    expect(
      summarizeFees([
        { item: 'Filing', amount: 500 },
        { item: 'Online request', amount: 0 },
        { item: 'Stamp', amount: 125.5 },
      ]),
    ).toEqual({ kind: 'fixed', total: 625.5 });
  });

  test('a total of zero is still a fixed total (the service is free)', () => {
    expect(summarizeFees([{ item: 'Request', amount: 0 }])).toEqual({ kind: 'fixed', total: 0 });
  });

  test('ranges give a starting amount instead of a total', () => {
    expect(
      summarizeFees([
        { item: 'Filing', amount: 100 },
        { item: 'Tax', min: 200, max: 900 },
      ]),
    ).toEqual({ kind: 'from', min: 300 });
  });

  test('any fee set at assessment makes the whole amount vary', () => {
    expect(
      summarizeFees([
        { item: 'Tax', min: 200, max: 900 },
        { item: 'Permit', varies: true, basis: 'Gross sales' },
      ]),
    ).toEqual({ kind: 'varies' });
  });
});
