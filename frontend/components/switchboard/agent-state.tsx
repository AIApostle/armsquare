"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { businessApi, type AutonomyLevel, type Desk } from "@/lib/api/business";
import { cx } from "@/lib/format";

/** The autonomy levels in everyday words. */
export const levelName: Record<AutonomyLevel, string> = {
  "Read-only": "Just watches",
  Recommend: "Suggests",
  Draft: "Gets it ready",
  "Execute after approval": "Agrees, you confirm",
  "Execute within limits": "Buys and sells within your limits",
};

type DeskState = {
  /** null while loading or when the load failed. */
  desk: Desk | null;
  failed: boolean;
  paused: boolean;
  /** True while a pause or resume is on its way to the server. */
  switching: boolean;
  switchFailed: boolean;
  setPaused: (paused: boolean) => void;
};

const DeskContext = createContext<DeskState>({
  desk: null,
  failed: false,
  paused: false,
  switching: false,
  switchFailed: false,
  setPaused: () => {},
});

/** Loads the owner's desk in the browser, where their session lives, and shares it with the bar and pages. */
export function AgentStateProvider({ children }: { children: ReactNode }) {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [failed, setFailed] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchFailed, setSwitchFailed] = useState(false);

  useEffect(() => {
    let live = true;
    businessApi
      .getDesk()
      .then((d) => live && setDesk(d))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  function setPaused(paused: boolean) {
    if (!desk || switching) return;
    setSwitching(true);
    setSwitchFailed(false);
    businessApi
      .setPaused(paused)
      .then(setDesk)
      .catch(() => setSwitchFailed(true))
      .finally(() => setSwitching(false));
  }

  return (
    <DeskContext value={{ desk, failed, paused: desk?.paused ?? false, switching, switchFailed, setPaused }}>
      {children}
    </DeskContext>
  );
}

export function useAgentState() {
  return useContext(DeskContext);
}

/** The business the desk belongs to, for the top bar. */
export function BusinessName({ className }: { className?: string }) {
  const { desk, failed } = useAgentState();
  if (failed) return null;
  if (!desk) return <span className={cx("h-5 w-36 animate-pulse rounded-full bg-panel-raised", className)} aria-hidden />;
  return <span className={cx("truncate text-base font-medium text-ink", className)}>{desk.business.name}</span>;
}

/** Compact status for narrow screens, where the top bar has no room for it. */
export function AgentStatusLine() {
  const { desk, paused } = useAgentState();
  if (!desk) return null;
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-2" aria-live="polite">
      <span aria-hidden className="dot" data-tone={paused ? "stopped" : "assistant"} />
      {paused ? "Your assistant is paused" : "Your assistant is working"}
    </span>
  );
}

/** Assistant status plus the pause button, always within reach in the top bar. */
export function AgentSwitch() {
  const { desk, paused, switching, switchFailed, setPaused } = useAgentState();
  if (!desk) return null;
  const failText = `We couldn't ${paused ? "turn your assistant back on" : "pause your assistant"}. Please try again.`;
  return (
    <div className="flex items-center gap-3">
      <div className="hidden min-w-0 flex-col items-end leading-tight xl:flex">
        <span className="flex items-center gap-2 text-base font-medium text-ink">
          <span aria-hidden className="dot" data-tone={paused ? "stopped" : "assistant"} />
          {paused ? "Paused" : "Your assistant is working"}
        </span>
        <span className={cx("text-sm", switchFailed ? "text-danger" : "text-ink-3")} aria-live="polite">
          {switchFailed ? failText : paused ? "It won't do anything until you turn it on" : levelName[desk.autonomy]}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
        aria-busy={switching || undefined}
        disabled={switching}
        title={switchFailed ? failText : undefined}
        className={cx(
          "inline-flex h-10 items-center gap-2 rounded-full px-4 text-base font-medium transition-colors duration-150 disabled:opacity-60",
          paused
            ? "bg-primary text-on-primary hover:bg-primary-hover"
            : "bg-surface text-danger shadow-card hover:bg-danger-wash",
        )}
      >
        {paused ? (
          <Play aria-hidden className="size-4" strokeWidth={2.5} />
        ) : (
          <Pause aria-hidden className="size-4" strokeWidth={2.5} />
        )}
        {paused ? "Turn on" : "Pause"}
      </button>
    </div>
  );
}
