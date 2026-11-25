import type { Request, Response } from "express";

import { listChains } from "../../services/chain.service";

export async function list(_req: Request, res: Response): Promise<void> {
  res.json({ items: await listChains() });
}
