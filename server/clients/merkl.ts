import { z } from "zod";

import { MerklUnavailableError } from "../errors";
import type { Chain } from "../models/chain";
import type { Token } from "../models/token";
import type {
  Opportunity,
  OpportunityFilters,
  Pagination,
} from "../models/opportunity";
import {
  merklChainSchema,
  merklOpportunitySchema,
  merklTokenSchema,
  type MerklTokenEntry,
} from "../schemas/merkl.schema";
import {
  chainsCache,
  opportunityCache,
  opportunityListCache,
  rewardTokensCache,
  tokenCache,
} from "./merkl.cache";

const MERKL_API_URL = "https://api.merkl.xyz/v4";
const REQUEST_TIMEOUT_MS = 3_000;

async function getJson<S extends z.ZodType>(
  path: string,
  query: URLSearchParams,
  schema: S,
): Promise<z.output<S>>;
async function getJson<S extends z.ZodType>(
  path: string,
  query: URLSearchParams,
  schema: S,
  options: { notFoundAsNull: true },
): Promise<z.output<S> | null>;
async function getJson<S extends z.ZodType>(
  path: string,
  query: URLSearchParams,
  schema: S,
  options?: { notFoundAsNull: true },
): Promise<z.output<S> | null> {
  let response: Response;
  try {
    response = await fetch(`${MERKL_API_URL}${path}?${query}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.warn(`Merkl ${path} failed:`, error);
    throw new MerklUnavailableError(error);
  }
  if (response.status >= 500) {
    console.warn(`Merkl ${path} responded ${response.status}`);
    throw new MerklUnavailableError(new Error(`Merkl responded ${response.status}`));
  }
  if (response.status === 404 && options?.notFoundAsNull) return null;
  if (!response.ok) {
    throw new Error(`Merkl rejected ${path}?${query}: ${response.status} ${await response.text()}`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.warn(`Merkl ${path} returned a non-JSON body`);
    throw new MerklUnavailableError(error);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.warn(`Merkl ${path} returned an unexpected shape:`, z.prettifyError(parsed.error));
    throw new MerklUnavailableError(parsed.error);
  }
  return parsed.data;
}

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
  query.sort();

  const opportunities = await opportunityListCache.getOrLoad(query.toString(), () =>
    getJson("/opportunities", query, z.array(merklOpportunitySchema)),
  );
  return {
    items: opportunities.slice(0, pageSize),
    hasNextPage: opportunities.length > pageSize,
  };
}

export async function fetchOpportunity(id: string): Promise<Opportunity | null> {
  return opportunityCache.getOrLoad(id, () =>
    getJson(`/opportunities/${encodeURIComponent(id)}`, new URLSearchParams(), merklOpportunitySchema, {
      notFoundAsNull: true,
    }),
  );
}

export async function fetchChains(): Promise<Chain[]> {
  return chainsCache.getOrLoad("all", () =>
    getJson("/chains", new URLSearchParams(), z.array(merklChainSchema)),
  );
}

export async function fetchToken(chainId: number, address: string): Promise<Token | null> {
  const query = new URLSearchParams({ chainId: String(chainId), address });
  const entries = await tokenCache.getOrLoad(`${chainId}:${address.toLowerCase()}`, () =>
    getJson("/tokens", query, z.array(merklTokenSchema)),
  );
  return (entries.find((e) => e.verified) ?? entries[0])?.token ?? null;
}

export async function fetchRewardTokens(chainId: number): Promise<Token[]> {
  const entries = await rewardTokensCache.getOrLoad(String(chainId), () =>
    getJson(`/tokens/reward/${chainId}`, new URLSearchParams(), z.array(merklTokenSchema)),
  );
  const byAddress = new Map<string, MerklTokenEntry>();
  for (const entry of entries) {
    const key = entry.token.address.toLowerCase();
    const kept = byAddress.get(key);
    if (!kept || (!kept.verified && entry.verified)) byAddress.set(key, entry);
  }
  return [...byAddress.values()].map((e) => e.token);
}
