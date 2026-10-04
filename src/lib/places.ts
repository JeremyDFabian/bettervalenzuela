import { site } from '../site.config';

export function osmLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

/** schema.org Place for a barangay page (spec §6.5). The street address is omitted when unknown. */
export function placeJsonLd(input: {
  name: string;
  address?: string | undefined;
  url: string;
  coordinates?: { lat: number; lng: number } | undefined;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: input.name,
    url: input.url,
    address: {
      '@type': 'PostalAddress',
      ...(input.address && { streetAddress: input.address }),
      addressLocality: site.cityName,
      addressRegion: site.region,
      addressCountry: 'PH',
    },
    ...(input.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: input.coordinates.lat,
        longitude: input.coordinates.lng,
      },
    }),
  };
}
