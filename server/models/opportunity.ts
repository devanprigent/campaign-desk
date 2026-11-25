export const OPPORTUNITY_ACTIONS = [
  "POOL",
  "HOLD",
  "DROP",
  "LEND",
  "BORROW",
  "STAKE",
  "SWAP",
] as const;
export type OpportunityAction = (typeof OPPORTUNITY_ACTIONS)[number];

export const OPPORTUNITY_STATUSES = ["LIVE", "PAST", "SOON"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type Opportunity = {
  id: string;
  name: string;
  chainId: number;
  chainName: string;
  protocolName: string | null;
  action: string;
  status: string;
  tvlUsd: number;
  apr: number;
  dailyRewardsUsd: number;
};

export type OpportunityFilters = {
  chainId?: number;
  action?: OpportunityAction;
  status?: OpportunityStatus;
  minTvlUsd?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
};

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};
