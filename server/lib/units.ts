export function toSmallestUnit(amount: string, decimals: number): bigint | null {
  const [whole, fraction = ""] = amount.split(".");
  if (fraction.length > decimals) return null;
  return BigInt(whole + fraction.padEnd(decimals, "0"));
}
