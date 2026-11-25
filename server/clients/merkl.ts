// Read-only access to Merkl's public API: HTTP call, timeout, cache, and
// mapping from Merkl's JSON to our types. No business rules here.
import { TtlCache } from "../lib/cache";
import type { Chain } from "../models/chain";
import type { Token } from "../models/token";
import type {
  Opportunity,
  OpportunityFilters,
  Pagination,
} from "../models/opportunity";

const MERKL_API_URL = "https://api.merkl.xyz/v4";
const REQUEST_TIMEOUT_MS = 3_000;

export class MerklUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Merkl API is unavailable", { cause });
    this.name = "MerklUnavailableError";
  }
}

// Subset of Merkl's opportunity payload that we actually read.
type MerklOpportunity = {
  id: string;
  name: string;
  chainId: number;
  chain?: { name?: string };
  protocol?: { name?: string } | null;
  action: string;
  status: string;
  tvl?: number;
  apr?: number;
  dailyRewards?: number;
};

const opportunityListCache = new TtlCache<MerklOpportunity[]>({
  ttlMs: 60_000, // opportunities change slowly
  staleTtlMs: 60 * 60_000, // serve up to 1h old data while Merkl is down
  maxEntries: 500, // one entry per filters + page combination
});

type MerklChain = { id: number; name: string };

const chainsCache = new TtlCache<MerklChain[]>({
  ttlMs: 60 * 60_000, // chains are added rarely
  staleTtlMs: 24 * 60 * 60_000,
  maxEntries: 1,
});

type MerklToken = {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  verified?: boolean;
  price?: number | null;
};

const opportunityCache = new TtlCache<MerklOpportunity | null>({
  ttlMs: 60_000,
  staleTtlMs: 60 * 60_000,
  maxEntries: 500,
});

// BR-1 values a campaign at the token's *current* price: never serve a stale
// price (staleTtlMs = ttlMs), refuse with MerklUnavailableError instead.
const tokenCache = new TtlCache<MerklToken[]>({
  ttlMs: 60_000,
  staleTtlMs: 60_000,
  maxEntries: 500,
});

async function getJson<T>(path: string, query: URLSearchParams): Promise<T>;
async function getJson<T>(
  path: string,
  query: URLSearchParams,
  options: { notFoundAsNull: true },
): Promise<T | null>;
async function getJson<T>(
  path: string,
  query: URLSearchParams,
  options?: { notFoundAsNull: true },
): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${MERKL_API_URL}${path}?${query}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.warn(`Merkl ${path} failed:`, error);
    throw new MerklUnavailableError(error); // network error or timeout
  }
  if (response.status >= 500) {
    console.warn(`Merkl ${path} responded ${response.status}`);
    throw new MerklUnavailableError(new Error(`Merkl responded ${response.status}`));
  }
  if (response.status === 404 && options?.notFoundAsNull) return null;
  if (!response.ok) {
    // A 4xx means we built a bad request: a bug on our side, not an outage.
    throw new Error(`Merkl rejected ${path}?${query}: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T;
}

function toOpportunity(raw: MerklOpportunity): Opportunity {
  return {
    id: raw.id,
    name: raw.name,
    chainId: raw.chainId,
    chainName: raw.chain?.name ?? String(raw.chainId),
    protocolName: raw.protocol?.name ?? null,
    action: raw.action,
    status: raw.status,
    tvlUsd: raw.tvl ?? 0,
    apr: raw.apr ?? 0,
    dailyRewardsUsd: raw.dailyRewards ?? 0,
  };
}

/**
 * Fetches one page of opportunities. Asks Merkl for `pageSize + 1` items so the
 * caller knows whether a next page exists without a separate count request.
 */
export async function fetchOpportunities(
  filters: OpportunityFilters,
  { page, pageSize }: Pagination,
): Promise<{ items: Opportunity[]; hasNextPage: boolean }> {
  const query = new URLSearchParams({
    page: String(page),
    items: String(pageSize + 1),
  });
  if (filters.chainId !== undefined) query.set("chainId", String(filters.chainId));
  if (filters.action !== undefined) query.set("action", filters.action);
  if (filters.status !== undefined) query.set("status", filters.status);
  if (filters.minTvlUsd !== undefined) query.set("minimumTvl", String(filters.minTvlUsd));
  query.sort(); // same filters in any order → same cache key

  const raw = await opportunityListCache.getOrLoad(query.toString(), () =>
    getJson<MerklOpportunity[]>("/opportunities", query),
  );

  return {
    items: raw.slice(0, pageSize).map(toOpportunity),
    hasNextPage: raw.length > pageSize,
  };
}

export async function fetchChains(): Promise<Chain[]> {
  const raw = await chainsCache.getOrLoad("all", () =>
    getJson<MerklChain[]>("/chains", new URLSearchParams()),
  );
  return raw.map(({ id, name }) => ({ id, name }));
}

/** One opportunity by Merkl id, or null if Merkl does not know it. */
export async function fetchOpportunity(id: string): Promise<Opportunity | null> {
  const raw = await opportunityCache.getOrLoad(id, () =>
    getJson<MerklOpportunity>(
      `/opportunities/${encodeURIComponent(id)}`,
      new URLSearchParams(),
      { notFoundAsNull: true },
    ),
  );
  return raw ? toOpportunity(raw) : null;
}

/**
 * A token by chain and address, or null if Merkl does not know it. Merkl can
 * return several entries for one address (different casing); the verified one
 * wins.
 */
export async function fetchToken(chainId: number, address: string): Promise<Token | null> {
  const query = new URLSearchParams({ chainId: String(chainId), address });
  const entries = await tokenCache.getOrLoad(`${chainId}:${address.toLowerCase()}`, () =>
    getJson<MerklToken[]>("/tokens", query),
  );
  const raw = entries.find((t) => t.verified) ?? entries[0];
  if (!raw) return null;
  return {
    chainId: raw.chainId,
    address: raw.address,
    symbol: raw.symbol,
    decimals: raw.decimals,
    priceUsd: typeof raw.price === "number" ? raw.price : null,
  };
}
