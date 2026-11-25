import { Link } from "react-router";

import { CampaignForm } from "../components/opportunity-page/campaign-form";
import { CampaignTable } from "../components/opportunity-page/campaign-table";
import { CreatedBanner } from "../components/opportunity-page/created-banner";
import { OpportunityDetails } from "../components/opportunity-page/opportunity-details";
import { createCampaignFromForm, loadOpportunityPage } from "../controllers/opportunity-page.server";
import type { Route } from "./+types/opportunity";

export function meta({ loaderData }: Route.MetaArgs) {
  const name = loaderData?.opportunity.status === "ok" ? loaderData.opportunity.value.name : "Opportunity";
  return [{ title: `${name} · Campaign Desk` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return loadOpportunityPage(params.opportunityId, request);
}

export async function action({ params, request }: Route.ActionArgs) {
  return createCampaignFromForm(params.opportunityId, request);
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
