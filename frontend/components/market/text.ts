import type { ErrandConstraint, OfferRound } from "@/lib/api";
import { formatDay, money, moneyWhole } from "@/lib/format";

const roundVerb: Record<OfferRound["kind"], string> = {
  quote: "Quote",
  ask: "Asked",
  offer: "Offered",
  counter: "Counter",
  accept: "Accepted",
};

/** "Quote $79.00 × 6", "Asked 18% off", "Quote $85.00 × 6 + $25.00" */
export function roundText(r: OfferRound) {
  const parts = [roundVerb[r.kind]];
  if (r.unitPrice) parts.push(r.quantity ? `${money(r.unitPrice.amount)} × ${r.quantity}` : money(r.unitPrice.amount));
  if (r.percentOff !== undefined) parts.push(`${r.percentOff}% off`);
  if (r.fee) parts.push(`+ ${money(r.fee.amount)}`);
  return parts.join(" ");
}

export function constraintText(c: ErrandConstraint): { label: string; value: string } {
  switch (c.kind) {
    case "item":
      return { label: "Item", value: c.quantity > 1 ? `${c.quantity} ${c.text}` : c.text };
    case "budget":
      return { label: "Budget", value: `Under ${moneyWhole(c.max.amount)}` };
    case "deadline":
      return { label: "Deliver by", value: formatDay(c.by) };
    case "sellers":
      return { label: "Sellers", value: c.verifiedOnly ? "Verified only" : "Any" };
  }
}
