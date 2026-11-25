// HTTP ↔ use case translation for campaigns: parse the body, call the
// service, send JSON. Amounts go out as strings (JSON has no bigint).
import type { Request, Response } from "express";

import type { Campaign } from "../../models/campaign";
import { createCampaign, listCampaigns } from "../../services/campaign.service";
import { createCampaignBodySchema } from "../../schemas/campaign.schema";

export async function list(req: Request<{ opportunityId: string }>, res: Response): Promise<void> {
  const campaigns = await listCampaigns(req.params.opportunityId);
  res.json({ items: campaigns.map(toJson) });
}

export async function create(req: Request<{ opportunityId: string }>, res: Response): Promise<void> {
  const input = createCampaignBodySchema.parse(req.body);
  const campaign = await createCampaign(req.params.opportunityId, input);
  res.status(201).json({ campaign: toJson(campaign) });
}

function toJson(campaign: Campaign) {
  return {
    ...campaign,
    amount: campaign.amount.toString(),
    fee: campaign.fee.toString(),
    totalCost: campaign.totalCost.toString(),
  };
}
