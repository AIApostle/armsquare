import type { MarketApi } from "./client";
import { httpApi } from "./http";
import { mockApi } from "./mock";

/**
 * The shopper UI's single data source. Set NEXT_PUBLIC_API_MODE=http (and
 * NEXT_PUBLIC_API_URL) to switch from the seeded demo to the real backend.
 */
export const api: MarketApi = process.env.NEXT_PUBLIC_API_MODE === "http" ? httpApi : mockApi;

export type { MarketApi } from "./client";
export * from "./types";
