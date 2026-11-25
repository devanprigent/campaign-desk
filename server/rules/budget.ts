export const MIN_DAILY_REWARDS_USD = 100;
const MS_PER_DAY = 86_400_000n;

export type BudgetInput = {
  amount: bigint;
  decimals: number;
  priceUsd: number | null;
  startAt: Date;
  endAt: Date;
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

  const price = toFraction(priceUsd);
  const dailyValue = amount * price.numerator * MS_PER_DAY;
  const minimum =
    BigInt(MIN_DAILY_REWARDS_USD) * 10n ** BigInt(decimals) * price.denominator * durationMs;
  if (dailyValue >= minimum) return { ok: true };

  const days = Number(durationMs) / Number(MS_PER_DAY);
  const dailyRewardsUsd = (Number(amount) / 10 ** decimals) * priceUsd / days;
  return { ok: false, reason: "BELOW_MINIMUM", dailyRewardsUsd };
}

function toFraction(value: number): { numerator: bigint; denominator: bigint } {
  const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e");
  const [integerPart, fractionPart = ""] = mantissa.split(".");
  const digits = BigInt(integerPart + fractionPart);
  const scale = fractionPart.length - Number(exponent);
  return scale >= 0
    ? { numerator: digits, denominator: 10n ** BigInt(scale) }
    : { numerator: digits * 10n ** BigInt(-scale), denominator: 1n };
}
