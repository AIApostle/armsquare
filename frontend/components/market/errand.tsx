"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleCheck, CircleX, Send } from "lucide-react";
import {
  api,
  type Business,
  type CustomerAgentSettings,
  type ErrandEvent,
  type ErrandStatus,
  type Offer,
  type Order,
} from "@/lib/api";
import { cx, formatDay, formatTime, money, moneyWhole } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Status, Verified } from "@/components/ui/mark";
import { ErrorNotice } from "@/components/ui/notice";
import { PictoRow, signUnit } from "@/components/ui/picto";
import { constraintText, roundText } from "./text";

export function Errand({ businesses }: { businesses: Business[] }) {
  // A shop page can hand over a starting request (?ask=...); the shopper still sends it.
  const handedOver = useSearchParams().get("ask") ?? "";
  const [request, setRequest] = useState(handedOver);
  const [settings, setSettings] = useState<CustomerAgentSettings | null>(null);
  const [errandId, setErrandId] = useState<string | null>(null);
  const [status, setStatus] = useState<ErrandStatus | null>(null);
  const [sentRequest, setSentRequest] = useState("");
  const [events, setEvents] = useState<ErrandEvent[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer>>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [approvedId, setApprovedId] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribe = useRef<(() => void) | null>(null);

  // The shopper's own rules are read in the browser, where their session lives.
  useEffect(() => {
    let live = true;
    api
      .getAgentSettings()
      .then((s) => live && setSettings(s))
      .catch(() => live && setError("We couldn't load your assistant's rules. It still follows them when it shops."));
    return () => {
      live = false;
      unsubscribe.current?.();
    };
  }, []);

  const byId = useMemo(() => Object.fromEntries(businesses.map((b) => [b.id, b])), [businesses]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || starting) return;
    unsubscribe.current?.();
    setStarting(true);
    setError(null);
    setEvents([]);
    setOffers({});
    setOrder(null);
    setApprovedId(null);
    setSentRequest(value);
    try {
      const errand = await api.startErrand(value);
      setErrandId(errand.id);
      setStatus(errand.status);
      unsubscribe.current = api.subscribeErrand(
        errand.id,
        (event) => {
          setEvents((list) => (list.some((e) => e.id === event.id) ? list : [...list, event]));
          if (event.status) setStatus(event.status);
          const offer = event.offer;
          if (offer) setOffers((o) => ({ ...o, [offer.id]: offer }));
          if (event.kind === "payment") setOrder((o) => (o ? { ...o, payment: "confirmed" } : o));
        },
        () => {
          setStatus("failed");
          setError("We lost touch with your assistant. It keeps working; reload the page to catch up.");
        },
      );
    } catch {
      setErrandId(null);
      setStatus(null);
      setError("Your assistant couldn't start. Check your internet connection and try again.");
    } finally {
      setStarting(false);
    }
  }

  async function approve(offer: Offer) {
    if (!errandId || approving) return;
    setApproving(offer.id);
    setError(null);
    try {
      const placed = await api.approveOffer(errandId, offer.id);
      setApprovedId(offer.id);
      setOrder(placed);
    } catch {
      setError("That didn't go through, so nothing was bought. Please try again.");
    } finally {
      setApproving(null);
    }
  }

  const running = status === "running";
  const ordered = !!order;
  const sorted = Object.values(offers).sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    return b.fit.filter((f) => f.ok).length - a.fit.filter((f) => f.ok).length;
  });
  const budget =
    events.flatMap((e) => e.constraints ?? []).find((c) => c.kind === "budget")?.max.amount ??
    settings?.errandBudget.amount ??
    Infinity;

  return (
    <div className="flex flex-col gap-10">
      {/* Ask */}
      <section aria-labelledby="ask-heading" className="mx-auto w-full max-w-3xl text-center">
        <h1 id="ask-heading" className="text-2xl font-bold text-ink sm:text-[2.5rem] sm:leading-tight">
          What do you need?
        </h1>
        <p className="mx-auto mt-2 min-h-6 max-w-[52ch] text-lg text-ink-2">
          {settings ? (
            <>
              {settings.agentName} shops for you, spends up to {moneyWhole(settings.errandBudget.amount)} at a
              time, and asks before buying anything over {moneyWhole(settings.autoApproveUnder.amount)}.{" "}
              <Link href="/market/agent" className="font-medium text-info underline">
                Change this
              </Link>
            </>
          ) : error ? null : (
            <span className="inline-block h-5 w-96 max-w-full animate-pulse rounded-full bg-panel-raised" aria-hidden />
          )}
        </p>
        <form
          className="card mt-6 flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            send(request);
          }}
        >
          <label htmlFor="errand-input" className="sr-only">
            Describe what you need
          </label>
          <input
            id="errand-input"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="e.g. 2 loaves, under $15, by Saturday"
            autoComplete="off"
            className="h-14 min-w-0 flex-1 rounded-control bg-transparent px-4 text-lg text-ink placeholder:text-ink-3 focus-visible:outline-offset-0"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={starting}
            disabled={!request.trim()}
            icon={<Send aria-hidden className="size-5" strokeWidth={2.25} />}
          >
            Ask my assistant
          </Button>
        </form>
        {error && <ErrorNotice className="mt-4 text-left">{error}</ErrorNotice>}
      </section>

      {errandId ? (
        <>
          <Progress
            request={sentRequest}
            events={events}
            status={status}
            offers={sorted.length}
          />

          <section aria-labelledby="offers-heading">
            <h2 id="offers-heading" className="text-xl font-bold text-ink">
              {sorted.length === 0 ? "Offers will show up here" : sorted.length === 1 ? "1 offer" : `${sorted.length} offers`}
            </h2>
            {sorted.length === 0 ? (
              <p className="mt-2 text-base text-ink-2">As shops send prices, your assistant lines them up here, best first.</p>
            ) : (
              <ul className="mt-4 grid gap-4 lg:grid-cols-2">
                {sorted.map((o) => (
                  <li key={o.id} className={cx(o.recommended && "lg:col-span-2")}>
                    <OfferCard
                      offer={o}
                      business={byId[o.businessId]}
                      budget={budget}
                      order={order && approvedId === o.id ? order : null}
                      ordered={ordered}
                      running={running}
                      approving={approving === o.id}
                      onApprove={() => approve(o)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <HowItGoes />
      )}
    </div>
  );
}

/** Before the first request: the same picture strip the errand fills in, still empty. */
function HowItGoes() {
  return (
    <section aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-xl font-bold text-ink">
        What your assistant will do
      </h2>
      <p className="mt-1 text-base text-ink-2">These fill in as it works, and it asks you before buying anything big.</p>
      <CountStrip shops={0} quotes={0} offers={0} onGround />
    </section>
  );
}

/** Shops asked, prices back and offers ready, counted on one baseline. */
function CountStrip({
  shops,
  quotes,
  offers,
  haggles = 0,
  offerTone = "assistant",
  onGround = false,
}: {
  shops: number;
  quotes: number;
  offers: number;
  haggles?: number;
  offerTone?: "assistant" | "waiting" | "done";
  /** On the page ground the tiles are cards; inside a card they are sunk bands. */
  onGround?: boolean;
}) {
  return (
    <ol className="mt-6 grid gap-3 sm:grid-cols-3" aria-live="polite">
      <Count onGround={onGround} label={shops === 1 ? "shop asked" : "shops asked"} value={shops}>
        <PictoRow name="shop" total={Math.max(shops, 1)} filled={shops} tone="assistant" label={`${shops} shops asked`} animate />
      </Count>
      <Count
        onGround={onGround}
        label={quotes === 1 ? "price back" : "prices back"}
        value={quotes}
        note={haggles > 0 ? `after ${haggles} ${haggles === 1 ? "round" : "rounds"} of haggling` : undefined}
      >
        <PictoRow name="tag" total={Math.max(quotes, 1)} filled={quotes} tone="assistant" label={`${quotes} prices back`} animate />
      </Count>
      <Count onGround={onGround} label={offers === 1 ? "offer for you" : "offers for you"} value={offers}>
        <PictoRow name="box" total={Math.max(offers, 1)} filled={offers} tone={offerTone} label={`${offers} offers for you`} animate />
      </Count>
    </ol>
  );
}

/** The errand so far, counted in pictures, with every step one tap away. */
function Progress({
  request,
  events,
  status,
  offers,
}: {
  request: string;
  events: ErrandEvent[];
  status: ErrandStatus | null;
  offers: number;
}) {
  const running = status === "running";
  const constraints = events.flatMap((e) => e.constraints ?? []);
  const shops = new Set(events.filter((e) => e.businessId && e.kind !== "decline").map((e) => e.businessId)).size;
  const quotes = new Set(events.filter((e) => e.kind === "quote").map((e) => e.businessId)).size;
  const haggles = events.filter((e) => e.kind === "counter").length;

  const statusText = running
    ? "Working on it…"
    : status === "awaiting_approval"
      ? "Back with offers for you"
      : status === "ordered"
        ? "Ordered"
        : status === "failed"
          ? "Lost connection"
          : "Finished";

  return (
    <section aria-labelledby="progress-heading" className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="progress-heading" className="text-xl font-bold text-ink">
          &ldquo;{request}&rdquo;
        </h2>
        <Status
          tone={running ? "assistant" : status === "awaiting_approval" ? "waiting" : status === "failed" ? "stopped" : "done"}
        >
          {statusText}
        </Status>
      </div>

      {constraints.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {constraints.map((c, i) => {
            const t = constraintText(c);
            return (
              <li key={i} className="rounded-full bg-info-wash px-3 py-1 text-sm text-ink">
                <span className="text-ink-2">{t.label}:</span> <span className="font-medium">{t.value}</span>
              </li>
            );
          })}
        </ul>
      )}

      <CountStrip
        shops={shops}
        quotes={quotes}
        offers={offers}
        haggles={haggles}
        offerTone={status === "ordered" ? "done" : status === "awaiting_approval" ? "waiting" : "assistant"}
      />

      {events.length > 0 && (
        <details className="group mt-6">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-base font-medium text-info [&::-webkit-details-marker]:hidden">
            See every step ({events.length})
            <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" strokeWidth={2.25} />
          </summary>
          <ol className="mt-3 flex flex-col gap-2">
            {events.map((e) => (
              <li key={e.id} className="flex gap-4 text-base">
                <span className="figure w-12 shrink-0 text-ink-3">{formatTime(e.at)}</span>
                <span className={e.kind === "decline" ? "text-ink-2" : "text-ink"}>{e.text}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

function Count({
  label,
  value,
  note,
  onGround = false,
  children,
}: {
  label: string;
  value: number;
  note?: string;
  onGround?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className={cx("flex flex-col justify-end gap-2 p-4", onGround ? "card" : "rounded-[14px] bg-surface-sunk")}>
      <div className="flex min-h-7 items-end">{children}</div>
      <p className="text-base text-ink-2">
        <span className="figure text-xl font-bold text-ink">{value}</span> {label}
        {note && <span className="block text-sm text-ink-3">{note}</span>}
      </p>
    </li>
  );
}

function OfferCard({
  offer,
  business,
  budget,
  order,
  ordered,
  running,
  approving,
  onApprove,
}: {
  offer: Offer;
  business?: Business;
  budget: number;
  order: Order | null;
  ordered: boolean;
  /** Offers can't be bought until the assistant is back with all of them. */
  running: boolean;
  approving: boolean;
  onApprove: () => void;
}) {
  const waiting = !!offer.recommended && !ordered && !running;
  const overBudget = offer.total.amount > budget;
  const canApprove = !running && !ordered && !overBudget && offer.status !== "negotiating";
  const name = business?.name ?? "A shop";
  const items = offer.lines.reduce((n, l) => n + l.qty, 0);
  const itemUnit = items <= 24 ? 1 : signUnit(items, 24);

  return (
    <article
      className={cx(
        "card animate-[land_260ms_var(--ease-signal)_both] overflow-hidden",
        waiting && "ring-3 ring-live",
        order && "ring-3 ring-success",
      )}
      aria-label={`Offer from ${name}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 p-6">
        <div className="min-w-0">
          {offer.recommended && (
            <p className="mb-2">
              <Status tone={order ? "done" : waiting ? "waiting" : "assistant"}>
                {order ? "You bought this" : "Your assistant's pick"}
              </Status>
            </p>
          )}
          <h3 className="text-xl font-bold text-ink">
            {business ? (
              <Link href={`/market/business/${business.id}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          <p className="mt-1 text-base text-ink-2">{offer.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {business && <Verified verified={business.verification === "verified"} />}
          </div>
        </div>
        <div className="text-right">
          <div className="figure text-[2rem] leading-tight font-bold text-ink">{money(offer.total.amount)}</div>
          <div className="text-base text-ink-2">Arrives {formatDay(offer.deliveryBy)}</div>
        </div>
      </div>

      {items > 0 && (
        <div className="px-6">
          <PictoRow
            name="box"
            total={Math.ceil(items / itemUnit)}
            filled={Math.ceil(items / itemUnit)}
            tone="ink"
            size="size-5"
            label={`${items} items`}
          />
          {itemUnit > 1 && <p className="mt-1 text-sm text-ink-3">Each box = {itemUnit} items</p>}
        </div>
      )}

      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <ul className="flex flex-col gap-1.5">
          {offer.fit.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-base">
              {f.ok ? (
                <Check aria-hidden className="size-5 text-success" strokeWidth={2.5} />
              ) : (
                <CircleX aria-hidden className="size-5 text-ink-3" strokeWidth={2} />
              )}
              <span className={f.ok ? "text-ink" : "text-ink-2"}>
                <span className="sr-only">{f.ok ? "Good: " : "Not quite: "}</span>
                {f.label}
              </span>
            </li>
          ))}
        </ul>
        {offer.rounds.length > 0 && (
          <details className="group text-base sm:max-w-80">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-medium text-info [&::-webkit-details-marker]:hidden">
              How the haggling went
              <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" strokeWidth={2.25} />
            </summary>
            <ol className="mt-2 flex flex-col gap-1">
              {offer.rounds.map((r, i) => (
                <li key={i} className="text-ink-2">
                  {roundText(r)}
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>

      {(order || canApprove || (overBudget && !ordered && !running)) && (
        <div className="flex flex-col gap-3 bg-surface-sunk px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {order ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-ink" aria-live="polite">
              <CircleCheck aria-hidden className="size-5 text-success" strokeWidth={2.25} />
              {order.payment === "confirmed"
                ? `Ordered and paid${order.sandbox ? " (test payment)" : ""}.`
                : "Ordered. We'll show it as paid once the payment goes through."}
              <Link href="/market/orders" className="inline-flex items-center gap-1 font-medium text-info hover:underline">
                See your orders <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
              </Link>
            </p>
          ) : canApprove ? (
            <>
              <p className="text-base text-ink-2">You&apos;ll pay exactly {money(offer.total.amount)}.</p>
              <Button
                variant={offer.recommended ? "primary" : "secondary"}
                loading={approving}
                onClick={onApprove}
                icon={<Check aria-hidden className="size-5" strokeWidth={2.5} />}
                className="shrink-0"
              >
                Buy for {money(offer.total.amount)}
              </Button>
            </>
          ) : (
            <p className="text-base text-ink-2">This is over your budget, so your assistant won&apos;t buy it.</p>
          )}
        </div>
      )}
    </article>
  );
}
