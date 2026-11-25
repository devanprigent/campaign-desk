export type Token = {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  priceUsd: number | null;
};
