"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type CustomerAgentSettings } from "@/lib/api";
import { moneyWhole } from "@/lib/format";

/** The shopper's agent and its monthly spend, read in the browser with the session. */
export function BudgetReadout() {
  const [s, setS] = useState<CustomerAgentSettings | null>(null);

  useEffect(() => {
    let live = true;
    api
      .getAgentSettings()
      .then((v) => live && setS(v))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!s) return <span className="hidden h-8 w-44 animate-pulse rounded-control bg-panel-raised lg:block" aria-hidden />;

  const pct = Math.min(100, (s.spentThisMonth.amount / s.monthlyLimit.amount) * 100);
  return (
    <Link
      href="/market/agent"
      className="hidden items-center gap-3 rounded-control px-2 py-1 hover:bg-panel-raised lg:flex"
      title="Your agent's monthly spending limit"
    >
      <span className="flex flex-col items-end leading-tight">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <span aria-hidden className="lamp" data-lamp="closed" />
          {s.agentName}
        </span>
        <span className="text-xs text-ink-3">
          <span className="tabular-nums">{moneyWhole(s.spentThisMonth.amount)}</span> of{" "}
          <span className="tabular-nums">{moneyWhole(s.monthlyLimit.amount)}</span> this month
        </span>
      </span>
      <span className="h-1 w-14 overflow-hidden rounded-full bg-rule" aria-hidden>
        <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </span>
    </Link>
  );
}
