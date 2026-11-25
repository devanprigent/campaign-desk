// Cache policy for Merkl responses: what is cached, for how long, and how old
// a value may be served while Merkl is down. In-process (no Redis), one
// instance per process. Only clients/merkl.ts uses these.
// Caches hold validated, mapped data: an invalid response is never cached.
import { TtlCache } from "../lib/cache";
import type { Chain } from "../models/chain";
import type { Opportunity } from "../models/opportunity";
import type { MerklTokenEntry } from "../schemas/merkl.schema";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const opportunityListCache = new TtlCache<Opportunity[]>({
  ttlMs: MINUTE, // opportunities change slowly
  staleTtlMs: HOUR, // serve up to 1h old data while Merkl is down
  maxEntries: 500, // one entry per filters + page combination
});

export const opportunityCache = new TtlCache<Opportunity | null>({
  ttlMs: MINUTE,
  staleTtlMs: HOUR,
  maxEntries: 500, // one entry per opportunity id
});

export const chainsCache = new TtlCache<Chain[]>({
  ttlMs: HOUR, // chains are added rarely
  staleTtlMs: 24 * HOUR,
  maxEntries: 1,
});

// BR-1 values a campaign at the token's *current* price: never serve a stale
// price (staleTtlMs = ttlMs), refuse with MerklUnavailableError instead.
export const tokenCache = new TtlCache<MerklTokenEntry[]>({
  ttlMs: MINUTE,
  staleTtlMs: MINUTE,
  maxEntries: 500, // one entry per chain + address
});

// Only feeds the token picker: BR-1 always re-reads the price via tokenCache.
export const rewardTokensCache = new TtlCache<MerklTokenEntry[]>({
  ttlMs: 10 * MINUTE,
  staleTtlMs: HOUR,
  maxEntries: 100, // one entry per chain
});
