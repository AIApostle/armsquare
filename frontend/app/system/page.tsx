import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { LimitControl, LimitMeter } from "@/components/ui/limit";
import { CheckIcon, LampLabel, Mark, Tag, Verified } from "@/components/ui/mark";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Design system",
};

const swatches: { token: string; role: string }[] = [
  { token: "panel", role: "The field jacks are mounted in" },
  { token: "panel-raised", role: "Hover and quiet fills on the panel" },
  { token: "surface", role: "Plates and listen-in panels" },
  { token: "surface-sunk", role: "Closed plates, action strip" },
  { token: "ink", role: "Primary text, never pure black" },
  { token: "ink-2", role: "Secondary text, talking lamps" },
  { token: "ink-3", role: "Labels, metadata" },
  { token: "rule", role: "Hairlines and plate edges" },
  { token: "cord", role: "Lines your agent handles alone" },
  { token: "live", role: "The line waiting for you" },
  { token: "primary", role: "Your actions, current tab" },
  { token: "primary-ink", role: "Orange text on panel or surface" },
  { token: "success", role: "Closed, executed, verified" },
  { token: "danger", role: "Blocked, void" },
  { token: "info", role: "Owner actions in the ledger" },
];

const typeScale = [
  { name: "2xl", cls: "text-2xl font-bold tracking-[-0.02em]", sample: "Talking to 5 agents" },
  { name: "xl", cls: "text-xl font-bold tracking-[-0.015em]", sample: "Restock oat milk, 40 cases" },
  { name: "base", cls: "text-base", sample: "Your agent is handling this on its own." },
  { name: "sm", cls: "text-sm text-ink-2", sample: "Northfield Dairy Co-op · 12 orders fulfilled with you" },
  { name: "label", cls: "label-caps", sample: "Total, USD" },
  { name: "figure", cls: "figure text-xl", sample: "$909.00 · R3 · AGT-NF-03" },
];

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-rule pt-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-1 max-w-[40ch] text-sm text-ink-2">{note}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function SystemPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Wordmark />
          <span className="text-sm font-semibold text-ink-2">Design system</span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-control px-2.5 text-sm font-semibold text-ink-2 hover:bg-panel-raised hover:text-ink"
            >
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
              Lines
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
        <div className="max-w-[62ch]">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">The switchboard</h1>
          <p className="mt-2 text-base text-ink-2">
            Your agent is a live line. Every negotiation is a cord patched to another agent.
            Most run quietly in graphite. Orange means one thing: a line is waiting for you.
          </p>
        </div>

        <Section title="Color" note="A near-neutral scale. Orange appears only on the waiting line and on your actions.">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {swatches.map((s) => (
              <li key={s.token} className="plate overflow-hidden shadow-none">
                <div className="h-12 border-b border-rule" style={{ background: `var(--${s.token})` }} />
                <div className="p-2.5">
                  <div className="figure text-sm text-ink">{s.token}</div>
                  <div className="mt-0.5 text-xs text-ink-2">{s.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type" note="Hanken Grotesk for everything read. Geist Mono for figures, IDs, jack and round numbers.">
          <dl className="surface divide-y divide-rule">
            {typeScale.map((t) => (
              <div key={t.name} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-4 px-4 py-3">
                <dt className="figure text-xs text-ink-3">{t.name}</dt>
                <dd className={`${t.cls} min-w-0 truncate text-ink`}>{t.sample}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          title="Jacks and cords"
          note="A plate names the other agent first, then who it acts for. The lamp and the cord share one state, and orange means waiting for you."
        >
          <div className="surface relative grid gap-y-3 p-6 md:grid-cols-[11rem_1fr_17rem]">
            <svg aria-hidden className="pointer-events-none absolute inset-0 hidden size-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path className="cord" vectorEffect="non-scaling-stroke" data-state="waiting" d="M 24 50 C 40 50, 46 22, 62 22" />
              <path className="cord" vectorEffect="non-scaling-stroke" data-state="talking" d="M 24 50 C 40 50, 46 50, 62 50" />
              <path className="cord" vectorEffect="non-scaling-stroke" data-state="closed" d="M 24 50 C 40 50, 46 78, 62 78" />
            </svg>
            <div className="plate relative self-center px-4 py-3.5">
              <div className="text-sm font-bold text-ink">K&amp;C Business Agent</div>
              <div className="text-xs text-ink-2">Your agent</div>
              <span className="socket absolute top-1/2 -right-[9px] -translate-y-1/2" data-lamp="talking" />
            </div>
            <div className="flex flex-col gap-2 md:col-start-3">
              {(
                [
                  ["waiting", "Northfield Sales Agent", "Purchase order · needs your signature"],
                  ["talking", "Greenbank Sales Agent", "Countering · round 3"],
                  ["closed", "Parcelkind Dispatch Agent", "Closed by your agent · pickup booked"],
                ] as const
              ).map(([state, who, status]) => (
                <div
                  key={state}
                  className={`relative rounded-plate border py-2.5 pr-3 pl-5 ${state === "waiting" ? "border-live bg-surface" : state === "closed" ? "border-rule" : "border-rule bg-surface"}`}
                >
                  <span className="socket absolute top-1/2 -left-[9px] -translate-y-1/2" data-lamp={state} />
                  <div className="text-sm font-bold text-ink">{who}</div>
                  <LampLabel state={state}>{status}</LampLabel>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="Centre rail"
          note="Listening in sets the negotiation as us and them, twinned around the rounds. Moves travel the cord in the direction of who made them."
        >
          <div className="surface px-5 py-4">
            <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] pb-1.5">
              <span className="label-caps text-right">Your agent</span>
              <span />
              <span className="label-caps">Northfield Sales</span>
            </div>
            <ol className="relative">
              <span aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-rule-strong" />
              {(
                [
                  ["them", "Quote", "$23.10 / case"],
                  ["us", "Counter", "$20.50 / case"],
                  ["them", "Counter", "$21.60 / case"],
                ] as const
              ).map(([from, label, amount], i) => {
                const last = i === 2;
                const cell = (
                  <span className={`flex flex-col ${from === "us" ? "items-end" : ""}`}>
                    <span className="text-xs font-semibold text-ink-3">{label}</span>
                    <span className={`figure text-sm ${last ? "font-bold text-ink" : "text-ink"}`}>{amount}</span>
                  </span>
                );
                return (
                  <li key={i} className="relative grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center py-1.5">
                    <span className="pr-3">{from === "us" ? cell : null}</span>
                    <span className="flex justify-center">
                      <span className={`figure grid h-5 min-w-7 place-items-center rounded-full border bg-surface px-1 text-[0.6875rem] ${last ? "border-ink-3 text-ink" : "border-rule-strong text-ink-3"}`}>
                        R{i + 1}
                      </span>
                    </span>
                    <span className="pl-3">{from === "them" ? cell : null}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </Section>

        <Section title="Actions" note="One primary per decision, placed last. Destructive actions are outlined. Loading keeps the label.">
          <div className="surface flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="quiet">Cancel</Button>
              <Button variant="danger">Void</Button>
              <Button variant="secondary">Return for edits</Button>
              <Button variant="primary" icon={<Check aria-hidden className="size-4" strokeWidth={2.5} />}>
                Approve
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" loading>
                Checking terms
              </Button>
              <Button variant="primary" disabled>
                Approve
              </Button>
              <Button variant="secondary" size="sm">
                Small secondary
              </Button>
              <Button variant="primary" size="sm">
                Small primary
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Fields" note="Labels sit above, hints and errors below, and an error names its own recovery.">
          <div className="surface grid gap-5 p-5 md:grid-cols-2">
            <TextField id="ds-qty" label="Quantity" defaultValue="40" hint="Cases of 12" />
            <TextField
              id="ds-price"
              label="Max unit price"
              defaultValue="$19.00"
              error="Below the seller's floor of $20.50. Raise it or skip this seller."
            />
            <TextField id="ds-note" label="Note to agent" placeholder="Prefer Thursday delivery" />
            <TextField id="ds-off" label="Currency" defaultValue="USD" disabled hint="Set per business" />
          </div>
        </Section>

        <Section title="Marks" note="Status is always words plus color. Dashed tags mark honest state: demo, sandbox, simulated.">
          <div className="surface flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Mark tone="pass">Executed</Mark>
              <Mark tone="flag">Needs you</Mark>
              <Mark tone="info">Owner action</Mark>
              <Mark tone="danger">Blocked</Mark>
              <Mark tone="neutral">Risk: Low</Mark>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tag>Demo data</Tag>
              <Tag>Sandbox payment</Tag>
              <Verified verified />
              <Verified verified={false} />
            </div>
            <ul className="grid gap-2 text-sm text-ink">
              <li className="flex items-center gap-2">
                <CheckIcon result="pass" /> Weekly supply budget: $2,651 of $3,000
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon result="flag" /> Autonomous spend: $409.00 over the $500 limit
              </li>
            </ul>
          </div>
        </Section>

        <Section title="Limits" note="Every limit shows its value as a live mono readout. Meters are thin bars with figures, never rings.">
          <div className="surface grid gap-8 p-5 md:grid-cols-2">
            <LimitControl label="Autonomous spend per transaction" min={0} max={2000} step={50} defaultValue={500} unit="usd" />
            <LimitControl label="Discount ceiling on sales" min={0} max={30} step={1} defaultValue={10} unit="pct" />
            <LimitMeter label="Weekly supply budget" used={1742} limit={3000} unit="usd" note="Resets Monday 00:00." />
          </div>
        </Section>
      </main>
    </div>
  );
}
