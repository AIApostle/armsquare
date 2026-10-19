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
        The limits your assistant works within. armsquare checks every deal against them, so if a deal
        would go past one, it comes to you instead.
      </p>
      <PolicyPanel />
    </div>
  );
}
