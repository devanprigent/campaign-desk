// Amounts are integers in the token's smallest unit (1 USDC = 1_000_000).

export type Campaign = {
  id: string;
  opportunityId: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  amount: bigint;
  fee: bigint;
  totalCost: bigint;
  tokenPriceUsd: number;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
};

/**
 * The JSON API sends the amount in the smallest unit; the web form sends it
 * in tokens ("1000.5"). Only the service knows the token's decimals, so it is
 * the one converting.
 */
export type CampaignAmount =
  | { unit: "smallest"; value: bigint }
  | { unit: "token"; value: string };

export type NewCampaignInput = {
  tokenAddress: string;
  amount: CampaignAmount;
  startAt: Date;
  endAt: Date;
};
