const FEE_PERCENT = 3n;

export function computeFee(amount: bigint): bigint {
  if (amount < 0n) throw new RangeError("amount must not be negative");
  return (amount * FEE_PERCENT + 99n) / 100n;
}
