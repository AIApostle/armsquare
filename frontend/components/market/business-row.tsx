import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/lib/api";
import { count } from "@/lib/format";
import { Verified } from "@/components/ui/mark";
import { Picto } from "@/components/ui/picto";

/** One shop: who it is, whether armsquare has checked it, and how it's done so far. */
export function BusinessRow({ business: b }: { business: Business }) {
  const verified = b.verification === "verified";
  return (
    <Link
      href={`/market/business/${b.id}`}
      className="card group flex h-full items-start gap-4 p-5 transition-[box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:shadow-raised"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-info-wash">
        <Picto name="shop" tone="assistant" className="size-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold text-ink">{b.name}</span>
        <span className="mt-0.5 block text-base text-ink-2">{b.tagline}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {b.isDemo ? (
            <span className="text-sm font-medium text-ink-2">Fictional demo shop</span>
          ) : (
            <Verified verified={verified} />
          )}
          <span className="text-sm text-ink-3">
            {b.isDemo ? (
              "Sample catalog"
            ) : verified && b.trust.ordersFulfilled > 0 ? (
              <>
                <span className="figure">{count(b.trust.ordersFulfilled)}</span> orders delivered
              </>
            ) : (
              "No orders yet"
            )}
          </span>
        </span>
      </span>
      <ArrowRight
        aria-hidden
        className="mt-1 size-5 shrink-0 text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink"
        strokeWidth={2.25}
      />
    </Link>
  );
}
