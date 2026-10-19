// The business owner's desk: their agent, its open lines, the ledger and the
// policy it works inside. Everything here belongs to the signed-in owner, so
// call it from the browser, where the session cookie travels with the request.
//
// Endpoint shapes are the contract the frontend expects:
//
//   GET    /v1/business/desk                       -> Desk
//   PATCH  /v1/business/desk         { paused }    -> Desk
//   GET    /v1/business/lines                      -> Line[]  (open lines plus those closed in the last hour)
//   GET    /v1/business/lines/events               text/event-stream of Line (each event is the line's latest state)
//   POST   /v1/business/lines/:id/decision         { decision } (Idempotency-Key header) -> Line
//   GET    /v1/business/ledger                     -> Ledger
//   GET    /v1/business/policy                     -> Policy
//   PATCH  /v1/business/policy                     -> Policy
import { ApiError, type IsoDate, type Money } from "./types";

export type AgentRef = {
  id: string;
  name: string;
  /** Who the agent acts for. */
  principal: string;
  kind: "business" | "customer";
  verified: boolean;
  /** History with this business, in words, e.g. "12 orders fulfilled with you". */
  history?: string;
};

/** The ladder is product structure, not data: the backend stores one rung. */
export const AUTONOMY_LADDER = [
  "Read-only",
  "Recommend",
  "Draft",
  "Execute after approval",
  "Execute within limits",
] as const;

export type AutonomyLevel = (typeof AUTONOMY_LADDER)[number];

export type Desk = {
  business: { id: string; name: string };
  owner: { name: string; initials: string };
  agent: AgentRef;
  autonomy: AutonomyLevel;
  /** Paused agents use no tools and start no transactions. */
  paused: boolean;
};

export type NegotiationRound = {
  from: "us" | "them";
  label: string;
  /** The move in words, e.g. "$21.60 / case" or "12% off". */
  amount: string;
  note?: string;
};

export type PolicyCheck = {
  rule: string;
  detail: string;
  result: "pass" | "flag";
};

export type ApprovalKind = "Purchase order" | "Sales discount" | "New supplier" | "Changed terms";

export type ApprovalRequest = {
  kind: ApprovalKind;
  direction: "buy" | "sell";
  items: { sku: string; description: string; qty: number; unit: string; unitPrice: Money }[];
  fees: { label: string; amount: Money }[];
  discount?: { label: string; amount: Money };
  total: Money;
  rationale: string;
  checks: PolicyCheck[];
  validUntil: IsoDate;
  /** What the counterparty can see. Private policy is never on their copy. */
  counterpartyNote: string;
  audit: { at: IsoDate; entry: string }[];
  /** Payments run in a provider sandbox until live payments are enabled. */
  sandbox: boolean;
};

export type LineState = "waiting" | "talking" | "closed";

export type OwnerDecision = "approve" | "void" | "return";

/** One negotiation between our agent and another agent. */
export type Line = {
  id: string;
  counterparty: AgentRef;
  topic: string;
  state: LineState;
  /** One line on what is happening now. */
  status: string;
  /** For lines the agent handles alone: the limits it is working inside. */
  within?: string;
  rounds: NegotiationRound[];
  /** Present when the line waits on the owner. */
  approval?: ApprovalRequest;
  /** The owner's decision, once made. */
  decision?: { decision: OwnerDecision; at: IsoDate; by: string };
  closedByAgent?: boolean;
  updatedAt: IsoDate;
};

export type LedgerOutcome = "Escalated" | "Within policy" | "Executed" | "Blocked" | "Declined" | "Voided" | "Owner";

export type Ledger = {
  /** Every action today, newest first. Entries are added, never edited. */
  actions: { id: string; at: IsoDate; actor: string; entry: string; outcome: LedgerOutcome }[];
  /** Lines closed today, newest first. */
  closed: { id: string; at: IsoDate; topic: string; outcome: LedgerOutcome; amount: Money | null; sandbox: boolean }[];
};

export type Policy = {
  /** Above this, the agent must ask. */
  perTransactionCap: Money;
  weeklyBudget: Money;
  weeklySpent: Money;
  weeklyResetsAt: IsoDate;
  /** Percent; deeper discounts need the owner. */
  discountCeiling: number;
  /** Percent. Private: never shown to other agents. */
  marginFloor: number;
  autonomy: AutonomyLevel;
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (cause) {
    throw new ApiError(`Couldn't reach the server (${(cause as Error).message})`, 0);
  }
  if (!res.ok) {
    throw new ApiError(`${init?.method ?? "GET"} ${path} failed with ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const businessApi = {
  getDesk: () => request<Desk>("/v1/business/desk"),
  setPaused: (paused: boolean) =>
    request<Desk>("/v1/business/desk", { method: "PATCH", body: JSON.stringify({ paused }) }),

  getLines: () => request<Line[]>("/v1/business/lines"),
  /** Live line updates. `onError` fires when the stream is lost for good. Returns an unsubscribe. */
  subscribeLines(onLine: (line: Line) => void, onError?: (error: Error) => void): () => void {
    const source = new EventSource(`${BASE}/v1/business/lines/events`, { withCredentials: true });
    source.onmessage = (message) => onLine(JSON.parse(message.data) as Line);
    // EventSource retries on its own; CLOSED means it has given up.
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        onError?.(new ApiError("Lost the live connection to your agent's lines", 0));
      }
    };
    return () => source.close();
  },
  /** Binds the decision to the line's current terms; the backend rejects it if they changed. */
  decide: (lineId: string, decision: OwnerDecision, updatedAt: IsoDate) =>
    request<Line>(`/v1/business/lines/${encodeURIComponent(lineId)}/decision`, {
      method: "POST",
      headers: { "Idempotency-Key": `${lineId}:${updatedAt}:${decision}` },
      body: JSON.stringify({ decision }),
    }),

  getLedger: () => request<Ledger>("/v1/business/ledger"),

  getPolicy: () => request<Policy>("/v1/business/policy"),
  updatePolicy: (patch: Partial<Pick<Policy, "perTransactionCap" | "discountCeiling">>) =>
    request<Policy>("/v1/business/policy", { method: "PATCH", body: JSON.stringify(patch) }),
};
