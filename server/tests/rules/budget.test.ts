import { describe, expect, it } from "vitest";

import { checkMinimumDailyBudget, type BudgetInput } from "../../rules/budget";

const START = new Date("2027-01-01T00:00:00Z");
const DAY_MS = 86_400_000;
const USDC = 1_000_000n;

function after(days: number): Date {
  return new Date(START.getTime() + days * DAY_MS);
}

function check(input: Partial<BudgetInput> & Pick<BudgetInput, "amount">) {
  return checkMinimumDailyBudget({
    decimals: 6,
    priceUsd: 1,
    startAt: START,
    endAt: after(1),
    ...input,
  });
}

describe("BR-1 minimum budget: at least $100 of rewards a day", () => {
  it("accepts exactly $100 over 1 day", () => {
    expect(check({ amount: 100n * USDC })).toEqual({ ok: true });
  });

  it("refuses one unit below $100 over 1 day", () => {
    expect(check({ amount: 100n * USDC - 1n })).toMatchObject({ ok: false, reason: "BELOW_MINIMUM" });
  });

  it("is per day: $700 over 7 days is accepted, one unit less is refused", () => {
    expect(check({ amount: 700n * USDC, endAt: after(7) })).toEqual({ ok: true });
    expect(check({ amount: 700n * USDC - 1n, endAt: after(7) })).toMatchObject({ ok: false });
  });

  it("uses the token price: 200 tokens at $0.50 is accepted, one unit less is refused", () => {
    expect(check({ amount: 200n * USDC, priceUsd: 0.5 })).toEqual({ ok: true });
    expect(check({ amount: 200n * USDC - 1n, priceUsd: 0.5 })).toMatchObject({ ok: false });
  });

  it("stays exact with 18 decimals, beyond 2^53: 100 tokens accepted, minus 1 wei refused", () => {
    const amount = 100n * 10n ** 18n;
    expect(check({ amount, decimals: 18 })).toEqual({ ok: true });
    expect(check({ amount: amount - 1n, decimals: 18 })).toMatchObject({ ok: false });
  });

  it("refuses a token without a Merkl price, whatever the amount", () => {
    expect(check({ amount: 10n ** 30n, priceUsd: null })).toEqual({ ok: false, reason: "NO_PRICE" });
  });
});
