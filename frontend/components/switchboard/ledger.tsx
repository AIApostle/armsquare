"use client";

import { useEffect, useState } from "react";
import { businessApi, type Ledger, type LedgerOutcome } from "@/lib/api/business";
import { formatTime, money } from "@/lib/format";
import { Mark, Tag } from "@/components/ui/mark";
import { EmptyNotice, ErrorNotice } from "@/components/ui/notice";

// The backend's outcome codes, in everyday words.
const outcome: Record<LedgerOutcome, { label: string; tone: "pass" | "flag" | "info" | "neutral" | "danger" }> = {
  Escalated: { label: "Asked you", tone: "flag" },
  "Within policy": { label: "Within your rules", tone: "neutral" },
  Executed: { label: "Done", tone: "pass" },
  Blocked: { label: "Stopped", tone: "danger" },
  Declined: { label: "Said no", tone: "neutral" },
  Voided: { label: "Cancelled", tone: "neutral" },
  Owner: { label: "You", tone: "info" },
};

export function LedgerView() {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    businessApi
      .getLedger()
      .then((l) => live && setLedger(l))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return (
      <ErrorNotice className="mt-8">We couldn&apos;t load your history just now. Nothing in it has changed; please reload the page.</ErrorNotice>
    );
  }

  if (!ledger) {
    return (
      <div className="mt-8 flex flex-col gap-3" aria-busy="true" aria-label="Loading your history">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-card bg-panel-raised" />
        ))}
      </div>
    );
  }

  return (
    <>
      <section aria-labelledby="actions-heading" className="mt-10">
        <h2 id="actions-heading" className="text-xl font-bold text-ink">
          Everything that happened
        </h2>
        {ledger.actions.length === 0 ? (
          <EmptyNotice className="mt-4">
            Nothing yet today. Every price, offer, sale and decision is written down here as it happens.
          </EmptyNotice>
        ) : (
          <ol className="card mt-4 divide-y divide-rule">
            {ledger.actions.map((a) => {
              const o = outcome[a.outcome];
              return (
                <li key={a.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
                  <span className="figure w-14 shrink-0 text-base text-ink-3">{formatTime(a.at)}</span>
                  <span className="min-w-0 flex-1 text-base text-ink">{a.entry}</span>
                  <Mark tone={o.tone} className="w-fit shrink-0">
                    {o.label}
                  </Mark>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="closed-heading" className="mt-10">
        <h2 id="closed-heading" className="text-xl font-bold text-ink">
          Deals finished today
        </h2>
        {ledger.closed.length === 0 ? (
          <EmptyNotice className="mt-4">No deals finished yet today.</EmptyNotice>
        ) : (
          <ol className="card mt-4 divide-y divide-rule">
            {ledger.closed.map((c) => {
              const o = outcome[c.outcome];
              return (
                <li key={c.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
                  <span className="figure w-14 shrink-0 text-base text-ink-3">{formatTime(c.at)}</span>
                  <span className="min-w-0 flex-1 text-base text-ink">
                    {c.topic} {c.sandbox && <Tag>Test payment</Tag>}
                  </span>
                  <span className="figure shrink-0 text-lg font-bold text-ink">{c.amount ? money(c.amount.amount) : ""}</span>
                  <Mark tone={o.tone} className="w-fit shrink-0">
                    {o.label}
                  </Mark>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
