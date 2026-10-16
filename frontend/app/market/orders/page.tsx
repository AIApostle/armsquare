import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { OrderList } from "@/components/market/order-list";

export const metadata: Metadata = {
  title: "Orders",
};

async function Orders() {
  const businesses = await api.getBusinesses();
  return <OrderList businesses={businesses} />;
}

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Orders</h1>
      <p className="mt-1 max-w-[62ch] text-sm text-ink-2">
        Payment shows as paid only once the payment provider confirms it. In this demo every payment
        runs in the provider&apos;s sandbox.
      </p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-panel bg-panel-raised" aria-busy="true" />}>
          <Orders />
        </Suspense>
      </div>
    </div>
  );
}
