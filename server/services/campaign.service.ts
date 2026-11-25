// Campaign use cases. The single entry point for creating a campaign, used by
// the JSON API and the web form alike, so every rule applies on every path.
import { fetchOpportunity, fetchToken } from "../clients/merkl";
import { NotFoundError, RejectionError } from "../errors";
import type { Campaign, NewCampaignInput } from "../models/campaign";
import { insertCampaign } from "../repositories/campaign.repository";
import { checkMinimumDailyBudget, MIN_DAILY_REWARDS_USD } from "../rules/budget";
import { computeFee } from "../rules/fee";
import { checkSchedule } from "../rules/schedule";

export async function createCampaign(
  opportunityId: string,
  input: NewCampaignInput,
  now: Date = new Date(),
): Promise<Campaign> {
  const scheduleErrors = checkSchedule(input.startAt, input.endAt, now);
  if (scheduleErrors.length > 0) throw new RejectionError(scheduleErrors);

  const opportunity = await fetchOpportunity(opportunityId);
  if (!opportunity) throw new NotFoundError("Opportunity", opportunityId);

  // Reward tokens are looked up on the opportunity's chain.
  const token = await fetchToken(opportunity.chainId, input.tokenAddress);
  if (!token) {
    throw new RejectionError([
      { field: "tokenAddress", message: `unknown token on ${opportunity.chainName}` },
    ]);
  }

  const budget = checkMinimumDailyBudget({
    amount: input.amount,
    decimals: token.decimals,
    priceUsd: token.priceUsd,
    startAt: input.startAt,
    endAt: input.endAt,
  });
  if (!budget.ok && budget.reason === "NO_PRICE") {
    throw new RejectionError([
      { field: "tokenAddress", rule: "BR-1", message: `Merkl has no price for ${token.symbol}` },
    ]);
  }
  if (!budget.ok) {
    // Rounded down: a refused campaign must never read as "$100.00 a day".
    const dailyUsd = (Math.floor(budget.dailyRewardsUsd * 100) / 100).toFixed(2);
    throw new RejectionError([
      {
        field: "amount",
        rule: "BR-1",
        message: `pays $${dailyUsd} a day, minimum is $${MIN_DAILY_REWARDS_USD}`,
      },
    ]);
  }

  return insertCampaign({
    opportunityId,
    chainId: opportunity.chainId,
    tokenAddress: token.address,
    tokenSymbol: token.symbol,
    tokenDecimals: token.decimals,
    amount: input.amount,
    fee: computeFee(input.amount),
    tokenPriceUsd: token.priceUsd as number, // non-null: BR-1 passed
    startAt: input.startAt,
    endAt: input.endAt,
  });
}
