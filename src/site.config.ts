/** City- and portal-specific settings. Templates must read these values from here, never hard-code them. */
export const site = {
  portalName: 'BetterValenzuela',
  cityName: 'Valenzuela',
  cityFullName: 'City of Valenzuela',
  region: 'Metro Manila',
  /** Canonical URL. Change this one value when the domain changes (spec §10). */
  url: 'https://bettervalenzuela.pages.dev',
  officialWebsite: 'https://www.valenzuela.gov.ph/',
  /** City hall, for the home contact block. Sources: https://www.valenzuela.gov.ph/contact-us (address, phone), https://www.openstreetmap.org/node/8671827641 (coordinates). */
  cityHall: {
    address: 'City Hall, MacArthur Highway, Karuhatan, Valenzuela City',
    phone: '(02) 8352-1000',
    coordinates: { lat: 14.6929096, lng: 120.9681428 },
  },
  /** Official Facebook page of the City Government, as linked from https://www.valenzuela.gov.ph/. */
  officialFacebook: 'https://www.facebook.com/ValenzuelaCityGov',
  repoUrl: 'https://github.com/JeremyDFabian/bettervalenzuela',
  /** BetterValenzuela is part of BetterGov.ph (maintainer, 2026-10-03). */
  parent: {
    name: 'BetterGov.ph',
    url: 'https://bettergov.ph/',
    joinUrl: 'https://bettergov.ph/join-us',
    contactUrl: 'https://bettergov.ph/contact',
  },
  nationalPortal: 'https://www.gov.ph/',
  licenses: {
    mit: 'https://opensource.org/license/mit',
    ccBy: 'https://creativecommons.org/licenses/by/4.0/',
  },
  /** Date the About, Privacy, and Accessibility pages were last edited. */
  infoPagesUpdated: '2026-10-03',
} as const;
