"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const tabs = [
  { href: "/dashboard", label: "Lines" },
  { href: "/dashboard/ledger", label: "Ledger" },
  { href: "/dashboard/policy", label: "Policy" },
] as const;

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Owner desk" className="flex h-full items-stretch gap-1">
      {tabs.map((t) => {
        const current = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={cx(
              "-mb-px inline-flex items-center border-b-2 px-2.5 text-sm font-semibold transition-colors duration-150",
              current
                ? "border-primary text-ink"
                : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
