import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { api } from "@/lib/api";
import { count, formatMonthYear, money, replyTime } from "@/lib/format";
import { Verified } from "@/components/ui/mark";
import { EmptyNotice, ErrorNotice } from "@/components/ui/notice";
import { Picto, PictoRow } from "@/components/ui/picto";

// Shop pages render on request inside the Suspense boundary below, so a
// shop that joins has a page straight away.
export async function generateMetadata({ params }: PageProps<"/market/business/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = await api.getBusiness(id).catch(() => null);
  return { title: found?.business.name ?? "Shop" };
}

const availability = {
  in_stock: { label: "In stock", tone: "text-success" },
  low_stock: { label: "Only a few left", tone: "text-primary-ink" },
  made_to_order: { label: "Made to order", tone: "text-ink-2" },
} as const;

export default function BusinessPage({ params }: PageProps<"/market/business/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-5xl animate-pulse rounded-card bg-panel-raised" aria-busy="true" />}>
      <BusinessDetail params={params} />
    </Suspense>
  );
}

async function BusinessDetail({ params }: { params: PageProps<"/market/business/[id]">["params"] }) {
  const { id } = await params;
  let found: Awaited<ReturnType<typeof api.getBusiness>>;
  try {
    found = await api.getBusiness(id);
  } catch {
    return (
      <ErrorNotice className="mx-auto max-w-5xl">We couldn&apos;t load this shop just now. Please reload the page.</ErrorNotice>
    );
  }
  if (!found) notFound();
  const { business: b, listings } = found;
  const verified = b.verification === "verified";
  const ask = (item: string) => `/market?ask=${encodeURIComponent(`${item} from ${b.name}`)}`;
  // Out of every 10 orders, how many arrived on time; rounded down so it never overstates.
  const onTime = b.trust.onTimeRate === null ? null : Math.floor(b.trust.onTimeRate / 10);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/market/browse" className="inline-flex items-center gap-1.5 text-base font-medium text-ink-2 hover:text-ink">
        <ArrowLeft aria-hidden className="size-4" strokeWidth={2.25} />
        All shops
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-card bg-info-wash">
            <Picto name="shop" tone="assistant" className="size-9" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">{b.name}</h1>
            <p className="mt-1 text-lg text-ink-2">{b.tagline}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {b.isDemo ? (
                <span className="text-sm font-medium text-ink-2">Fictional demo shop</span>
              ) : (
                <Verified verified={verified} />
              )}
              <span className="text-sm text-ink-3">{b.region}</span>
            </p>
          </div>
        </div>
        <Link
          href={ask("a price")}
          className="inline-flex h-13 items-center gap-2 rounded-control bg-primary px-6 text-lg font-medium text-on-primary shadow-card transition-colors duration-150 hover:bg-primary-hover"
        >
          <Send aria-hidden className="size-5" strokeWidth={2.25} />
          Ask my assistant for a price
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="listings-heading" className="min-w-0">
          <h2 id="listings-heading" className="text-xl font-bold text-ink">
            What they sell
          </h2>
          {listings.length === 0 ? (
            <EmptyNotice className="mt-4">
              {b.name} hasn&apos;t listed anything yet. Your assistant can still ask them for a price.
            </EmptyNotice>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {listings.map((l) => (
                <li key={l.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-ink">{l.name}</p>
                    <p className="text-base text-ink-2">{l.description}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
                      <span className={availability[l.availability].tone}>{availability[l.availability].label}</span>
                      <span className="text-ink-3">{l.delivery}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <span className="figure text-xl font-bold text-ink">
                      {money(l.price.amount)} <span className="text-sm font-normal text-ink-3">per {l.unit}</span>
                    </span>
                    <Link href={ask(l.name)} className="text-base font-medium text-info hover:underline">
                      Ask my assistant
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-base text-ink-3">
            These are their usual prices. Your assistant may get you a better one.
          </p>
        </section>

        <aside className="flex flex-col gap-6">
          <section aria-labelledby="record-heading" className="card p-6">
            <h2 id="record-heading" className="text-lg font-bold text-ink">
              Their track record
            </h2>
            {b.isDemo ? (
              <p className="mt-2 text-base text-ink-2">
                This fictional demo shop has sample products and no real orders or verified history.
              </p>
            ) : verified && b.trust.ordersFulfilled > 0 ? (
              <>
                <p className="mt-3 text-base text-ink-2">
                  <span className="figure text-2xl font-bold text-ink">{count(b.trust.ordersFulfilled)}</span> orders delivered
                </p>
                {onTime !== null && (
                  <div className="mt-4">
                    <PictoRow
                      name="box"
                      total={10}
                      filled={onTime}
                      tone="done"
                      size="size-[1.125rem]"
                      className="gap-0.5"
                      label={`${b.trust.onTimeRate}% delivered on time`}
                    />
                    <p className="mt-1 text-sm text-ink-2">
                      <span className="figure">{b.trust.onTimeRate}%</span> arrived on time. Each box is 1 in 10 orders.
                    </p>
                  </div>
                )}
                <p className="mt-4 text-sm text-ink-2">
                  {b.trust.disputes === 0 ? "No complaints" : `${count(b.trust.disputes)} complaints`} · on armsquare since{" "}
                  {formatMonthYear(b.trust.memberSince)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-base text-ink-2">
                {verified ? "No orders through armsquare yet." : "Not checked yet, and no orders through armsquare so far."}
              </p>
            )}
            <p className="mt-4 text-sm text-ink-3">Counted from real orders on armsquare.</p>
          </section>

          <section aria-labelledby="assistant-heading" className="card p-6">
            <h2 id="assistant-heading" className="text-lg font-bold text-ink">
              Their assistant
            </h2>
            <p className="mt-2 flex items-center gap-2 text-base text-ink">
              <span aria-hidden className="dot" data-tone="assistant" />
              {replyTime(b.agent.medianReplySeconds)}
            </p>
          </section>

          {b.claims.length > 0 && (
            <section aria-labelledby="claims-heading" className="card p-6">
              <h2 id="claims-heading" className="text-lg font-bold text-ink">
                In their own words
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-base text-ink-2">
                {b.claims.map((c) => (
                  <li key={c}>&ldquo;{c}&rdquo;</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-3">The shop says this; armsquare hasn&apos;t checked it.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
