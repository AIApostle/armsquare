// Seeded demo market. Every business, agent, figure and review here is
// invented for demonstration and is labeled as demo data in the UI.
import type { Business, Category, CustomerAgentSettings, Listing, Order } from "./types";

const usd = (amount: number) => ({ amount, currency: "USD" as const });

export const categories: Category[] = [
  { id: "gifts", name: "Gifts & hampers" },
  { id: "bakery", name: "Bakery" },
  { id: "dairy", name: "Dairy" },
  { id: "pantry", name: "Pantry" },
  { id: "coffee", name: "Coffee" },
];

export const businesses: Business[] = [
  {
    id: "kettle-crate",
    name: "Kettle & Crate Provisions",
    tagline: "Specialty grocery and made-to-order gift hampers",
    categoryIds: ["gifts", "pantry"],
    region: "Riverside",
    verification: "verified",
    agent: {
      id: "AGT-KC-01",
      name: "K&C Business Agent",
      capabilities: ["Quotes", "Negotiates bulk discounts", "Local delivery"],
      medianReplySeconds: 40,
    },
    trust: { ordersFulfilled: 412, onTimeRate: 98, disputes: 1, memberSince: "2026-03-01" },
    claims: ["Hampers packed same day"],
  },
  {
    id: "bloom-barrel",
    name: "Bloom & Barrel",
    tagline: "Gift hampers with flowers and wine",
    categoryIds: ["gifts"],
    region: "Old Town",
    verification: "verified",
    agent: {
      id: "AGT-BB-05",
      name: "Bloom & Barrel Sales Agent",
      capabilities: ["Quotes", "Gift messages", "Courier delivery"],
      medianReplySeconds: 130,
    },
    trust: { ordersFulfilled: 230, onTimeRate: 95, disputes: 2, memberSince: "2026-05-01" },
    claims: ["Fresh flowers in every hamper"],
  },
  {
    id: "harvest-lane",
    name: "Harvest Lane Farm Shop",
    tagline: "Farm produce boxes and seasonal hampers",
    categoryIds: ["gifts", "pantry"],
    region: "Millbrook",
    verification: "verified",
    agent: {
      id: "AGT-HL-02",
      name: "Harvest Lane Agent",
      capabilities: ["Quotes", "Weekly boxes"],
      medianReplySeconds: 2400,
    },
    trust: { ordersFulfilled: 188, onTimeRate: 91, disputes: 0, memberSince: "2026-06-01" },
    claims: ["Everything grown within 20 miles"],
  },
  {
    id: "little-larder",
    name: "Little Larder",
    tagline: "Small-batch hampers and preserves",
    categoryIds: ["gifts", "pantry"],
    region: "Riverside",
    verification: "unverified",
    agent: {
      id: "AGT-LL-09",
      name: "Little Larder Agent",
      capabilities: ["Quotes"],
      medianReplySeconds: null,
    },
    trust: { ordersFulfilled: 0, onTimeRate: null, disputes: 0, memberSince: "2026-10-01" },
    claims: ["Award-winning hampers", "Next-day delivery"],
  },
  {
    id: "greenbank",
    name: "Greenbank Bakery",
    tagline: "Sourdough, rye and Saturday pastries",
    categoryIds: ["bakery"],
    region: "Riverside",
    verification: "verified",
    agent: {
      id: "AGT-GB-02",
      name: "Greenbank Sales Agent",
      capabilities: ["Quotes", "Subscriptions"],
      medianReplySeconds: 40,
    },
    trust: { ordersFulfilled: 951, onTimeRate: 99, disputes: 0, memberSince: "2026-02-01" },
    claims: [],
  },
  {
    id: "northfield",
    name: "Northfield Dairy Co-op",
    tagline: "Milk, yogurt and oat milk from the co-op",
    categoryIds: ["dairy"],
    region: "Northfield",
    verification: "verified",
    agent: {
      id: "AGT-NF-03",
      name: "Northfield Sales Agent",
      capabilities: ["Quotes", "Wholesale", "Subscriptions"],
      medianReplySeconds: 40,
    },
    trust: { ordersFulfilled: 1320, onTimeRate: 97, disputes: 3, memberSince: "2026-01-01" },
    claims: [],
  },
  {
    id: "hollin",
    name: "Hollin Apiary",
    tagline: "Raw wildflower and heather honey",
    categoryIds: ["pantry"],
    region: "Hollin Moor",
    verification: "verified",
    agent: {
      id: "AGT-HA-12",
      name: "Hollin Apiary Sales Agent",
      capabilities: ["Quotes"],
      medianReplySeconds: 300,
    },
    trust: { ordersFulfilled: 140, onTimeRate: 96, disputes: 0, memberSince: "2026-04-01" },
    claims: [],
  },
  {
    id: "harbor-roast",
    name: "Harbor Roast Collective",
    tagline: "Small-lot espresso and filter coffee",
    categoryIds: ["coffee"],
    region: "Harbor",
    verification: "unverified",
    agent: {
      id: "AGT-HR-11",
      name: "Harbor Roast Sales Agent",
      capabilities: ["Quotes", "Subscriptions"],
      medianReplySeconds: null,
    },
    trust: { ordersFulfilled: 0, onTimeRate: null, disputes: 0, memberSince: "2026-10-01" },
    claims: ["Roasted to order every Monday"],
  },
];

export const listings: Listing[] = [
  { id: "kc-hamp-l", businessId: "kettle-crate", name: "Large holiday hamper", description: "Nine items: preserves, crackers, cheese, chocolate, tea.", price: usd(79), unit: "each", availability: "made_to_order", delivery: "Free local delivery, 2 days" },
  { id: "kc-hamp-s", businessId: "kettle-crate", name: "Small hamper", description: "Five pantry favourites in a reusable crate.", price: usd(39), unit: "each", availability: "in_stock", delivery: "Free local delivery, 2 days" },
  { id: "kc-oat", businessId: "kettle-crate", name: "Oat milk 1L", description: "From Northfield Dairy Co-op.", price: usd(2.4), unit: "carton", availability: "low_stock", delivery: "Next day" },
  { id: "bb-hamp", businessId: "bloom-barrel", name: "Bloom hamper", description: "Seasonal flowers, wine and chocolates.", price: usd(85), unit: "each", availability: "made_to_order", delivery: "Courier, $25 per address group" },
  { id: "hl-box", businessId: "harvest-lane", name: "Seasonal farm hamper", description: "Cheese, chutney, apples and bread.", price: usd(73), unit: "each", availability: "made_to_order", delivery: "Mondays only" },
  { id: "ll-hamp", businessId: "little-larder", name: "Preserves hamper", description: "Jams, chutneys and shortbread.", price: usd(76), unit: "each", availability: "made_to_order", delivery: "Claims next day" },
  { id: "gb-sour", businessId: "greenbank", name: "Sourdough loaf", description: "48-hour ferment, 800g.", price: usd(7), unit: "loaf", availability: "in_stock", delivery: "Saturday delivery" },
  { id: "gb-rye", businessId: "greenbank", name: "Seeded rye", description: "Dense, 700g.", price: usd(6.5), unit: "loaf", availability: "in_stock", delivery: "Saturday delivery" },
  { id: "nf-oat", businessId: "northfield", name: "Oat milk 1L, case of 12", description: "Barista style.", price: usd(23.1), unit: "case", availability: "in_stock", delivery: "Weekday mornings" },
  { id: "nf-yog", businessId: "northfield", name: "Greek yogurt 500g", description: "Whole milk, strained.", price: usd(3.2), unit: "tub", availability: "in_stock", delivery: "Weekday mornings" },
  { id: "ha-wild", businessId: "hollin", name: "Wildflower honey 340g", description: "Raw, unfiltered.", price: usd(9), unit: "jar", availability: "in_stock", delivery: "2–3 days" },
  { id: "hr-esp", businessId: "harbor-roast", name: "Espresso blend 1kg", description: "Chocolate and cherry.", price: usd(24), unit: "bag", availability: "made_to_order", delivery: "Claims Friday" },
];

export const agentSettings: CustomerAgentSettings = {
  agentId: "CA-7Q2",
  agentName: "Alex's Shopping Agent",
  ownerName: "Alex Moreno",
  errandBudget: usd(500),
  monthlyLimit: usd(1200),
  spentThisMonth: usd(386),
  autoApproveUnder: usd(200),
  maxDiscountAsk: 20,
  deliveryArea: "Riverside, within 3 miles",
  preferences: ["Local businesses", "Recyclable packaging"],
  avoid: ["Peanuts"],
  verifiedSellersOnly: true,
};

export const pastOrders: Order[] = [
  { id: "ORD-2302", placedAt: "2026-10-13T16:40:00Z", businessId: "hollin", summary: "Wildflower honey × 2", total: usd(18), payment: "confirmed", sandbox: true, fulfillment: "out_for_delivery", deliveryBy: "2026-10-15", approvedBy: "auto" },
  { id: "ORD-2291", placedAt: "2026-10-11T09:12:00Z", businessId: "greenbank", summary: "Sourdough loaf × 2", total: usd(14), payment: "confirmed", sandbox: true, fulfillment: "delivered", deliveryBy: "2026-10-12", approvedBy: "auto" },
  { id: "ORD-2240", placedAt: "2026-10-06T18:03:00Z", businessId: "bloom-barrel", summary: "Bloom hamper, birthday message", total: usd(110), payment: "confirmed", sandbox: true, fulfillment: "delivered", deliveryBy: "2026-10-08", approvedBy: "auto" },
  { id: "ORD-2198", placedAt: "2026-10-02T12:47:00Z", businessId: "northfield", summary: "Greek yogurt × 6", total: usd(19.2), payment: "refunded", sandbox: true, fulfillment: "cancelled", deliveryBy: "2026-10-03", approvedBy: "auto" },
];
