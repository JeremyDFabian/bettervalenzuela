/** Sum of a service's listed fees; 0 means the service is free. */
export function totalFee(fees: readonly { amount: number }[]): number {
  return fees.reduce((sum, fee) => sum + fee.amount, 0);
}
