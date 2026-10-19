"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const tabs = [
  { href: "/market", label: "Ask" },
  { href: "/market/browse", label: "Shops" },
  { href: "/market/orders", label: "Orders" },
  { href: "/market/agent", label: "My assistant" },
] as const;

export function MarketNav() {
  return <MarketTabs pathname={usePathname()} />;
}

/** The tabs for a known path. With no path (while the URL streams in), none is marked current. */
export function MarketTabs({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Shopping" className="flex h-full items-center gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const current =
          pathname !== null &&
          (t.href === "/market"
            ? pathname === "/market"
            : t.href === "/market/browse"
              ? pathname.startsWith("/market/browse") || pathname.startsWith("/market/business")
              : pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={cx(
              "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-base transition-colors duration-150",
              current ? "bg-info-wash font-medium text-ink" : "text-ink-2 hover:bg-panel-raised hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
