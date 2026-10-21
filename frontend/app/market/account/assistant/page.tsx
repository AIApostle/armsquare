import type { Metadata } from "next";
import Link from "next/link";
import { AgentSettingsPanel } from "@/components/market/agent-settings";

export const metadata: Metadata = {
  title: "My assistant",
};

export default function ShopperAssistantSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/market/account" className="text-sm font-medium text-info underline underline-offset-2">
        Account
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-ink">My assistant</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        The rules your shopping assistant follows. armsquare checks every purchase against them, so
        nothing that breaks one is bought without you.
      </p>
      <AgentSettingsPanel />
    </div>
  );
}
