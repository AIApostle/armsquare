import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { autonomy, limits } from "@/lib/demo-data";
import { cx } from "@/lib/format";
import { LimitControl, LimitMeter } from "@/components/ui/limit";
import { Tag } from "@/components/ui/mark";

export const metadata: Metadata = {
  title: "Policy",
};

export default function PolicyPage() {
  const [cap, weekly, discount, margin] = limits;
  const current = autonomy.ladder.indexOf(autonomy.level);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Policy</h1>
        <Tag>Changes here don&apos;t persist in the demo</Tag>
      </div>
      <p className="mt-1 max-w-[62ch] text-sm text-ink-2">
        The limits your agent works inside. The platform enforces them, not the AI: a line that
        would cross one is put through to you instead.
      </p>

      <section aria-labelledby="limits-heading" className="mt-8">
        <h2 id="limits-heading" className="text-sm font-semibold text-ink-2">
          Limits
        </h2>
        <div className="surface mt-2 grid gap-x-10 gap-y-8 p-5 md:grid-cols-2">
          <LimitControl
            label={cap.label}
            min={0}
            max={2000}
            step={50}
            defaultValue={cap.limit}
            unit="usd"
            note={cap.note}
          />
          <LimitControl
            label={discount.label}
            min={0}
            max={30}
            step={1}
            defaultValue={discount.limit}
            unit="pct"
            note={discount.note}
          />
          <LimitMeter label={weekly.label} used={weekly.used} limit={weekly.limit} unit="usd" note={weekly.note} />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              {margin.label}
              <span className="inline-flex items-center gap-1 rounded-full bg-panel-raised px-2 py-0.5 text-xs font-semibold text-ink-2">
                <Lock aria-hidden className="size-3" strokeWidth={2.25} />
                Private
              </span>
            </div>
            <div className="figure text-xl text-ink">{margin.limit}%</div>
            <p className="text-xs text-ink-3">{margin.note}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="autonomy-heading" className="mt-8">
        <h2 id="autonomy-heading" className="text-sm font-semibold text-ink-2">
          Autonomy
        </h2>
        <ol className="surface mt-2 divide-y divide-rule" aria-label="Autonomy ladder">
          {autonomy.ladder.map((step, i) => {
            const isCurrent = i === current;
            return (
              <li
                key={step}
                aria-current={isCurrent ? "step" : undefined}
                className={cx(
                  "flex items-center gap-3 px-4 py-3 text-sm",
                  isCurrent ? "font-bold text-ink" : i < current ? "text-ink-2" : "text-ink-3",
                )}
              >
                <span
                  aria-hidden
                  className="socket scale-75"
                  data-lamp={isCurrent ? "set" : "off"}
                />
                <span className="flex-1">{step}</span>
                {isCurrent && <span className="text-xs font-semibold text-primary-ink">Current level</span>}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
