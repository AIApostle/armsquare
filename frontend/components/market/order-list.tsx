"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Business, type Order } from "@/lib/api";
import { formatMonthDay, formatStamp, money } from "@/lib/format";
import { Status, Tag, type StatusTone } from "@/components/ui/mark";
import { EmptyNotice, ErrorNotice } from "@/components/ui/notice";
import { Picto } from "@/components/ui/picto";

const payment: Record<Order["payment"], { label: string; tone: StatusTone }> = {
  confirmed: { label: "Paid", tone: "done" },
  pending: { label: "Payment going through", tone: "assistant" },
  failed: { label: "Payment didn't go through", tone: "stopped" },
  refunded: { label: "Refunded", tone: "idle" },
};

const fulfillment: Record<Order["fulfillment"], string> = {
  preparing: "Being prepared",
  out_for_delivery: "On its way",
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

  const name = (id: string) => businesses.find((b) => b.id === id)?.name ?? "A shop";

  if (failed) {
    return <ErrorNotice>We couldn&apos;t load your orders just now. Nothing has changed with them; please reload the page.</ErrorNotice>;
  }

  if (!orders) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading orders">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-panel-raised" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyNotice>
        <Picto name="box" tone="empty" className="mx-auto size-12" />
        <p className="mt-3 text-lg font-medium text-ink">No orders yet</p>
        <p className="mt-1">When you say yes to an offer, it shows up here with its payment and delivery.</p>
        <Link href="/market" className="mt-4 inline-block font-medium text-info underline">
          Ask your assistant for something
        </Link>
      </EmptyNotice>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {orders.map((o) => {
        const p = payment[o.payment];
        return (
          <li key={o.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-surface-sunk">
              <Picto name="box" tone={o.fulfillment === "delivered" ? "done" : "ink"} className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-ink">{o.summary}</p>
              <p className="text-base text-ink-2">
                <Link href={`/market/business/${o.businessId}`} className="hover:underline">
                  {name(o.businessId)}
                </Link>{" "}
                · ordered {formatStamp(o.placedAt)}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <Status tone={p.tone}>{p.label}</Status>
                {o.sandbox && o.payment !== "failed" && <Tag>Test payment</Tag>}
                <span className="text-sm text-ink-2">
                  {fulfillment[o.fulfillment]}
                  {o.fulfillment !== "cancelled" && o.fulfillment !== "delivered" && `, arriving ${formatMonthDay(o.deliveryBy)}`}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-3">
                {o.approvedBy === "you" ? "You said yes to this" : "Bought by your assistant, under your limit"}
              </p>
            </div>
            <div className="figure text-xl font-bold text-ink sm:text-right">{money(o.total.amount)}</div>
          </li>
        );
      })}
    </ol>
  );
}
