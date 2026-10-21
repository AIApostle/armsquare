// Business requests run in the browser so the signed-in session cookie travels with them.
import { ApiError, type IsoDate, type Money } from "./types";

export type StoreCategoryId = "skin-care" | "arts-and-crafts" | "cycling";
export type ProductAvailability = "in_stock" | "low_stock" | "made_to_order";
export type AgentToolId =
  | "catalog.read"
  | "marketplace.search"
  | "product.create_draft"
  | "web.research";

export type StoreProduct = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: Money;
  unit: string;
  availability: ProductAvailability;
  delivery: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdByAgent: boolean;
  createdAt: IsoDate;
};

export type BusinessStore = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  categoryId: StoreCategoryId;
  region: string;
  imageUrl: string | null;
  isPublished: boolean;
  isDemo: boolean;
  createdAt: IsoDate;
  agent: {
    id: string;
    name: string;
    capabilities: string[];
    enabledTools: AgentToolId[];
    autonomyLevel: AgentConfiguration["autonomyLevel"];
    isPaused: boolean;
    available: boolean;
    medianReplySeconds: number | null;
    createdAt: IsoDate;
  };
  products: StoreProduct[];
};

export type StoreDraft = Pick<
  BusinessStore,
  "name" | "tagline" | "description" | "categoryId" | "region"
> & { imageUrl?: string | null };

export type ProductDraft = Pick<
  StoreProduct,
  "name" | "description" | "unit" | "availability" | "delivery"
> & { price: number; imageUrl?: string | null };

export type AgentConfiguration = {
  enabledTools: AgentToolId[];
  autonomyLevel: "read_only" | "recommend" | "draft";
  isPaused: boolean;
};

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
const autonomyLevels: Record<string, AutonomyLevel> = {
  read_only: "Read-only",
  recommend: "Recommend",
  draft: "Draft",
  execute_after_approval: "Execute after approval",
  execute_within_limits: "Execute within limits",
  "Read-only": "Read-only",
  Recommend: "Recommend",
  Draft: "Draft",
  "Execute after approval": "Execute after approval",
  "Execute within limits": "Execute within limits",
};

export type Desk = {
  business: { id: string; name: string };
  owner: { name: string; initials: string };
  agent: AgentRef;
  autonomy: AutonomyLevel;
  /** Paused agents cannot use tools. */
  paused: boolean;
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
    let message = `The server couldn't complete this request (HTTP ${res.status}). Please try again.`;
    try {
      const payload: unknown = await res.json();
      if (
        payload &&
        typeof payload === "object" &&
        "detail" in payload &&
        typeof payload.detail === "string"
      ) {
        message = payload.detail;
      } else if (
        payload &&
        typeof payload === "object" &&
        "detail" in payload &&
        Array.isArray(payload.detail)
      ) {
        const details = payload.detail
          .map((item: unknown) =>
            item && typeof item === "object" && "msg" in item && typeof item.msg === "string"
              ? item.msg
              : null,
          )
          .filter((item): item is string => item !== null);
        if (details.length > 0) message = details.join(" ");
      }
    } catch {
      message = `The server couldn't complete this request (HTTP ${res.status}). Please try again.`;
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const businessApi = {
  searchLocations: (query: string) =>
    request<{ label: string }[]>(
      `/v1/business/locations/search?q=${encodeURIComponent(query)}`,
    ),
  async getDesk() {
    const response = await request<Omit<Desk, "autonomy"> & { autonomy: string }>(
      "/v1/business/desk",
    );
    const autonomy = autonomyLevels[response.autonomy];
    if (!autonomy) {
      throw new ApiError("The server returned an unsupported assistant permission level.", 502);
    }
    return { ...response, autonomy };
  },
  async setPaused(paused: boolean) {
    const response = await request<Omit<Desk, "autonomy"> & { autonomy: string }>(
      "/v1/business/desk",
      { method: "PATCH", body: JSON.stringify({ paused }) },
    );
    const autonomy = autonomyLevels[response.autonomy];
    if (!autonomy) {
      throw new ApiError("The server returned an unsupported assistant permission level.", 502);
    }
    return { ...response, autonomy };
  },

  getStores: () => request<BusinessStore[]>("/v1/business/stores"),
  createStore: (store: StoreDraft) =>
    request<BusinessStore>("/v1/business/stores", {
      method: "POST",
      body: JSON.stringify({ ...store, imageUrl: store.imageUrl?.trim() || null, isPublished: false }),
    }),
  updateStore: (storeId: string, store: StoreDraft) =>
    request<BusinessStore>(`/v1/business/stores/${encodeURIComponent(storeId)}/details`, {
      method: "PATCH",
      body: JSON.stringify({ ...store, imageUrl: store.imageUrl?.trim() || null }),
    }),
  setStorePublished: (storeId: string, isPublished: boolean) =>
    request<BusinessStore>(`/v1/business/stores/${encodeURIComponent(storeId)}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished }),
    }),
  setAgentConfiguration: (storeId: string, configuration: Partial<AgentConfiguration>) =>
    request<BusinessStore["agent"]>(
      `/v1/business/stores/${encodeURIComponent(storeId)}/agent`,
      { method: "PATCH", body: JSON.stringify(configuration) },
    ),
  createProduct: (storeId: string, product: ProductDraft) =>
    request<StoreProduct>(`/v1/business/stores/${encodeURIComponent(storeId)}/products`, {
      method: "POST",
      body: JSON.stringify({
        ...product,
        imageUrl: product.imageUrl?.trim() || null,
        isPublished: false,
      }),
    }),
  setProductPublished: (productId: string, isPublished: boolean) =>
    request<StoreProduct>(`/v1/business/products/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished }),
    }),
  updateProduct: (productId: string, product: ProductDraft) =>
    request<StoreProduct>(`/v1/business/products/${encodeURIComponent(productId)}/details`, {
      method: "PATCH",
      body: JSON.stringify({
        ...product,
        imageUrl: product.imageUrl?.trim() || null,
        isPublished: false,
      }),
    }),
};
