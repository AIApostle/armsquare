import Link from "next/link";
import { autonomy, business, ourAgent } from "@/lib/demo-data";
import { AgentStateProvider, AgentStatusLine, AgentSwitch } from "@/components/switchboard/agent-state";
import { NavTabs } from "@/components/switchboard/nav-tabs";
import { Tag } from "@/components/ui/mark";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <AgentStateProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 border-b border-rule bg-panel">
          <div className="mx-auto flex h-14 max-w-360 items-stretch gap-3 px-4 sm:gap-5 sm:px-6">
            <Link href="/" aria-label="armsquare, choose a side" className="flex shrink-0 items-center">
              <Wordmark />
            </Link>
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <span className="truncate text-sm font-semibold text-ink-2">{business.name}</span>
              <Tag>Demo data</Tag>
            </div>
            <div className="hidden sm:flex sm:items-stretch md:ml-4">
              <NavTabs />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <AgentSwitch agentName={ourAgent.name} level={autonomy.level} />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex h-11 items-stretch border-t border-rule px-2 sm:hidden">
            <NavTabs />
          </div>
        </header>
        <main className="mx-auto w-full max-w-360 flex-1 px-4 pt-5 pb-16 sm:px-6">
          {/* Narrow screens: business, honest-state tag and agent status, dropped from the bar */}
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 md:hidden">
            <span className="text-sm font-semibold text-ink-2">{business.name}</span>
            <Tag>Demo data</Tag>
            <span className="xl:hidden">
              <AgentStatusLine level={autonomy.level} />
            </span>
          </div>
          {children}
        </main>
      </div>
    </AgentStateProvider>
  );
}
