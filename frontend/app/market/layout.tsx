import Link from "next/link";
import { BudgetReadout } from "@/components/market/budget-readout";
import { MarketNav } from "@/components/market/market-nav";
import { Tag } from "@/components/ui/mark";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MarketLayout({ children }: LayoutProps<"/market">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-rule bg-panel">
        <div className="mx-auto flex h-14 max-w-360 items-stretch gap-3 px-4 sm:gap-5 sm:px-6">
          <Link href="/" aria-label="armsquare, choose a side" className="flex shrink-0 items-center">
            <Wordmark />
          </Link>
          <div className="hidden items-stretch sm:flex">
            <MarketNav />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <BudgetReadout />
            <Tag>Demo data</Tag>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex h-11 items-stretch border-t border-rule px-2 sm:hidden">
          <MarketNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-360 flex-1 px-4 pt-6 pb-20 sm:px-6">{children}</main>
    </div>
  );
}
