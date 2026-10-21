"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type CustomerAgentSettings } from "@/lib/api";
import { moneyWhole } from "@/lib/format";
import { Picto } from "@/components/ui/picto";

/** This month's spending in words, read in the browser with the session. */
export function BudgetReadout() {
  const [s, setS] = useState<CustomerAgentSettings | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .getAgentSettings()
      .then((v) => live && setS(v))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  // The assistant page explains a failed load; the bar just stays quiet.
  if (failed) return null;
  if (!s) return <span className="hidden h-10 w-48 animate-pulse rounded-full bg-panel-raised lg:block" aria-hidden />;

  const spent = s.spentThisMonth.amount;
  const limit = s.monthlyLimit.amount;
  return (
    <Link
      href="/market/account/assistant"
      className="hidden items-center gap-3 rounded-full px-3 py-1.5 hover:bg-panel-raised lg:flex"
      title="Your monthly spending limit"
    >
      <Picto name="coin" tone="assistant" className="size-5" />
      <span className="text-sm text-ink-2">
        <span className="figure font-medium text-ink">{moneyWhole(spent)}</span> of{" "}
        <span className="figure">{moneyWhole(limit)}</span> this month
      </span>
    </Link>
  );
}
