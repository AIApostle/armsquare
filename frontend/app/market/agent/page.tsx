import type { Metadata } from "next";
import { AgentSettingsPanel } from "@/components/market/agent-settings";

export const metadata: Metadata = {
  title: "My agent",
};

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">My agent</h1>
      <p className="mt-1 max-w-[62ch] text-sm text-ink-2">
        The rules your shopping agent works inside. armsquare enforces them, not the AI: an offer that
        breaks one is never bought without you.
      </p>
      <AgentSettingsPanel />
    </div>
  );
}
