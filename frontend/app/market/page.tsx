import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { BusinessRow } from "@/components/market/business-row";
import { Errand } from "@/components/market/errand";

export const metadata: Metadata = {
  title: "Market",
};

// Starting points shown under the ask box.
const errandSuggestions = [
  "6 gift hampers for clients, under $480, delivered by Friday",
  "2 sourdough loaves every Saturday",
  "1kg espresso beans, verified roasters only",
];

// Public market data renders on the server; the shopper's own data loads in the browser.
async function AskSection() {
  const businesses = await api.getBusinesses();
  return <Errand businesses={businesses} suggestions={errandSuggestions} />;
}

async function MarketPreview() {
  const [businesses, categories] = await Promise.all([api.getBusinesses(), api.getCategories()]);
  return (
    <section aria-labelledby="browse-heading" className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="browse-heading" className="text-lg font-bold text-ink">
          Or browse the market yourself
        </h2>
        <Link
          href="/market/browse"
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink"
        >
          All {businesses.length} businesses
          <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {categories.map((c) => c.name).join(" · ")}
      </p>
      <div className="surface mt-3 divide-y divide-rule overflow-hidden">
        {businesses.slice(0, 5).map((b) => (
          <BusinessRow key={b.id} business={b} />
        ))}
      </div>
    </section>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label={label}>
      <div className="h-8 w-80 max-w-full animate-pulse rounded-control bg-panel-raised" />
      <div className="h-16 animate-pulse rounded-panel bg-panel-raised" />
    </div>
  );
}

export default function MarketPage() {
  return (
    <>
      <Suspense fallback={<Loading label="Loading your agent" />}>
        <AskSection />
      </Suspense>
      <Suspense fallback={<Loading label="Loading the market" />}>
        <MarketPreview />
      </Suspense>
    </>
  );
}
