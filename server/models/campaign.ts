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

export type NewCampaignInput = {
  tokenAddress: string;
  amount: bigint;
  startAt: Date;
  endAt: Date;
};
