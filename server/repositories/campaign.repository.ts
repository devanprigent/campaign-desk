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

export async function findCampaignsByOpportunity(opportunityId: string): Promise<Campaign[]> {
  const rows = await prisma.campaign.findMany({
    where: { opportunityId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCampaign);
}

function toCampaign(row: CampaignRow): Campaign {
  const amount = BigInt(row.amount);
  const fee = BigInt(row.fee);
  return { ...row, amount, fee, totalCost: amount + fee };
}
