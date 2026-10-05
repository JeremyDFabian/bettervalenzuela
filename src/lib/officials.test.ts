import { describe, expect, test } from 'vitest';
import { governmentSections, groupOfficials, surnameKey } from './officials';
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
    ['Juan Cruz, Jr.', 'cruz'],
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

describe('governmentSections', () => {
  const group = (executive: number, districts: number, exOfficio: number) => ({
    executive: Array.from({ length: executive }, () => 0),
    districts: Array.from({ length: districts }, () => ({ district: 1 as const, members: [0] })),
    exOfficio: Array.from({ length: exOfficio }, () => 0),
  });
  test('nothing published renders no people sections', () => {
    expect(governmentSections(group(0, 0, 0))).toEqual({ executive: false, council: false });
  });
  test('the council renders for districts alone', () => {
    expect(governmentSections(group(2, 1, 0))).toEqual({ executive: true, council: true });
  });
  test('the council renders for ex-officio members alone', () => {
    expect(governmentSections(group(0, 0, 1))).toEqual({ executive: false, council: true });
  });
});
