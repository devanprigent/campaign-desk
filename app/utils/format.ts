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

export function formatApr(apr: number): string {
  return `${apr.toFixed(2)}%`;
}

export function formatUnits(amount: bigint, decimals: number): string {
  const base = 10n ** BigInt(decimals);
  const whole = (amount / base).toLocaleString("en-US");
  const fraction = (amount % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function formatDateTime(date: Date): string {
  return `${dateTimeFormat.format(date)} UTC`;
}
