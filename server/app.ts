// The Express application: JSON API under /api, every other path is
// server-rendered by React Router.
import { createRequestHandler } from "@react-router/express";
import express from "express";

import { apiRouter } from "./api/router";

export const app = express();

app.use("/api", express.json(), apiRouter);

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
  }),
);
