import type { Metadata } from "next";
import { LedgerView } from "@/components/switchboard/ledger";

export const metadata: Metadata = {
  title: "History",
};

export default function LedgerPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">History</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        A record of agent and transaction activity will be available when those workflows are connected.
      </p>
      <LedgerView />
    </div>
  );
}
