import type { ReactNode } from "react";
import { BadgeCheck, CircleAlert, CircleCheck, CircleHelp } from "lucide-react";
import { cx } from "@/lib/format";

type Tone = "pass" | "flag" | "info" | "neutral" | "danger";

const tones: Record<Tone, string> = {
  pass: "text-success bg-success-wash",
  flag: "text-primary-ink bg-primary-wash",
  info: "text-info bg-info-wash",
  neutral: "text-ink-2 bg-panel-raised",
  danger: "text-danger bg-danger-wash",
};

/** A small status pill. Always words plus color, never color alone. */
export function Mark({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type StatusTone = "assistant" | "waiting" | "done" | "stopped" | "idle";

/** A status dot with its words. The words stay ink; the dot carries the color. */
export function Status({ tone, children, className }: { tone: StatusTone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-sm font-medium text-ink", className)}>
      <span aria-hidden className="dot" data-tone={tone === "idle" ? undefined : tone} />
      {children}
    </span>
  );
}

/** A rule check: passed, or needs you. Always paired with text. */
export function CheckIcon({ result }: { result: "pass" | "flag" }) {
  return result === "pass" ? (
    <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={2} />
  ) : (
    <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-primary-ink" strokeWidth={2} />
  );
}

/** Whether armsquare has checked this shop. Checked is a fact; unchecked stays the shop's own word. */
export function Verified({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
      <BadgeCheck aria-hidden className="size-4" strokeWidth={2.25} />
      Checked by armsquare
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-2">
      <CircleHelp aria-hidden className="size-4" strokeWidth={2.25} />
      Not checked yet
    </span>
  );
}

/** Honest-state tag: an example, a test payment. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-panel-raised px-2.5 text-xs font-medium text-ink-2">
      {children}
    </span>
  );
}
