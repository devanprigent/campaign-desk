import { describe, expect, it } from "vitest";

import { computeFee, computeTotalCost } from "../../rules/fee";

describe("BR-2 computeFee: 3% of the amount, rounded up to the next unit", () => {
  it.each([
    { amount: 100n, fee: 3n, case: "exact 3%, no rounding" },
    { amount: 200n, fee: 6n, case: "exact 3%, no rounding" },
    { amount: 101n, fee: 4n, case: "3.03 rounds up" },
    { amount: 133n, fee: 4n, case: "3.99 rounds up" },
    { amount: 134n, fee: 5n, case: "4.02 rounds up" },
    { amount: 33n, fee: 1n, case: "0.99 rounds up" },
    { amount: 34n, fee: 2n, case: "1.02 rounds up" },
    { amount: 1n, fee: 1n, case: "the smallest amount still pays one unit" },
    { amount: 0n, fee: 0n, case: "nothing to pay on nothing" },
  ])("$amount → $fee ($case)", ({ amount, fee }) => {
    expect(computeFee(amount)).toBe(fee);
  });

  it("works in the token's smallest unit: 1 USDC (1_000_000) → 30_000", () => {
    expect(computeFee(1_000_000n)).toBe(30_000n);
  });

  it("stays exact above 2^53: 1000 WETH + 1 wei still rounds up", () => {
    const amount = 1000n * 10n ** 18n + 1n;
    expect(computeFee(amount)).toBe(30n * 10n ** 18n + 1n);
  });

  it("refuses a negative amount", () => {
    expect(() => computeFee(-1n)).toThrow(RangeError);
  });
});

describe("BR-2 computeTotalCost: the fee is paid on top of the amount", () => {
  it("1000 USDC costs 1030 USDC", () => {
    expect(computeTotalCost(1_000_000_000n)).toBe(1_030_000_000n);
  });

  it("adds the rounded-up fee: 101 → 101 + 4", () => {
    expect(computeTotalCost(101n)).toBe(105n);
  });
});
