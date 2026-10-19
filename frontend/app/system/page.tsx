import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { CoinMeter, LimitControl } from "@/components/ui/limit";
import { CheckIcon, Mark, Status, Tag, Verified } from "@/components/ui/mark";
import { Wordmark } from "@/components/ui/logo";
import { ErrorNotice, EmptyNotice } from "@/components/ui/notice";
import { Picto, PictoRow, type PictoName } from "@/components/ui/picto";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Design system",
};

const swatches: { token: string; role: string }[] = [
  { token: "panel", role: "The soft page ground" },
  { token: "surface", role: "Cards" },
  { token: "surface-sunk", role: "Quiet bands inside cards" },
  { token: "ink", role: "Main text, never pure black" },
  { token: "ink-2", role: "Supporting text" },
  { token: "ink-3", role: "Hints and times" },
  { token: "info", role: "Your assistant, links, sliders" },
  { token: "live", role: "Something waiting for you" },
  { token: "primary", role: "Your main action" },
  { token: "success", role: "Done, bought, paid" },
  { token: "danger", role: "Stopped, declined, errors" },
  { token: "picto-empty", role: "Empty pictograms" },
];

const typeScale = [
  { name: "5xl", cls: "text-5xl font-bold tracking-[-0.03em]", sample: "You stay in charge." },
  { name: "2xl", cls: "text-2xl font-bold", sample: "1 deal needs you" },
  { name: "xl", cls: "text-xl font-bold", sample: "6 gift hampers" },
  { name: "lg", cls: "text-lg text-ink-2", sample: "Your assistant is handling 3 more on its own." },
  { name: "base", cls: "text-base", sample: "If the price changes, it has to ask you again." },
  { name: "sm", cls: "text-sm text-ink-3", sample: "Answer by Oct 19, 15:04" },
  { name: "number", cls: "figure text-[2rem] font-bold", sample: "$417.12" },
];

const pictos: { name: PictoName; means: string }[] = [
  { name: "coin", means: "Money" },
  { name: "box", means: "An item" },
  { name: "shop", means: "A shop" },
  { name: "person", means: "A person" },
  { name: "tag", means: "A price" },
  { name: "bag", means: "Shopping" },
];

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
      <div>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 max-w-[40ch] text-base text-ink-2">{note}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function SystemPage() {
  return (
    <div className="min-h-dvh">
      <header className="bg-panel">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Wordmark />
          <span className="text-base text-ink-2">Design system</span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-base text-ink-2 hover:bg-panel-raised hover:text-ink"
            >
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2.25} />
              Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6">
        <div className="max-w-[60ch]">
          <h1 className="text-2xl font-bold text-ink">Picture Signs</h1>
          <p className="mt-2 text-lg text-ink-2">
            Every number becomes something you can see: coins for money, boxes for items, shops for
            shops. Plain words, Roboto throughout, blue for your assistant, and orange only for the
            one thing that needs you.
          </p>
        </div>

        <Section title="Color" note="Calm neutrals and three meanings: blue is your assistant, orange waits for you, green is done.">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {swatches.map((s) => (
              <li key={s.token} className="card overflow-hidden">
                <div className="h-14" style={{ background: `var(--${s.token})` }} />
                <div className="p-3">
                  <div className="text-base font-medium text-ink">{s.token}</div>
                  <div className="text-sm text-ink-2">{s.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type" note="Roboto for everything, numbers included, with figures that line up.">
          <dl className="card divide-y divide-rule">
            {typeScale.map((t) => (
              <div key={t.name} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-4 px-5 py-4">
                <dt className="text-sm text-ink-3">{t.name}</dt>
                <dd className={`${t.cls} min-w-0 text-ink`}>{t.sample}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Pictograms" note="Solid and flat, on one grid. Each stands for a real thing you could count. Never decoration.">
          <div className="card p-6">
            <ul className="grid grid-cols-3 gap-6 sm:grid-cols-6">
              {pictos.map((p) => (
                <li key={p.name} className="flex flex-col items-center gap-2">
                  <Picto name={p.name} tone="ink" className="size-10" />
                  <span className="text-sm text-ink-2">{p.means}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-4 border-t border-rule pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <PictoRow name="box" total={6} filled={6} tone="ink" label="6 items" />
                <span className="text-base text-ink-2">6 items: one box each</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <PictoRow name="shop" total={3} filled={3} tone="assistant" label="3 shops asked" />
                <span className="text-base text-ink-2">3 shops asked, in your assistant&apos;s blue</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span role="img" aria-label="5 coins allowed, 4 more needed" className="flex gap-1">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Picto key={i} name="coin" tone={i < 5 ? "assistant" : i < 9 ? "waiting" : "empty"} />
                  ))}
                </span>
                <span className="text-base text-ink-2">Each coin = $50. Blue coins it may spend; orange ones need you</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Limits" note="A slider with its value written large. Spending is shown as coins filling up.">
          <div className="card grid gap-x-12 gap-y-10 p-6 md:grid-cols-2">
            <LimitControl label="Buy without asking me, up to" min={0} max={500} step={10} defaultValue={200} unit="usd" note="Anything over this waits for your yes." />
            <CoinMeter label="Spent this month" used={420} limit={600} note="armsquare stops purchases past your limit." />
          </div>
        </Section>

        <Section title="Buttons" note="Big and plain. One orange button per decision, placed last.">
          <div className="card flex flex-wrap items-center gap-3 p-6">
            <Button variant="danger" icon={<X aria-hidden className="size-4.5" strokeWidth={2.5} />}>
              Decline
            </Button>
            <Button variant="secondary">Ask for changes</Button>
            <Button variant="primary" icon={<Check aria-hidden className="size-5" strokeWidth={2.5} />}>
              Approve
            </Button>
            <Button variant="quiet">Not now</Button>
            <Button variant="primary" loading>
              Saving
            </Button>
          </div>
        </Section>

        <Section title="Status" note="Always words with color, never color alone.">
          <div className="card flex flex-col gap-5 p-6">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Status tone="assistant">Your assistant is working</Status>
              <Status tone="waiting">Needs you</Status>
              <Status tone="done">Paid</Status>
              <Status tone="stopped">Paused</Status>
            </div>
            <div className="flex flex-wrap gap-2">
              <Mark tone="flag">Asked you</Mark>
              <Mark tone="pass">Done</Mark>
              <Mark tone="info">You</Mark>
              <Mark tone="neutral">Within your rules</Mark>
              <Mark tone="danger">Stopped</Mark>
              <Tag>Example</Tag>
              <Tag>Test payment</Tag>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Verified verified />
              <Verified verified={false} />
            </div>
            <ul className="flex flex-col gap-2 text-base">
              <li className="flex items-start gap-2.5">
                <CheckIcon result="pass" />
                <span className="text-ink-2">Within your weekly budget</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon result="flag" />
                <span className="text-ink-2">More than you let it spend alone</span>
              </li>
            </ul>
          </div>
        </Section>

        <Section title="Fields and messages" note="Labels above, hints below, errors that say what to do next.">
          <div className="flex flex-col gap-4">
            <div className="card grid gap-6 p-6 md:grid-cols-2">
              <TextField id="sys-area" label="Delivery area" defaultValue="Riverside" hint="It only asks shops that deliver here." />
              <TextField id="sys-email" label="Email" defaultValue="me@" error="That email looks incomplete. Please check it." />
            </div>
            <ErrorNotice>We couldn&apos;t load your orders just now. Please reload the page.</ErrorNotice>
            <EmptyNotice>No orders yet. When you say yes to an offer, it shows up here.</EmptyNotice>
          </div>
        </Section>
      </main>
    </div>
  );
}
