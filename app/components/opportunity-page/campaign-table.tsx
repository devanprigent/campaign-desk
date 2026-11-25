import type { Campaign } from "../../../server/models/campaign";
import { formatDateTime, formatUnits } from "../../utils/format";

export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) return <p>No campaigns on this opportunity yet.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th className="num">Amount</th>
          <th className="num">Fee (3%)</th>
          <th className="num">Total cost</th>
          <th>Start</th>
          <th>End</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <tr key={c.id}>
            <td>{c.tokenSymbol}</td>
            <td className="num">{formatUnits(c.amount, c.tokenDecimals)}</td>
            <td className="num">{formatUnits(c.fee, c.tokenDecimals)}</td>
            <td className="num">{formatUnits(c.totalCost, c.tokenDecimals)}</td>
            <td>{formatDateTime(c.startAt)}</td>
            <td>{formatDateTime(c.endAt)}</td>
            <td>{formatDateTime(c.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
