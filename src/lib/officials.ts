import type { OfficialPosition } from './schemas';

export interface OfficialLike {
  position: OfficialPosition;
  district?: 1 | 2 | undefined;
  name: string;
}

const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);
/** Lowercase particles that start a Filipino or Spanish compound surname. */
const PARTICLES = new Set([
  'de',
  'del',
  'dela',
  'delos',
  'de los',
  'de la',
  'san',
  'santa',
  'sta.',
  'sto.',
  'santo',
]);

/** The surname used for alphabetical order: suffixes dropped, particles kept ("dela Cruz" sorts under D). */
export function surnameKey(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/,+$/, ''))
    .filter((w) => !SUFFIXES.has(w.toLowerCase()));
  let start = words.length - 1;
  while (start > 0) {
    const prev = (words[start - 1] ?? '').toLowerCase();
    const prevTwo = start > 1 ? `${(words[start - 2] ?? '').toLowerCase()} ${prev}` : '';
    if (PARTICLES.has(prevTwo)) start -= 2;
    else if (PARTICLES.has(prev)) start -= 1;
    else break;
  }
  return words.slice(start).join(' ').toLowerCase();
}

export interface OfficialGroups<T> {
  executive: T[];
  districts: { district: 1 | 2; members: T[] }[];
  exOfficio: T[];
}

const bySurname = <T extends { data: OfficialLike }>(a: T, b: T) =>
  surnameKey(a.data.name).localeCompare(surnameKey(b.data.name), 'en');

/** Sections of /government/: mayor then vice mayor; per district the representative then councilors by surname; ex-officio. */
export function groupOfficials<T extends { data: OfficialLike }>(entries: T[]): OfficialGroups<T> {
  const of = (position: OfficialPosition) => entries.filter((e) => e.data.position === position);
  const districts = ([1, 2] as const)
    .map((district) => ({
      district,
      members: [
        ...of('representative')
          .filter((e) => e.data.district === district)
          .sort(bySurname),
        ...of('councilor')
          .filter((e) => e.data.district === district)
          .sort(bySurname),
      ],
    }))
    .filter((group) => group.members.length > 0);
  return {
    executive: [...of('mayor'), ...of('vice-mayor')],
    districts,
    exOfficio: of('ex-officio').sort(bySurname),
  };
}

/** Which people sections /government/ renders: ex-officio members count toward the council. */
export function governmentSections(groups: OfficialGroups<unknown>): {
  executive: boolean;
  council: boolean;
} {
  return {
    executive: groups.executive.length > 0,
    council: groups.districts.length > 0 || groups.exOfficio.length > 0,
  };
}
