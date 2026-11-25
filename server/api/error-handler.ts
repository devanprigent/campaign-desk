// Maps errors thrown by any layer to a JSON response. The only place in the
// API that decides status codes for errors.
import type { ErrorRequestHandler, RequestHandler } from "express";
import { z } from "zod";

import { MerklUnavailableError, NotFoundError, RejectionError, toFieldErrors } from "../errors";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: "not_found", message: `No route for ${req.method} ${req.originalUrl}` },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // Thrown by schema.parse() in controllers: the input is malformed.
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: { code: "validation_error", message: "Invalid request", fields: toFieldErrors(error) },
    });
    return;
  }
  if (error instanceof RejectionError) {
    res.status(422).json({
      error: { code: "rejected", message: "Refused by a business rule", fields: error.fields },
    });
    return;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: { code: "not_found", message: error.message } });
    return;
  }
  if (error instanceof MerklUnavailableError) {
    res.status(503).json({
      error: { code: "merkl_unavailable", message: "Merkl is unavailable, try again later" },
    });
    return;
  }
  // Malformed JSON body, rejected by express.json() before any controller.
  if (error?.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "invalid_json", message: "Body is not valid JSON" } });
    return;
  }
  console.error(error);
  res.status(500).json({
    error: { code: "internal_error", message: "Unexpected error" },
  });
};
