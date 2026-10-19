import type { ErrandConstraint, OfferRound } from "@/lib/api";
import { formatDay, money, moneyWhole } from "@/lib/format";

/** One haggling move in plain words, from your assistant's side or the shop's. */
export function roundText(r: OfferRound) {
  const who = r.from === "us" ? "Your assistant" : "The shop";
  const price = r.unitPrice
    ? r.quantity
      ? `${money(r.unitPrice.amount)} each for ${r.quantity}`
      : money(r.unitPrice.amount)
    : null;
  const off = r.percentOff !== undefined ? `${r.percentOff}% off` : null;
  const fee = r.fee ? `plus ${money(r.fee.amount)} delivery` : null;
  const what = [price, off, fee].filter(Boolean).join(", ");
  switch (r.kind) {
    case "quote":
      return `${who} quoted ${what}`;
    case "ask":
      return `${who} asked for ${what || "a better price"}`;
    case "offer":
      return `${who} offered ${what}`;
    case "counter":
      return `${who} suggested ${what}`;
    case "accept":
      return `${who} agreed${what ? ` to ${what}` : ""}`;
  }
}

/** What the assistant understood from the request, as a short chip. */
export function constraintText(c: ErrandConstraint): { label: string; value: string } {
  switch (c.kind) {
    case "item":
      return { label: "What", value: c.quantity > 1 ? `${c.quantity} ${c.text}` : c.text };
    case "budget":
      return { label: "Budget", value: `up to ${moneyWhole(c.max.amount)}` };
    case "deadline":
      return { label: "By", value: formatDay(c.by) };
    case "sellers":
      return { label: "Shops", value: c.verifiedOnly ? "checked shops only" : "any shop" };
  }
}
