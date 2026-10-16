"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const tabs = [
  { href: "/market", label: "Ask" },
  { href: "/market/browse", label: "Browse" },
  { href: "/market/orders", label: "Orders" },
  { href: "/market/agent", label: "My agent" },
] as const;

export function MarketNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Market" className="flex h-full items-stretch gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const current =
          t.href === "/market"
            ? pathname === "/market"
            : t.href === "/market/browse"
              ? pathname.startsWith("/market/browse") || pathname.startsWith("/market/business")
              : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={cx(
              "-mb-px inline-flex shrink-0 items-center border-b-2 px-2.5 text-sm font-semibold transition-colors duration-150",
              current ? "border-primary text-ink" : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
