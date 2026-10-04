import type { MessageKey } from '../i18n/t';
import type { IconName } from './icons';

export interface MenuItem {
  labelKey: MessageKey;
  descKey?: MessageKey;
  icon: IconName;
  /** Present only when the page exists; unbuilt pages show as "Coming soon" without a link. */
  href?: string;
  comingSoon?: true;
}

export interface MenuGroup {
  headingKey: MessageKey;
  items: MenuItem[];
}

export interface MenuEntry {
  labelKey: MessageKey;
  href?: string;
  /** "services" panels are filled from the content collections at build time. */
  panel?: 'services';
  groups?: MenuGroup[];
}

/** The approved main menu (maintainer, 2026-10-03). Plan 2 pages stay "Coming soon" until they are built. */
export const menu: MenuEntry[] = [
  { labelKey: 'nav.services', href: '/services/', panel: 'services' },
  {
    labelKey: 'nav.government',
    groups: [
      {
        headingKey: 'nav.group.peoplePlaces',
        items: [
          {
            labelKey: 'nav.item.officials',
            descKey: 'nav.item.officials.d',
            icon: 'office',
            comingSoon: true,
          },
          {
            labelKey: 'nav.item.barangays',
            descKey: 'nav.item.barangays.d',
            icon: 'map',
            comingSoon: true,
          },
        ],
      },
      {
        headingKey: 'nav.group.lawsMoney',
        items: [
          {
            labelKey: 'nav.item.ordinances',
            descKey: 'nav.item.ordinances.d',
            icon: 'scale',
            comingSoon: true,
          },
          {
            labelKey: 'nav.item.transparency',
            descKey: 'nav.item.transparency.d',
            icon: 'wallet',
            comingSoon: true,
          },
        ],
      },
    ],
  },
  {
    labelKey: 'nav.safety',
    groups: [
      {
        headingKey: 'nav.group.staySafe',
        items: [
          {
            labelKey: 'nav.hotlines',
            descKey: 'nav.item.hotlines.d',
            icon: 'phone',
            href: '/hotlines/',
          },
          {
            labelKey: 'nav.item.preparedness',
            descKey: 'nav.item.preparedness.d',
            icon: 'umbrella',
            comingSoon: true,
          },
        ],
      },
    ],
  },
  {
    labelKey: 'nav.discover',
    groups: [
      {
        headingKey: 'nav.group.knowCity',
        items: [
          {
            labelKey: 'nav.item.statistics',
            descKey: 'nav.item.statistics.d',
            icon: 'chart',
            comingSoon: true,
          },
          {
            labelKey: 'nav.item.history',
            descKey: 'nav.item.history.d',
            icon: 'clock',
            comingSoon: true,
          },
          { labelKey: 'nav.item.quiz', descKey: 'nav.item.quiz.d', icon: 'help', comingSoon: true },
        ],
      },
    ],
  },
  { labelKey: 'nav.about', href: '/about/' },
];

/** Every path the menu links to, for tests and link checks. */
export function menuLinks(): string[] {
  const paths = menu.flatMap((entry) => [
    ...(entry.href ? [entry.href] : []),
    ...(entry.groups?.flatMap((g) => g.items.flatMap((i) => (i.href ? [i.href] : []))) ?? []),
  ]);
  return [...new Set(paths)];
}
