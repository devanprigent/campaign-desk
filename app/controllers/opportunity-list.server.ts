import { MerklUnavailableError, toFieldErrors } from "../../server/errors";
import { opportunityListQuerySchema } from "../../server/schemas/opportunity.schema";
import { listChains } from "../../server/services/chain.service";
import { listOpportunities } from "../../server/services/opportunity.service";
import { toQuery, type Query } from "../utils/search-params";

export async function loadOpportunityList(request: Request) {
  const query = toQuery(request.url);
  const chains = listChains().catch(() => null);
  const result = loadOpportunities(query);
  return { query, chains: await chains, result: await result };
}

async function loadOpportunities(query: Query) {
  const parsed = opportunityListQuerySchema.safeParse(query);
  if (!parsed.success) return { status: "invalid" as const, fields: toFieldErrors(parsed.error) };
  try {
    const page = await listOpportunities(parsed.data.filters, parsed.data.pagination);
    return { status: "ok" as const, page };
  } catch (error) {
    if (error instanceof MerklUnavailableError) return { status: "unavailable" as const };
    throw error;
  }
}
