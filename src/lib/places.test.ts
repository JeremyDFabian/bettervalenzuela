import { describe, expect, test } from 'vitest';
import { osmLink, placeJsonLd } from './places';

test('osmLink opens OpenStreetMap at the pin', () => {
  expect(osmLink(14.7, 120.97)).toBe(
    'https://www.openstreetmap.org/?mlat=14.7&mlon=120.97#map=18/14.7/120.97',
  );
});

describe('placeJsonLd', () => {
  const base = {
    name: 'Barangay Malinta',
    address: 'MacArthur Hwy',
    url: 'https://x.ph/barangays/malinta/',
  };
  test('includes the address in Valenzuela and geo when coordinates exist', () => {
    const ld = placeJsonLd({ ...base, coordinates: { lat: 14.7, lng: 120.97 } });
    expect(ld).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: 'Barangay Malinta',
      url: base.url,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'MacArthur Hwy',
        addressLocality: 'Valenzuela',
        addressRegion: 'Metro Manila',
        addressCountry: 'PH',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 14.7, longitude: 120.97 },
    });
  });
  test('omits geo without coordinates', () => {
    expect(placeJsonLd(base)).not.toHaveProperty('geo');
  });
  test('omits streetAddress when the hall address is unknown, keeping the locality', () => {
    const { address: _a, ...noAddress } = base;
    void _a;
    const ld = placeJsonLd(noAddress);
    expect(ld.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Valenzuela',
      addressRegion: 'Metro Manila',
      addressCountry: 'PH',
    });
  });
});
