import { createRequestHandler } from "@react-router/express";
import express from "express";

import { apiRouter } from "./api/router";

export const app = express();

app.use("/api", apiRouter);

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
  }),
);
