"use client";

import { Ban, Check, EyeOff, PenLine, ScrollText } from "lucide-react";
import type { ApprovalRequest, NegotiationRound } from "@/lib/demo-data";
import type { Line, LineState } from "@/lib/lines";
import { cx, money, remaining } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CheckIcon, LampLabel, Verified } from "@/components/ui/mark";

export type Decision = { tone: "approve" | "void" | "return"; at: string };

export type LineView = {
  state: LineState;
  status: string;
  rounds: NegotiationRound[];
  /** Index of the next scripted move (demo simulation). */
  step: number;
  decision?: Decision;
  closedByAgent?: boolean;
  /** Keeps a line in its group while the signal is still running. */
  group?: LineState;
};

function totals(r: ApprovalRequest) {
  const items = r.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const fees = r.fees.reduce((sum, f) => sum + f.amount, 0);
  return { items, total: items + fees + (r.discount?.amount ?? 0) };
}

export function ListenIn({
  line,
  view,
  elapsed,
  busy,
  paused,
  ownerInitials,
  onDecide,
}: {
  line: Line;
  view: LineView;
  elapsed: number;
  busy: Decision["tone"] | null;
  paused: boolean;
  ownerInitials: string;
  onDecide: (tone: Decision["tone"]) => void;
}) {
  const cp = line.counterparty;
  const them = cp.kind === "customer" ? "Shopper's agent" : cp.name.replace(/ Agent$/, "");
  const a = line.approval;
  const pending = view.state === "waiting" && !view.decision;

  return (
    <article
      aria-labelledby="listen-heading"
      className="surface overflow-hidden border-rule-strong"
    >
      <header className="px-5 pt-4 pb-3">
        <h2 id="listen-heading" className="text-xl font-bold tracking-[-0.015em] text-ink">
          {line.topic}
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-2">
          <span className="font-semibold text-ink">{cp.name}</span>
          <span>for {cp.principal}</span>
          <Verified verified={cp.verified} />
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <LampLabel state={view.state}>{view.status}</LampLabel>
          <span className="figure">Line {line.jack}</span>
          <span className="figure">{cp.id}</span>
          {cp.history && <span>{cp.history}</span>}
        </p>
      </header>

      {/* Centre rail: us and them, twinned around the rounds */}
      <div className="border-t border-rule px-5 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-end pb-1.5">
          <span className="label-caps text-right">Your agent</span>
          <span />
          <span className="label-caps truncate">{them}</span>
        </div>
        <ol aria-label="Rounds" className="relative">
          <span aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-rule-strong" />
          {view.rounds.map((r, i) => {
            const last = i === view.rounds.length - 1;
            const cell = (
              <span className={cx("flex flex-col", r.from === "us" ? "items-end text-right" : "items-start")}>
                <span className="text-xs font-semibold text-ink-3">{r.label}</span>
                <span
                  className={cx(
                    "figure text-sm",
                    last && pending ? "font-bold text-ink" : "text-ink",
                  )}
                >
                  {r.amount}
                </span>
                {r.note && <span className="text-xs text-ink-3">{r.note}</span>}
              </span>
            );
            return (
              <li
                key={i}
                className="animate-[round-land_260ms_var(--ease-signal)_both] relative grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center py-1.5"
              >
                <span className="pr-3">{r.from === "us" ? cell : null}</span>
                <span className="relative flex justify-center">
                  <span
                    className={cx(
                      "figure grid h-5 min-w-7 place-items-center rounded-full border bg-surface px-1 text-[0.6875rem]",
                      last ? "border-ink-3 text-ink" : "border-rule-strong text-ink-3",
                    )}
                  >
                    R{i + 1}
                  </span>
                </span>
                <span className="pl-3">{r.from === "them" ? cell : null}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {a ? (
        <DecisionBlock
          request={a}
          view={view}
          elapsed={elapsed}
          busy={busy}
          paused={paused}
          ownerInitials={ownerInitials}
          onDecide={onDecide}
        />
      ) : (
        <div className="border-t border-rule bg-surface-sunk px-5 py-4">
          <p className="text-sm font-semibold text-ink">
            {view.state === "closed"
              ? view.closedByAgent
                ? "Your agent closed this on its own."
                : "Closed."
              : "Your agent is handling this on its own."}
          </p>
          {line.within && <p className="mt-1 text-sm text-ink-2">{line.within}.</p>}
          {view.state !== "closed" && (
            <p className="mt-1 text-sm text-ink-3">
              It will put this line through to you if anything goes past your limits.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function DecisionBlock({
  request: r,
  view,
  elapsed,
  busy,
  paused,
  ownerInitials,
  onDecide,
}: {
  request: ApprovalRequest;
  view: LineView;
  elapsed: number;
  busy: Decision["tone"] | null;
  paused: boolean;
  ownerInitials: string;
  onDecide: (tone: Decision["tone"]) => void;
}) {
  const { items, total } = totals(r);
  const left = r.validForSeconds - elapsed;
  const flagged = r.checks.filter((c) => c.result === "flag");
  const passed = r.checks.filter((c) => c.result === "pass");
  const d = view.decision;

  return (
    <div className="border-t border-rule">
      {/* Terms */}
      <div className="px-5 pt-3.5 pb-3">
        <ul className="flex flex-col gap-1 text-sm">
          {r.items.map((i) => (
            <li key={i.sku} className="flex items-baseline justify-between gap-4">
              <span className="flex min-w-0 flex-col text-ink">
                {i.description}
                <span className="figure text-xs text-ink-3">
                  {i.qty} {i.unit} × {money(i.unitPrice)}
                </span>
              </span>
              <span className="figure text-ink">{money(i.qty * i.unitPrice)}</span>
            </li>
          ))}
          {r.fees.map((f) => (
            <li key={f.label} className="flex items-baseline justify-between gap-4 text-ink-2">
              <span>{f.label}</span>
              <span className="figure">{money(f.amount)}</span>
            </li>
          ))}
          {r.discount && (
            <li className="flex items-baseline justify-between gap-4 text-ink-2">
              <span>
                {r.discount.label} on {money(items)}
              </span>
              <span className="figure">{money(r.discount.amount)}</span>
            </li>
          )}
        </ul>
        <div className="mt-2.5 flex items-end justify-between gap-4 border-t border-rule pt-2.5">
          <div className="text-xs text-ink-3" suppressHydrationWarning>
            Valid until {r.validUntilLabel}
            <span className={cx("block", left < 3600 && !d ? "font-semibold text-primary-ink" : "")}>
              {d ? "Decision recorded" : left > 0 ? `${remaining(left)} left` : "Expired. Agent must re-quote."}
            </span>
          </div>
          <div className="text-right">
            <div className="label-caps">Total, USD</div>
            <div className="figure text-2xl font-semibold tracking-[-0.03em] text-ink">{money(total)}</div>
          </div>
        </div>
      </div>

      {/* Why it's asking */}
      <div className="border-t border-rule px-5 py-3">
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink">Why it&apos;s asking: </span>
          {r.rationale}
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {flagged.map((c) => (
            <li key={c.rule} className="flex items-start gap-2 text-sm">
              <CheckIcon result="flag" />
              <span>
                <span className="font-semibold text-ink">{c.rule}:</span>{" "}
                <span className="text-ink-2">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {passed.length > 0 && (
            <details className="group text-sm">
              <summary className="cursor-pointer list-none font-semibold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
                <Check aria-hidden className="mr-1 inline size-3.5 text-success" strokeWidth={2.5} />
                {passed.length} other checks passed
              </summary>
              <ul className="mt-1.5 flex flex-col gap-1">
                {passed.map((c) => (
                  <li key={c.rule} className="flex items-start gap-2">
                    <CheckIcon result="pass" />
                    <span>
                      <span className="font-semibold text-ink">{c.rule}:</span>{" "}
                      <span className="text-ink-2">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <details className="text-sm">
            <summary className="cursor-pointer list-none font-semibold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
              <EyeOff aria-hidden className="mr-1 inline size-3.5" strokeWidth={2} />
              What they see
            </summary>
            <p className="mt-1.5 text-ink-2">{r.counterpartyNote}</p>
          </details>
          <details className="text-sm">
            <summary className="cursor-pointer list-none font-semibold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
              <ScrollText aria-hidden className="mr-1 inline size-3.5" strokeWidth={2} />
              Line log
            </summary>
            <ol className="mt-1.5 flex flex-col gap-0.5">
              {[
                ...r.audit,
                ...(d
                  ? [
                      {
                        time: d.at,
                        entry:
                          d.tone === "approve"
                            ? `Approved by ${ownerInitials}, bound to these exact terms`
                            : d.tone === "void"
                              ? `Voided by ${ownerInitials}`
                              : `Returned for edits by ${ownerInitials}`,
                      },
                    ]
                  : []),
              ].map((e, i) => (
                <li key={i} className="grid grid-cols-[4.5rem_1fr] gap-2">
                  <span className="figure text-xs text-ink-3">{e.time}</span>
                  <span className="text-ink-2">{e.entry}</span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>

      {/* Your move */}
      <div className="border-t border-rule bg-surface-sunk px-5 py-3.5">
        {d ? (
          <p className="text-sm text-ink-2" aria-live="polite">
            <span className="font-semibold text-ink">
              {d.tone === "approve" ? "Approved" : d.tone === "void" ? "Voided" : "Returned"} by {ownerInitials} at{" "}
              {d.at}.
            </span>{" "}
            {d.tone === "approve"
              ? "Your agent is executing exactly these terms. Payment runs in sandbox."
              : d.tone === "void"
                ? "Your agent will decline and won't reopen this offer."
                : "Your agent will renegotiate and put the line back through to you."}
          </p>
        ) : (
          <>
            <p className="text-sm text-ink-2">
              {paused ? (
                <span className="font-semibold text-ink">Resume your agent to execute anything you approve.</span>
              ) : (
                <>
                  Approving binds you to <span className="figure font-semibold text-ink">{money(total)}</span> until{" "}
                  {r.validUntilLabel}. If the terms change, your agent must ask again.
                </>
              )}
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button
                variant="danger"
                icon={<Ban aria-hidden className="size-4" strokeWidth={2} />}
                loading={busy === "void"}
                disabled={!!busy && busy !== "void"}
                onClick={() => onDecide("void")}
              >
                Void
              </Button>
              <Button
                variant="secondary"
                icon={<PenLine aria-hidden className="size-4" strokeWidth={2} />}
                loading={busy === "return"}
                disabled={!!busy && busy !== "return"}
                onClick={() => onDecide("return")}
              >
                Return for edits
              </Button>
              <Button
                variant="primary"
                className="grow sm:grow-0"
                icon={<Check aria-hidden className="size-4" strokeWidth={2.5} />}
                loading={busy === "approve"}
                disabled={paused || (!!busy && busy !== "approve")}
                onClick={() => onDecide("approve")}
              >
                {busy === "approve" ? "Checking terms" : "Approve"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
