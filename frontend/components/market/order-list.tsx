"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Business, type Order } from "@/lib/api";
import { CircleAlert } from "lucide-react";
import { cx, formatMonthDay, formatStamp, money } from "@/lib/format";

const payment: Record<Order["payment"], { label: string; lamp?: "closed" | "talking"; tone: string }> = {
  confirmed: { label: "Paid", lamp: "closed", tone: "text-success" },
  pending: { label: "Payment pending", lamp: "talking", tone: "text-ink-2" },
  failed: { label: "Payment failed", tone: "text-danger" },
  refunded: { label: "Refunded", tone: "text-ink-2" },
};

const fulfillment: Record<Order["fulfillment"], string> = {
  preparing: "Being prepared",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderList({ businesses }: { businesses: Business[] }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);

  // Orders belong to the signed-in shopper, so they load in the browser.
  useEffect(() => {
    let live = true;
    api
      .getOrders()
      .then((o) => live && setOrders(o))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const name = (id: string) => businesses.find((b) => b.id === id)?.name ?? id;

  if (failed) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-control border border-danger bg-danger-wash px-3 py-2 text-sm text-ink">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
        Couldn&apos;t load your orders. Nothing has changed with them; reload to try again.
      </p>
    );
  }

  if (!orders) {
    return (
      <div className="surface divide-y divide-rule" aria-busy="true" aria-label="Loading orders">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2 px-4 py-4">
            <div className="h-4 w-48 animate-pulse rounded bg-panel-raised" />
            <div className="h-3 w-72 max-w-full animate-pulse rounded bg-panel-raised" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-rule-strong px-5 py-8 text-sm text-ink-2">
        No orders yet. When you approve an offer your agent brings back, it shows up here with its
        payment and delivery status.{" "}
        <Link href="/market" className="font-semibold text-ink underline">
          Send your agent on an errand
        </Link>
      </div>
    );
  }

  return (
    <ol className="surface divide-y divide-rule overflow-hidden">
      {orders.map((o) => {
        const p = payment[o.payment];
        return (
          <li key={o.id} className="grid gap-x-6 gap-y-1.5 px-4 py-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_7rem]">
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink">{o.summary}</p>
              <p className="flex flex-wrap gap-x-3 text-sm text-ink-2">
                <Link href={`/market/business/${o.businessId}`} className="hover:underline">
                  {name(o.businessId)}
                </Link>
                <span className="figure text-xs leading-5 text-ink-3">
                  {o.id} · {formatStamp(o.placedAt)}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-0.5 text-sm">
              <span className={cx("inline-flex items-center gap-1.5 font-semibold", p.tone)}>
                {p.lamp && <span aria-hidden className="lamp" data-lamp={p.lamp} />}
                {p.label}
                {o.sandbox && o.payment !== "failed" && <span className="font-normal text-ink-3">· sandbox</span>}
              </span>
              <span className="text-ink-2">
                {fulfillment[o.fulfillment]}
                {o.fulfillment !== "cancelled" && o.fulfillment !== "delivered" && ` · by ${formatMonthDay(o.deliveryBy)}`}
              </span>
              <span className="text-xs text-ink-3">
                {o.approvedBy === "you" ? "Approved by you" : "Bought by your agent within your auto-approve limit"}
              </span>
            </div>
            <div className="figure text-base text-ink md:text-right">{money(o.total.amount)}</div>
          </li>
        );
      })}
    </ol>
  );
}
