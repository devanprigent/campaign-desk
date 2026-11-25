import { fetchChains } from "../clients/merkl";
import type { Chain } from "../models/chain";

export async function listChains(): Promise<Chain[]> {
  const chains = await fetchChains();
  return [...chains].sort((a, b) => a.name.localeCompare(b.name));
}
