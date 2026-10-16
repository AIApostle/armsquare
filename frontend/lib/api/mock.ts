// In-memory implementation of MarketApi for the demo. Errands play a scripted
// timeline of events; the hamper errand lines up with the owner desk's story
// (Kettle & Crate's agent escalates the 12% discount to its owner at 11:03).
import type { MarketApi } from "./client";
import { agentSettings, businesses, categories, listings, pastOrders } from "./mock-data";
import type { CustomerAgentSettings, Errand, ErrandEvent, Offer, Order } from "./types";

const usd = (amount: number) => ({ amount, currency: "USD" as const });
const round2 = (n: number) => Math.round(n * 100) / 100;
const at = (hm: string) => `2026-10-14T${hm}:00Z`;

// Reads resolve immediately (they prerender on the server); writes take a beat like a network call.
const pause = <T,>(value: T, ms = 0) =>
  ms === 0 ? Promise.resolve(value) : new Promise<T>((r) => setTimeout(() => r(value), ms));

let settings: CustomerAgentSettings = { ...agentSettings };
const orders: Order[] = [...pastOrders];
const errands = new Map<string, Errand>();
const listeners = new Map<string, Set<(e: ErrandEvent) => void>>();
let errandCount = 0;

function emit(errandId: string, event: ErrandEvent) {
  const errand = errands.get(errandId);
  if (errand) {
    errand.events.push(event);
    if (event.status) errand.status = event.status;
  }
  listeners.get(errandId)?.forEach((fn) => fn(event));
}

// ---------------------------------------------------------------- scripts

const BUDGET = 480;

function kcOffer(stage: "quoted" | "asked" | "8" | "countered" | "12", recommended = false): Offer {
  const list = 6 * 79;
  const pct = stage === "8" || stage === "countered" ? 8 : stage === "12" ? 12 : 0;
  const discount = round2((list * pct) / 100);
  const rounds: Offer["rounds"] = [{ from: "them", kind: "quote", unitPrice: usd(79), quantity: 6 }];
  if (stage !== "quoted") rounds.push({ from: "us", kind: "ask", percentOff: 18 });
  if (stage === "8" || stage === "countered" || stage === "12") rounds.push({ from: "them", kind: "offer", percentOff: 8 });
  if (stage === "countered" || stage === "12") rounds.push({ from: "us", kind: "counter", percentOff: 12 });
  if (stage === "12") rounds.push({ from: "them", kind: "accept", percentOff: 12 });
  return {
    id: "off-kc",
    businessId: "kettle-crate",
    summary: "6 large holiday hampers",
    lines: [{ description: "Large holiday hamper", qty: 6, unitPrice: usd(79) }],
    fees: [{ label: "Local delivery", amount: usd(0) }],
    discount: pct ? { percent: pct, amount: usd(-discount) } : undefined,
    total: usd(round2(list - discount)),
    deliveryBy: "2026-10-15",
    validUntil: at("11:42"),
    rounds,
    fit: [
      { label: `Within your $${BUDGET}`, ok: true },
      { label: "Arrives by Friday", ok: true },
      { label: "Verified seller", ok: true },
    ],
    status: stage === "12" ? "final" : "negotiating",
    recommended,
  };
}

const bloomOffer: Offer = {
  id: "off-bb",
  businessId: "bloom-barrel",
  summary: "6 Bloom hampers",
  lines: [{ description: "Bloom hamper", qty: 6, unitPrice: usd(85) }],
  fees: [{ label: "Courier delivery", amount: usd(25) }],
  total: usd(535),
  deliveryBy: "2026-10-16",
  validUntil: at("18:00"),
  rounds: [{ from: "them", kind: "quote", unitPrice: usd(85), quantity: 6, fee: usd(25) }],
  fit: [
    { label: `$${535 - BUDGET} over your $${BUDGET}`, ok: false },
    { label: "Arrives by Friday", ok: true },
    { label: "Verified seller", ok: true },
  ],
  status: "final",
};

const harvestOffer: Offer = {
  id: "off-hl",
  businessId: "harvest-lane",
  summary: "6 seasonal farm hampers",
  lines: [{ description: "Seasonal farm hamper", qty: 6, unitPrice: usd(73) }],
  fees: [{ label: "Delivery", amount: usd(0) }],
  total: usd(438),
  deliveryBy: "2026-10-19",
  validUntil: "2026-10-15T12:00:00Z",
  rounds: [{ from: "them", kind: "quote", unitPrice: usd(73), quantity: 6 }],
  fit: [
    { label: `Within your $${BUDGET}`, ok: true },
    { label: "Arrives Monday, after Friday", ok: false },
    { label: "Verified seller", ok: true },
  ],
  status: "final",
};

type Step = { delay: number; event: ErrandEvent };

function hamperScript(): Step[] {
  let n = 0;
  const ev = (delay: number, e: Omit<ErrandEvent, "id">): Step => ({ delay, event: { id: `ev-${++n}`, ...e } });
  const sellers = businesses.filter((b) => b.categoryIds.includes("gifts"));
  const unverified = sellers.filter((b) => b.verification !== "verified");
  const asked = sellers.length - unverified.length;
  return [
    ev(300, {
      at: at("10:58"),
      kind: "read",
      status: "running",
      text: "Read your request.",
      constraints: [
        { kind: "item", text: "gift hampers", quantity: 6 },
        { kind: "budget", max: usd(BUDGET) },
        { kind: "deadline", by: "2026-10-16" },
        { kind: "sellers", verifiedOnly: true },
      ],
    }),
    ev(1500, {
      at: at("10:58"),
      kind: "search",
      text: `Searched the market: ${sellers.length} businesses sell gift hampers near Riverside.`,
    }),
    ...unverified.map((b) =>
      ev(2700, {
        at: at("10:58"),
        kind: "decline",
        businessId: b.id,
        text: `Skipped ${b.name}: not a verified business, and you only buy from verified sellers.`,
      }),
    ),
    ev(3700, { at: at("10:58"), kind: "ask", text: `Asked ${asked} business agents for quotes.` }),
    ev(4900, { at: at("10:59"), kind: "quote", businessId: "harvest-lane", text: "Harvest Lane quoted $438.00, but can't deliver until Monday.", offer: harvestOffer }),
    ev(6000, { at: at("10:59"), kind: "quote", businessId: "bloom-barrel", text: "Bloom & Barrel quoted $535.00 with delivery: over budget.", offer: bloomOffer }),
    ev(7100, { at: at("10:59"), kind: "quote", businessId: "kettle-crate", text: "Kettle & Crate quoted $474.00, delivered Thursday.", offer: kcOffer("quoted") }),
    ev(8400, { at: at("10:59"), kind: "counter", businessId: "kettle-crate", text: "Asked Kettle & Crate for 18% off six hampers.", offer: kcOffer("asked") }),
    ev(9700, { at: at("10:59"), kind: "counter", businessId: "kettle-crate", text: "Kettle & Crate offered 8% off: $436.08.", offer: kcOffer("8") }),
    ev(11000, { at: at("11:02"), kind: "counter", businessId: "kettle-crate", text: "Countered at 12% off, inside your 20% limit.", offer: kcOffer("countered") }),
    ev(12400, { at: at("11:03"), kind: "ask", businessId: "kettle-crate", text: "Kettle & Crate's agent is checking 12% with its owner." }),
    ev(15200, { at: at("11:06"), kind: "accept", businessId: "kettle-crate", text: "Kettle & Crate accepted 12% off: $417.12, delivered Thursday.", offer: kcOffer("12") }),
    ev(16400, {
      at: at("11:06"),
      kind: "recommend",
      status: "awaiting_approval",
      businessId: "kettle-crate",
      text: `Recommended Kettle & Crate: $${(BUDGET - 417.12).toFixed(2)} under budget, arrives Thursday, 412 orders fulfilled. It's over your $200 auto-approve limit, so it's waiting for you.`,
      offer: kcOffer("12", true),
    }),
  ];
}

function unsupportedScript(request: string): Step[] {
  return [
    {
      delay: 300,
      event: {
        id: "ev-1",
        at: at("10:58"),
        kind: "read",
        status: "running",
        text: "Read your request.",
        constraints: [{ kind: "item", text: request.slice(0, 60), quantity: 1 }],
      },
    },
    {
      delay: 1400,
      event: {
        id: "ev-2",
        at: at("10:58"),
        kind: "decline",
        status: "closed",
        text: "This demo runs one scripted errand: gift hampers. Live errands need the backend; try the first suggestion.",
      },
    },
  ];
}

// ------------------------------------------------------------------- api

export const mockApi: MarketApi = {
  getCategories: () => pause(categories),
  getBusinesses: () => pause(businesses),
  getBusiness: (id) => {
    const business = businesses.find((b) => b.id === id);
    return pause(business ? { business, listings: listings.filter((l) => l.businessId === id) } : null);
  },

  getAgentSettings: () => pause({ ...settings }),
  updateAgentSettings: (patch) => {
    settings = { ...settings, ...patch };
    return pause({ ...settings }, 450);
  },

  getOrders: () => pause(orders.map((o) => ({ ...o }))),

  startErrand: (request) => {
    const id = `ERR-${++errandCount}`;
    const errand: Errand = { id, request, status: "running", events: [] };
    errands.set(id, errand);
    const script = /hamper|gift/i.test(request) ? hamperScript() : unsupportedScript(request);
    for (const step of script) setTimeout(() => emit(id, step.event), step.delay);
    return pause({ ...errand, events: [] }, 250);
  },

  subscribeErrand: (errandId, onEvent) => {
    const set = listeners.get(errandId) ?? new Set();
    set.add(onEvent);
    listeners.set(errandId, set);
    // Replay anything that already happened.
    errands.get(errandId)?.events.forEach(onEvent);
    return () => set.delete(onEvent);
  },

  approveOffer: (errandId, offerId) => {
    // Bind to the latest version of exactly this offer, as the backend must.
    const offer = [...(errands.get(errandId)?.events ?? [])].reverse().find((e) => e.offer?.id === offerId)?.offer;
    if (!offer) return Promise.reject(new Error(`Offer ${offerId} not found on ${errandId}`));
    const seller = businesses.find((b) => b.id === offer.businessId);
    const order: Order = {
      id: `ORD-${2310 + orders.length}`,
      placedAt: at("11:07"),
      businessId: offer.businessId,
      summary: offer.discount ? `${offer.summary}, ${offer.discount.percent}% off` : offer.summary,
      total: offer.total,
      payment: "pending",
      sandbox: true,
      fulfillment: "preparing",
      deliveryBy: offer.deliveryBy,
      approvedBy: "you",
    };
    orders.unshift(order);
    const name = seller?.name ?? offer.businessId;
    emit(errandId, {
      id: `ev-ap-${offerId}`,
      at: at("11:07"),
      kind: "approved",
      status: "ordered",
      businessId: offer.businessId,
      text: `You approved ${name} at $${offer.total.amount.toFixed(2)}. Order placed, payment pending with the provider.`,
    });
    setTimeout(() => {
      order.payment = "confirmed";
      emit(errandId, {
        id: `ev-pay-${offerId}`,
        at: at("11:07"),
        kind: "payment",
        businessId: offer.businessId,
        text: "Payment confirmed by the provider (sandbox).",
      });
    }, 2400);
    return pause({ ...order }, 600);
  },
};
