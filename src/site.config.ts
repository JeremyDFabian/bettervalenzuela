/** City- and portal-specific settings. Templates must read these values from here, never hard-code them. */
export const site = {
  portalName: 'Better Valenzuela',
  cityName: 'Valenzuela',
  cityFullName: 'City of Valenzuela',
  region: 'Metro Manila',
  /** Canonical URL. Change this one value when the domain changes (spec §10). */
  url: 'https://bettervalenzuela.pages.dev',
  officialWebsite: 'https://www.valenzuela.gov.ph/',
  repoUrl: 'https://github.com/JeremyDFabian/bettervalenzuela',
} as const;
