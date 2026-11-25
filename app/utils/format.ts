// Display formatting shared by pages. Fixed locale and time zone so the
// server-rendered HTML matches what the browser hydrates.

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatUsd(value: number): string {
  return usdFormat.format(value);
}

/** Merkl's APR is already a percentage (5 means 5%). */
export function formatApr(apr: number): string {
  return `${apr.toFixed(2)}%`;
}

/** Smallest-unit integer → human amount, exact (1000000n, 6 → "1"). */
export function formatUnits(amount: bigint, decimals: number): string {
  const base = 10n ** BigInt(decimals);
  const whole = (amount / base).toLocaleString("en-US");
  const fraction = (amount % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function formatDateTime(date: Date): string {
  return `${dateTimeFormat.format(date)} UTC`;
}
