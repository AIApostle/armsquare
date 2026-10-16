import type { ReactNode } from "react";
import { BadgeCheck, CircleAlert, CircleCheck, CircleDashed } from "lucide-react";
import { cx } from "@/lib/format";

type Tone = "pass" | "flag" | "info" | "neutral" | "danger";

const tones: Record<Tone, string> = {
  pass: "text-success bg-success-wash",
  flag: "text-primary-ink bg-primary-wash",
  info: "text-info bg-info-wash",
  neutral: "text-ink-2 bg-panel-raised",
  danger: "text-danger bg-danger-wash",
};

/** Small status mark. Always words plus color, never color alone. */
export function Mark({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Lamp plus label for a line's state. */
export function LampLabel({
  state,
  children,
}: {
  state: "waiting" | "talking" | "closed";
  children: ReactNode;
}) {
  return (
    <span
      // Lamp Carries State: the words stay ink; only the lamp takes the state's color.
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink"
    >
      <span aria-hidden className="lamp" data-lamp={state} />
      {children}
    </span>
  );
}

/** Policy check result icon, paired with text. */
export function CheckIcon({ result }: { result: "pass" | "flag" }) {
  return result === "pass" ? (
    <CircleCheck aria-hidden className="size-4 shrink-0 text-success" strokeWidth={2} />
  ) : (
    <CircleAlert aria-hidden className="size-4 shrink-0 text-primary-ink" strokeWidth={2} />
  );
}

/** Verification state: verified is a fact; unverified stays a claim. */
export function Verified({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
      <BadgeCheck aria-hidden className="size-3.5" strokeWidth={2.25} />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2">
      <CircleDashed aria-hidden className="size-3.5" strokeWidth={2.25} />
      Unverified: claims only
    </span>
  );
}

/** Honest-state tag: demo data, sandbox payment, simulated. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-dashed border-ink-3 px-2 text-[0.6875rem] font-semibold tracking-[0.04em] text-ink-2">
      {children}
    </span>
  );
}
