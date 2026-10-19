import type { MarketApi } from "./client";
import { httpApi } from "./http";

/**
 * The shopper UI's single data source: the backend at NEXT_PUBLIC_API_URL.
 */
export const api: MarketApi = httpApi;

export type { MarketApi } from "./client";
export * from "./types";
