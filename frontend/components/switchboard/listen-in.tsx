"use client";

import { Check, ChevronDown, CircleCheck, PenLine, X } from "lucide-react";
import type { ApprovalRequest, Line, OwnerDecision } from "@/lib/api/business";
import { cx, formatStamp, formatTime, money, remaining } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CheckIcon, Status, Tag, Verified } from "@/components/ui/mark";
import { ErrorNotice } from "@/components/ui/notice";
import { CoinRow, Picto, PictoRow, signUnit } from "@/components/ui/picto";

const decided: Record<OwnerDecision, string> = {
  approve: "You approved this",
  void: "You declined this",
  return: "You asked for changes",
};

/** One deal, in plain sentences: who, what was said, and what needs your answer. */
export function DealDetail({
  line,
  now,
  busy,
  error,
  paused,
  spendLimit,
  onDecide,
}: {
  line: Line;
  /** Most the assistant may spend without asking, when known; drawn against a purchase's total. */
  spendLimit?: number;
  /** Current time in ms, ticking each second for the countdown. */
  now: number;
  busy: OwnerDecision | null;
  error: string | null;
  paused: boolean;
  onDecide: (decision: OwnerDecision) => void;
}) {
  const cp = line.counterparty;
  const them = cp.kind === "customer" ? "The customer" : cp.principal;
  const a = line.approval;

  return (
    <article aria-labelledby="deal-heading" className="card overflow-hidden">
      <header className="p-6">
        <h2 id="deal-heading" className="text-xl font-bold text-ink">
          {line.topic}
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-ink-2">
          with {cp.principal}
          <Verified verified={cp.verified} />
        </p>
        {cp.history && <p className="mt-1 text-sm text-ink-3">{cp.history}</p>}
        <p className="mt-3">
          <Status tone={line.state === "waiting" ? "waiting" : line.state === "closed" ? "done" : "assistant"}>{line.status}</Status>
        </p>
      </header>

      {line.rounds.length > 0 && (
        <div className="border-t border-rule px-6 py-5">
          <h3 className="text-base font-bold text-ink">How the price moved</h3>
          {/* One row per offer, oldest first: a price tag, who put it forward, and the price. */}
          <ol className="mt-3 flex flex-col">
            {line.rounds.map((r, i) => {
              const ours = r.from === "us";
              const latest = i === line.rounds.length - 1;
              return (
                <li
                  key={i}
                  className="grid animate-[land_220ms_var(--ease-signal)_both] grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-rule py-2.5 last:border-b-0"
                >
                  <Picto name="tag" tone={ours ? "assistant" : "ink"} className="mt-0.5 size-6" />
                  <span className="min-w-0">
                    <span className="block text-base text-ink">
                      <span className={ours ? "font-medium text-info" : "font-medium"}>{ours ? "Your assistant" : them}</span>{" "}
                      {r.label.toLowerCase()}
                    </span>
                    {r.note && <span className="block text-sm text-ink-3">{r.note}</span>}
                  </span>
                  <span className={cx("figure text-right text-lg", latest ? "font-bold text-ink" : "text-ink-2")}>{r.amount}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {a ? (
        <Decision
          request={a}
          line={line}
          now={now}
          busy={busy}
          error={error}
          paused={paused}
          spendLimit={spendLimit}
          onDecide={onDecide}
        />
      ) : (
        <div className="border-t border-rule bg-surface-sunk px-6 py-5">
          <p className="text-base font-bold text-ink">
            {line.state === "closed"
              ? line.closedByAgent
                ? "Your assistant finished this on its own."
                : "This deal is finished."
              : "Your assistant is handling this on its own."}
          </p>
          {line.within && <p className="mt-1 text-base text-ink-2">{line.within}.</p>}
          {line.state !== "closed" && (
            <p className="mt-1 text-base text-ink-3">If it needs to go past one of your rules, it will ask you first.</p>
          )}
        </div>
      )}
    </article>
  );
}

function Decision({
  request: r,
  line,
  now,
  busy,
  error,
  paused,
  spendLimit,
  onDecide,
}: {
  request: ApprovalRequest;
  line: Line;
  now: number;
  busy: OwnerDecision | null;
  error: string | null;
  paused: boolean;
  spendLimit?: number;
  onDecide: (decision: OwnerDecision) => void;
}) {
  const left = Math.floor((Date.parse(r.validUntil) - now) / 1000);
  const flagged = r.checks.filter((c) => c.result === "flag");
  const passed = r.checks.filter((c) => c.result === "pass");
  const d = line.decision;
  const answerBy = formatStamp(r.validUntil);
  const sell = r.direction === "sell";

  return (
    <div className="border-t border-rule">
      {/* What, and how much */}
      <div className="px-6 py-5">
        <h3 className="text-base font-bold text-ink">{sell ? "You'd be selling" : "You'd be buying"}</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {r.items.map((i) => (
            <li key={i.sku} className="flex items-start justify-between gap-4">
              <span className="min-w-0">
                <span className="block text-base text-ink">{i.description}</span>
                <span className="figure block text-sm text-ink-2">
                  {i.qty} × {money(i.unitPrice.amount)}
                </span>
                <ItemSigns qty={i.qty} unit={i.unit} />
              </span>
              <span className="figure text-base text-ink">{money(i.qty * i.unitPrice.amount)}</span>
            </li>
          ))}
          {r.fees.map((f) => (
            <li key={f.label} className="flex justify-between gap-4 text-base text-ink-2">
              <span>{f.label}</span>
              <span className="figure">{money(f.amount.amount)}</span>
            </li>
          ))}
          {r.discount && (
            <li className="flex justify-between gap-4 text-base text-ink-2">
              <span>{r.discount.label}</span>
              <span className="figure">{money(r.discount.amount.amount)}</span>
            </li>
          )}
        </ul>
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-rule pt-4">
          <p className="text-sm text-ink-2" suppressHydrationWarning>
            {d ? (
              "Answered"
            ) : left > 0 ? (
              <>
                Answer by {answerBy}
                <span className={cx("block", left < 3600 ? "font-medium text-primary-ink" : "text-ink-3")}>
                  {remaining(left)} left
                </span>
              </>
            ) : (
              "This offer has run out. Your assistant will ask for a new one."
            )}
          </p>
          <div className="text-right">
            <div className="text-sm text-ink-2">Total</div>
            <div className="figure text-[2rem] leading-tight font-bold text-ink">{money(r.total.amount)}</div>
          </div>
        </div>
      </div>

      {/* Why */}
      <div className="border-t border-rule px-6 py-5">
        <h3 className="text-base font-bold text-ink">Why it&apos;s asking you</h3>
        <p className="mt-1 text-base text-ink-2">{r.rationale}</p>
        {flagged.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {flagged.map((c) => (
              <li key={c.rule} className="flex items-start gap-2.5 rounded-[14px] bg-primary-wash/60 px-4 py-3 text-base">
                <CheckIcon result="flag" />
                <span>
                  <span className="font-medium text-ink">{c.rule}:</span> <span className="text-ink-2">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {!sell && spendLimit !== undefined && (
          <div className="mt-4">
            <CoinRow amount={r.total.amount} limit={spendLimit} mode="price" />
            <p className="mt-1 text-sm text-ink-3">
              Blue coins fit inside your limit{r.total.amount > spendLimit ? "; orange coins are the part over it." : "."}
            </p>
          </div>
        )}
        <div className="mt-3 flex flex-col gap-2">
          {passed.length > 0 && (
            <Disclosure title={`${passed.length} other ${passed.length === 1 ? "check" : "checks"} passed`} icon={<CircleCheck aria-hidden className="size-4 text-success" strokeWidth={2.25} />}>
              <ul className="flex flex-col gap-2">
                {passed.map((c) => (
                  <li key={c.rule} className="flex items-start gap-2.5 text-base">
                    <CheckIcon result="pass" />
                    <span>
                      <span className="font-medium text-ink">{c.rule}:</span> <span className="text-ink-2">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}
          <Disclosure title="What the other side can see">
            <p className="text-base text-ink-2">{r.counterpartyNote}</p>
          </Disclosure>
          {r.audit.length > 0 && (
            <Disclosure title="Everything that happened">
              <ol className="flex flex-col gap-1">
                {r.audit.map((e, i) => (
                  <li key={i} className="flex gap-4 text-base">
                    <span className="figure w-12 shrink-0 text-ink-3">{formatTime(e.at)}</span>
                    <span className="text-ink-2">{e.entry}</span>
                  </li>
                ))}
              </ol>
            </Disclosure>
          )}
        </div>
      </div>

      {/* Your answer */}
      <div className="border-t border-rule bg-surface-sunk px-6 py-5">
        {d ? (
          <p className="text-base text-ink-2" aria-live="polite">
            <span className="font-bold text-ink">
              {decided[d.decision]} at {formatTime(d.at)}.
            </span>{" "}
            {d.decision === "approve"
              ? "Your assistant is going ahead with exactly these terms."
              : d.decision === "void"
                ? "Your assistant will say no and won't reopen this offer."
                : "Your assistant will try again and come back to you."}
            {d.decision === "approve" && r.sandbox && (
              <>
                {" "}
                <Tag>Test payment</Tag>
              </>
            )}
          </p>
        ) : (
          <>
            <p className="text-base text-ink-2">
              {paused ? (
                <span className="font-medium text-ink">Turn your assistant back on to go ahead with anything you approve.</span>
              ) : (
                <>
                  If you approve, you agree to exactly <span className="figure font-medium text-ink">{money(r.total.amount)}</span>. If
                  anything changes, your assistant has to ask again.
                </>
              )}
            </p>
            {error && <ErrorNotice className="mt-4">{error}</ErrorNotice>}
            {/* Phones: full-width buttons with Approve on top; wider: Approve last, on the right */}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
              <Button
                variant="danger"
                icon={<X aria-hidden className="size-4.5" strokeWidth={2.5} />}
                loading={busy === "void"}
                disabled={!!busy && busy !== "void"}
                onClick={() => onDecide("void")}
              >
                Decline
              </Button>
              <Button
                variant="secondary"
                icon={<PenLine aria-hidden className="size-4.5" strokeWidth={2.25} />}
                loading={busy === "return"}
                disabled={!!busy && busy !== "return"}
                onClick={() => onDecide("return")}
              >
                Ask for changes
              </Button>
              <Button
                variant="primary"
                icon={<Check aria-hidden className="size-5" strokeWidth={2.5} />}
                loading={busy === "approve"}
                disabled={paused || left <= 0 || (!!busy && busy !== "approve")}
                onClick={() => onDecide("approve")}
              >
                {busy === "approve" ? "Checking…" : "Approve"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Disclosure({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-base font-medium text-info [&::-webkit-details-marker]:hidden">
        {icon}
        {title}
        <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" strokeWidth={2.25} />
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

/** Items as boxes; large quantities scale so one box stands for several, with the key printed. */
function ItemSigns({ qty, unit }: { qty: number; unit: string }) {
  const per = qty <= 24 ? 1 : signUnit(qty, 24);
  const boxes = Math.ceil(qty / per);
  return (
    <span className="mt-1.5 flex flex-col gap-1">
      <PictoRow name="box" total={boxes} filled={boxes} tone="ink" size="size-4" label={`${qty} ${unit}`} className="gap-0.5" />
      {per > 1 && (
        <span className="text-sm text-ink-3">
          Each box = {per} {unit}
        </span>
      )}
    </span>
  );
}
