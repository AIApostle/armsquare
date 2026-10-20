import Link from "next/link";
import { AgentStateProvider, AgentStatusLine, AgentSwitch, BusinessName } from "@/components/switchboard/agent-state";
import { NavTabs } from "@/components/switchboard/nav-tabs";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { requireAccountRole } from "@/lib/auth/server";

export const instant = false;

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  await requireAccountRole("business");

  return (
    <AgentStateProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 bg-panel/90 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
            <Link href="/" aria-label="armsquare home" className="flex shrink-0 items-center">
              <Wordmark />
            </Link>
            <div className="hidden min-w-0 items-center lg:flex">
              <BusinessName />
            </div>
            <div className="hidden h-full items-center sm:flex">
              <NavTabs />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <AgentSwitch />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex h-14 items-center px-2 sm:hidden">
            <NavTabs />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
          {/* Narrow screens: the business and the assistant's status, dropped from the bar */}
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 empty:hidden lg:hidden">
            <BusinessName />
            <span className="xl:hidden">
              <AgentStatusLine />
            </span>
          </div>
          {children}
        </main>
      </div>
    </AgentStateProvider>
  );
}
