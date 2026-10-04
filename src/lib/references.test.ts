import { describe, expect, test } from 'vitest';
import { requireEntry } from './references';

describe('requireEntry', () => {
  test('returns the entry when the reference resolves', () => {
    const office = { id: 'bplo', data: { name: 'BPLO' } };
    expect(requireEntry(office, { from: 'services/permit', field: 'office', id: 'bplo' })).toBe(
      office,
    );
  });

  test('fails the build naming the file, field, and missing id', () => {
    expect(() =>
      requireEntry(undefined, { from: 'services/permit', field: 'office', id: 'bplo-typo' }),
    ).toThrow('services/permit: office "bplo-typo" does not exist');
  });
});
