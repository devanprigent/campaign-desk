// Opportunity use cases. Callers (API controllers, React Router loaders)
// go through here and never call the Merkl client directly.
import { fetchOpportunities } from "../clients/merkl";
import type {
  Opportunity,
  OpportunityFilters,
  Page,
  Pagination,
} from "../models/opportunity";

export async function listOpportunities(
  filters: OpportunityFilters,
  pagination: Pagination,
): Promise<Page<Opportunity>> {
  const { items, hasNextPage } = await fetchOpportunities(filters, pagination);
  return { items, hasNextPage, ...pagination };
}
