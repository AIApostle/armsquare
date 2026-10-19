import Link from "next/link";
import { Suspense } from "react";
import { BudgetReadout } from "@/components/market/budget-readout";
import { MarketNav, MarketTabs } from "@/components/market/market-nav";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MarketLayout({ children }: LayoutProps<"/market">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 bg-panel/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link href="/" aria-label="armsquare home" className="flex shrink-0 items-center">
            <Wordmark />
          </Link>
          <div className="hidden h-full items-center md:flex">
            <Suspense fallback={<MarketTabs pathname={null} />}>
              <MarketNav />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <BudgetReadout />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex h-14 items-center px-2 md:hidden">
          <Suspense fallback={<MarketTabs pathname={null} />}>
            <MarketNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-10">{children}</main>
    </div>
  );
}
