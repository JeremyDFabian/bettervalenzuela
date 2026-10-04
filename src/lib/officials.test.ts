import { describe, expect, test } from 'vitest';
import { groupOfficials, surnameKey } from './officials';
import type { OfficialPosition } from './schemas';

describe('surnameKey', () => {
  test.each([
    ['Juan dela Cruz Jr.', 'dela cruz'],
    ['Ma. Teresa De Guzman', 'de guzman'],
    ['Jose Santos III', 'santos'],
    ['Wesley T. Gatchalian', 'gatchalian'],
    ['Rovin Andrew M. Feliciano', 'feliciano'],
    ['Ana Delos Santos', 'delos santos'],
    ['Pedro San Juan', 'san juan'],
  ])('%s -> %s', (name, key) => {
    expect(surnameKey(name)).toBe(key);
  });
});

describe('groupOfficials', () => {
  const e = (name: string, position: OfficialPosition, district?: 1 | 2) => ({
    data: { name, position, district },
  });
  const list = [
    e('Zed Zamora', 'councilor', 1),
    e('Ana Abad', 'councilor', 1),
    e('Rita Rep', 'representative', 1),
    e('Vic Vice', 'vice-mayor'),
    e('May Mayor', 'mayor'),
    e('Ben Two', 'councilor', 2),
    e('Liga Pres', 'ex-officio'),
  ];

  test('executive is mayor then vice mayor', () => {
    expect(groupOfficials(list).executive.map((o) => o.data.name)).toEqual([
      'May Mayor',
      'Vic Vice',
    ]);
  });

  test('each district lists its representative first, then councilors by surname', () => {
    const { districts } = groupOfficials(list);
    expect(districts.map((d) => d.district)).toEqual([1, 2]);
    expect(districts[0]?.members.map((o) => o.data.name)).toEqual([
      'Rita Rep',
      'Ana Abad',
      'Zed Zamora',
    ]);
  });

  test('drops a district with no members and keeps ex-officio separate', () => {
    const { districts, exOfficio } = groupOfficials(list.filter((o) => o.data.district !== 2));
    expect(districts.map((d) => d.district)).toEqual([1]);
    expect(exOfficio.map((o) => o.data.name)).toEqual(['Liga Pres']);
  });

  test('empty input gives empty groups', () => {
    expect(groupOfficials([])).toEqual({ executive: [], districts: [], exOfficio: [] });
  });
});
