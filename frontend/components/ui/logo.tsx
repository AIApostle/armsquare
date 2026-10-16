import { cx } from "@/lib/format";

/** A square jack plate with its socket and a cord leaving it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cx("size-6 shrink-0", className)}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="var(--ink)" />
      <circle cx="10" cy="12" r="4.25" fill="var(--panel)" />
      <circle cx="10" cy="12" r="2" fill="var(--live)" />
      <path d="M14.25 12 C 17.5 12, 18.5 8, 22 8" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-[-0.025em] text-ink">armsquare</span>
    </span>
  );
}
