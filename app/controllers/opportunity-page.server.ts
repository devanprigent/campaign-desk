import { data, redirect } from "react-router";

import {
  MerklUnavailableError,
  NotFoundError,
  RejectionError,
  toFieldErrors,
} from "../../server/errors";
import { createCampaignFormSchema } from "../../server/schemas/campaign.schema";
import { createCampaign, listCampaigns } from "../../server/services/campaign.service";
import { getOpportunity } from "../../server/services/opportunity.service";
import { listRewardTokens } from "../../server/services/token.service";
import type { CampaignFormResult } from "../components/opportunity-page/campaign-form";
import { toQuery } from "../utils/search-params";

export async function loadOpportunityPage(opportunityId: string, request: Request) {
  const [opportunity, campaigns] = await Promise.all([
    loadOpportunity(opportunityId),
    listCampaigns(opportunityId),
  ]);
  const rewardTokens =
    opportunity.status === "ok"
      ? await listRewardTokens(opportunity.value.chainId).catch(() => null)
      : null;
  const createdId = toQuery(request.url).created;
  const created = campaigns.find((c) => c.id === createdId) ?? null;
  return { opportunity, campaigns, rewardTokens, created };
}

async function loadOpportunity(id: string) {
  try {
    return { status: "ok" as const, value: await getOpportunity(id) };
  } catch (error) {
    if (error instanceof NotFoundError) throw data("Opportunity not found", { status: 404 });
    if (error instanceof MerklUnavailableError) return { status: "unavailable" as const };
    throw error;
  }
}

export async function createCampaignFromForm(opportunityId: string, request: Request) {
  const values: Record<string, string> = {};
  for (const [name, value] of await request.formData()) {
    if (typeof value === "string") values[name] = value;
  }
  const parsed = createCampaignFormSchema.safeParse(values);
  if (!parsed.success) {
    return data<CampaignFormResult>({ values, fields: toFieldErrors(parsed.error) }, { status: 400 });
  }
  try {
    const campaign = await createCampaign(opportunityId, parsed.data);
    return redirect(`/opportunities/${opportunityId}?created=${campaign.id}`);
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
