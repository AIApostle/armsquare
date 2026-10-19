"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { businessApi, type Line, type LineState, type OwnerDecision } from "@/lib/api/business";
import { cx } from "@/lib/format";
import { EmptyNotice, ErrorNotice } from "@/components/ui/notice";
import { Picto } from "@/components/ui/picto";
import { useAgentState } from "./agent-state";
import { DealDetail } from "./listen-in";

const DONE_SHOWN = 3; // older finished deals live in History

/** The deals desk: what needs you first, then what your assistant is handling. */
export function Board() {
  const { desk, failed: deskFailed, paused } = useAgentState();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [streamLost, setStreamLost] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [busy, setBusy] = useState<OwnerDecision | null>(null);
  const [decideError, setDecideError] = useState<string | null>(null);
  // Read the clock only in the browser; deals (and their countdowns) never render before it is set.
  const [now, setNow] = useState(0);
  // The spending limit, so a purchase can be drawn against it; the deal still shows without it.
  const [spendLimit, setSpendLimit] = useState<number | undefined>();
  const panelRef = useRef<HTMLElement>(null);
  const linesRef = useRef<Line[] | null>(null);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  // Deals load once, then the live stream keeps them current.
  useEffect(() => {
    let live = true;
    let unsubscribe = () => {};
    businessApi
      .getLines()
      .then((loaded) => {
        if (!live) return;
        setNow(Date.now());
        setLines(loaded);
        setSelected((s) => s ?? (loaded.find((l) => l.state === "waiting") ?? loaded[0])?.id);
        unsubscribe = businessApi.subscribeLines(
          (line) => {
            setLines((list) => {
              const current = list ?? [];
              return current.some((l) => l.id === line.id)
                ? current.map((l) => (l.id === line.id ? line : l))
                : [...current, line];
            });
            setSelected((s) => s ?? line.id);
          },
          () => setStreamLost(true),
        );
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let live = true;
    businessApi
      .getPolicy()
      .then((p) => live && setSpendLimit(p.perTransactionCap.amount))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  // Clock for "answer by" countdowns.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (failed || deskFailed) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-ink">Deals</h1>
        <ErrorNotice className="mt-6">
          We couldn&apos;t load your deals just now. Your assistant keeps working within your rules; please reload
          the page.
        </ErrorNotice>
      </div>
    );
  }

  if (!lines || !desk) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your deals">
        <div className="h-10 w-72 max-w-full animate-pulse rounded-full bg-panel-raised" />
        <div className="h-40 animate-pulse rounded-card bg-panel-raised" />
        <div className="h-64 animate-pulse rounded-card bg-panel-raised" />
      </div>
    );
  }

  const byState = (s: LineState) => lines.filter((l) => l.state === s);
  const waiting = byState("waiting");
  const talking = byState("talking");
  const done = byState("closed")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, DONE_SHOWN);
  const line = lines.find((l) => l.id === selected);

  function selectLine(id: string) {
    setSelected(id);
    setDecideError(null);
    // Below the two-column layout the deal opens under the list: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  async function decide(decision: OwnerDecision) {
    if (!line || busy) return;
    const id = line.id;
    setBusy(decision);
    setDecideError(null);
    try {
      // armsquare re-checks the terms before it accepts the answer.
      const updated = await businessApi.decide(id, decision, line.updatedAt);
      setLines((ls) => ls && ls.map((l) => (l.id === id ? updated : l)));
      const next = linesRef.current?.find((l) => l.id !== id && l.state === "waiting");
      if (next) setSelected(next.id);
    } catch {
      setDecideError("Your answer didn't go through, so nothing has happened yet. The deal may have changed; please try again.");
    } finally {
      setBusy(null);
    }
  }

  const headline = paused
    ? "Your assistant is paused"
    : waiting.length === 0
      ? "Nothing needs you right now"
      : waiting.length === 1
        ? "1 deal needs you"
        : `${waiting.length} deals need you`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="deals-heading" className="min-w-0">
        <h1 id="deals-heading" className="text-2xl font-bold text-ink">
          {headline}
        </h1>
        <p className="mt-2 text-lg text-ink-2" aria-live="polite">
          {paused
            ? "It won't reply to anyone or make any deals until you turn it back on."
            : talking.length === 0
              ? "Your assistant is ready for the next customer."
              : `Your assistant is handling ${talking.length} more on its own.`}
        </p>

        {streamLost && (
          <ErrorNotice className="mt-4">
            We lost the live connection, so this may be out of date. Please reload the page.
          </ErrorNotice>
        )}

        {lines.length === 0 ? (
          <EmptyNotice className="mt-8">
            <Picto name="person" tone="empty" className="mx-auto size-12" />
            <p className="mt-3 text-lg font-medium text-ink">No deals yet</p>
            <p className="mt-1">When a customer or supplier gets in touch, the deal shows up here.</p>
          </EmptyNotice>
        ) : (
          <div className={cx("mt-8 flex flex-col gap-8", paused && "opacity-60")}>
            {waiting.length > 0 && (
              <Group title="Needs you" count={waiting.length}>
                {waiting.map((l) => (
                  <DealCard key={l.id} line={l} selected={selected === l.id} onSelect={() => selectLine(l.id)} />
                ))}
              </Group>
            )}
            <Group title="Your assistant is handling" count={talking.length}>
              {talking.length === 0 ? (
                <li className="text-base text-ink-3">Nothing in progress.</li>
              ) : (
                talking.map((l) => (
                  <DealCard key={l.id} line={l} selected={selected === l.id} onSelect={() => selectLine(l.id)} />
                ))
              )}
            </Group>
            {done.length > 0 && (
              <Group title="Just finished" count={done.length}>
                {done.map((l) => (
                  <DealCard key={l.id} line={l} selected={selected === l.id} onSelect={() => selectLine(l.id)} />
                ))}
              </Group>
            )}
          </div>
        )}

        <Link href="/dashboard/ledger" className="mt-8 inline-flex items-center gap-1.5 text-base font-medium text-info hover:underline">
          See everything that happened today
          <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
        </Link>
      </section>

      <section ref={panelRef} aria-label="Deal details" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
        {line ? (
          <DealDetail
            key={line.id}
            line={line}
            now={now}
            busy={busy}
            error={decideError}
            paused={paused}
            spendLimit={spendLimit}
            onDecide={decide}
          />
        ) : (
          lines.length > 0 && <EmptyNotice>Choose a deal to see the details.</EmptyNotice>
        )}
      </section>
    </div>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
        {title}
        <span className="figure rounded-full bg-panel-raised px-2.5 text-sm font-medium text-ink-2">{count}</span>
      </h2>
      <ul className="flex flex-col gap-3">{children}</ul>
    </section>
  );
}

function DealCard({ line, selected, onSelect }: { line: Line; selected: boolean; onSelect: () => void }) {
  const cp = line.counterparty;
  const waiting = line.state === "waiting";
  const closed = line.state === "closed";
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cx(
          "card flex w-full items-center gap-4 p-4 text-left transition-[box-shadow,translate] duration-150",
          waiting && "ring-2 ring-live",
          closed && !selected && "bg-surface-sunk shadow-none",
          selected && (waiting ? "ring-3" : "ring-3 ring-info"),
          !selected && "hover:-translate-y-0.5",
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-surface-sunk">
          <Picto
            name={cp.kind === "customer" ? "bag" : "shop"}
            tone={waiting ? "waiting" : closed ? "done" : "assistant"}
            className="size-6"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold text-ink">{line.topic}</span>
          <span className="block truncate text-sm text-ink-2">with {cp.principal}</span>
          <span className="mt-1 flex items-center gap-2 text-sm text-ink-2">
            <span aria-hidden className="dot" data-tone={waiting ? "waiting" : closed ? "done" : "assistant"} />
            {line.status}
          </span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3" strokeWidth={2.25} />
      </button>
    </li>
  );
}
