// Mounts the API sub-routers, then the JSON 404 and error handlers so that
// /api never falls through to the HTML pages.
import { Router } from "express";

import { errorHandler, notFoundHandler } from "./error-handler";
import { chainsRoutes } from "./routes/chains.routes";
import { opportunitiesRoutes } from "./routes/opportunities.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/chains", chainsRoutes);
apiRouter.use("/opportunities", opportunitiesRoutes);

apiRouter.use(notFoundHandler);
apiRouter.use(errorHandler);
