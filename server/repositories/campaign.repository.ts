// Campaign persistence. The only module that talks to Prisma about campaigns;
// converts between database rows (amounts as text) and our Campaign model.
import type { Campaign as CampaignRow } from "../../generated/prisma/client";
import { prisma } from "../db/client";
import type { Campaign } from "../models/campaign";

export type CampaignToSave = Omit<Campaign, "id" | "createdAt" | "totalCost">;

export async function insertCampaign(data: CampaignToSave): Promise<Campaign> {
  const row = await prisma.campaign.create({
    data: { ...data, amount: data.amount.toString(), fee: data.fee.toString() },
  });
  return toCampaign(row);
}

function toCampaign(row: CampaignRow): Campaign {
  const amount = BigInt(row.amount);
  const fee = BigInt(row.fee);
  return { ...row, amount, fee, totalCost: amount + fee };
}
