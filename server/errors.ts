// Errors shared across layers. They carry no HTTP status: mapping them to a
// response is the job of api/error-handler.ts (and of the React Router actions).

export type FieldError = { field: string; message: string };

export class ValidationError extends Error {
  constructor(readonly fields: FieldError[]) {
    super(fields.map((f) => `${f.field}: ${f.message}`).join("; "));
    this.name = "ValidationError";
  }
}
