import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cx } from "@/lib/format";

/** Something didn't work: says what, and what to do next. */
export function ErrorNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cx("flex items-start gap-3 rounded-card bg-danger-wash px-5 py-4 text-base text-ink", className)}
    >
      <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}

/** Nothing here yet: says what will show up and how. */
export function EmptyNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-card border-2 border-dashed border-rule px-6 py-10 text-center text-base text-ink-2", className)}>
      {children}
    </div>
  );
}
