import { describe, expect, test } from 'vitest';
import { z } from 'astro/zod';
import {
  feeSchema,
  hotlinesSchema,
  officeSchema,
  serviceCategorySchema,
  serviceFields,
  sourceSchema,
} from './schemas';

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

describe('office schedule', () => {
  const office = { name: 'Office', location: 'City Hall', hours: 'Mon–Fri 8–5', ...verified };
  const weekdays = { days: ['mon', 'tue', 'wed', 'thu', 'fri'], open: '08:00', close: '17:00' };

  test('defaults to no structured schedule', () => {
    expect(officeSchema.parse(office).schedule).toEqual([]);
  });

  test('accepts opening hours in 24-hour time', () => {
    expect(officeSchema.parse({ ...office, schedule: [weekdays] }).schedule).toHaveLength(1);
  });

  test('rejects times that are not HH:MM', () => {
    const bad = { ...weekdays, open: '8am' };
    expect(officeSchema.safeParse({ ...office, schedule: [bad] }).success).toBe(false);
  });

  test('rejects a closing time that is not after the opening time', () => {
    const bad = { ...weekdays, close: '08:00' };
    expect(officeSchema.safeParse({ ...office, schedule: [bad] }).success).toBe(false);
  });

  test('rejects unknown day names', () => {
    const bad = { ...weekdays, days: ['monday'] };
    expect(officeSchema.safeParse({ ...office, schedule: [bad] }).success).toBe(false);
  });
});

describe('service fees', () => {
  test('accept a fixed amount, a range, and a fee that varies', () => {
    expect(feeSchema.safeParse({ item: 'Filing', amount: 500 }).success).toBe(true);
    expect(feeSchema.safeParse({ item: 'Tax', min: 100, max: 900 }).success).toBe(true);
    expect(
      feeSchema.safeParse({ item: 'Permit', varies: true, basis: 'Gross sales' }).success,
    ).toBe(true);
  });

  test('reject negative amounts and ranges whose minimum exceeds the maximum', () => {
    expect(feeSchema.safeParse({ item: 'Filing', amount: -1 }).success).toBe(false);
    expect(feeSchema.safeParse({ item: 'Tax', min: 900, max: 100 }).success).toBe(false);
  });

  test('require a basis when the fee varies', () => {
    expect(feeSchema.safeParse({ item: 'Permit', varies: true }).success).toBe(false);
  });
});

describe('service fields', () => {
  const service = z.object(serviceFields);
  const base = {
    title: 'Permit',
    summary: 'Get a permit',
    whoCanApply: [{ condition: 'The business owner', note: 'Or an officer' }],
    requirements: ['Form'],
    steps: [{ title: 'Apply', detail: 'Submit the form.', where: 'City Hall' }],
    processingTime: '3 days',
    ...verified,
  };

  test('accept conditions, structured steps, and no fees', () => {
    expect(service.parse(base).fees).toEqual([]);
  });

  test('require at least one condition and one step', () => {
    expect(service.safeParse({ ...base, whoCanApply: [] }).success).toBe(false);
    expect(service.safeParse({ ...base, steps: [] }).success).toBe(false);
  });

  test('require every step to have a title and a detail', () => {
    expect(service.safeParse({ ...base, steps: [{ title: 'Apply' }] }).success).toBe(false);
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

  test('keeps the optional one-line note shown on hotline cards', () => {
    const entry = { name: 'Police', category: 'police', numbers: ['117'], note: '24 hours' };
    expect(hotlinesSchema.parse({ entries: [entry], ...verified }).entries[0]?.note).toBe(
      '24 hours',
    );
  });

  test('rejects unknown categories', () => {
    const entry = { name: 'X', category: 'pizza', numbers: ['911'] };
    expect(hotlinesSchema.safeParse({ entries: [entry], ...verified }).success).toBe(false);
  });
});

test('astro/zod is the zod instance the schemas use', () => {
  expect(sourceSchema).toBeInstanceOf(z.ZodObject);
});
