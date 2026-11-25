// Opportunity page: Merkl data for one opportunity and the campaigns created
// on it. The loader calls the same services as the JSON API.
import { data, Link } from "react-router";

import { MerklUnavailableError } from "../../server/clients/merkl";
import { NotFoundError } from "../../server/errors";
import type { Campaign } from "../../server/models/campaign";
import type { Opportunity } from "../../server/models/opportunity";
import { listCampaigns } from "../../server/services/campaign.service";
import { getOpportunity } from "../../server/services/opportunity.service";
import { formatApr, formatDateTime, formatUnits, formatUsd } from "../utils/format";
import type { Route } from "./+types/opportunity";

export function meta({ loaderData }: Route.MetaArgs) {
  const name = loaderData?.opportunity.status === "ok" ? loaderData.opportunity.value.name : "Opportunity";
  return [{ title: `${name} · Campaign Desk` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  // In parallel. Campaigns come from our database only, so they are still
  // shown when Merkl is down.
  const [opportunity, campaigns] = await Promise.all([
    loadOpportunity(params.opportunityId),
    listCampaigns(params.opportunityId),
  ]);
  return { opportunity, campaigns };
}

async function loadOpportunity(id: string) {
  try {
    return { status: "ok" as const, value: await getOpportunity(id) };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw data("Opportunity not found", { status: 404 }); // rendered by root ErrorBoundary
    }
    if (error instanceof MerklUnavailableError) return { status: "unavailable" as const };
    throw error;
  }
}

export default function OpportunityPage({ loaderData }: Route.ComponentProps) {
  const { opportunity, campaigns } = loaderData;
  return (
    <main>
      <p>
        <Link to="/">← All opportunities</Link>
      </p>
      {opportunity.status === "ok" ? (
        <OpportunityDetails opportunity={opportunity.value} />
      ) : (
        <p role="alert">Merkl is unavailable right now: opportunity details cannot be shown.</p>
      )}
      <h2>Campaigns</h2>
      <CampaignTable campaigns={campaigns} />
    </main>
  );
}

function OpportunityDetails({ opportunity: o }: { opportunity: Opportunity }) {
  return (
    <>
      <h1>{o.name}</h1>
      <dl>
        <dt>Chain</dt>
        <dd>{o.chainName}</dd>
        <dt>Protocol</dt>
        <dd>{o.protocolName ?? "—"}</dd>
        <dt>Action</dt>
        <dd>{o.action}</dd>
        <dt>Status</dt>
        <dd>{o.status}</dd>
        <dt>TVL</dt>
        <dd>{formatUsd(o.tvlUsd)}</dd>
        <dt>APR</dt>
        <dd>{formatApr(o.apr)}</dd>
        <dt>Daily rewards</dt>
        <dd>{formatUsd(o.dailyRewardsUsd)}</dd>
      </dl>
    </>
  );
}

function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) return <p>No campaigns on this opportunity yet.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Amount</th>
          <th>Fee (3%)</th>
          <th>Total cost</th>
          <th>Start</th>
          <th>End</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <tr key={c.id}>
            <td>{c.tokenSymbol}</td>
            <td>{formatUnits(c.amount, c.tokenDecimals)}</td>
            <td>{formatUnits(c.fee, c.tokenDecimals)}</td>
            <td>{formatUnits(c.totalCost, c.tokenDecimals)}</td>
            <td>{formatDateTime(c.startAt)}</td>
            <td>{formatDateTime(c.endAt)}</td>
            <td>{formatDateTime(c.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
