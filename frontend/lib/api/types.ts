// Domain types for the shopper side of the marketplace. They mirror the PRD's
// commerce protocol (capability profile, discovery request, quote, offer,
// order, transaction event) so the backend can map onto them directly.
//
// The API carries data, never display strings: dates are ISO 8601 (UTC),
// money is a Money value, durations are numbers. lib/format turns them into text.

export type Money = { amount: number; currency: "USD" };

/** ISO 8601 timestamp or date, UTC. */
export type IsoDate = string;

export type Verification = "verified" | "unverified";

export type Category = {
  id: string;
  name: string;
};

/** A business on the market and the agent that represents it. */
export type Business = {
  id: string;
  name: string;
  tagline: string;
  categoryIds: string[];
  region: string;
  verification: Verification;
  agent: {
    id: string;
    name: string;
    capabilities: string[];
    /** Median reply time in seconds, measured by the platform; null until measured. */
    medianReplySeconds: number | null;
  };
  /** Verified signals come from platform records; claims come from the business. */
  trust: {
    ordersFulfilled: number;
    /** Percent of orders delivered on time; null until there is history. */
    onTimeRate: number | null;
    disputes: number;
    memberSince: IsoDate;
  };
  claims: string[];
};

export type Listing = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: Money;
  unit: string;
  availability: "in_stock" | "low_stock" | "made_to_order";
  delivery: string;
};

/** The shopper's Customer Agent and the rules it must follow. */
export type CustomerAgentSettings = {
  agentId: string;
  agentName: string;
  ownerName: string;
  /** Default ceiling for a single errand. */
  errandBudget: Money;
  monthlyLimit: Money;
  spentThisMonth: Money;
  /** Approve automatically at or below this total; above it, the agent asks. */
  autoApproveUnder: Money;
  /** Most the agent may ask a seller to come down, as a percent of list price. */
  maxDiscountAsk: number;
  deliveryArea: string;
  preferences: string[];
  avoid: string[];
  verifiedSellersOnly: boolean;
};

/** A structured constraint the agent read from the request. */
export type ErrandConstraint =
  | { kind: "item"; text: string; quantity: number }
  | { kind: "budget"; max: Money }
  | { kind: "deadline"; by: IsoDate }
  | { kind: "sellers"; verifiedOnly: boolean };

export type ErrandStepKind =
  | "read"
  | "search"
  | "ask"
  | "quote"
  | "counter"
  | "accept"
  | "decline"
  | "recommend"
  | "approved"
  | "payment"
  | "failed";

export type ErrandStatus = "running" | "awaiting_approval" | "ordered" | "closed" | "failed";

/** One event on an errand's log. Streamed by the backend as it happens. */
export type ErrandEvent = {
  id: string;
  at: IsoDate;
  kind: ErrandStepKind;
  /** Human-readable account of the step, written by the agent. */
  text: string;
  /** The errand's status after this event, when it changed. */
  status?: ErrandStatus;
  /** The business agent this step involved, if any. */
  businessId?: string;
  /** For quote/counter/accept/recommend: the latest version of the offer. */
  offer?: Offer;
  constraints?: ErrandConstraint[];
};

export type OfferRound = {
  from: "us" | "them";
  kind: "quote" | "ask" | "offer" | "counter" | "accept";
  /** Price per unit, when the move names one. */
  unitPrice?: Money;
  quantity?: number;
  /** Discount off list, when the move names one. */
  percentOff?: number;
  fee?: Money;
};

export type FitCheck = { label: string; ok: boolean };

export type Offer = {
  id: string;
  businessId: string;
  summary: string;
  lines: { description: string; qty: number; unitPrice: Money }[];
  fees: { label: string; amount: Money }[];
  discount?: { percent: number; amount: Money };
  total: Money;
  deliveryBy: IsoDate;
  validUntil: IsoDate;
  rounds: OfferRound[];
  fit: FitCheck[];
  status: "quoted" | "negotiating" | "final" | "declined";
  recommended?: boolean;
};

export type Errand = {
  id: string;
  request: string;
  status: ErrandStatus;
  events: ErrandEvent[];
};

export type PaymentState = "pending" | "confirmed" | "failed" | "refunded";
export type FulfillmentState = "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export type Order = {
  id: string;
  placedAt: IsoDate;
  businessId: string;
  summary: string;
  total: Money;
  payment: PaymentState;
  /** Payments run in a provider sandbox until live payments are enabled. */
  sandbox: boolean;
  fulfillment: FulfillmentState;
  deliveryBy: IsoDate;
  approvedBy: "you" | "auto";
};

/** A failed API call. `status` is the HTTP status, or 0 when the network failed. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
