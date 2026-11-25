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

export type CampaignAmount =
  | { unit: "smallest"; value: bigint }
  | { unit: "token"; value: string };

export type NewCampaignInput = {
  tokenAddress: string;
  amount: CampaignAmount;
  startAt: Date;
  endAt: Date;
};
