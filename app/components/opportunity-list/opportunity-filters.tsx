import { Form, useSubmit } from "react-router";

import type { Chain } from "../../../server/models/chain";
import { OPPORTUNITY_ACTIONS, OPPORTUNITY_STATUSES } from "../../../server/models/opportunity";
import { nonEmptyParams, type Query } from "../../utils/search-params";

export function OpportunityFilters({ query, chains }: { query: Query; chains: Chain[] | null }) {
  const submit = useSubmit();

  return (
    <Form
      method="get"
      key={new URLSearchParams(query).toString()}
      onChange={(event) => submit(nonEmptyParams(event.currentTarget), { method: "get" })}
    >
      <label>
        Chain{" "}
        {chains ? (
          <select name="chainId" defaultValue={query.chainId ?? ""}>
            <option value="">All chains</option>
            {chains.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input type="number" name="chainId" min={1} placeholder="Chain ID" defaultValue={query.chainId} />
        )}
      </label>{" "}
      <label>
        Action{" "}
        <select name="action" defaultValue={query.action?.toUpperCase() ?? ""}>
          <option value="">All actions</option>
          {OPPORTUNITY_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>{" "}
      <label>
        Status{" "}
        <select name="status" defaultValue={query.status?.toUpperCase() ?? ""}>
          <option value="">All statuses</option>
          {OPPORTUNITY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>{" "}
      {query.pageSize && <input type="hidden" name="pageSize" value={query.pageSize} />}
      <noscript>
        <button type="submit">Apply</button>
      </noscript>
    </Form>
  );
}
