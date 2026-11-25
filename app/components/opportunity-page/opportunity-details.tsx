import type { Opportunity } from "../../../server/models/opportunity";
import { formatApr, formatUsd } from "../../utils/format";

export function OpportunityDetails({ opportunity: o }: { opportunity: Opportunity }) {
  const details = [
    ["Chain", o.chainName],
    ["Protocol", o.protocolName ?? "—"],
    ["Action", o.action],
    ["Status", o.status],
    ["TVL", formatUsd(o.tvlUsd)],
    ["APR", formatApr(o.apr)],
    ["Daily rewards", formatUsd(o.dailyRewardsUsd)],
  ];
  return (
    <>
      <h1>{o.name}</h1>
      <dl>
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
