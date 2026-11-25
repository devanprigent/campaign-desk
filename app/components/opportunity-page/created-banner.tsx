import type { Campaign } from "../../../server/models/campaign";
import { formatUnits } from "../../utils/format";

export function CreatedBanner({ campaign: c }: { campaign: Campaign }) {
  const amount = (value: bigint) => `${formatUnits(value, c.tokenDecimals)} ${c.tokenSymbol}`;
  return (
    <p role="status">
      Campaign created: {amount(c.amount)} of rewards + {amount(c.fee)} fee ={" "}
      <strong>{amount(c.totalCost)} total cost</strong>.
    </p>
  );
}
