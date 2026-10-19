import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cx } from "@/lib/format";

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 ease-signal " +
  "disabled:pointer-events-none disabled:opacity-45 aria-busy:cursor-progress";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-press shadow-card",
  secondary: "bg-surface text-ink border border-rule-strong hover:border-ink-3 hover:bg-surface-sunk",
  quiet: "text-ink-2 hover:text-ink hover:bg-panel-raised",
  danger: "bg-surface text-danger border border-rule-strong hover:border-danger hover:bg-danger-wash",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-6 text-lg",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" strokeWidth={2.25} /> : icon}
      {children}
    </button>
  );
}
