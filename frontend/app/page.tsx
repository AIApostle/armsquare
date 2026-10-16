import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Tag } from "@/components/ui/mark";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "armsquare",
};

const sides = [
  {
    href: "/dashboard",
    who: "I run a business",
    agent: "K&C Business Agent",
    note: "Your agent sells, sources and negotiates for Kettle & Crate Provisions. You step in only where it needs you.",
    cta: "Open the owner desk",
    socket: "right",
  },
  {
    href: "/market",
    who: "I'm shopping",
    agent: "Alex's Shopping Agent",
    note: "Send your agent on an errand. It finds businesses, gets quotes, haggles inside your budget, and asks before it buys.",
    cta: "Enter the market",
    socket: "left",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Tag>Demo data</Tag>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <h1 className="max-w-[18ch] text-[2.5rem] leading-[1.1] font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          One market. An agent on both sides of every deal.
        </h1>
        <p className="mt-4 max-w-[58ch] text-base text-ink-2">
          On armsquare, businesses and shoppers each have an agent that finds the other, negotiates,
          and transacts within limits people set. Pick a side to see the demo from there.
        </p>

        <div className="relative mt-12 grid gap-6 md:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] md:gap-0">
          {/* The cord between the two agents */}
          <svg
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 hidden h-16 w-28 -translate-x-1/2 -translate-y-1/2 overflow-visible md:block"
            viewBox="0 0 112 64"
          >
            <path className="cord" d="M 0 32 C 40 32, 72 32, 112 32" />
          </svg>
          {sides.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className={`plate group relative flex flex-col gap-3 px-6 py-6 transition-[border-color,box-shadow] duration-200 ease-signal hover:border-rule-strong hover:shadow-raised ${i === 1 ? "md:col-start-3" : ""}`}
            >
              <span
                aria-hidden
                className={`socket absolute top-1/2 hidden -translate-y-1/2 md:inline-grid ${s.socket === "right" ? "-right-[9px]" : "-left-[9px]"}`}
                data-lamp="talking"
              />
              <span className="text-2xl font-bold tracking-[-0.02em] text-ink">{s.who}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-2">
                <span aria-hidden className="lamp" data-lamp="closed" />
                {s.agent}
              </span>
              <span className="max-w-[44ch] text-sm text-ink-2">{s.note}</span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-base font-semibold text-primary-ink">
                {s.cta}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-3">
          The two sides share one story: Alex&apos;s agent asks Kettle &amp; Crate for 12% off six hampers,
          and K&amp;C&apos;s agent puts that line through to its owner.
        </p>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-6 text-xs text-ink-3 sm:px-6">
        Every business, agent and figure here is demo data. Payments run in a provider sandbox.{" "}
        <Link href="/system" className="underline hover:text-ink">
          Design system
        </Link>
      </footer>
    </div>
  );
}
