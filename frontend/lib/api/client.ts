import type {
  Business,
  Category,
  CustomerAgentSettings,
  Errand,
  ErrandEvent,
  Listing,
  Order,
} from "./types";

/** Everything the shopper UI reads or writes. `httpApi` implements it against the backend. */
export interface MarketApi {
  getCategories(): Promise<Category[]>;
  getBusinesses(): Promise<Business[]>;
  /** Resolves null only when the business doesn't exist; other failures reject. */
  getBusiness(id: string): Promise<{ business: Business; listings: Listing[] } | null>;

  // The signed-in shopper's data. Call these from the browser, where the
  // session cookie travels with the request.
  getAgentSettings(): Promise<CustomerAgentSettings>;
  updateAgentSettings(patch: Partial<CustomerAgentSettings>): Promise<CustomerAgentSettings>;

  getOrders(): Promise<Order[]>;

  /** Hand the shopper's agent an errand. Progress arrives through `subscribeErrand`. */
  startErrand(request: string): Promise<Errand>;
  /**
   * Live errand events (server-sent events over HTTP). `onError` fires when the
   * stream is lost for good. Returns an unsubscribe.
   */
  subscribeErrand(
    errandId: string,
    onEvent: (event: ErrandEvent) => void,
    onError?: (error: Error) => void,
  ): () => void;
  /**
   * Approve exactly this offer. The order comes back with payment pending;
   * confirmation arrives later as a `payment` event from the provider.
   */
  approveOffer(errandId: string, offerId: string): Promise<Order>;
}
