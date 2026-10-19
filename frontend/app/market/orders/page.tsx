import type { Metadata } from "next";
import { Suspense } from "react";
import { api, type Business } from "@/lib/api";
import { OrderList } from "@/components/market/order-list";

export const metadata: Metadata = {
  title: "Orders",
};

async function Orders() {
  // Only used to name sellers; orders still list without it.
  const businesses: Business[] = await api.getBusinesses().catch(() => []);
  return <OrderList businesses={businesses} />;
}

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-ink">Your orders</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        An order only shows as paid once the payment has actually gone through.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-card bg-panel-raised" aria-busy="true" />}>
          <Orders />
        </Suspense>
      </div>
    </div>
  );
}
