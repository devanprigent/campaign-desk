import type { Campaign } from "../../../server/models/campaign";
import { formatDateTime, formatUnits } from "../../utils/format";

export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) return <p>No campaigns on this opportunity yet.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Amount</th>
          <th>Fee (3%)</th>
          <th>Total cost</th>
          <th>Start</th>
          <th>End</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <tr key={c.id}>
            <td>{c.tokenSymbol}</td>
            <td>{formatUnits(c.amount, c.tokenDecimals)}</td>
            <td>{formatUnits(c.fee, c.tokenDecimals)}</td>
            <td>{formatUnits(c.totalCost, c.tokenDecimals)}</td>
            <td>{formatDateTime(c.startAt)}</td>
            <td>{formatDateTime(c.endAt)}</td>
            <td>{formatDateTime(c.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
