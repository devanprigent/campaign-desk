// Errors shared across layers. They carry no HTTP status: mapping them to a
// response is the job of api/error-handler.ts (and of the React Router actions).
// Malformed input is reported by zod (ZodError), turned into FieldErrors below.
import type { z } from "zod";

export type FieldError = { field: string; message: string; rule?: string };

/** The input is well-formed but refused by a business rule. */
export class RejectionError extends Error {
  constructor(readonly fields: FieldError[]) {
    super(fields.map((f) => `${f.field}: ${f.message}`).join("; "));
    this.name = "RejectionError";
  }
}

export class NotFoundError extends Error {
  constructor(readonly resource: string, readonly id: string) {
    super(`${resource} ${id} not found`);
    this.name = "NotFoundError";
  }
}

/** Merkl timed out, was unreachable or answered 5xx. Thrown by clients/merkl.ts. */
export class MerklUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Merkl API is unavailable", { cause });
    this.name = "MerklUnavailableError";
  }
}

/** One FieldError per field (its first issue), so each field shows one message. */
export function toFieldErrors(error: z.ZodError): FieldError[] {
  const fields: FieldError[] = [];
  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "body";
    if (!fields.some((f) => f.field === field)) fields.push({ field, message: issue.message });
  }
  return fields;
}
