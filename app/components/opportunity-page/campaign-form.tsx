import { Form, useNavigation } from "react-router";

import type { FieldError } from "../../../server/errors";
import type { Token } from "../../../server/models/token";

export type CampaignFormResult = {
  values: Record<string, string>;
  fields: FieldError[];
  formError?: string;
};

type Props = {
  tokens: Token[] | null;
  result: CampaignFormResult | undefined;
};

export function CampaignForm({ tokens, result }: Props) {
  const submitting = useNavigation().state === "submitting";
  const values = result?.values ?? {};

  return (
    <details open={result !== undefined}>
      <summary>New campaign</summary>
      <Form method="post" key={JSON.stringify(values)} noValidate>
        {result?.formError && <p role="alert">{result.formError}</p>}

        <Field label="Reward token" name="tokenAddress" result={result}>
          {tokens ? (
            <select id="tokenAddress" name="tokenAddress" required defaultValue={values.tokenAddress ?? ""}>
              <option value="" disabled>
                Choose a token
              </option>
              {tokens.map((t) => (
                <option key={t.address} value={t.address}>
                  {t.symbol} · {t.address.slice(0, 6)}…{t.address.slice(-4)}
                  {t.priceUsd === null ? " (no Merkl price)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <input id="tokenAddress" name="tokenAddress" required placeholder="0x…" defaultValue={values.tokenAddress} />
          )}
        </Field>

        <Field label="Total amount (in tokens)" name="amount" result={result}>
          <input id="amount" name="amount" inputMode="decimal" required placeholder="1000" defaultValue={values.amount} />
        </Field>

        <Field label="Start (UTC)" name="startAt" result={result}>
          <input id="startAt" name="startAt" type="datetime-local" required defaultValue={values.startAt} />
        </Field>

        <Field label="End (UTC)" name="endAt" result={result}>
          <input id="endAt" name="endAt" type="datetime-local" required defaultValue={values.endAt} />
        </Field>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create campaign"}
        </button>
      </Form>
    </details>
  );
}

function Field({
  label,
  name,
  result,
  children,
}: {
  label: string;
  name: string;
  result: CampaignFormResult | undefined;
  children: React.ReactNode;
}) {
  const errors = result?.fields.filter((f) => f.field === name) ?? [];
  return (
    <p>
      <label htmlFor={name}>{label}</label> {children}
      {errors.map((e) => (
        <strong key={e.message} role="alert">
          {" "}
          {e.rule ? `${e.rule}: ` : ""}
          {e.message}
        </strong>
      ))}
    </p>
  );
}
