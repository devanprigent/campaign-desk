import { TtlCache } from "../lib/cache";
import type { Chain } from "../models/chain";
import type { Opportunity } from "../models/opportunity";
import type { MerklTokenEntry } from "../schemas/merkl.schema";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const opportunityListCache = new TtlCache<Opportunity[]>({
  ttlMs: MINUTE,
  staleTtlMs: HOUR,
  maxEntries: 500,
});

export const opportunityCache = new TtlCache<Opportunity | null>({
  ttlMs: MINUTE,
  staleTtlMs: HOUR,
  maxEntries: 500,
});

export const chainsCache = new TtlCache<Chain[]>({
  ttlMs: HOUR,
  staleTtlMs: 24 * HOUR,
  maxEntries: 1,
});

export const tokenCache = new TtlCache<MerklTokenEntry[]>({
  ttlMs: MINUTE,
  staleTtlMs: MINUTE,
  maxEntries: 500,
});

export const rewardTokensCache = new TtlCache<MerklTokenEntry[]>({
  ttlMs: 10 * MINUTE,
  staleTtlMs: HOUR,
  maxEntries: 100,
});
