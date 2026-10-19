"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Business, Category } from "@/lib/api";
import { cx } from "@/lib/format";
import { EmptyNotice } from "@/components/ui/notice";
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
      (!q || `${b.name} ${b.tagline}`.toLowerCase().includes(q)),
  );

  return (
    <div>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-3" strokeWidth={2.25} />
        <label htmlFor="market-search" className="sr-only">
          Search shops
        </label>
        <input
          id="market-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shops"
          className="card h-14 w-full pr-4 pl-12 text-lg text-ink placeholder:text-ink-3 focus-visible:outline-offset-0"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Kind of shop">
        {[{ id: null, name: "All" } as { id: string | null; name: string }, ...categories].map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c.id)}
              className={cx(
                "h-10 rounded-full px-4 text-base transition-colors duration-150",
                active ? "bg-ink font-medium text-panel" : "bg-surface text-ink-2 shadow-card hover:text-ink",
              )}
            >
              {c.name}
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 text-base text-ink">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="size-5 accent-[var(--info)]"
          />
          Checked shops only
        </label>
      </div>

      <p className="mt-6 text-base text-ink-2" aria-live="polite">
        {shown.length} {shown.length === 1 ? "shop" : "shops"}
      </p>
      {shown.length === 0 ? (
        <EmptyNotice className="mt-3">
          No shops match. Try clearing a filter, or just ask your assistant: it looks further than this list.
        </EmptyNotice>
      ) : (
        <ul className="mt-3 grid gap-4 md:grid-cols-2">
          {shown.map((b) => (
            <li key={b.id}>
              <BusinessRow business={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
