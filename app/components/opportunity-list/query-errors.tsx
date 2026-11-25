import type { FieldError } from "../../../server/errors";

export function QueryErrors({ fields }: { fields: FieldError[] }) {
  return (
    <ul role="alert">
      {fields.map((f) => (
        <li key={f.field}>
          Invalid <code>{f.field}</code>: {f.message}
        </li>
      ))}
    </ul>
  );
}
