"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Undo2 } from "lucide-react";
import type { AgentRef, NegotiationRound } from "@/lib/demo-data";
import type { Line, LineState } from "@/lib/lines";
import { cx } from "@/lib/format";
import { Tag } from "@/components/ui/mark";
import { useAgentState } from "./agent-state";
import { ListenIn, type Decision, type LineView } from "./listen-in";

// Signature motion: "patch through".
const DECIDE_MS = 450; // policy service revalidates the terms
const RUN_MS = 650; // a signal travels the cord
const SETTLE_MS = 1500; // closed line holds before the next one is picked up
const UNDO_MS = 8000;
// Demo simulation: one move lands on a handled line at a time.
const AMBIENT_MS = 4200;
const HANDLED_TARGET = 3; // new agents patch in to keep this many lines handled
const CLOSED_SHOWN = 2; // older closed lines roll into "closed earlier today"

type Packet = { key: number; jack: string; dir: "out" | "in"; tone?: "closed" };

const outcome: Record<Decision["tone"], (l: Line) => string> = {
  approve: (l) =>
    l.approval?.direction === "sell"
      ? "Sale confirmed · sandbox payment"
      : l.approval?.kind === "Changed terms"
        ? "Revised order confirmed"
        : "Order placed · sandbox payment",
  void: () => "Voided by you",
  return: () => "Renegotiating after your note",
};

const FILED_AT = ["11:06", "11:07", "11:09", "11:12"];

export function Board({
  lines: initialLines,
  arrivals,
  home,
  homeNote,
  ownerInitials,
  closedCount,
}: {
  lines: Line[];
  arrivals: Omit<Line, "jack">[];
  home: AgentRef;
  homeNote: string;
  ownerInitials: string;
  closedCount: number;
}) {
  const { paused } = useAgentState();
  const [lines, setLines] = useState(initialLines);
  const [rolledOff, setRolledOff] = useState(0);
  const [views, setViews] = useState<Record<string, LineView>>(() =>
    Object.fromEntries(
      initialLines.map((l) => [l.jack, { state: l.state, status: l.status, rounds: l.rounds, step: 0 }]),
    ),
  );
  const [selected, setSelected] = useState(
    () => initialLines.find((l) => l.state === "waiting")?.jack ?? initialLines[0]?.jack,
  );
  const [busy, setBusy] = useState<Decision["tone"] | null>(null);
  const [undo, setUndo] = useState<{ jack: string; tone: Decision["tone"] } | null>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);

  const fieldRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const socketRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const packetKey = useRef(0);
  const viewsRef = useRef(views);
  const linesRef = useRef(lines);
  const selectedRef = useRef(selected);
  const ambientTurn = useRef(0);
  const arrivalTurn = useRef(0);
  const nextJack = useRef(initialLines.length + 1);

  useEffect(() => {
    viewsRef.current = views;
    linesRef.current = lines;
    selectedRef.current = selected;
  }, [views, lines, selected]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  // Demo clock for expiry countdowns.
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    const pending = timers.current;
    return () => {
      clearInterval(t);
      pending.forEach(clearTimeout);
    };
  }, []);

  // Draw cords from the home socket to every line's socket.
  const measure = useCallback(() => {
    const field = fieldRef.current;
    const homeEl = homeRef.current;
    if (!field || !homeEl) return;
    const f = field.getBoundingClientRect();
    const h = homeEl.getBoundingClientRect();
    const x1 = h.left + h.width / 2 - f.left;
    const y1 = h.top + h.height / 2 - f.top;
    const next: Record<string, string> = {};
    for (const [jack, el] of Object.entries(socketRefs.current)) {
      if (!el) continue;
      const s = el.getBoundingClientRect();
      const x2 = s.left + s.width / 2 - f.left;
      const y2 = s.top + s.height / 2 - f.top;
      const dx = x2 - x1;
      if (dx > 48) {
        // Side by side: a cord that leaves level and arrives level.
        const k = Math.max(40, dx * 0.55);
        next[jack] = `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`;
      } else {
        // Stacked (narrow screens): drop down a trunk, then hook into the socket.
        const tx = Math.min(x1, x2) - 14;
        next[jack] = `M ${x1} ${y1} C ${tx} ${y1 + 24}, ${tx} ${y2}, ${x2} ${y2}`;
      }
    }
    setPaths(next);
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(field);
    return () => ro.disconnect();
  }, [measure]);

  // Lines change group when their state changes; re-measure after layout.
  useEffect(() => {
    const raf = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(raf);
  }, [views, measure]);

  const sendPacket = useCallback((jack: string, dir: Packet["dir"], tone?: Packet["tone"]) => {
    const key = ++packetKey.current;
    setPackets((p) => [...p, { key, jack, dir, tone }]);
    setTimeout(() => setPackets((p) => p.filter((x) => x.key !== key)), RUN_MS + 80);
  }, []);

  // Demo simulation: moves travel the cord in the direction of who made them,
  // then land on the plate and the rail. Lines close on their own, and new
  // agents patch in so the board is never left with only work for you.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      const current = viewsRef.current;
      const board = linesRef.current;
      const handling = board.filter((l) => current[l.jack]?.state === "talking" && !current[l.jack]?.decision);

      if (handling.length < HANDLED_TARGET && arrivals.length > 0) {
        const template = arrivals[arrivalTurn.current++ % arrivals.length];
        const jack = String(nextJack.current++).padStart(2, "0");
        const arrived: Line = { ...template, jack };
        const closedByAgent = board.filter(
          (l) => current[l.jack]?.closedByAgent && l.jack !== selectedRef.current,
        );
        const drop = new Set(
          closedByAgent.slice(0, Math.max(0, closedByAgent.length - CLOSED_SHOWN)).map((l) => l.jack),
        );
        setLines((ls) => [...ls.filter((l) => !drop.has(l.jack)), arrived]);
        setRolledOff((n) => n + drop.size);
        setViews((v) => ({
          ...v,
          [jack]: { state: "talking", status: template.status, rounds: template.rounds, step: 0 },
        }));
        // Their first move arrives once the new cord has been drawn.
        setTimeout(() => sendPacket(jack, "in"), 120);
        return;
      }

      const live = handling.filter((l) => l.script && current[l.jack].step < l.script.length);
      if (live.length === 0) return;
      const l = live[ambientTurn.current++ % live.length];
      const step = l.script![current[l.jack].step];
      sendPacket(l.jack, step.from === "us" ? "out" : "in", step.closes ? "closed" : undefined);
      setTimeout(() => {
        setViews((v) => {
          const lv = v[l.jack];
          if (!lv || lv.state !== "talking" || lv.decision) return v;
          const round: NegotiationRound = { from: step.from, label: step.label, amount: step.amount, note: step.note };
          return {
            ...v,
            [l.jack]: {
              ...lv,
              rounds: [...lv.rounds, round],
              status: step.status,
              step: lv.step + 1,
              state: step.closes ? "closed" : "talking",
              closedByAgent: step.closes,
            },
          };
        });
      }, RUN_MS);
    }, AMBIENT_MS);
    return () => clearInterval(t);
  }, [paused, arrivals, sendPacket]);

  const line = lines.find((l) => l.jack === selected);
  const view = selected ? views[selected] : undefined;

  function selectLine(jack: string) {
    setSelected(jack);
    // Below the two-column layout the panel sits under the field: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function decide(tone: Decision["tone"]) {
    if (!line || busy) return;
    const jack = line.jack;
    const next = lines.find((l) => l.jack !== jack && views[l.jack].state === "waiting");
    setBusy(tone);
    later(() => {
      const decidedCount = Object.values(views).filter((v) => v.decision).length;
      const decision: Decision = { tone, at: FILED_AT[decidedCount % FILED_AT.length] };
      setBusy(null);
      // The cord cools while the signal runs to the other agent...
      setViews((v) => ({
        ...v,
        [jack]: { ...v[jack], state: "talking", status: "Patching through…", decision, group: "waiting" },
      }));
      sendPacket(jack, "out", tone === "approve" ? "closed" : undefined);
      // ...then the line lands in its new state.
      later(() => {
        setViews((v) => ({
          ...v,
          [jack]: {
            ...v[jack],
            state: tone === "return" ? "talking" : "closed",
            status: outcome[tone](line),
            group: undefined,
          },
        }));
      }, RUN_MS);
      later(() => {
        if (next) setSelected(next.jack);
        setUndo({ jack, tone });
        later(() => setUndo((u) => (u?.jack === jack ? null : u)), UNDO_MS);
      }, RUN_MS + SETTLE_MS);
    }, DECIDE_MS);
  }

  function undoDecision(jack: string) {
    const original = lines.find((l) => l.jack === jack);
    if (!original) return;
    setViews((v) => ({
      ...v,
      [jack]: { ...v[jack], state: original.state, status: original.status, decision: undefined, group: undefined },
    }));
    setUndo(null);
    setSelected(jack);
  }

  const groups: { key: LineState; title: string; empty?: string }[] = [
    { key: "waiting", title: "Waiting for you", empty: "Nothing needs you right now." },
    { key: "talking", title: "Handling on its own" },
    { key: "closed", title: "Closed just now" },
  ];
  // Count by the group a line is shown in, so headline and groups always agree.
  const count = (s: LineState) => lines.filter((l) => (views[l.jack].group ?? views[l.jack].state) === s).length;
  const waitingCount = count("waiting");
  const liveCount = waitingCount + count("talking");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-8">
      {/* Patch field */}
      <section aria-labelledby="lines-heading" className="min-w-0">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div>
            <h1 id="lines-heading" className="text-2xl font-bold tracking-[-0.02em] text-ink">
              {paused ? "Your agent is paused" : `Talking to ${liveCount} agents`}
            </h1>
            <p className="mt-0.5 text-sm text-ink-2" aria-live="polite">
              {paused
                ? "No tool use or new transactions until you resume."
                : `${count("talking")} handled on its own · ${
                    waitingCount === 0 ? "nothing waiting for you" : `${waitingCount} waiting for you`
                  }`}
            </p>
          </div>
          <p className="text-sm text-ink-3">Select a line to listen in.</p>
        </div>

        <div aria-live="polite">
          {undo && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-control border border-rule bg-surface px-3 py-2 text-sm">
              <span className="text-ink-2">
                {undo.tone === "approve" ? "Patched through" : undo.tone === "void" ? "Voided" : "Sent back"}{" "}
                line <span className="figure text-ink">{undo.jack}</span>.
              </span>
              <button
                type="button"
                onClick={() => undoDecision(undo.jack)}
                className="inline-flex items-center gap-1 rounded-control px-1.5 py-0.5 font-semibold text-ink hover:bg-panel-raised"
              >
                <Undo2 aria-hidden className="size-3.5" strokeWidth={2.25} />
                Undo
              </button>
            </div>
          )}
        </div>

        <div
          ref={fieldRef}
          className={cx(
            "relative grid grid-cols-[minmax(0,1fr)] gap-y-5 md:grid-cols-[12.5rem_minmax(3rem,1fr)_minmax(0,19.5rem)] md:gap-y-0",
            paused && "opacity-60 grayscale",
          )}
        >
          {/* Cords */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            {lines.map((l) => {
              const d = paths[l.jack];
              if (!d) return null;
              const v = views[l.jack];
              return (
                <path
                  key={l.jack}
                  d={d}
                  className="cord"
                  data-state={v.state}
                  data-selected={selected === l.jack}
                />
              );
            })}
          </svg>
          {packets.map((p) =>
            paths[p.jack] ? (
              <span
                key={p.key}
                aria-hidden
                className="packet"
                data-tone={p.tone}
                data-dir={p.dir}
                style={{ offsetPath: `path('${paths[p.jack]}')`, ["--run" as string]: `${RUN_MS}ms` } as CSSProperties}
              />
            ) : null,
          )}

          {/* Home jack */}
          <div className="relative z-10 md:col-start-1 md:self-center">
            <div className="plate relative px-4 py-4">
              <div className="text-base leading-snug font-bold text-ink">{home.name}</div>
              <div className="mt-0.5 text-sm text-ink-2">{homeNote}</div>
              <div className="figure mt-2 text-xs text-ink-3">{home.id}</div>
              <span
                ref={homeRef}
                className="socket absolute -bottom-[9px] left-5 md:top-1/2 md:-right-[9px] md:bottom-auto md:left-auto md:-translate-y-1/2"
                data-lamp={paused ? "off" : "talking"}
              />
            </div>
          </div>

          {/* Other agents' jacks */}
          <div className="relative z-10 flex flex-col gap-5 pl-7 md:col-start-3 md:pl-0">
            {groups.map((g) => {
              const inGroup = lines.filter((l) => (views[l.jack].group ?? views[l.jack].state) === g.key);
              if (inGroup.length === 0 && !g.empty) return null;
              return (
                <section key={g.key} aria-label={g.title}>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-2">
                    {g.title}
                    <span className="figure text-xs text-ink-3">{inGroup.length}</span>
                  </h2>
                  {inGroup.length === 0 ? (
                    <p className="text-sm text-ink-3">{g.empty}</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {inGroup.map((l) => (
                        <li key={l.jack}>
                          <JackPlate
                            line={l}
                            view={views[l.jack]}
                            selected={selected === l.jack}
                            onSelect={() => selectLine(l.jack)}
                            socketRef={(el) => {
                              socketRefs.current[l.jack] = el;
                            }}
                            paused={paused}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3 text-sm text-ink-3">
          <Link
            href="/dashboard/ledger"
            className="inline-flex items-center gap-1 font-semibold text-ink-2 hover:text-ink"
          >
            {closedCount + rolledOff} lines closed earlier today
            <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
          </Link>
          <Tag>Agent activity is simulated in this demo</Tag>
        </div>
      </section>

      {/* Listen in */}
      <section
        ref={panelRef}
        aria-label="Listen in"
        className="min-w-0 scroll-mt-28 lg:sticky lg:top-20 lg:self-start"
      >
        {line && view && (
          <ListenIn
            key={line.jack}
            line={line}
            view={view}
            elapsed={elapsed}
            busy={busy}
            paused={paused}
            ownerInitials={ownerInitials}
            onDecide={decide}
          />
        )}
      </section>
    </div>
  );
}

function JackPlate({
  line,
  view,
  selected,
  onSelect,
  socketRef,
  paused,
}: {
  line: Line;
  view: LineView;
  selected: boolean;
  onSelect: () => void;
  socketRef: (el: HTMLSpanElement | null) => void;
  paused: boolean;
}) {
  const cp = line.counterparty;
  const waiting = view.state === "waiting";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cx(
        "relative flex w-full flex-col items-start rounded-plate border py-2.5 pr-3 pl-5 text-left",
        "transition-[border-color,background-color] duration-200 ease-signal",
        selected
          ? waiting
            ? "border-live bg-surface"
            : "border-ink-3 bg-surface"
          : view.state === "closed"
            ? "border-rule bg-transparent hover:bg-surface"
            : "border-rule bg-surface hover:border-rule-strong",
      )}
    >
      <span
        ref={socketRef}
        className="socket absolute top-1/2 -left-[9px] -translate-y-1/2"
        data-lamp={paused ? "off" : view.state}
        data-selected={selected || undefined}
      />
      <span className="flex w-full items-baseline justify-between gap-3">
        <span className="truncate text-sm font-bold text-ink">{cp.name}</span>
        <span className="figure shrink-0 text-xs text-ink-3">{line.jack}</span>
      </span>
      <span className="truncate text-xs text-ink-3">for {cp.principal}</span>
      <span className="mt-1 line-clamp-1 text-sm text-ink-2">{line.topic}</span>
      <span className={cx("text-xs", waiting ? "font-semibold text-ink" : "text-ink-3")}>{view.status}</span>
    </button>
  );
}
