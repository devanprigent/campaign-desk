/**
 * Exact conversion of a token amount to its smallest unit, without floats:
 * ("1000.5", 6) → 1000500000n. Returns null when the amount has more
 * fraction digits than the token supports. Expects digits with an optional
 * fraction ("123" or "123.45"); callers validate the format first.
 */
export function toSmallestUnit(amount: string, decimals: number): bigint | null {
  const [whole, fraction = ""] = amount.split(".");
  if (fraction.length > decimals) return null;
  return BigInt(whole + fraction.padEnd(decimals, "0"));
}
