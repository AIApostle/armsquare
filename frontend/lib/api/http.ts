import type { MarketApi } from "./client";
import {
  ApiError,
  type Business,
  type Category,
  type CustomerAgentSettings,
  type Errand,
  type ErrandEvent,
  type Listing,
  type Order,
} from "./types";

// HTTP client for the backend. Endpoint shapes are the contract the frontend
// expects; adjust paths here once the backend publishes its API.
//
// Public market data (safe to fetch on the server):
//   GET    /v1/market/categories
//   GET    /v1/market/businesses
//   GET    /v1/market/businesses/:id            -> { business, listings } | 404
//
// The signed-in shopper (fetched from the browser with the session cookie):
//   GET    /v1/me/agent
//   PATCH  /v1/me/agent
//   GET    /v1/me/orders
//   POST   /v1/errands                          { request } -> Errand
//   GET    /v1/errands/:id/events               text/event-stream of ErrandEvent
//   POST   /v1/errands/:id/offers/:offerId/approve   (Idempotency-Key header) -> Order

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

export const httpApi: MarketApi = {
  getCategories: () => request<Category[]>("/v1/market/categories"),
  getBusinesses: () => request<Business[]>("/v1/market/businesses"),
  getBusiness: async (id) => {
    try {
      return await request<{ business: Business; listings: Listing[] }>(
        `/v1/market/businesses/${encodeURIComponent(id)}`,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  getAgentSettings: () => request<CustomerAgentSettings>("/v1/me/agent"),
  updateAgentSettings: (patch) =>
    request<CustomerAgentSettings>("/v1/me/agent", { method: "PATCH", body: JSON.stringify(patch) }),

  getOrders: () => request<Order[]>("/v1/me/orders"),

  startErrand: (text) =>
    request<Errand>("/v1/errands", { method: "POST", body: JSON.stringify({ request: text }) }),
  subscribeErrand: (errandId, onEvent, onError) => {
    const source = new EventSource(`${BASE}/v1/errands/${encodeURIComponent(errandId)}/events`, {
      withCredentials: true,
    });
    source.onmessage = (message) => onEvent(JSON.parse(message.data) as ErrandEvent);
    // EventSource retries on its own; CLOSED means it has given up.
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        onError?.(new ApiError("Lost the connection to your agent's errand", 0));
      }
    };
    return () => source.close();
  },
  approveOffer: (errandId, offerId) =>
    request<Order>(
      `/v1/errands/${encodeURIComponent(errandId)}/offers/${encodeURIComponent(offerId)}/approve`,
      { method: "POST", headers: { "Idempotency-Key": `${errandId}:${offerId}` } },
    ),
};
