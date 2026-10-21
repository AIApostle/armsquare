"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CircleAlert, MapPin, Pencil, Plus, Store } from "lucide-react";
import {
  businessApi,
  type AgentConfiguration,
  type BusinessStore,
  type ProductAvailability,
  type ProductDraft,
  type StoreCategoryId,
  type StoreDraft,
} from "@/lib/api/business";
import { useAgentState } from "./agent-state";

const categories: { id: StoreCategoryId; name: string }[] = [
  { id: "skin-care", name: "Skin care" },
  { id: "arts-and-crafts", name: "Arts and crafts" },
  { id: "cycling", name: "Cycling" },
];

const blankStore: StoreDraft = {
  name: "",
  tagline: "",
  description: "",
  categoryId: "skin-care",
  region: "",
  imageUrl: "",
};

const blankProduct: ProductDraft = {
  name: "",
  description: "",
  price: 1,
  unit: "item",
  availability: "in_stock",
  delivery: "",
  imageUrl: "",
};

const availableAgentTools = [
  { id: "catalog.read", label: "Read this shop's catalog" },
  { id: "marketplace.search", label: "Search published shops" },
  { id: "web.research", label: "Research public web sources with Tavily" },
  { id: "product.create_draft", label: "Prepare product drafts" },
] as const;

const autonomyLabels: Record<AgentConfiguration["autonomyLevel"], string> = {
  read_only: "Read-only",
  recommend: "Recommend",
  draft: "Draft",
};

type LocationSuggestion = { label: string };

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export function StoreManager() {
  const { refreshDesk } = useAgentState();
  const [stores, setStores] = useState<BusinessStore[]>([]);
  const [storeDraft, setStoreDraft] = useState(blankStore);
  const [regionQuery, setRegionQuery] = useState("");
  const [locations, setLocations] = useState<LocationSuggestion[]>([]);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState(blankProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [agentDrafts, setAgentDrafts] = useState<Record<string, AgentConfiguration>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingAgent, setSavingAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedStore = stores.find((store) => store.id === selectedId) ?? stores[0] ?? null;
  const agentDraft = selectedStore
    ? agentDrafts[selectedStore.id] ?? {
      enabledTools: selectedStore.agent.enabledTools,
      autonomyLevel: selectedStore.agent.autonomyLevel || "draft",
      isPaused: selectedStore.agent.isPaused,
    }
    : null;

  function updateAgentDraft(
    update: (current: AgentConfiguration) => AgentConfiguration,
  ) {
    if (!selectedStore) return;
    setAgentDrafts((current) => ({
      ...current,
      [selectedStore.id]: update(
        current[selectedStore.id] ?? {
          enabledTools: selectedStore.agent.enabledTools,
          autonomyLevel: selectedStore.agent.autonomyLevel || "draft",
          isPaused: selectedStore.agent.isPaused,
        },
      ),
    }));
  }

  useEffect(() => {
    let active = true;
    businessApi
      .getStores()
      .then((result) => {
        if (!active) return;
        setStores(result);
        setSelectedId(result[0]?.id ?? null);
      })
      .catch((cause: unknown) => {
        if (active) setError(messageFrom(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storeDraft.region) {
      setLocationError("Search for and select a location before saving your shop.");
      document.getElementById("region-search")?.focus();
      return;
    }
    setSavingStore(true);
    setError(null);
    try {
      if (editingStoreId) {
        const updated = await businessApi.updateStore(editingStoreId, storeDraft);
        setStores((current) =>
          current.map((store) => (store.id === updated.id ? updated : store)),
        );
        setSelectedId(updated.id);
      } else {
        const created = await businessApi.createStore(storeDraft);
        setStores((current) => [created, ...current]);
        setSelectedId(created.id);
        await refreshDesk();
      }
      setEditingStoreId(null);
      setStoreDraft(blankStore);
      setRegionQuery("");
      setLocations([]);
      setLocationError(null);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setSavingStore(false);
    }
  }

  function editStore(store: BusinessStore) {
    setStoreDraft({
      name: store.name,
      tagline: store.tagline,
      description: store.description,
      categoryId: store.categoryId,
      region: store.region,
      imageUrl: store.imageUrl ?? "",
    });
    setRegionQuery(store.region);
    setLocations([]);
    setLocationError(null);
    setEditingStoreId(store.id);
    document.getElementById("create-shop-heading")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  async function searchLocations() {
    const query = regionQuery.trim();
    if (query.length < 2) {
      setLocationError("Enter at least two characters to search for a location.");
      return;
    }
    setSearchingLocations(true);
    setLocationError(null);
    setLocations([]);
    try {
      const results = await businessApi.searchLocations(query);
      setLocations(results);
      if (results.length === 0) {
        setLocationError("No matching locations found. Try a nearby city or region.");
      }
    } catch (cause) {
      setLocationError(messageFrom(cause));
    } finally {
      setSearchingLocations(false);
    }
  }

  async function updateStorePublication(store: BusinessStore) {
    setError(null);
    try {
      const updated = await businessApi.setStorePublished(store.id, !store.isPublished);
      setStores((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStore) return;
    setSavingProduct(true);
    setError(null);
    try {
      const updated = editingProductId
        ? await businessApi.updateProduct(editingProductId, productDraft)
        : null;
      const created = updated ?? (await businessApi.createProduct(selectedStore.id, productDraft));
      setStores((current) =>
        current.map((store) =>
          store.id === selectedStore.id
            ? {
                ...store,
                products: updated
                  ? store.products.map((product) =>
                      product.id === updated.id ? updated : product,
                    )
                  : [created, ...store.products],
              }
            : store,
        ),
      );
      setProductDraft(blankProduct);
      setEditingProductId(null);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setSavingProduct(false);
    }
  }

  function editProduct(productId: string) {
    const product = selectedStore?.products.find((item) => item.id === productId);
    if (!product) return;
    setProductDraft({
      name: product.name,
      description: product.description,
      price: product.price.amount,
      unit: product.unit,
      availability: product.availability,
      delivery: product.delivery,
      imageUrl: product.imageUrl ?? "",
    });
    setEditingProductId(product.id);
    document.getElementById("product-form-heading")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  async function updateProductPublication(productId: string, isPublished: boolean) {
    setError(null);
    try {
      const updated = await businessApi.setProductPublished(productId, !isPublished);
      setStores((current) =>
        current.map((store) =>
          store.id === updated.businessId
            ? {
                ...store,
                products: store.products.map((product) =>
                  product.id === updated.id ? updated : product,
                ),
              }
            : store,
        ),
      );
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  async function saveAgentConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStore || !agentDraft) return;
    setSavingAgent(true);
    setError(null);
    try {
      const agent = await businessApi.setAgentConfiguration(selectedStore.id, agentDraft);
      setStores((current) =>
        current.map((store) => (store.id === selectedStore.id ? { ...store, agent } : store)),
      );
      setAgentDrafts((current) => ({
        ...current,
        [selectedStore.id]: {
          enabledTools: agent.enabledTools,
          autonomyLevel: agent.autonomyLevel,
          isPaused: agent.isPaused,
        },
      }));
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setSavingAgent(false);
    }
  }

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading your shop" className="space-y-4">
        <div className="h-28 animate-pulse rounded-card bg-panel-raised" />
        <div className="h-56 animate-pulse rounded-card bg-panel-raised" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-card bg-danger-wash px-4 py-3 text-sm text-ink">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
          <span>{error}</span>
        </p>
      )}

      <section
        className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        aria-labelledby="external-store-heading"
      >
        <div>
          <h2 id="external-store-heading" className="text-lg font-bold text-ink">
            Connect an external shop
          </h2>
          <p className="mt-1 text-base text-ink-2">
            Available soon, after supported imports and permissions are ready.
          </p>
        </div>
        <span className="inline-flex h-9 w-fit items-center rounded-full bg-panel-raised px-3 text-sm font-medium text-ink-2">
          Available soon
        </span>
      </section>

      {stores.length > 0 && (
        <section aria-labelledby="store-heading" className="card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="store-heading" className="text-lg font-bold text-ink">
                {selectedStore?.name}
              </h2>
              {stores.length > 1 && (
                <label className="mt-3 block text-sm font-medium text-ink-2">
                  Choose a shop
                  <select
                    value={selectedStore?.id}
                    onChange={(event) => {
                      setSelectedId(event.target.value);
                      setEditingStoreId(null);
                      setStoreDraft(blankStore);
                      setRegionQuery("");
                      setLocations([]);
                      setLocationError(null);
                      setEditingProductId(null);
                      setProductDraft(blankProduct);
                    }}
                    className="card mt-1 block h-11 w-full max-w-sm px-3 text-base text-ink"
                  >
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="mt-1 text-base text-ink-2">
                {selectedStore?.isPublished ? "Visible to shoppers" : "Not visible to shoppers yet"}
                {" · "}
                Assistant {selectedStore?.agent.isPaused ? "paused" : "ready"}
              </p>
            </div>
            {selectedStore && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => editStore(selectedStore)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-control border border-rule px-4 text-base font-medium text-ink hover:bg-panel-raised"
                >
                  <Pencil aria-hidden className="size-4" />
                  Edit shop
                </button>
                <button
                  type="button"
                  onClick={() => updateStorePublication(selectedStore)}
                  className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-5 text-base font-medium text-on-primary hover:bg-primary-hover"
                >
                  {selectedStore.isPublished ? "Unpublish shop" : "Publish shop"}
                </button>
              </div>
            )}
          </div>

          {selectedStore && (
            <>
              <section aria-labelledby="assistant-permissions-heading" className="mt-6 rounded-inset bg-info-wash p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 id="assistant-permissions-heading" className="font-bold text-ink">
                      {selectedStore.agent.name}
                    </h3>
                    <p className="mt-1 text-sm text-ink-2">
                      The assistant can only use these enabled tools for this shop. It cannot publish products or make purchases.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-surface px-3 py-1 text-sm font-medium text-ink">
                    {autonomyLabels[selectedStore.agent.autonomyLevel]} permission
                  </span>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {selectedStore.agent.enabledTools.map((tool) => (
                    <li key={tool} className="rounded-full border border-rule bg-surface px-3 py-1 text-sm text-ink-2">
                      {tool === "catalog.read"
                        ? "Read catalog"
                        : tool === "marketplace.search"
                          ? "Search public listings"
                          : tool === "web.research"
                            ? "Research public web sources"
                          : tool === "product.create_draft"
                            ? "Prepare product drafts"
                            : tool}
                    </li>
                  ))}
                </ul>
                {agentDraft && (
                  <form onSubmit={saveAgentConfiguration} className="mt-5 border-t border-rule pt-4">
                    <h4 className="font-bold text-ink">Assistant permissions</h4>
                    <fieldset className="mt-3">
                      <legend className="text-sm font-medium text-ink-2">Available tools</legend>
                      <p className="mt-1 max-w-[65ch] text-sm text-ink-2">
                        Tavily research is read-only. Its public-web results are unverified context, not current
                        shop prices, stock, business verification, or authority to transact.
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {availableAgentTools.map((tool) => (
                          <label key={tool.id} className="flex items-start gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={agentDraft.enabledTools.includes(tool.id)}
                              onChange={(event) =>
                                updateAgentDraft((current) => {
                                  const enabledTools = event.target.checked
                                    ? [...current.enabledTools, tool.id]
                                    : current.enabledTools.filter((enabled) => enabled !== tool.id);
                                  return { ...current, enabledTools };
                                })
                              }
                              className="mt-0.5 size-4 accent-[var(--info)]"
                            />
                            {tool.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium text-ink">
                        Permission level
                        <select
                          value={agentDraft.autonomyLevel}
                          onChange={(event) =>
                            updateAgentDraft((current) => ({
                              ...current,
                              autonomyLevel: event.target.value as AgentConfiguration["autonomyLevel"],
                            }))
                          }
                          className="card mt-1 block h-11 w-full px-3 text-base"
                        >
                          <option value="read_only">Read only</option>
                          <option value="recommend">Recommend actions</option>
                          <option value="draft">Prepare drafts</option>
                        </select>
                        <span className="mt-1 block text-xs text-ink-3">
                          This prototype only supports read, search and draft actions.
                        </span>
                      </label>
                      <label className="flex items-center gap-2 self-start pt-7 text-sm font-medium text-ink">
                        <input
                          type="checkbox"
                          checked={agentDraft.isPaused}
                          onChange={(event) =>
                            updateAgentDraft((current) => ({
                              ...current,
                              isPaused: event.target.checked,
                            }))
                          }
                          className="size-4 accent-[var(--primary)]"
                        />
                        Pause this shop&apos;s assistant
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={savingAgent || agentDraft.enabledTools.length === 0}
                      className="mt-4 inline-flex h-10 items-center justify-center rounded-control border border-rule-strong bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-sunk disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingAgent ? "Saving..." : "Save assistant settings"}
                    </button>
                  </form>
                )}
              </section>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-ink">Products</h3>
                  <p className="mt-1 text-sm text-ink-2">
                    Assistant-created listings stay as drafts until you publish them.
                  </p>
                </div>
                <span className="text-sm text-ink-3">
                  {selectedStore.products.length}{" "}
                  {selectedStore.products.length === 1 ? "product" : "products"}
                </span>
              </div>
              {selectedStore.products.length > 0 ? (
                <ul className="mt-3 grid gap-3">
                  {selectedStore.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex flex-col gap-3 rounded-control border border-rule p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-ink">{product.name}</p>
                        <p className="mt-1 text-sm text-ink-2">{product.description}</p>
                        <p className="mt-1 text-sm text-ink-3">
                          ${product.price.amount.toFixed(2)} per {product.unit}
                          {" · "}
                          {product.isPublished ? "Published" : "Draft"}
                          {product.createdByAgent ? " · Prepared by assistant" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => editProduct(product.id)}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-control border border-rule px-4 text-sm font-medium text-ink hover:bg-panel-raised"
                      >
                        <Pencil aria-hidden className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProductPublication(product.id, product.isPublished)}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-control border border-rule px-4 text-sm font-medium text-ink hover:bg-panel-raised"
                      >
                        {product.isPublished ? "Unpublish" : "Publish"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-control border-2 border-dashed border-rule px-5 py-7 text-center">
                  <Store aria-hidden className="mx-auto size-7 text-info" />
                  <p className="mt-2 font-medium text-ink">Your catalog is ready for its first product</p>
                  <p className="mt-1 text-sm text-ink-2">Add an item below, then publish it when it is ready.</p>
                </div>
              )}

              <form onSubmit={createProduct} className="mt-6 border-t border-rule pt-5">
                <h3 id="product-form-heading" className="text-base font-bold text-ink">
                  {editingProductId ? "Edit product" : "Add a product"}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-ink">
                    Product name
                    <input
                      required
                      minLength={2}
                      maxLength={160}
                      value={productDraft.name}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, name: event.target.value }))
                      }
                      className="card mt-1 block h-11 w-full px-3 text-base"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Price in USD
                    <input
                      required
                      type="number"
                      min="0.01"
                      max="9999999999.99"
                      step="0.01"
                      value={productDraft.price}
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          price: Number(event.target.value),
                        }))
                      }
                      className="card mt-1 block h-11 w-full px-3 text-base"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink sm:col-span-2">
                    Description
                    <textarea
                      required
                      maxLength={2000}
                      value={productDraft.description}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, description: event.target.value }))
                      }
                      className="card mt-1 block min-h-24 w-full resize-y px-3 py-2 text-base"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Unit
                    <input
                      required
                      maxLength={40}
                      value={productDraft.unit}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, unit: event.target.value }))
                      }
                      className="card mt-1 block h-11 w-full px-3 text-base"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Availability
                    <select
                      value={productDraft.availability}
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          availability: event.target.value as ProductAvailability,
                        }))
                      }
                      className="card mt-1 block h-11 w-full px-3 text-base"
                    >
                      <option value="in_stock">In stock</option>
                      <option value="low_stock">Low stock</option>
                      <option value="made_to_order">Made to order</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-ink sm:col-span-2">
                    Delivery details
                    <input
                      required
                      maxLength={180}
                      value={productDraft.delivery}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, delivery: event.target.value }))
                      }
                      className="card mt-1 block h-11 w-full px-3 text-base"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink sm:col-span-2">
                    Product image URL (optional)
                    <input
                      type="url"
                      value={productDraft.imageUrl ?? ""}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, imageUrl: event.target.value }))
                      }
                      className="card mt-1 block h-11 w-full px-3 text-base"
                    />
                    <span className="mt-1 block text-xs text-ink-3">Use a secure https:// image address.</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-base font-medium text-on-primary hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                >
                  <Plus aria-hidden className="size-4" />
                  {savingProduct
                    ? editingProductId
                      ? "Saving..."
                      : "Adding..."
                    : editingProductId
                      ? "Save changes"
                      : "Add as draft"}
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductDraft(blankProduct);
                    }}
                    className="ml-2 inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium text-ink-2 hover:bg-panel-raised"
                  >
                    Cancel edit
                  </button>
                )}
              </form>
            </>
          )}
        </section>
      )}

      <section aria-labelledby="create-shop-heading" className="card p-5 sm:p-6">
        <h2 id="create-shop-heading" className="text-lg font-bold text-ink">
          {editingStoreId
            ? "Edit shop details"
            : stores.length === 0
              ? "Create your shop"
              : "Create another shop"}
        </h2>
        <p className="mt-1 max-w-[60ch] text-base text-ink-2">
          A private assistant is set up for each shop. You control its public catalog.
        </p>
        <form onSubmit={createStore} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Shop name
            <input
              required
              minLength={2}
              maxLength={160}
              value={storeDraft.name}
              onChange={(event) => setStoreDraft((current) => ({ ...current, name: event.target.value }))}
              className="card mt-1 block h-11 w-full px-3 text-base"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Short description
            <input
              required
              minLength={2}
              maxLength={180}
              value={storeDraft.tagline}
              onChange={(event) => setStoreDraft((current) => ({ ...current, tagline: event.target.value }))}
              className="card mt-1 block h-11 w-full px-3 text-base"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Category
            <select
              value={storeDraft.categoryId}
              onChange={(event) =>
                setStoreDraft((current) => ({
                  ...current,
                  categoryId: event.target.value as StoreCategoryId,
                }))
              }
              className="card mt-1 block h-11 w-full px-3 text-base"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm font-medium text-ink">
            Business location
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <input
                id="region-search"
                type="search"
                maxLength={120}
                value={regionQuery}
                onChange={(event) => {
                  setRegionQuery(event.target.value);
                  setStoreDraft((current) => ({ ...current, region: "" }));
                  setLocations([]);
                  setLocationError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void searchLocations();
                  }
                }}
                placeholder="Search a city, region, or country"
                aria-describedby="location-attribution location-feedback"
                className="card block h-11 min-w-0 flex-1 px-3 text-base"
              />
              <button
                type="button"
                onClick={() => void searchLocations()}
                disabled={searchingLocations || regionQuery.trim().length < 2}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control border border-rule px-4 text-sm font-medium text-ink hover:bg-panel-raised disabled:cursor-wait disabled:opacity-60"
              >
                <MapPin aria-hidden className="size-4" />
                {searchingLocations ? "Searching..." : "Search locations"}
              </button>
            </div>
            <p id="location-attribution" className="mt-1 text-xs font-normal text-ink-3">
              Location search by OpenStreetMap contributors via Photon.
            </p>
            {storeDraft.region && (
              <p className="mt-2 text-sm font-normal text-success" aria-live="polite">
                Selected location: {storeDraft.region}
              </p>
            )}
            {locationError && (
              <p id="location-feedback" className="mt-2 text-sm font-normal text-danger" role="alert">
                {locationError}
              </p>
            )}
            {locations.length > 0 && (
              <ul className="mt-2 grid gap-2" aria-label="Location search results">
                {locations.map((location) => (
                  <li key={location.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setStoreDraft((current) => ({ ...current, region: location.label }));
                        setRegionQuery(location.label);
                        setLocations([]);
                        setLocationError(null);
                      }}
                      className="flex min-h-11 w-full items-center gap-2 rounded-control border border-rule px-3 py-2 text-left text-sm font-normal text-ink hover:bg-panel-raised focus-visible:outline-offset-2"
                    >
                      <MapPin aria-hidden className="size-4 shrink-0 text-info" />
                      {location.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="text-sm font-medium text-ink sm:col-span-2">
            About your shop
            <textarea
              required
              maxLength={2000}
              value={storeDraft.description}
              onChange={(event) =>
                setStoreDraft((current) => ({ ...current, description: event.target.value }))
              }
              className="card mt-1 block min-h-24 w-full resize-y px-3 py-2 text-base"
            />
          </label>
          <label className="text-sm font-medium text-ink sm:col-span-2">
            Shop image URL (optional)
            <input
              type="url"
              value={storeDraft.imageUrl ?? ""}
              onChange={(event) => setStoreDraft((current) => ({ ...current, imageUrl: event.target.value }))}
              className="card mt-1 block h-11 w-full px-3 text-base"
            />
            <span className="mt-1 block text-xs text-ink-3">Use a secure https:// image address.</span>
          </label>
          <button
            type="submit"
            disabled={savingStore}
            className="inline-flex h-11 items-center justify-center gap-2 justify-self-start rounded-control bg-primary px-5 text-base font-medium text-on-primary hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            <Plus aria-hidden className="size-4" />
            {savingStore ? "Saving..." : editingStoreId ? "Save shop details" : "Create shop"}
          </button>
          {editingStoreId && (
            <button
              type="button"
              onClick={() => {
                setEditingStoreId(null);
                setStoreDraft(blankStore);
              }}
              className="inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium text-ink-2 hover:bg-panel-raised"
            >
              Cancel edit
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
