import type { Opportunity } from "../../../server/models/opportunity";
import { formatApr, formatUsd } from "../../utils/format";

export function OpportunityDetails({ opportunity: o }: { opportunity: Opportunity }) {
  return (
    <>
      <h1>{o.name}</h1>
      <dl>
        <dt>Chain</dt>
        <dd>{o.chainName}</dd>
        <dt>Protocol</dt>
        <dd>{o.protocolName ?? "—"}</dd>
        <dt>Action</dt>
        <dd>{o.action}</dd>
        <dt>Status</dt>
        <dd>{o.status}</dd>
        <dt>TVL</dt>
        <dd>{formatUsd(o.tvlUsd)}</dd>
        <dt>APR</dt>
        <dd>{formatApr(o.apr)}</dd>
        <dt>Daily rewards</dt>
        <dd>{formatUsd(o.dailyRewardsUsd)}</dd>
      </dl>
    </>
  );
}
