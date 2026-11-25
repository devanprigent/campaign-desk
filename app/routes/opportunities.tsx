// Opportunity list page. The loader is this page's controller: it reads the
// URL, uses the same schema and services as the JSON API, and returns data.
// Filters and pagination live in the URL, so the page works without JS.
import { Form, Link, useSubmit } from "react-router";

import { MerklUnavailableError } from "../../server/clients/merkl";
import { toFieldErrors } from "../../server/errors";
import type { Chain } from "../../server/models/chain";
import {
  OPPORTUNITY_ACTIONS,
  OPPORTUNITY_STATUSES,
  type Opportunity,
} from "../../server/models/opportunity";
import { listChains } from "../../server/services/chain.service";
import { opportunityListQuerySchema } from "../../server/schemas/opportunity.schema";
import { listOpportunities } from "../../server/services/opportunity.service";
import { formatApr, formatUsd } from "../utils/format";
import type { Route } from "./+types/opportunities";

type Query = Record<string, string>;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Opportunities · Campaign Desk" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const query: Query = Object.fromEntries(new URL(request.url).searchParams);
  // Started in parallel; if Merkl's chain list fails, the chain filter
  // falls back to a plain number input instead of breaking the page.
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
    if (error instanceof MerklUnavailableError) {
      return { status: "unavailable" as const };
    }
    throw error;
  }
}

export default function Opportunities({ loaderData }: Route.ComponentProps) {
  const { query, chains, result } = loaderData;
  return (
    <main>
      <h1>Opportunities</h1>
      <Filters query={query} chains={chains} />
      {result.status === "unavailable" && (
        <p role="alert">Merkl is unavailable right now. Please try again in a moment.</p>
      )}
      {result.status === "invalid" && (
        <ul role="alert">
          {result.fields.map((f) => (
            <li key={f.field}>
              Invalid <code>{f.field}</code>: {f.message}
            </li>
          ))}
        </ul>
      )}
      {result.status === "ok" && (
        <>
          <OpportunityTable items={result.page.items} />
          <Pagination query={query} page={result.page.page} hasNextPage={result.page.hasNextPage} />
        </>
      )}
    </main>
  );
}

function Filters({ query, chains }: { query: Query; chains: Chain[] | null }) {
  const submit = useSubmit();

  // Any change reloads the page with the new filters, dropping empty fields
  // and the page number (a new filter starts again at page 1).
  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value !== "") params.set(name, value);
    }
    submit(params, { method: "get" });
  }

  // key: remount when the URL changes, so the fields show the current filters
  // after a client-side navigation (defaultValue is only read on mount).
  return (
    <Form method="get" key={new URLSearchParams(query).toString()} onChange={handleChange}>
      <label>
        Chain{" "}
        {chains ? (
          <select name="chainId" defaultValue={query.chainId ?? ""}>
            <option value="">All chains</option>
            {chains.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input type="number" name="chainId" min={1} placeholder="Chain ID" defaultValue={query.chainId} />
        )}
      </label>{" "}
      <label>
        Action{" "}
        <select name="action" defaultValue={query.action?.toUpperCase() ?? ""}>
          <option value="">All actions</option>
          {OPPORTUNITY_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>{" "}
      <label>
        Status{" "}
        <select name="status" defaultValue={query.status?.toUpperCase() ?? ""}>
          <option value="">All statuses</option>
          {OPPORTUNITY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>{" "}
      {query.pageSize && <input type="hidden" name="pageSize" value={query.pageSize} />}
      {/* Without JS, onChange never fires: this button keeps the form usable. */}
      <noscript>
        <button type="submit">Apply</button>
      </noscript>
    </Form>
  );
}

function Pagination({ query, page, hasNextPage }: { query: Query; page: number; hasNextPage: boolean }) {
  return (
    <nav aria-label="Pagination">
      {page > 0 ? <Link to={pageHref(query, page - 1)}>← Previous</Link> : <span>← Previous</span>}
      {" · "}Page {page + 1}{" · "}
      {hasNextPage ? <Link to={pageHref(query, page + 1)}>Next →</Link> : <span>Next →</span>}
    </nav>
  );
}

// Same URL with only the page changed, so filters are kept across pages.
function pageHref(query: Query, page: number): string {
  const params = new URLSearchParams(query);
  if (page === 0) params.delete("page");
  else params.set("page", String(page));
  return `?${params}`;
}

function OpportunityTable({ items }: { items: Opportunity[] }) {
  if (items.length === 0) return <p>No opportunities match these filters.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Chain</th>
          <th>Protocol</th>
          <th>Action</th>
          <th>Status</th>
          <th>TVL</th>
          <th>APR</th>
          <th>Daily rewards</th>
        </tr>
      </thead>
      <tbody>
        {items.map((o) => (
          <tr key={o.id}>
            <td>
              <Link to={`/opportunities/${o.id}`}>{o.name}</Link>
            </td>
            <td>{o.chainName}</td>
            <td>{o.protocolName ?? "—"}</td>
            <td>{o.action}</td>
            <td>{o.status}</td>
            <td>{formatUsd(o.tvlUsd)}</td>
            <td>{formatApr(o.apr)}</td>
            <td>{formatUsd(o.dailyRewardsUsd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
