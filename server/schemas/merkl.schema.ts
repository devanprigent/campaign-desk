// Shape of Merkl's responses. Validated at the boundary (clients/merkl.ts)
// before anything is cached or used, and mapped to our own types, so the rest
// of the app never sees Merkl's format. Unknown fields are dropped.
import { z } from "zod";

import type { Chain } from "../models/chain";
import type { Opportunity } from "../models/opportunity";
import type { Token } from "../models/token";

export const merklOpportunitySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    chainId: z.number().int(),
    chain: z.object({ name: z.string() }).optional(),
    protocol: z.object({ name: z.string() }).nullish(),
    action: z.string(),
    status: z.string(),
    tvl: z.number().nullish(),
    apr: z.number().nullish(),
    dailyRewards: z.number().nullish(),
  })
  .transform(
    (raw): Opportunity => ({
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
    }),
  );

export const merklChainSchema = z.object({
  id: z.number().int(),
  name: z.string(),
}) satisfies z.ZodType<Chain>;

/**
 * Keeps `verified` next to the token: Merkl may return one address several
 * times, and the client prefers the verified entry. `decimals` and `price`
 * feed BR-1 and BR-2, hence the strict checks.
 */
export const merklTokenSchema = z
  .object({
    chainId: z.number().int(),
    address: z.string(),
    symbol: z.string(),
    decimals: z.number().int().min(0).max(255),
    verified: z.boolean().optional(),
    // An unusable price (negative, not a number) counts as no price: BR-1
    // then refuses the token instead of the whole token list failing.
    price: z.number().nonnegative().nullish().catch(null),
  })
  .transform(({ verified, price, ...token }) => ({
    verified: verified ?? false,
    token: { ...token, priceUsd: price ?? null } satisfies Token,
  }));

export type MerklTokenEntry = z.output<typeof merklTokenSchema>;
