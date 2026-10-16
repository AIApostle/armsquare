import type { Metadata } from "next";
import { activity } from "@/lib/demo-data";
import { closedToday } from "@/lib/lines";
import { cx, money } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ledger",
};

const tone: Record<string, string> = {
  Escalated: "text-primary-ink",
  "Within policy": "text-ink-2",
  Executed: "text-success",
  Blocked: "text-danger",
  Declined: "text-ink-2",
  Voided: "text-ink-2",
  Owner: "text-info",
};

export default function LedgerPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Ledger</h1>
      <p className="mt-1 max-w-[62ch] text-sm text-ink-2">
        Everything your agent and you did today, newest first. Entries are added, never edited.
      </p>

      <section aria-labelledby="actions-heading" className="mt-8">
        <h2 id="actions-heading" className="text-sm font-semibold text-ink-2">
          Actions
        </h2>
        <ol className="surface mt-2 divide-y divide-rule">
          {activity.map((a, i) => (
            <li key={i} className="grid gap-x-4 gap-y-0.5 px-4 py-3 sm:grid-cols-[3.5rem_6.5rem_minmax(0,1fr)_7rem]">
              <span className="figure text-sm text-ink-3">{a.time}</span>
              <span className="figure text-sm text-ink-2">{a.agent}</span>
              <span className="text-sm text-ink">{a.entry}</span>
              <span className={cx("text-sm font-semibold sm:text-right", tone[a.decision])}>{a.decision}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="closed-heading" className="mt-8">
        <h2 id="closed-heading" className="text-sm font-semibold text-ink-2">
          Lines closed earlier today
        </h2>
        <ol className="surface mt-2 divide-y divide-rule">
          {closedToday.map((c, i) => (
            <li key={i} className="grid gap-x-4 gap-y-0.5 px-4 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_6rem_7rem]">
              <span className="figure text-sm text-ink-3">{c.time}</span>
              <span className="text-sm text-ink">{c.topic}</span>
              <span className="figure text-sm text-ink-2 sm:text-right">{c.amount ? money(c.amount) : "–"}</span>
              <span className={cx("text-sm font-semibold sm:text-right", tone[c.outcome])}>{c.outcome}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-ink-3">Payments are sandbox payments confirmed by the provider.</p>
      </section>
    </div>
  );
}
