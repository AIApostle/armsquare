"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CircleAlert, CircleX, Send } from "lucide-react";
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
import { LampLabel, Verified } from "@/components/ui/mark";
import { constraintText, roundText } from "./text";

const plan = [
  "Read your request and your rules",
  "Search the market for businesses that can do it",
  "Ask their agents for quotes",
  "Negotiate inside your limits",
  "Bring back offers, and ask you before buying",
];

/** Steps shown before "Show all" on narrow screens. */
const LOG_PEEK = 3;

export function Errand({ businesses, suggestions }: { businesses: Business[]; suggestions: string[] }) {
  // A business page can hand over a starting request (?ask=...); the shopper still sends it.
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
  const [showAll, setShowAll] = useState(false);
  const unsubscribe = useRef<(() => void) | null>(null);

  // The shopper's own rules are read in the browser, where their session lives.
  useEffect(() => {
    let live = true;
    api
      .getAgentSettings()
      .then((s) => live && setSettings(s))
      .catch(() => live && setError("Couldn't load your agent's rules. Errands still use them on the server."));
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
    setShowAll(false);
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
          setError("Lost the connection to your agent. Its work continues; reload to catch up.");
        },
      );
    } catch {
      setErrandId(null);
      setStatus(null);
      setError("Your agent couldn't start this errand. Check your connection and send it again.");
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
      setError("The approval didn't go through, so nothing was bought. Try Approve again.");
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
  const last = events[events.length - 1];
  const hiddenOnMobile = !showAll && events.length > LOG_PEEK ? events.length - LOG_PEEK : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Ask */}
      <section aria-labelledby="ask-heading">
        <h1 id="ask-heading" className="text-2xl font-bold tracking-[-0.02em] text-ink">
          What should your agent get?
        </h1>
        <p className="mt-1 min-h-5 text-sm text-ink-2">
          {settings ? (
            <>
              {settings.agentName} shops for you, up to {moneyWhole(settings.errandBudget.amount)} an errand, and asks
              before buying anything over {moneyWhole(settings.autoApproveUnder.amount)}.{" "}
              <Link href="/market/agent" className="font-semibold text-ink underline decoration-rule-strong hover:decoration-ink">
                Change its rules
              </Link>
            </>
          ) : (
            <span className="inline-block h-4 w-96 max-w-full animate-pulse rounded bg-panel-raised" aria-hidden />
          )}
        </p>
        <form
          className="surface mt-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
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
            placeholder="e.g. 6 gift hampers for clients, under $480, delivered by Friday"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-control bg-transparent px-2 text-base text-ink placeholder:text-ink-3 focus-visible:outline-offset-0"
          />
          <Button
            type="submit"
            variant="secondary"
            loading={starting}
            disabled={!request.trim()}
            icon={<Send aria-hidden className="size-4" strokeWidth={2} />}
          >
            Send my agent
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-3">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setRequest(s);
                send(s);
              }}
              className="rounded-full border border-rule bg-surface px-3 py-1 text-left text-sm text-ink-2 transition-colors duration-150 hover:border-rule-strong hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-control border border-danger bg-danger-wash px-3 py-2 text-sm text-ink">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
            {error}
          </p>
        )}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        {/* Errand log */}
        <section aria-labelledby="log-heading" className="order-2 min-w-0 lg:order-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="log-heading" className="text-lg font-bold text-ink">
              {errandId ? "Your agent's errand" : "What your agent will do"}
            </h2>
            {errandId && status && (
              <LampLabel state={running ? "talking" : status === "awaiting_approval" ? "waiting" : "closed"}>
                {running
                  ? "Working"
                  : status === "awaiting_approval"
                    ? "Back with offers"
                    : status === "ordered"
                      ? "Ordered"
                      : status === "failed"
                        ? "Connection lost"
                        : "Finished"}
              </LampLabel>
            )}
          </div>
          {sentRequest && <p className="mt-1 text-sm text-ink-3">&ldquo;{sentRequest}&rdquo;</p>}

          <ol className="relative mt-4" aria-live="polite">
            <span aria-hidden className="absolute top-2 bottom-2 left-[2.5px] w-[1.75px] rounded-full bg-cord" />
            {errandId
              ? events.map((e, i) => {
                  const waitingHere = e.kind === "recommend" && status === "awaiting_approval";
                  return (
                    <li
                      key={e.id}
                      className={cx(
                        "relative animate-[round-land_260ms_var(--ease-signal)_both] pb-4 pl-6",
                        i < hiddenOnMobile && "max-lg:hidden",
                      )}
                    >
                      {e === last && <span className="signal-drop" aria-hidden />}
                      <span
                        aria-hidden
                        className="socket absolute top-0.5 -left-1.5 scale-[0.6]"
                        data-lamp={
                          waitingHere
                            ? "set"
                            : e === last && running
                              ? "talking"
                              : e.kind === "payment" || e.kind === "approved" || e.kind === "accept"
                                ? "closed"
                                : "off"
                        }
                      />
                      <div className="flex gap-3">
                        <span className="figure w-11 shrink-0 pt-px text-xs text-ink-3">{formatTime(e.at)}</span>
                        <div className="min-w-0">
                          <p className={cx("text-sm", e.kind === "decline" ? "text-ink-2" : "text-ink", waitingHere && "font-semibold")}>
                            {e.text}
                          </p>
                          {e.constraints && (
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {e.constraints.map((c, j) => {
                                const t = constraintText(c);
                                return (
                                  <li key={j} className="rounded-full border border-rule bg-surface px-2.5 py-0.5 text-xs text-ink-2">
                                    <span className="text-ink-3">{t.label}:</span>{" "}
                                    <span className="font-semibold text-ink">{t.value}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })
              : plan.map((p, i) => (
                  <li key={p} className="relative pb-4 pl-6">
                    <span aria-hidden className="socket absolute top-0.5 -left-1.5 scale-[0.6]" data-lamp="off" />
                    <div className="flex gap-3">
                      <span className="figure w-11 shrink-0 pt-px text-xs text-ink-3">{i + 1}</span>
                      <p className="text-sm text-ink-2">{p}</p>
                    </div>
                  </li>
                ))}
            {running && (
              <li className="relative pl-6 text-sm text-ink-3">
                <span aria-hidden className="socket absolute top-0.5 -left-1.5 scale-[0.6] animate-pulse" data-lamp="talking" />
                <span className="ml-14">Working…</span>
              </li>
            )}
          </ol>
          {hiddenOnMobile > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-1 text-sm font-semibold text-ink-2 underline decoration-rule-strong hover:text-ink lg:hidden"
            >
              Show all {events.length} steps
            </button>
          )}
        </section>

        {/* Offers: first on narrow screens, where the decision has to be reachable */}
        <section aria-labelledby="offers-heading" className="order-1 min-w-0 lg:order-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="offers-heading" className="text-lg font-bold text-ink">
              Offers
            </h2>
            <span className="figure text-xs text-ink-3">{sorted.length}</span>
          </div>
          {sorted.length === 0 ? (
            <div className="mt-4 rounded-panel border border-dashed border-rule-strong px-5 py-8 text-sm text-ink-3">
              {errandId
                ? "Quotes from business agents land here as they arrive."
                : "Send your agent on an errand and the offers it gathers will line up here, best fit first."}
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {sorted.map((o) => (
                <li key={o.id}>
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
      </div>
    </div>
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
  /** Offers can't be approved until the agent is back with all of them. */
  running: boolean;
  approving: boolean;
  onApprove: () => void;
}) {
  const waiting = !!offer.recommended && !ordered && !running;
  const overBudget = offer.total.amount > budget;
  const canApprove = !running && !ordered && !overBudget && offer.status !== "negotiating";
  return (
    <article
      className={cx(
        "surface animate-[round-land_260ms_var(--ease-signal)_both] overflow-hidden",
        waiting && "border-live",
        order && "border-success",
      )}
      aria-label={`Offer from ${business?.name ?? offer.businessId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 px-4 pt-3.5 pb-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink">
            {business ? (
              <Link href={`/market/business/${business.id}`} className="hover:underline">
                {business.name}
              </Link>
            ) : (
              offer.businessId
            )}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-3">
            <span>via {business?.agent.name}</span>
            {business && <Verified verified={business.verification === "verified"} />}
          </p>
          {(waiting || order || (offer.recommended && ordered)) && (
            <p className="mt-1.5">
              <LampLabel state={order ? "closed" : waiting ? "waiting" : "talking"}>
                {order ? "Ordered" : waiting ? "Your agent's pick · waiting for you" : "Your agent's pick"}
              </LampLabel>
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="figure text-xl font-semibold tracking-[-0.02em] text-ink">{money(offer.total.amount)}</div>
          <div className="text-xs text-ink-3">Delivered {formatDay(offer.deliveryBy)}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-rule px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <ul className="flex flex-col gap-1">
          {offer.fit.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-sm">
              {f.ok ? (
                <Check aria-hidden className="size-4 text-success" strokeWidth={2.5} />
              ) : (
                <CircleX aria-hidden className="size-4 text-ink-3" strokeWidth={2} />
              )}
              <span className={f.ok ? "text-ink" : "text-ink-2"}>
                <span className="sr-only">{f.ok ? "Meets: " : "Misses: "}</span>
                {f.label}
              </span>
            </li>
          ))}
        </ul>
        <details className="text-sm sm:max-w-68">
          <summary className="cursor-pointer list-none text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="figure">{offer.rounds.length}</span> round{offer.rounds.length === 1 ? "" : "s"} ·{" "}
            {offer.status === "negotiating" ? "still negotiating" : "final terms"}
          </summary>
          <ol className="mt-2 flex flex-col gap-1">
            {offer.rounds.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="figure w-6 text-ink-3">R{i + 1}</span>
                <span className="w-20 shrink-0 text-ink-3">{r.from === "us" ? "Your agent" : "Their agent"}</span>
                <span className="text-ink">{roundText(r)}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>

      {(order || canApprove) && (
        <div className="flex flex-col gap-3 border-t border-rule bg-surface-sunk px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {order ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2" aria-live="polite">
              <span aria-hidden className="lamp" data-lamp={order.payment === "confirmed" ? "closed" : "talking"} />
              {order.payment === "confirmed"
                ? `Order ${order.id} · payment confirmed by provider (sandbox)`
                : `Order ${order.id} placed · payment pending with provider`}
              <Link href="/market/orders" className="inline-flex items-center gap-0.5 font-semibold text-ink hover:underline">
                Orders <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
              </Link>
            </p>
          ) : (
            <>
              <p className="text-xs text-ink-2">
                Approving buys exactly these terms for{" "}
                <span className="figure font-semibold text-ink">{money(offer.total.amount)}</span>. Payment runs in sandbox.
              </p>
              <Button
                variant={offer.recommended ? "primary" : "secondary"}
                size="sm"
                loading={approving}
                onClick={onApprove}
                icon={<Check aria-hidden className="size-4" strokeWidth={2.5} />}
                className="shrink-0"
              >
                {offer.recommended ? "Approve" : "Approve this instead"}
              </Button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
