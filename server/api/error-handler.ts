// Maps errors thrown by any layer to a JSON response. The only place in the
// API that decides status codes for errors.
import type { ErrorRequestHandler, RequestHandler } from "express";

import { MerklUnavailableError } from "../clients/merkl";
import { ValidationError } from "../errors";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: "not_found", message: `No route for ${req.method} ${req.originalUrl}` },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: { code: "validation_error", message: "Invalid request", fields: error.fields },
    });
    return;
  }
  if (error instanceof MerklUnavailableError) {
    res.status(503).json({
      error: { code: "merkl_unavailable", message: "Merkl is unavailable, try again later" },
    });
    return;
  }
  console.error(error);
  res.status(500).json({
    error: { code: "internal_error", message: "Unexpected error" },
  });
};
