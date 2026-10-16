// The switchboard's view of the seeded demo: every negotiation is a line
// patched from our agent to another agent. Invented for demonstration.
import { approvals, type AgentRef, type ApprovalRequest, type NegotiationRound } from "./demo-data";

export type LineState = "waiting" | "talking" | "closed";

/** A simulated move that lands on a line the agent is handling alone. */
export type ScriptStep = NegotiationRound & {
  /** Status the plate shows once the move lands. */
  status: string;
  /** The agent closes the line on its own with this move. */
  closes?: boolean;
};

export type Line = {
  /** Jack number on the board. */
  jack: string;
  counterparty: AgentRef;
  topic: string;
  state: LineState;
  /** One line on what is happening now. */
  status: string;
  /** For lines the agent handles alone: the limits it is working inside. */
  within?: string;
  rounds: NegotiationRound[];
  /** Demo simulation: moves still to come on this line. */
  script?: ScriptStep[];
  approval?: ApprovalRequest;
};

// Two lines are waiting on the owner; the agent handles the rest alone.
const waiting: Line[] = approvals.slice(0, 2).map((a, i) => ({
  jack: String(i + 1).padStart(2, "0"),
  counterparty: a.counterparty,
  topic: a.summary,
  state: "waiting",
  status: `${a.kind} · needs your signature`,
  rounds: a.rounds,
  approval: a,
}));

const talking: Line[] = [
  {
    jack: "03",
    counterparty: {
      id: "AGT-GB-02",
      name: "Greenbank Sales Agent",
      principal: "Greenbank Bakery",
      kind: "business",
      verified: true,
      history: "8 orders fulfilled with you",
    },
    topic: "Buying 60 sourdough loaves for Saturday",
    state: "talking",
    status: "Countering · round 3",
    within: "Inside your $500 per-transaction limit and bakery allow-list",
    rounds: [
      { from: "them", label: "Quote", amount: "$3.80 / loaf" },
      { from: "us", label: "Counter", amount: "$3.30 / loaf", note: "Matched last month's price" },
      { from: "them", label: "Counter", amount: "$3.55 / loaf" },
    ],
    script: [
      { from: "us", label: "Counter", amount: "$3.40 / loaf", status: "Countered at $3.40 · round 4" },
      { from: "them", label: "Counter", amount: "$3.45 / loaf", status: "They came to $3.45 · round 5" },
      { from: "us", label: "Accept", amount: "$207.00 total", status: "Closed by your agent · $207.00, sandbox payment", closes: true },
    ],
  },
  {
    jack: "04",
    counterparty: {
      id: "CA-9F1",
      name: "Shopper's Agent",
      principal: "Individual shopper (verified account)",
      kind: "customer",
      verified: true,
      history: "2 purchases",
    },
    topic: "Is the large hamper gluten-free?",
    state: "talking",
    status: "Answered · round 2",
    within: "Catalog answers and list-price sales only; no discount offered",
    rounds: [
      { from: "them", label: "Inquiry", amount: "Gluten-free contents?" },
      { from: "us", label: "Answer", amount: "6 of 9 items", note: "Offered a gluten-free swap" },
    ],
    script: [
      { from: "them", label: "Order", amount: "1 hamper, with swap", status: "Shopper wants to buy · round 3" },
      { from: "us", label: "Sale", amount: "$79.00", status: "Closed by your agent · sale confirmed, sandbox payment", closes: true },
    ],
  },
  {
    jack: "05",
    counterparty: {
      id: "AGT-PK-07",
      name: "Parcelkind Dispatch Agent",
      principal: "Parcelkind Couriers",
      kind: "business",
      verified: true,
      history: "31 pickups with you",
    },
    topic: "Booking Friday pickup for 2 hampers",
    state: "talking",
    status: "Slot offered · round 2",
    within: "Under your $500 per-transaction limit",
    rounds: [
      { from: "us", label: "Request", amount: "Fri 14:00–16:00" },
      { from: "them", label: "Offer", amount: "Fri 15:00 · $12.00" },
    ],
    script: [
      { from: "us", label: "Accept", amount: "Fri 15:00", status: "Accepted the slot · round 3" },
      { from: "them", label: "Booked", amount: "Ref PK-5521", status: "Closed by your agent · pickup booked", closes: true },
    ],
  },
];

export const lines: Line[] = [...waiting, ...talking];

/**
 * Demo simulation: new agents that patch in while the board runs, so there is
 * always work being handled. The board numbers each arrival's jack itself.
 */
export const arrivals: Omit<Line, "jack">[] = [
  {
    counterparty: {
      id: "AGT-HA-12",
      name: "Hollin Apiary Sales Agent",
      principal: "Hollin Apiary",
      kind: "business",
      verified: true,
      history: "5 orders fulfilled with you",
    },
    topic: "Restocking honey, 24 jars",
    state: "talking",
    status: "Quote received · round 1",
    within: "Inside your $500 per-transaction limit and weekly budget",
    rounds: [{ from: "them", label: "Quote", amount: "$8.80 / jar" }],
    script: [
      { from: "us", label: "Counter", amount: "$8.40 / jar", note: "Matched this morning's order", status: "Countered at $8.40 · round 2" },
      { from: "them", label: "Accept", amount: "$201.60 total", status: "Closed by your agent · $201.60, sandbox payment", closes: true },
    ],
  },
  {
    counterparty: {
      id: "CA-2D7",
      name: "Shopper's Agent",
      principal: "Individual shopper (verified account)",
      kind: "customer",
      verified: true,
      history: "First purchase",
    },
    topic: "Two holiday hampers for Sunday",
    state: "talking",
    status: "Inquiry received · round 1",
    within: "List-price sales only; no discount offered",
    rounds: [{ from: "them", label: "Inquiry", amount: "2 large · Sun delivery?" }],
    script: [
      { from: "us", label: "Offer", amount: "$158.00 · Sun AM", status: "Offered list price · round 2" },
      { from: "them", label: "Accept", amount: "$158.00", status: "Closed by your agent · sale confirmed, sandbox payment", closes: true },
    ],
  },
  {
    counterparty: {
      id: "AGT-RM-04",
      name: "Riverside Mill Sales Agent",
      principal: "Riverside Mill",
      kind: "business",
      verified: true,
      history: "3 orders fulfilled with you",
    },
    topic: "Pricing 10 sacks of rye flour",
    state: "talking",
    status: "Quote received · round 1",
    within: "Inside your $500 per-transaction limit and mill allow-list",
    rounds: [{ from: "them", label: "Quote", amount: "$31.00 / sack" }],
    script: [
      { from: "us", label: "Counter", amount: "$28.00 / sack", status: "Countered at $28.00 · round 2" },
      { from: "them", label: "Counter", amount: "$29.50 / sack", status: "They came to $29.50 · round 3" },
      { from: "us", label: "Accept", amount: "$295.00 total", status: "Closed by your agent · $295.00, sandbox payment", closes: true },
    ],
  },
];

export const closedToday = [
  { time: "09:58", topic: "Harbor Roast coffee order, voided by you (supplier unverified)", outcome: "Voided", amount: null },
  { time: "08:52", topic: "Bought 24 jars of honey from Hollin Apiary", outcome: "Executed", amount: 211.2 },
  { time: "08:40", topic: "Sold a gift card to CA-1B4", outcome: "Executed", amount: 50 },
  { time: "08:20", topic: "Northfield yogurt order, revised total approved by you", outcome: "Executed", amount: 336 },
  { time: "08:11", topic: "Quote from AGT-RV-09 above market, declined", outcome: "Declined", amount: null },
] as const;
