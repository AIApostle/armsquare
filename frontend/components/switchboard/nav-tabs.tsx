"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const tabs = [
  { href: "/dashboard", label: "Deals" },
  { href: "/dashboard/ledger", label: "History" },
  { href: "/dashboard/policy", label: "Rules" },
] as const;

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Business desk" className="flex h-full items-center gap-1">
      {tabs.map((t) => {
        const current = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={cx(
              "inline-flex h-10 items-center rounded-full px-4 text-base transition-colors duration-150",
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
