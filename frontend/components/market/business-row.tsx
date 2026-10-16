import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/lib/api";
import { count, replyTime } from "@/lib/format";
import { Verified } from "@/components/ui/mark";

/** One business in the market directory: who it is, its agent, and its record. */
export function BusinessRow({ business: b }: { business: Business }) {
  const verified = b.verification === "verified";
  return (
    <Link
      href={`/market/business/${b.id}`}
      className="group grid gap-x-6 gap-y-1 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-sunk md:grid-cols-[minmax(0,1fr)_15rem_13rem]"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-base font-bold text-ink">{b.name}</span>
          <Verified verified={verified} />
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink-2">{b.tagline}</span>
      </span>
      <span className="flex min-w-0 items-center gap-2 text-sm text-ink-2">
        {/* Unlit: nobody's agent is on this line until you ask. */}
        <span aria-hidden className="socket scale-75" data-lamp="off" />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">{b.agent.name}</span>
          <span className="block truncate text-xs text-ink-3">{replyTime(b.agent.medianReplySeconds)}</span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-4 md:justify-end">
        <span className="text-xs text-ink-3">
          {verified && b.trust.ordersFulfilled > 0 ? (
            <>
              <span className="tabular-nums">{count(b.trust.ordersFulfilled)}</span> orders ·{" "}
              <span className="tabular-nums">{b.trust.onTimeRate}%</span> on time
            </>
          ) : (
            "No order history yet"
          )}
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink"
          strokeWidth={2}
        />
      </span>
    </Link>
  );
}
