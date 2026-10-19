import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/format";

/** Text input with its label, hint and error kept together. */
export function TextField({
  label,
  hint,
  error,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cx("flex flex-col", className)}>
      <label htmlFor={id} className="text-base font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "mt-2 h-12 w-full rounded-control border bg-surface px-4 text-base text-ink",
          "placeholder:text-ink-3 transition-colors duration-150",
          "hover:border-ink-3 focus-visible:border-info focus-visible:outline-offset-0",
          "disabled:bg-surface-sunk disabled:text-ink-3",
          error ? "border-danger" : "border-rule-strong",
        )}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
