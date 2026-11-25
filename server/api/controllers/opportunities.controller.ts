// HTTP ↔ use case translation for opportunities: parse the query string,
// call the service, send JSON. No business logic, no Merkl calls.
import type { Request, Response } from "express";

import { getOpportunity, listOpportunities } from "../../services/opportunity.service";
import { opportunityListQuerySchema } from "../../schemas/opportunity.schema";

export async function list(req: Request, res: Response): Promise<void> {
  const { filters, pagination } = opportunityListQuerySchema.parse(req.query);
  res.json(await listOpportunities(filters, pagination));
}

export async function get(req: Request<{ opportunityId: string }>, res: Response): Promise<void> {
  res.json({ opportunity: await getOpportunity(req.params.opportunityId) });
}
