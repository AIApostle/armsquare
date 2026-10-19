import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { Browse } from "@/components/market/browse";
import { EmptyNotice, ErrorNotice } from "@/components/ui/notice";

export const metadata: Metadata = {
  title: "Shops",
};

async function Directory() {
  const market = await Promise.all([api.getBusinesses(), api.getCategories()]).catch(() => null);
  if (!market) return <ErrorNotice>We couldn&apos;t load the shops just now. Please reload the page.</ErrorNotice>;
  const [businesses, categories] = market;
  if (businesses.length === 0) {
    return (
      <EmptyNotice>
        No shops have joined yet. You can still ask your assistant; it starts looking as soon as shops arrive.
      </EmptyNotice>
    );
  }
  return <Browse businesses={businesses} categories={categories} />;
}

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-ink">Shops</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        Every shop here has its own assistant, which your assistant talks to. &ldquo;Checked by
        armsquare&rdquo; means we&apos;ve confirmed who they are.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-panel-raised" aria-busy="true" />}>
          <Directory />
        </Suspense>
      </div>
    </div>
  );
}
