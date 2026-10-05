export function categoryHref(categoryId: string): string {
  return `/services/${categoryId}/`;
}

export function serviceHref(categoryId: string, serviceId: string): string {
  return `/services/${categoryId}/${serviceId}/`;
}

export function barangayHref(slug: string): string {
  return `/barangays/${slug}/`;
}
