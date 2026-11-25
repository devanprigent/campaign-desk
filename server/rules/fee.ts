// BR-2: the fee is 3% of the reward amount, paid on top, rounded up to the
// next unit. Pure integer math on the token's smallest unit, no floats.

const FEE_PERCENT = 3n;

export function computeFee(amount: bigint): bigint {
  if (amount < 0n) throw new RangeError("amount must not be negative");
  return (amount * FEE_PERCENT + 99n) / 100n; // ceil(amount * 3 / 100)
}

export function computeTotalCost(amount: bigint): bigint {
  return amount + computeFee(amount);
}
