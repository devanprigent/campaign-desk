// Wiring only: method + path → controller.
import { Router } from "express";

import * as chainsController from "../controllers/chains.controller";

export const chainsRoutes = Router();

chainsRoutes.get("/", chainsController.list);
