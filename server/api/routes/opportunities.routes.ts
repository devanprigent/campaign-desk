// Wiring only: method + path → controller.
import { Router } from "express";

import * as opportunitiesController from "../controllers/opportunities.controller";

export const opportunitiesRoutes = Router();

opportunitiesRoutes.get("/", opportunitiesController.list);
