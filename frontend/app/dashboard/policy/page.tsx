import type { Metadata } from "next";
import { PolicyPanel } from "@/components/switchboard/policy";

export const metadata: Metadata = {
  title: "Rules",
};

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">Rules</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        Manage the controls available for your shop assistant. Financial and transaction rules will be
        available when commerce workflows are connected.
      </p>
      <PolicyPanel />
    </div>
  );
}
