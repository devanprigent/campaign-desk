// Wiring only: method + path → controller. Mounted under
// /opportunities/:opportunityId/campaigns, hence mergeParams.
import { Router } from "express";

import * as campaignsController from "../controllers/campaigns.controller";

export const campaignsRoutes = Router({ mergeParams: true });

campaignsRoutes.post("/", campaignsController.create);
