/**
 * Converts a Philippine phone number as written in public sources into a tel: href.
 * Returns null when the number cannot be dialled reliably; callers then render plain text.
 */
export function toTelHref(display: string): string | null {
  const [base = ''] = display.trim().split(/\s*(?:loc\.?|local|ext\.?)\s*\d*/i);
  const digits = base.replace(/\D/g, '');

  if (base.startsWith('+')) {
    return digits.length >= 10 ? `tel:+${digits}` : null;
  }
  // Short national hotlines such as 911 or 8888.
  if (digits.length >= 3 && digits.length <= 4) return `tel:${digits}`;
  // Mobile: 09XX XXX XXXX
  if (digits.length === 11 && digits.startsWith('09')) return `tel:+63${digits.slice(1)}`;
  // Metro Manila landline with area code: (02) 8XXX-XXXX
  if (digits.length === 10 && digits.startsWith('02')) return `tel:+63${digits.slice(1)}`;
  // Metro Manila landline without area code: 8XXX-XXXX
  if (digits.length === 8 && digits.startsWith('8')) return `tel:+632${digits}`;
  return null;
}
