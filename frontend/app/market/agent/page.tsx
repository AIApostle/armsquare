import type { Metadata } from "next";
import { AgentSettingsPanel } from "@/components/market/agent-settings";

export const metadata: Metadata = {
  title: "My assistant",
};

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-ink">My assistant</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-2">
        The rules your shopping assistant follows. armsquare checks every purchase against them, so
        nothing that breaks one is bought without you.
      </p>
      <AgentSettingsPanel />
    </div>
  );
}
