import { data, Link, redirect } from "react-router";

import {
  MerklUnavailableError,
  NotFoundError,
  RejectionError,
  toFieldErrors,
} from "../../server/errors";
import type { Campaign } from "../../server/models/campaign";
import type { Opportunity } from "../../server/models/opportunity";
import { createCampaignFormSchema } from "../../server/schemas/campaign.schema";
import { createCampaign, listCampaigns } from "../../server/services/campaign.service";
import { getOpportunity } from "../../server/services/opportunity.service";
import { listRewardTokens } from "../../server/services/token.service";
import { CampaignForm, type CampaignFormResult } from "../components/campaign-form";
import { formatApr, formatDateTime, formatUnits, formatUsd } from "../utils/format";
import type { Route } from "./+types/opportunity";

export function meta({ loaderData }: Route.MetaArgs) {
  const name = loaderData?.opportunity.status === "ok" ? loaderData.opportunity.value.name : "Opportunity";
  return [{ title: `${name} · Campaign Desk` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const [opportunity, campaigns] = await Promise.all([
    loadOpportunity(params.opportunityId),
    listCampaigns(params.opportunityId),
  ]);
  const rewardTokens =
    opportunity.status === "ok"
      ? await listRewardTokens(opportunity.value.chainId).catch(() => null)
      : null;
  const createdId = new URL(request.url).searchParams.get("created");
  const created = campaigns.find((c) => c.id === createdId) ?? null;
  return { opportunity, campaigns, rewardTokens, created };
}

export async function action({ params, request }: Route.ActionArgs) {
  const values: Record<string, string> = {};
  for (const [name, value] of await request.formData()) {
    if (typeof value === "string") values[name] = value;
  }
  const parsed = createCampaignFormSchema.safeParse(values);
  if (!parsed.success) {
    return data<CampaignFormResult>({ values, fields: toFieldErrors(parsed.error) }, { status: 400 });
  }
  try {
    const campaign = await createCampaign(params.opportunityId, parsed.data);
    return redirect(`/opportunities/${params.opportunityId}?created=${campaign.id}`);
  } catch (error) {
    if (error instanceof RejectionError) {
      return data<CampaignFormResult>({ values, fields: error.fields }, { status: 422 });
    }
    if (error instanceof MerklUnavailableError) {
      const formError = "Merkl is unavailable: the token price cannot be checked. Try again in a moment.";
      return data<CampaignFormResult>({ values, fields: [], formError }, { status: 503 });
    }
    if (error instanceof NotFoundError) throw data("Opportunity not found", { status: 404 });
    throw error;
  }
}

async function loadOpportunity(id: string) {
  try {
    return { status: "ok" as const, value: await getOpportunity(id) };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw data("Opportunity not found", { status: 404 });
    }
    if (error instanceof MerklUnavailableError) return { status: "unavailable" as const };
    throw error;
  }
}

export default function OpportunityPage({ loaderData, actionData }: Route.ComponentProps) {
  const { opportunity, campaigns, rewardTokens, created } = loaderData;
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
      {created && <CreatedBanner campaign={created} />}
      {opportunity.status === "ok" && <CampaignForm tokens={rewardTokens} result={actionData} />}
      <CampaignTable campaigns={campaigns} />
    </main>
  );
}

function CreatedBanner({ campaign: c }: { campaign: Campaign }) {
  const amount = (value: bigint) => `${formatUnits(value, c.tokenDecimals)} ${c.tokenSymbol}`;
  return (
    <p role="status">
      Campaign created: {amount(c.amount)} of rewards + {amount(c.fee)} fee ={" "}
      <strong>{amount(c.totalCost)} total cost</strong>.
    </p>
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
