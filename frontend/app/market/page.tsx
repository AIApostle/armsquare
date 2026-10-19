import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { api, type Business } from "@/lib/api";
import { BusinessRow } from "@/components/market/business-row";
import { Errand } from "@/components/market/errand";
import { EmptyNotice, ErrorNotice } from "@/components/ui/notice";

export const metadata: Metadata = {
  title: "Ask",
};

// Public market data renders on the server; the shopper's own data loads in the browser.
async function AskSection() {
  // The errand only uses the shop list to name sellers; it still works without it.
  const businesses: Business[] = await api.getBusinesses().catch(() => []);
  return <Errand businesses={businesses} />;
}

async function MarketPreview() {
  const businesses = await api.getBusinesses().catch(() => null);
  return (
    <section aria-labelledby="browse-heading" className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="browse-heading" className="text-xl font-bold text-ink">
          Or look around yourself
        </h2>
        {businesses && businesses.length > 0 && (
          <Link href="/market/browse" className="inline-flex items-center gap-1 text-base font-medium text-info hover:underline">
            See all {businesses.length} {businesses.length === 1 ? "shop" : "shops"}
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
          </Link>
        )}
      </div>
      {!businesses ? (
        <ErrorNotice className="mt-4">We couldn&apos;t load the shops just now. Please reload the page.</ErrorNotice>
      ) : businesses.length === 0 ? (
        <EmptyNotice className="mt-4">
          No shops have joined yet. When they do, you&apos;ll see them here.
        </EmptyNotice>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {businesses.slice(0, 4).map((b) => (
            <li key={b.id}>
              <BusinessRow business={b} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4" aria-busy="true" aria-label={label}>
      <div className="h-10 w-72 max-w-full animate-pulse rounded-full bg-panel-raised" />
      <div className="h-18 w-full animate-pulse rounded-card bg-panel-raised" />
    </div>
  );
}

export default function MarketPage() {
  return (
    <>
      <Suspense fallback={<Loading label="Loading your assistant" />}>
        <AskSection />
      </Suspense>
      <Suspense fallback={<Loading label="Loading shops" />}>
        <MarketPreview />
      </Suspense>
    </>
  );
}
