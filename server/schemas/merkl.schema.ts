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

export const merklTokenSchema = z
  .object({
    chainId: z.number().int(),
    address: z.string(),
    symbol: z.string(),
    decimals: z.number().int().min(0).max(255),
    verified: z.boolean().optional(),
    price: z.number().nonnegative().nullish().catch(null),
  })
  .transform(({ verified, price, ...token }) => ({
    verified: verified ?? false,
    token: { ...token, priceUsd: price ?? null } satisfies Token,
  }));

export type MerklTokenEntry = z.output<typeof merklTokenSchema>;
