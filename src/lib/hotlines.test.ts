import { describe, expect, test } from 'vitest';
import { groupByCategory, tickerItems, type HotlineEntry } from './hotlines';

const entries: HotlineEntry[] = [
  { name: 'City Hall trunkline', category: 'office', numbers: ['(02) 8352-1000'] },
  { name: 'Fire station', category: 'fire', numbers: ['8292-3519', '0917 000 0000'] },
  { name: 'Police', category: 'police', numbers: ['352-1000'] },
];

describe('tickerItems', () => {
  test('puts 911 first when the data has no 911 entry', () => {
    const items = tickerItems(entries);
    expect(items[0]).toEqual({ name: 'Emergency', number: '911', href: 'tel:911' });
  });

  test('includes only urgent categories, using each entry’s first number', () => {
    const items = tickerItems(entries);
    expect(items.map((i) => i.name)).toEqual(['Emergency', 'Fire station', 'Police']);
    expect(items[1]?.href).toBe('tel:+63282923519');
  });

  test('keeps numbers that cannot be dialled as plain text', () => {
    expect(tickerItems(entries)[2]).toEqual({ name: 'Police', number: '352-1000', href: null });
  });

  test('does not duplicate 911 when the data already has it', () => {
    const items = tickerItems([
      { name: 'National emergency', category: 'emergency', numbers: ['911'] },
    ]);
    expect(items).toEqual([{ name: 'National emergency', number: '911', href: 'tel:911' }]);
  });

  test('moves 911 to the front when the data lists it after other numbers', () => {
    const items = tickerItems([
      { name: 'Police', category: 'police', numbers: ['(02) 8000-0101'] },
      { name: 'National emergency', category: 'emergency', numbers: ['911'] },
    ]);
    expect(items.map((i) => i.number)).toEqual(['911', '(02) 8000-0101']);
  });

  test('keeps 911 even when it falls beyond the limit in the data', () => {
    const items = tickerItems(
      [
        { name: 'Police', category: 'police', numbers: ['(02) 8000-0101'] },
        { name: 'Fire', category: 'fire', numbers: ['(02) 8292-3519'] },
        { name: 'Medical', category: 'medical', numbers: ['(02) 8000-0301'] },
        { name: 'National emergency', category: 'emergency', numbers: ['911'] },
      ],
      3,
    );
    expect(items[0]?.href).toBe('tel:911');
    expect(items).toHaveLength(3);
  });

  test('still offers 911 with no data at all', () => {
    expect(tickerItems([])).toEqual([{ name: 'Emergency', number: '911', href: 'tel:911' }]);
  });

  test('respects the limit', () => {
    const many: HotlineEntry[] = Array.from({ length: 10 }, (_, i) => ({
      name: `Station ${i}`,
      category: 'fire',
      numbers: ['8292-3519'],
    }));
    expect(tickerItems(many, 4)).toHaveLength(4);
  });
});

describe('groupByCategory', () => {
  test('groups in the fixed category order and skips empty categories', () => {
    expect(groupByCategory(entries).map((g) => g.category)).toEqual(['police', 'fire', 'office']);
  });
});
