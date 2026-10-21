import type { Metadata } from "next";
import { StoreManager } from "@/components/switchboard/store-manager";

export const metadata: Metadata = {
  title: "Shop",
};

export default function StorePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-ink">Your shop</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        Publish your shop and products for shoppers. Your assistant can prepare drafts, but you decide what goes live.
      </p>
      <div className="mt-8">
        <StoreManager />
      </div>
    </div>
  );
}
