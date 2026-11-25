import type { z } from "zod";

export type FieldError = { field: string; message: string; rule?: string };

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

export class MerklUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Merkl API is unavailable", { cause });
    this.name = "MerklUnavailableError";
  }
}

export function toFieldErrors(error: z.ZodError): FieldError[] {
  const fields: FieldError[] = [];
  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "body";
    if (!fields.some((f) => f.field === field)) fields.push({ field, message: issue.message });
  }
  return fields;
}
