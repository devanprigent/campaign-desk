import { Router } from "express";

import * as campaignsController from "../controllers/campaigns.controller";

export const campaignsRoutes = Router({ mergeParams: true });

campaignsRoutes.get("/", campaignsController.list);
campaignsRoutes.post("/", campaignsController.create);
