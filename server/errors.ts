// Errors shared across layers. They carry no HTTP status: mapping them to a
// response is the job of api/error-handler.ts (and of the React Router actions).

export type FieldError = { field: string; message: string; rule?: string };

/** The input is malformed (wrong type, missing field, bad format). */
export class ValidationError extends Error {
  constructor(readonly fields: FieldError[]) {
    super(fields.map((f) => `${f.field}: ${f.message}`).join("; "));
    this.name = "ValidationError";
  }
}

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
