import { describe, expect, test } from 'vitest';
import { z } from 'astro/zod';
import { hotlinesSchema, officeSchema, serviceCategorySchema, sourceSchema } from './schemas';

const verified = {
  sources: [
    { title: 'City website', url: 'https://www.valenzuela.gov.ph/', accessed: '2026-10-02' },
  ],
  lastVerified: '2026-10-02',
  status: 'verified',
};

describe('sourceSchema', () => {
  test('accepts https sources and coerces the date', () => {
    const parsed = sourceSchema.parse({
      title: 'A',
      url: 'https://example.ph/',
      accessed: '2026-10-02',
    });
    expect(parsed.accessed).toBeInstanceOf(Date);
  });

  test('rejects non-http URLs such as javascript:', () => {
    expect(
      sourceSchema.safeParse({ title: 'A', url: 'javascript:alert(1)', accessed: '2026-10-02' })
        .success,
    ).toBe(false);
  });

  test('rejects an empty title', () => {
    expect(
      sourceSchema.safeParse({ title: ' ', url: 'https://a.ph/', accessed: '2026-10-02' }).success,
    ).toBe(false);
  });
});

describe('shared verifiable fields', () => {
  const office = { name: 'Office', location: 'City Hall', hours: 'Mon–Fri 8–5', ...verified };

  test('accept a complete office', () => {
    expect(officeSchema.parse(office).phones).toEqual([]);
  });

  test('require at least one source', () => {
    expect(officeSchema.safeParse({ ...office, sources: [] }).success).toBe(false);
  });

  test('reject a lastVerified date in the future (typo guard)', () => {
    expect(officeSchema.safeParse({ ...office, lastVerified: '2062-10-02' }).success).toBe(false);
  });

  test('reject unknown status values', () => {
    expect(officeSchema.safeParse({ ...office, status: 'draft' }).success).toBe(false);
  });

  test('reject an invalid date', () => {
    expect(officeSchema.safeParse({ ...office, lastVerified: 'soon' }).success).toBe(false);
  });
});

describe('serviceCategorySchema', () => {
  test('only allows known icon names', () => {
    const base = { name: 'Business', description: 'Permits', order: 1 };
    expect(serviceCategorySchema.safeParse({ ...base, icon: 'business' }).success).toBe(true);
    expect(serviceCategorySchema.safeParse({ ...base, icon: 'rocket' }).success).toBe(false);
  });
});

describe('hotlinesSchema', () => {
  test('requires every entry to have at least one number', () => {
    const entry = { name: 'Fire', category: 'fire', numbers: [] };
    expect(hotlinesSchema.safeParse({ entries: [entry], ...verified }).success).toBe(false);
  });

  test('rejects unknown categories', () => {
    const entry = { name: 'X', category: 'pizza', numbers: ['911'] };
    expect(hotlinesSchema.safeParse({ entries: [entry], ...verified }).success).toBe(false);
  });
});

test('astro/zod is the zod instance the schemas use', () => {
  expect(sourceSchema).toBeInstanceOf(z.ZodObject);
});
