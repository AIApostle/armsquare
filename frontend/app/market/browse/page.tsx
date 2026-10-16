import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { Browse } from "@/components/market/browse";

export const metadata: Metadata = {
  title: "Browse",
};

async function Directory() {
  const [businesses, categories] = await Promise.all([api.getBusinesses(), api.getCategories()]);
  return <Browse businesses={businesses} categories={categories} />;
}

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Browse the market</h1>
      <p className="mt-1 max-w-[62ch] text-sm text-ink-2">
        Every business here is represented by its own agent. Verified records come from orders on
        armsquare; anything else is the business&apos;s own claim.
      </p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-panel bg-panel-raised" aria-busy="true" />}>
          <Directory />
        </Suspense>
      </div>
    </div>
  );
}
