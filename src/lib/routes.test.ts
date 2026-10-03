import { expect, test } from 'vitest';
import { categoryHref, serviceHref } from './routes';

test('builds category and service URLs with trailing slashes', () => {
  expect(categoryHref('business')).toBe('/services/business/');
  expect(serviceHref('business', 'business-permit')).toBe('/services/business/business-permit/');
});
