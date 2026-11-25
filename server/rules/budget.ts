// BR-1: a campaign pays at least $100 of rewards a day, valued at the token's
// current Merkl price. A token without a Merkl price is refused.
//
// The comparison is exact: the price is turned into a fraction and everything
// is compared in bigint, so a campaign at exactly $100/day is accepted.

export const MIN_DAILY_REWARDS_USD = 100;
const MS_PER_DAY = 86_400_000n;

export type BudgetInput = {
  amount: bigint; // smallest unit
  decimals: number;
  priceUsd: number | null;
  startAt: Date;
  endAt: Date; // must be after startAt
};

export type BudgetCheck =
  | { ok: true }
  | { ok: false; reason: "NO_PRICE" }
  | { ok: false; reason: "BELOW_MINIMUM"; dailyRewardsUsd: number };

export function checkMinimumDailyBudget(input: BudgetInput): BudgetCheck {
  const { amount, decimals, priceUsd, startAt, endAt } = input;
  if (priceUsd === null || !Number.isFinite(priceUsd) || priceUsd < 0) {
    return { ok: false, reason: "NO_PRICE" };
  }
  const durationMs = BigInt(endAt.getTime() - startAt.getTime());
  if (durationMs <= 0n) throw new RangeError("endAt must be after startAt");

  // amount / 10^decimals * price / (durationMs / MS_PER_DAY) >= 100
  // <=> amount * priceNum * MS_PER_DAY >= 100 * 10^decimals * priceDen * durationMs
  const price = toFraction(priceUsd);
  const dailyValue = amount * price.numerator * MS_PER_DAY;
  const minimum =
    BigInt(MIN_DAILY_REWARDS_USD) * 10n ** BigInt(decimals) * price.denominator * durationMs;
  if (dailyValue >= minimum) return { ok: true };

  const days = Number(durationMs) / Number(MS_PER_DAY);
  const dailyRewardsUsd = (Number(amount) / 10 ** decimals) * priceUsd / days;
  return { ok: false, reason: "BELOW_MINIMUM", dailyRewardsUsd };
}

/** Exact fraction of a JS number as written by toString (e.g. 1.5e-7 → 15 / 10^8). */
function toFraction(value: number): { numerator: bigint; denominator: bigint } {
  const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e");
  const [integerPart, fractionPart = ""] = mantissa.split(".");
  const digits = BigInt(integerPart + fractionPart);
  const scale = fractionPart.length - Number(exponent);
  return scale >= 0
    ? { numerator: digits, denominator: 10n ** BigInt(scale) }
    : { numerator: digits * 10n ** BigInt(-scale), denominator: 1n };
}
