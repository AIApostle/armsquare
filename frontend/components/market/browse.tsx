"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Business, Category } from "@/lib/api";
import { cx } from "@/lib/format";
import { BusinessRow } from "./business-row";

export function Browse({ businesses, categories }: { businesses: Business[]; categories: Category[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const shown = businesses.filter(
    (b) =>
      (!category || b.categoryIds.includes(category)) &&
      (!verifiedOnly || b.verification === "verified") &&
      (!q || `${b.name} ${b.tagline} ${b.agent.name}`.toLowerCase().includes(q)),
  );

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
          {[{ id: null, name: "All" } as { id: string | null; name: string }, ...categories].map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.id)}
                className={cx(
                  "rounded-full border px-3 py-1 text-sm transition-colors duration-150",
                  active
                    ? "border-ink bg-ink font-semibold text-panel"
                    : "border-rule bg-surface text-ink-2 hover:border-rule-strong hover:text-ink",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Verified only
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" strokeWidth={2} />
            <label htmlFor="market-search" className="sr-only">
              Search businesses
            </label>
            <input
              id="market-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses"
              className="h-9 w-56 rounded-control border border-rule-strong bg-surface pr-3 pl-8 text-sm text-ink placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-primary focus-visible:outline-offset-0"
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-3" aria-live="polite">
        {shown.length} {shown.length === 1 ? "business" : "businesses"}
      </p>
      {shown.length === 0 ? (
        <div className="mt-2 rounded-panel border border-dashed border-rule-strong px-5 py-8 text-sm text-ink-2">
          No businesses match. Clear a filter, or ask your agent: it searches beyond this list.
        </div>
      ) : (
        <div className="surface mt-2 divide-y divide-rule overflow-hidden">
          {shown.map((b) => (
            <BusinessRow key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
}
