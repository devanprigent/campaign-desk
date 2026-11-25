import { OpportunityFilters } from "../components/opportunity-list/opportunity-filters";
import { OpportunityTable } from "../components/opportunity-list/opportunity-table";
import { Pagination } from "../components/opportunity-list/pagination";
import { QueryErrors } from "../components/opportunity-list/query-errors";
import { loadOpportunityList } from "../controllers/opportunity-list.server";
import type { Route } from "./+types/opportunities";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Opportunities · Campaign Desk" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  return loadOpportunityList(request);
}

export default function Opportunities({ loaderData }: Route.ComponentProps) {
  const { query, chains, result } = loaderData;
  return (
    <main>
      <h1>Opportunities</h1>
      <OpportunityFilters query={query} chains={chains} />
      {result.status === "unavailable" && (
        <p role="alert">Merkl is unavailable right now. Please try again in a moment.</p>
      )}
      {result.status === "invalid" && <QueryErrors fields={result.fields} />}
      {result.status === "ok" && (
        <>
          <OpportunityTable items={result.page.items} />
          <Pagination query={query} page={result.page.page} hasNextPage={result.page.hasNextPage} />
        </>
      )}
    </main>
  );
}
