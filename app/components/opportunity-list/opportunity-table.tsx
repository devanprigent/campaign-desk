import { Link } from "react-router";

import type { Opportunity } from "../../../server/models/opportunity";
import { formatApr, formatUsd } from "../../utils/format";

export function OpportunityTable({ items }: { items: Opportunity[] }) {
  if (items.length === 0) return <p>No opportunities match these filters.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Chain</th>
          <th>Protocol</th>
          <th>Action</th>
          <th>Status</th>
          <th className="num">TVL</th>
          <th className="num">APR</th>
          <th className="num">Daily rewards</th>
        </tr>
      </thead>
      <tbody>
        {items.map((o) => (
          <tr key={o.id}>
            <td>
              <Link to={`/opportunities/${o.id}`}>{o.name}</Link>
            </td>
            <td>{o.chainName}</td>
            <td>{o.protocolName ?? "—"}</td>
            <td>{o.action}</td>
            <td>
              <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
            </td>
            <td className="num">{formatUsd(o.tvlUsd)}</td>
            <td className="num">{formatApr(o.apr)}</td>
            <td className="num">{formatUsd(o.dailyRewardsUsd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
