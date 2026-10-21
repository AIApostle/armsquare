"use client";

import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { useAgentState } from "./agent-state";
import { WorkflowNotice } from "./workflow-notice";
import { ErrorNotice } from "@/components/ui/notice";

export function Board() {
  const { desk, failed, setupRequired } = useAgentState();

  if (setupRequired) {
    return (
      <section className="mx-auto max-w-3xl">
        <div className="grid size-14 place-items-center rounded-[16px] bg-info-wash text-info">
          <Store aria-hidden className="size-7" strokeWidth={2} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-ink">Set up your shop and assistant</h1>
        <p className="mt-2 max-w-[58ch] text-lg text-ink-2">
          Add your business details and products. Your assistant can answer questions from your published catalog and
          prepare product drafts for your review.
        </p>
        <Link
          href="/dashboard/store"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-control bg-primary px-5 text-base font-medium text-on-primary transition-colors hover:bg-primary-hover"
        >
          Create your shop
          <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
        </Link>
      </section>
    );
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-ink">Deals</h1>
        <ErrorNotice className="mt-6">
          We couldn&apos;t load your business details. Check your connection and try again.
        </ErrorNotice>
      </div>
    );
  }

  if (!desk) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading your business desk">
        <div className="h-9 w-64 max-w-full animate-pulse rounded-full bg-panel-raised" />
        <div className="h-44 animate-pulse rounded-card bg-panel-raised" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">Deals</h1>
      <p className="mt-2 max-w-[65ch] text-lg text-ink-2">
        Your shop and catalog assistant are ready. Deal negotiation and transaction workflows are not active yet.
      </p>
      <WorkflowNotice
        title="Deal approvals are not connected yet"
        description="The assistant cannot negotiate, approve transactions, make purchases, or process payments. It can answer from your published catalog and prepare drafts within the permissions you configure."
        actions={[
          { href: "/dashboard/store", label: "Manage shop" },
          { href: "/dashboard/assistant", label: "Open assistant" },
        ]}
      />
    </div>
  );
}
