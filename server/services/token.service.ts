import { fetchRewardTokens } from "../clients/merkl";
import type { Token } from "../models/token";

export async function listRewardTokens(chainId: number): Promise<Token[]> {
  const tokens = await fetchRewardTokens(chainId);
  return [...tokens].sort((a, b) => a.symbol.localeCompare(b.symbol));
}
