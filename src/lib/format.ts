const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeZone: 'Asia/Manila',
});

export function formatPeso(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError(`Invalid peso amount: ${amount}`);
  }
  return pesoFormatter.format(amount);
}

export function formatDate(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError('Invalid date');
  }
  return dateFormatter.format(value);
}
