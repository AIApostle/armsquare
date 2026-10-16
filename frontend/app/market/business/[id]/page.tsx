import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { api } from "@/lib/api";
import { count, cx, formatMonthYear, money, replyTime } from "@/lib/format";
import { Verified } from "@/components/ui/mark";

// Prerender the known businesses when the API is reachable at build time;
// otherwise every page renders on request inside the Suspense boundary below.
export async function generateStaticParams() {
  try {
    const businesses = await api.getBusinesses();
    return businesses.map((b) => ({ id: b.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/market/business/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = await api.getBusiness(id);
  return { title: found?.business.name ?? "Business" };
}

const availability = {
  in_stock: { label: "In stock", tone: "text-success" },
  low_stock: { label: "Low stock", tone: "text-primary-ink" },
  made_to_order: { label: "Made to order", tone: "text-ink-2" },
} as const;

export default function BusinessPage({ params }: PageProps<"/market/business/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-5xl animate-pulse rounded-panel bg-panel-raised" aria-busy="true" />}>
      <BusinessDetail params={params} />
    </Suspense>
  );
}

async function BusinessDetail({ params }: { params: PageProps<"/market/business/[id]">["params"] }) {
  const { id } = await params;
  const found = await api.getBusiness(id);
  if (!found) notFound();
  const { business: b, listings } = found;
  const verified = b.verification === "verified";
  const ask = (item: string) => `/market?ask=${encodeURIComponent(`${item} from ${b.name}`)}`;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/market/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft aria-hidden className="size-3.5" strokeWidth={2} />
        Market
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">{b.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
            {b.tagline}
            <span className="text-ink-3">{b.region}</span>
            <Verified verified={verified} />
          </p>
        </div>
        <Link
          href={ask("a quote")}
          className="inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-base font-semibold text-on-primary transition-colors duration-150 hover:bg-primary-hover"
        >
          <Send aria-hidden className="size-4" strokeWidth={2} />
          Ask my agent to get a quote
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="listings-heading" className="min-w-0">
          <h2 id="listings-heading" className="text-sm font-semibold text-ink-2">
            Listings
          </h2>
          <ul className="surface mt-2 divide-y divide-rule overflow-hidden">
            {listings.map((l) => (
              <li key={l.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink">{l.name}</p>
                  <p className="text-sm text-ink-2">{l.description}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs">
                    <span className={availability[l.availability].tone}>{availability[l.availability].label}</span>
                    <span className="text-ink-3">{l.delivery}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="figure text-base text-ink">
                    {money(l.price.amount)} <span className="text-xs text-ink-3">/ {l.unit}</span>
                  </span>
                  <Link href={ask(l.name)} className="text-sm font-semibold text-ink-2 underline decoration-rule-strong hover:text-ink hover:decoration-ink">
                    Ask my agent
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-3">
            List prices. Your agent may negotiate within your limits before anything is bought.
          </p>
        </section>

        <aside className="flex flex-col gap-6">
          <section aria-labelledby="agent-heading">
            <h2 id="agent-heading" className="text-sm font-semibold text-ink-2">
              Their agent
            </h2>
            <div className="plate mt-2 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="socket" data-lamp="talking" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{b.agent.name}</p>
                  <p className="figure text-xs text-ink-3">{b.agent.id}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-3">{replyTime(b.agent.medianReplySeconds)}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {b.agent.capabilities.map((c) => (
                  <li key={c} className="rounded-full bg-panel-raised px-2 py-0.5 text-xs text-ink-2">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="record-heading">
            <h2 id="record-heading" className="text-sm font-semibold text-ink-2">
              Record on armsquare
            </h2>
            <dl className="surface mt-2 grid grid-cols-2 gap-px overflow-hidden bg-rule">
              {[
                ["Orders fulfilled", count(b.trust.ordersFulfilled)],
                ["On time", b.trust.onTimeRate === null ? "–" : `${b.trust.onTimeRate}%`],
                ["Disputes", count(b.trust.disputes)],
                ["Member since", formatMonthYear(b.trust.memberSince)],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface px-3 py-2.5">
                  <dt className="text-xs text-ink-3">{k}</dt>
                  <dd className="figure text-lg text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className={cx("mt-2 text-xs", verified ? "text-ink-3" : "text-ink-2")}>
              {verified
                ? "Counted from completed orders on armsquare."
                : "This business isn't verified yet and has no order history here."}
            </p>
          </section>

          {b.claims.length > 0 && (
            <section aria-labelledby="claims-heading">
              <h2 id="claims-heading" className="text-sm font-semibold text-ink-2">
                What the business says
              </h2>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-2">
                {b.claims.map((c) => (
                  <li key={c}>&ldquo;{c}&rdquo;</li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-ink-3">Claims, not checked by armsquare.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
