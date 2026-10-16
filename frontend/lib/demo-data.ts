// Seeded demo data for the Stage 1 prototype. Every business, agent and
// figure here is invented for demonstration and is labeled as such in the UI.

export type AgentRef = {
  id: string;
  name: string;
  principal: string;
  kind: "business" | "customer";
  verified: boolean;
  history?: string;
};

export type LineItem = {
  sku: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
};

export type PolicyCheck = {
  rule: string;
  detail: string;
  result: "pass" | "flag";
};

export type NegotiationRound = {
  from: "us" | "them";
  label: string;
  amount: string;
  note?: string;
};

export type ApprovalKind =
  | "Purchase order"
  | "Sales discount"
  | "New supplier"
  | "Changed terms";

export type ApprovalRequest = {
  serial: string;
  kind: ApprovalKind;
  direction: "buy" | "sell";
  summary: string;
  counterparty: AgentRef;
  items: LineItem[];
  fees: { label: string; amount: number }[];
  discount?: { label: string; amount: number };
  rationale: string;
  risk: "Low" | "Medium" | "High";
  checks: PolicyCheck[];
  rounds: NegotiationRound[];
  /** Seconds the offer stays valid, measured from the demo clock. */
  validForSeconds: number;
  validUntilLabel: string;
  /** Terms the counterparty can see. Private policy is never on their copy. */
  counterpartyNote: string;
  audit: { time: string; entry: string }[];
};

export const business = {
  name: "Kettle & Crate Provisions",
  short: "K&C",
  category: "Specialty grocery",
  owner: { name: "Mara Lindqvist", initials: "M.L." },
};

export const ourAgent: AgentRef = {
  id: "AGT-KC-01",
  name: "K&C Business Agent",
  principal: business.name,
  kind: "business",
  verified: true,
};

export const autonomy = {
  level: "Execute within limits",
  ladder: [
    "Read-only",
    "Recommend",
    "Draft",
    "Execute after approval",
    "Execute within limits",
  ],
};

export const limits = [
  {
    id: "cap",
    label: "Autonomous spend per transaction",
    short: "Per transaction",
    used: null as number | null,
    limit: 500,
    unit: "usd",
    note: "Above this, the agent must ask you.",
  },
  {
    id: "weekly",
    label: "Weekly supply budget",
    short: "Weekly budget",
    used: 1742,
    limit: 3000,
    unit: "usd",
    note: "Resets Monday 00:00.",
  },
  {
    id: "discount",
    label: "Discount ceiling on sales",
    short: "Discount ceiling",
    used: null,
    limit: 10,
    unit: "pct",
    note: "Deeper discounts need your signature.",
  },
  {
    id: "margin",
    label: "Margin floor",
    short: "Margin floor",
    used: null,
    limit: 22,
    unit: "pct",
    note: "Private. Never shown to other agents.",
  },
] as const;

export const approvals: ApprovalRequest[] = [
  {
    serial: "004217",
    kind: "Purchase order",
    direction: "buy",
    summary: "Restock oat milk, 40 cases",
    counterparty: {
      id: "AGT-NF-03",
      name: "Northfield Sales Agent",
      principal: "Northfield Dairy Co-op",
      kind: "business",
      verified: true,
      history: "12 orders fulfilled with you",
    },
    items: [
      {
        sku: "NF-OAT-1L-12",
        description: "Oat milk 1L, case of 12",
        qty: 40,
        unit: "case",
        unitPrice: 21.6,
      },
    ],
    fees: [{ label: "Delivery, Thu AM", amount: 45 }],
    rationale:
      "Oat milk 1L runs out in about 3 days at current sell-through (14 units/day). Northfield quoted $23.10/case; after two rounds they came down to $21.60, 6% under our last order. The total is over the $500 autonomous limit, so this needs your signature.",
    risk: "Low",
    checks: [
      {
        rule: "Autonomous spend per transaction",
        detail: "$909.00 is $409.00 over the $500 limit",
        result: "flag",
      },
      {
        rule: "Weekly supply budget",
        detail: "$2,651 of $3,000 used after this order",
        result: "pass",
      },
      {
        rule: "Supplier allow-list",
        detail: "Northfield Dairy Co-op is on your list",
        result: "pass",
      },
      {
        rule: "Price and stock revalidated",
        detail: "Confirmed with seller 2 minutes ago",
        result: "pass",
      },
    ],
    rounds: [
      { from: "them", label: "Quote", amount: "$23.10 / case" },
      { from: "us", label: "Counter", amount: "$20.50 / case", note: "Cited last order price" },
      { from: "them", label: "Counter", amount: "$21.60 / case", note: "Holds through Thu delivery" },
    ],
    validForSeconds: 4 * 3600 + 12 * 60,
    validUntilLabel: "Today, 15:04",
    counterpartyNote:
      "Northfield sees the order terms, quantities and delivery window. Your budget, limits and margin floor are not on their copy.",
    audit: [
      { time: "10:31", entry: "Low stock flagged: oat milk 1L, 41 units left" },
      { time: "10:42", entry: "Quote received from AGT-NF-03, $23.10/case" },
      { time: "10:44", entry: "Counteroffer sent, $20.50/case, within negotiation policy" },
      { time: "10:51", entry: "Counteroffer received, $21.60/case" },
      { time: "10:52", entry: "Approval requested: over $500 autonomous limit" },
    ],
  },
  {
    serial: "004218",
    kind: "Sales discount",
    direction: "sell",
    summary: "6 holiday hampers at 12% off",
    counterparty: {
      id: "CA-7Q2",
      name: "Shopper's Agent",
      principal: "Individual shopper (verified account)",
      kind: "customer",
      verified: true,
      history: "First purchase",
    },
    items: [
      {
        sku: "KC-HAMP-L",
        description: "Large holiday hamper",
        qty: 6,
        unit: "each",
        unitPrice: 79,
      },
    ],
    fees: [{ label: "Local delivery", amount: 0 }],
    discount: { label: "Bulk discount 12%", amount: -56.88 },
    rationale:
      "The shopper's agent asked for 18% off six hampers. I offered 8%, and they countered at 12%. Margin stays above your 22% floor at 12%, but it's over the 10% discount ceiling, so I can't accept without you.",
    risk: "Low",
    checks: [
      {
        rule: "Discount ceiling on sales",
        detail: "12% requested; ceiling is 10%",
        result: "flag",
      },
      {
        rule: "Margin floor",
        detail: "Margin 27% after discount; floor is 22%",
        result: "pass",
      },
      {
        rule: "Stock reserved",
        detail: "6 of 14 hampers held for 2 hours",
        result: "pass",
      },
    ],
    rounds: [
      { from: "them", label: "Inquiry", amount: "18% off × 6" },
      { from: "us", label: "Offer", amount: "8% off" },
      { from: "them", label: "Counter", amount: "12% off" },
    ],
    validForSeconds: 38 * 60,
    validUntilLabel: "Today, 11:42",
    counterpartyNote:
      "The shopper's agent sees the price, discount and delivery terms. Your margin floor and cost basis are not on their copy.",
    audit: [
      { time: "10:58", entry: "Inquiry from CA-7Q2: 6 large hampers, asks 18% off" },
      { time: "10:59", entry: "Offer sent: 8% off, within discount ceiling" },
      { time: "11:02", entry: "Counteroffer received: 12% off" },
      { time: "11:03", entry: "Approval requested: over 10% discount ceiling" },
    ],
  },
  {
    serial: "004219",
    kind: "New supplier",
    direction: "buy",
    summary: "First order, whole-bean coffee",
    counterparty: {
      id: "AGT-HR-11",
      name: "Harbor Roast Sales Agent",
      principal: "Harbor Roast Collective",
      kind: "business",
      verified: false,
      history: "No orders with you. Business not yet verified.",
    },
    items: [
      {
        sku: "HR-ESP-1KG",
        description: "Espresso blend, whole bean, 1kg",
        qty: 12,
        unit: "bag",
        unitPrice: 24,
      },
    ],
    fees: [{ label: "Courier", amount: 24 }],
    rationale:
      "Our current roaster is out of the espresso blend until the 28th. Harbor Roast can deliver Friday at a comparable price. They aren't on your allow-list and aren't verified yet, so I need you to decide.",
    risk: "Medium",
    checks: [
      {
        rule: "Supplier allow-list",
        detail: "Harbor Roast Collective is not on your list",
        result: "flag",
      },
      {
        rule: "Business verification",
        detail: "Not verified; profile claims are unconfirmed",
        result: "flag",
      },
      {
        rule: "Autonomous spend per transaction",
        detail: "$312.00 is under the $500 limit",
        result: "pass",
      },
    ],
    rounds: [{ from: "them", label: "Quote", amount: "$24.00 / bag" }],
    validForSeconds: 26 * 3600,
    validUntilLabel: "Tomorrow, 12:00",
    counterpartyNote:
      "Harbor Roast sees the order and delivery address only. Your supplier rules and budget are not on their copy.",
    audit: [
      { time: "09:47", entry: "Supplier search: espresso blend, deliver by Fri" },
      { time: "09:55", entry: "Quote received from AGT-HR-11, $24.00/bag" },
      { time: "09:56", entry: "Approval requested: supplier not on allow-list" },
    ],
  },
  {
    serial: "004209",
    kind: "Changed terms",
    direction: "buy",
    summary: "Delivery fee rose on approved order",
    counterparty: {
      id: "AGT-NF-03",
      name: "Northfield Sales Agent",
      principal: "Northfield Dairy Co-op",
      kind: "business",
      verified: true,
      history: "12 orders fulfilled with you",
    },
    items: [
      {
        sku: "NF-YOG-500",
        description: "Greek yogurt 500g, case of 8",
        qty: 15,
        unit: "case",
        unitPrice: 18.4,
      },
    ],
    fees: [{ label: "Delivery, Wed PM (was $45.00)", amount: 60 }],
    rationale:
      "You approved this order yesterday at $321.00. Northfield has since raised the delivery fee from $45 to $60. Your approval was for the old terms, so I've paused the order until you sign the new total of $336.00.",
    risk: "Low",
    checks: [
      {
        rule: "Terms match approval",
        detail: "Total changed from $321.00 to $336.00",
        result: "flag",
      },
      {
        rule: "Weekly supply budget",
        detail: "Already counted; +$15.00 if approved",
        result: "pass",
      },
    ],
    rounds: [
      { from: "them", label: "Accepted", amount: "$321.00 total" },
      { from: "them", label: "Revised", amount: "$336.00 total", note: "Fuel surcharge" },
    ],
    validForSeconds: 2 * 3600 + 40 * 60,
    validUntilLabel: "Today, 13:32",
    counterpartyNote:
      "Northfield sees whether the revised total is accepted. Your budget remains private.",
    audit: [
      { time: "Yday 16:20", entry: "Order approved by M.L. at $321.00" },
      { time: "08:14", entry: "Revised terms received: delivery $45 → $60" },
      { time: "08:14", entry: "Order paused: terms no longer match approval" },
    ],
  },
];

export const activity = [
  { time: "11:03", agent: "AGT-KC-01", entry: "Asked for approval on No. 004218 (discount ceiling)", decision: "Escalated" },
  { time: "10:52", agent: "AGT-KC-01", entry: "Asked for approval on No. 004217 (over $500 limit)", decision: "Escalated" },
  { time: "10:44", agent: "AGT-KC-01", entry: "Countered Northfield at $20.50/case", decision: "Within policy" },
  { time: "09:58", agent: "Mara L.", entry: "Voided No. 004219: Harbor Roast isn't a verified business yet", decision: "Owner" },
  { time: "09:30", agent: "AGT-KC-01", entry: "Sold 2 holiday hampers to CA-3M8 for $158.00 (sandbox payment, provider-confirmed)", decision: "Executed" },
  { time: "09:18", agent: "AGT-KC-01", entry: "Declined inquiry from AGT-LX-40: asked for your cost prices", decision: "Blocked" },
  { time: "08:20", agent: "Mara L.", entry: "Approved the revised $336.00 total on No. 004209", decision: "Owner" },
  { time: "08:05", agent: "Mara L.", entry: "Resumed the Business Agent after overnight pause", decision: "Owner" },
] as const;

export const counts = {
  negotiations: 3,
  orders: 12,
};
