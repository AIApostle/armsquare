import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DealStory } from "@/components/landing/deal-story";
import { ErrandDemo } from "@/components/landing/errand-demo";
import { Ladder } from "@/components/landing/ladder";
import { Wordmark } from "@/components/ui/logo";
import { Picto, type PictoName } from "@/components/ui/picto";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cx } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: "armsquare · Your assistant does the haggling. You stay in charge." },
};

const sections = [
  { href: "#how", label: "How it works" },
  { href: "#in-charge", label: "You're in charge" },
  { href: "#promises", label: "Our promises" },
] as const;

const doors: { href: string; picto: PictoName; who: string; note: string; cta: string }[] = [
  {
    href: "/market",
    picto: "bag",
    who: "I'm shopping",
    note: "Tell your assistant what you need. It finds it, haggles, and asks before it buys.",
    cta: "Start shopping",
  },
  {
    href: "/dashboard",
    picto: "shop",
    who: "I run a business",
    note: "Your assistant answers customers, sells and restocks, and checks with you on the big things.",
    cta: "Open your business desk",
  },
];

const sides = [
  {
    id: "shoppers",
    picto: "bag" as PictoName,
    title: "I'm shopping",
    lede: "Like sending a friend who's great at bargains.",
    points: [
      "Say what you need in one sentence.",
      "It compares shops and asks for better prices.",
      "Small buys under your limit just happen.",
      "Anything bigger waits for your yes.",
    ],
    href: "/market",
    cta: "Start shopping",
  },
  {
    id: "businesses",
    picto: "shop" as PictoName,
    title: "I run a business",
    lede: "An extra pair of hands at the counter and in the stockroom.",
    points: [
      "Answers customers' questions and gives prices from your list.",
      "Offers discounts, but never more than you allow.",
      "Notices when stock runs low and finds suppliers.",
      "Brings the big decisions to you.",
    ],
    href: "/dashboard",
    cta: "Open your business desk",
  },
];

const promises = [
  ["Your limits are the rules.", "armsquare checks every deal against them. The assistant can't go past them."],
  ["A yes is for that exact deal.", "If the price or delivery changes after you say yes, it has to ask you again."],
  ["Your limits stay private.", "The other side sees the offer, never your budget or your rules."],
  ["Paid means really paid.", "We only show an order as paid once the payment has actually gone through."],
  ["Checked shops are marked.", "We show which shops armsquare has checked, and which haven't been yet."],
  ["You can pause any time.", "One button stops your assistant until you turn it back on."],
] as const;

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 bg-panel/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="armsquare home" className="shrink-0">
            <Wordmark />
          </Link>
          <nav aria-label="On this page" className="hidden items-center gap-1 lg:flex">
            {sections.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="rounded-full px-3 py-2 text-base text-ink-2 transition-colors duration-150 hover:bg-panel-raised hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="hidden h-10 items-center rounded-full px-4 text-base text-ink-2 transition-colors duration-150 hover:bg-panel-raised hover:text-ink sm:inline-flex"
            >
              For businesses
            </Link>
            <Link
              href="/market"
              className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-base font-medium text-panel transition-opacity duration-150 hover:opacity-90"
            >
              Start shopping
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section aria-labelledby="hero-heading" className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pt-16 lg:pb-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-x-14 lg:gap-y-10">
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <h1 id="hero-heading" className="max-w-[13ch] text-5xl font-bold tracking-[-0.03em] text-ink">
                Your assistant does the haggling. You stay in charge.
              </h1>
              <p className="mt-6 max-w-[44ch] text-lg text-ink-2">
                On armsquare, shoppers and businesses each get an assistant. Yours finds what you need,
                gets prices and asks for a better deal. It only spends what you allow, and asks you
                about anything bigger.
              </p>
            </div>
            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
              <ErrandDemo />
              <p className="mt-3 text-center text-base text-ink-3">Move the slider: more coins, more it can buy alone.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-start-1 lg:row-start-2 lg:self-start">
              {doors.map((d) => (
                <Door key={d.href} {...d} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-heading" className="scroll-mt-16 bg-surface-sunk">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 id="how-heading" className="max-w-[20ch] text-3xl font-bold tracking-[-0.02em] text-ink">
              How a deal happens, in five steps.
            </h2>
            <p className="mt-4 max-w-[56ch] text-lg text-ink-2">
              Both sides have an assistant, and the two assistants talk to each other. Here&apos;s what
              that looks like from your side of the counter.
            </p>
            <div className="mt-10">
              <DealStory />
            </div>
          </div>
        </section>

        {/* In charge */}
        <section id="in-charge" aria-labelledby="charge-heading" className="scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 id="charge-heading" className="max-w-[20ch] text-3xl font-bold tracking-[-0.02em] text-ink">
              You choose how much it does on its own.
            </h2>
            <p className="mt-4 max-w-[56ch] text-lg text-ink-2">
              Pick a level to see who does what. Whatever you choose, it never spends past your limits.
            </p>
            <div className="mt-10">
              <Ladder />
            </div>
          </div>
        </section>

        {/* Promises */}
        <section id="promises" aria-labelledby="promises-heading" className="scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 id="promises-heading" className="max-w-[20ch] text-3xl font-bold tracking-[-0.02em] text-ink">
              What you can count on.
            </h2>
            <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
              {promises.map(([title, text]) => (
                <li key={title} className="border-t border-rule py-5">
                  <p className="text-xl font-bold text-ink">{title}</p>
                  <p className="mt-1 max-w-[46ch] text-lg text-ink-2">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Close */}
        <section aria-labelledby="close-heading" className="bg-surface-sunk">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 id="close-heading" className="text-3xl font-bold tracking-[-0.02em] text-ink">
              Which side are you on?
            </h2>
            <p className="mt-3 max-w-[52ch] text-lg text-ink-2">
              Set your limits first. Your assistant starts small and only does what you allow.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {sides.map((side) => (
                <article key={side.id} aria-labelledby={`${side.id}-heading`} className="card flex flex-col p-7">
                  <Picto name={side.picto} tone="assistant" className="size-11" />
                  <h3 id={`${side.id}-heading`} className="mt-4 text-2xl font-bold text-ink">
                    {side.title}
                  </h3>
                  <p className="mt-1 text-lg text-ink-2">{side.lede}</p>
                  <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                    {side.points.map((p) => (
                      <li key={p} className="flex gap-3 text-base text-ink">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink-3" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={side.href}
                    className="group mt-7 inline-flex h-12 w-fit items-center gap-2 rounded-control bg-ink px-5 text-base font-medium text-panel transition-opacity duration-150 hover:opacity-90"
                  >
                    {side.cta}
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2.25} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-base text-ink-3 sm:px-6">
          <Wordmark />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/market" className="hover:text-ink">
              Shopping
            </Link>
            <Link href="/dashboard" className="hover:text-ink">
              Business desk
            </Link>
            <Link href="/system" className="hover:text-ink">
              Design system
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Door({
  href,
  picto,
  who,
  note,
  cta,
  large = false,
}: {
  href: string;
  picto: PictoName;
  who: string;
  note: string;
  cta: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "card group flex flex-col transition-[box-shadow,translate] duration-200 ease-signal hover:-translate-y-0.5 hover:shadow-raised",
        large ? "gap-2 p-7" : "gap-1.5 p-5",
      )}
    >
      <Picto name={picto} tone="assistant" className={large ? "size-11" : "size-8"} />
      <span className={cx("mt-2 font-bold text-ink", large ? "text-2xl" : "text-xl")}>{who}</span>
      <span className="text-base text-ink-2">{note}</span>
      <span className={cx("inline-flex items-center gap-1.5 font-medium text-info", large ? "mt-4 text-lg" : "mt-2 text-base")}>
        {cta}
        <ArrowRight aria-hidden className="size-4.5 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2.25} />
      </span>
    </Link>
  );
}
