// Mounts the API sub-routers, then the JSON 404 and error handlers so that
// /api never falls through to the HTML pages.
import express, { Router } from "express";

import { errorHandler, notFoundHandler } from "./error-handler";
import { campaignsRoutes } from "./routes/campaigns.routes";
import { chainsRoutes } from "./routes/chains.routes";
import { opportunitiesRoutes } from "./routes/opportunities.routes";

export const apiRouter = Router();

// Inside the router so that malformed JSON reaches errorHandler below.
apiRouter.use(express.json());

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/chains", chainsRoutes);
apiRouter.use("/opportunities", opportunitiesRoutes);
apiRouter.use("/opportunities/:opportunityId/campaigns", campaignsRoutes);

apiRouter.use(notFoundHandler);
apiRouter.use(errorHandler);
