import type { Fee } from './schemas';

/** What a service costs at a glance: a total only when every fee is a fixed amount. */
export type FeeSummary =
  | { kind: 'none' }
  | { kind: 'fixed'; total: number }
  | { kind: 'from'; min: number }
  | { kind: 'varies' };

export function summarizeFees(fees: readonly Fee[]): FeeSummary {
  if (fees.length === 0) return { kind: 'none' };
  if (fees.some((fee) => 'varies' in fee)) return { kind: 'varies' };

  let total = 0;
  let ranged = false;
  for (const fee of fees) {
    if ('amount' in fee) total += fee.amount;
    else if ('min' in fee) {
      total += fee.min;
      ranged = true;
    }
  }
  return ranged ? { kind: 'from', min: total } : { kind: 'fixed', total };
}
