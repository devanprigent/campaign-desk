import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchOpportunity, fetchToken } from "../../clients/merkl";
import { RejectionError } from "../../errors";
import type { NewCampaignInput } from "../../models/campaign";
import type { Opportunity } from "../../models/opportunity";
import type { Token } from "../../models/token";
import { insertCampaign } from "../../repositories/campaign.repository";
import { createCampaign } from "../../services/campaign.service";

vi.mock("../../clients/merkl", () => ({
  fetchOpportunity: vi.fn(),
  fetchToken: vi.fn(),
}));
vi.mock("../../repositories/campaign.repository", () => ({
  insertCampaign: vi.fn(async (data) => ({ ...data, id: "c1", createdAt: new Date(), totalCost: 0n })),
}));

const NOW = new Date("2027-01-01T00:00:00Z");
const ONE_DAY_LATER = new Date("2027-01-02T00:00:00Z");
const USDC = 1_000_000n;

const opportunity: Opportunity = {
  id: "opp-1",
  name: "USDC pool",
  chainId: 1,
  chainName: "Ethereum",
  protocolName: null,
  action: "POOL",
  status: "LIVE",
  tvlUsd: 0,
  apr: 0,
  dailyRewardsUsd: 0,
};

const usdc: Token = {
  chainId: 1,
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  symbol: "USDC",
  decimals: 6,
  priceUsd: 1,
};

function input(amount: bigint): NewCampaignInput {
  return {
    tokenAddress: usdc.address,
    amount: { unit: "smallest", value: amount },
    startAt: NOW,
    endAt: ONE_DAY_LATER,
  };
}

async function rejection(promise: Promise<unknown>): Promise<RejectionError> {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(RejectionError);
  return error as RejectionError;
}

describe("createCampaign enforces the business rules before saving", () => {
  beforeEach(() => {
    vi.mocked(fetchOpportunity).mockResolvedValue(opportunity);
    vi.mocked(fetchToken).mockResolvedValue(usdc);
    vi.mocked(insertCampaign).mockClear();
  });

  it("BR-1: refuses a campaign below $100 a day on the amount field, and saves nothing", async () => {
    const error = await rejection(createCampaign(opportunity.id, input(100n * USDC - 1n), NOW));

    expect(error.fields).toEqual([expect.objectContaining({ field: "amount", rule: "BR-1" })]);
    expect(insertCampaign).not.toHaveBeenCalled();
  });

  it("BR-1: refuses a token without a Merkl price on the token field, and saves nothing", async () => {
    vi.mocked(fetchToken).mockResolvedValue({ ...usdc, priceUsd: null });

    const error = await rejection(createCampaign(opportunity.id, input(1_000n * USDC), NOW));

    expect(error.fields).toEqual([expect.objectContaining({ field: "tokenAddress", rule: "BR-1" })]);
    expect(insertCampaign).not.toHaveBeenCalled();
  });

  it("BR-2: saves an accepted campaign with its fee rounded up", async () => {
    const amount = 100n * USDC + 1n; // 3% = 3_000_000.03 → 3_000_001

    await createCampaign(opportunity.id, input(amount), NOW);

    expect(insertCampaign).toHaveBeenCalledWith(
      expect.objectContaining({ amount, fee: 3_000_001n, tokenPriceUsd: 1 }),
    );
  });
});
