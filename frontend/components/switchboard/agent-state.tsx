"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { cx } from "@/lib/format";

const AgentContext = createContext<{
  paused: boolean;
  setPaused: (paused: boolean) => void;
}>({ paused: false, setPaused: () => {} });

export function AgentStateProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return <AgentContext value={{ paused, setPaused }}>{children}</AgentContext>;
}

export function useAgentState() {
  return useContext(AgentContext);
}

/** Compact status for narrow screens, where the top bar has no room for it. */
export function AgentStatusLine({ level }: { level: string }) {
  const { paused } = useAgentState();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2" aria-live="polite">
      <span aria-hidden className="lamp" data-lamp={paused ? undefined : "closed"} />
      {paused ? "Paused" : `On the board · ${level}`}
    </span>
  );
}

/** Agent status plus the kill switch, always within reach in the top bar. */
export function AgentSwitch({ agentName, level }: { agentName: string; level: string }) {
  const { paused, setPaused } = useAgentState();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden min-w-0 flex-col items-end leading-tight xl:flex">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <span aria-hidden className="lamp" data-lamp={paused ? undefined : "closed"} />
          {agentName}
        </span>
        <span className="text-xs text-ink-3" aria-live="polite">
          {paused ? "Paused: no tool use or new transactions" : `On the board · ${level}`}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
        className={cx(
          "inline-flex h-9 items-center gap-2 rounded-control border px-3 text-sm font-semibold transition-colors duration-150",
          paused
            ? "border-transparent bg-primary text-on-primary hover:bg-primary-hover"
            : "border-rule-strong bg-surface text-danger hover:border-danger hover:bg-danger-wash",
        )}
      >
        {paused ? (
          <Play aria-hidden className="size-4" strokeWidth={2.25} />
        ) : (
          <Pause aria-hidden className="size-4" strokeWidth={2.25} />
        )}
        {paused ? "Resume" : "Pause"}
        <span className="sr-only sm:not-sr-only sm:-ml-1">agent</span>
      </button>
    </div>
  );
}
