"use client";

import { useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";
import { AUTONOMY_LADDER, businessApi, type Policy } from "@/lib/api/business";
import { cx, formatDay } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CoinMeter, LimitControl } from "@/components/ui/limit";
import { levelName } from "./agent-state";
import { ErrorNotice } from "@/components/ui/notice";

const usd = (amount: number) => ({ amount, currency: "USD" as const });

/** Loads the owner's policy in the browser, where their session lives. */
export function PolicyPanel() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    businessApi
      .getPolicy()
      .then((p) => live && setPolicy(p))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return (
      <ErrorNotice className="mt-8">
        We couldn&apos;t load your rules just now. Your assistant keeps following the saved ones; please reload the page.
      </ErrorNotice>
    );
  }
  if (!policy) {
    return <div className="mt-8 h-96 animate-pulse rounded-card bg-panel-raised" aria-busy="true" aria-label="Loading your rules" />;
  }
  return <PolicyForm initial={policy} />;
}

function PolicyForm({ initial }: { initial: Policy }) {
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // Remount the sliders on discard so they pick the saved values back up.
  const [revision, setRevision] = useState(0);
  const dirty =
    p.perTransactionCap.amount !== saved.perTransactionCap.amount || p.discountCeiling !== saved.discountCeiling;
  const current = AUTONOMY_LADDER.indexOf(p.autonomy);

  async function save() {
    setSaving(true);
    setSaveError(false);
    try {
      const next = await businessApi.updatePolicy({
        perTransactionCap: p.perTransactionCap,
        discountCeiling: p.discountCeiling,
      });
      setSaved(next);
      setP(next);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <section aria-labelledby="limits-heading" className="mt-10">
        <h2 id="limits-heading" className="text-xl font-bold text-ink">
          Money limits
        </h2>
        <div key={revision} className="card mt-4 grid gap-x-12 gap-y-10 p-6 md:grid-cols-2">
          <LimitControl
            label="Most it can spend without asking you"
            min={0}
            max={2000}
            step={50}
            defaultValue={p.perTransactionCap.amount}
            onChange={(v) => setP((x) => ({ ...x, perTransactionCap: usd(v) }))}
            unit="usd"
            note="Anything bigger waits for your OK."
          />
          <LimitControl
            label="Biggest discount it can give"
            min={0}
            max={30}
            step={1}
            defaultValue={p.discountCeiling}
            onChange={(v) => setP((x) => ({ ...x, discountCeiling: v }))}
            unit="pct"
            note="A bigger discount waits for your OK."
          />
          <CoinMeter
            label="Spent on stock this week"
            used={p.weeklySpent.amount}
            limit={p.weeklyBudget.amount}
            note={`Starts again ${formatDay(p.weeklyResetsAt)}.`}
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-base font-medium text-ink">
              Lowest profit it will accept
              <span className="inline-flex items-center gap-1 rounded-full bg-panel-raised px-2.5 py-0.5 text-sm text-ink-2">
                <Lock aria-hidden className="size-3.5" strokeWidth={2.25} />
                Private
              </span>
            </div>
            <div className="figure text-2xl font-bold text-ink">{p.marginFloor}%</div>
            <p className="text-sm text-ink-3">It never sells below this. Customers never see it.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="autonomy-heading" className="mt-10">
        <h2 id="autonomy-heading" className="text-xl font-bold text-ink">
          How much it does on its own
        </h2>
        <ol className="card mt-4 divide-y divide-rule" aria-label="How much it does on its own">
          {AUTONOMY_LADDER.map((step, i) => {
            const isCurrent = i === current;
            return (
              <li
                key={step}
                aria-current={isCurrent ? "step" : undefined}
                className={cx(
                  "flex items-center gap-4 px-5 py-4 text-base",
                  isCurrent ? "font-bold text-ink" : i < current ? "text-ink-2" : "text-ink-3",
                )}
              >
                <span aria-hidden className="flex gap-1">
                  {AUTONOMY_LADDER.map((_, j) => (
                    <span key={j} className={cx("size-2.5 rounded-full", j <= i ? "bg-info" : "bg-picto-empty")} />
                  ))}
                </span>
                <span className="flex-1">{levelName[step]}</span>
                {isCurrent && <span className="rounded-full bg-info-wash px-3 py-0.5 text-sm font-medium text-ink">Now</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <div
        className={cx(
          "card -mx-4 mt-10 flex flex-wrap items-center justify-between gap-3 rounded-none px-4 py-4 sm:mx-0 sm:rounded-card sm:px-6",
          dirty && "sticky bottom-0 shadow-raised",
        )}
      >
        <p className="text-base text-ink-2" aria-live="polite">
          {saving ? (
            "Saving…"
          ) : saveError ? (
            <span className="text-danger">That didn&apos;t save. Your assistant is still using the old limits; please try again.</span>
          ) : dirty ? (
            "You have changes. They apply to new deals once saved."
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Check aria-hidden className="size-5 text-success" strokeWidth={2.5} />
              Saved. Your assistant is using these limits.
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button
            variant="quiet"
            disabled={!dirty || saving}
            onClick={() => {
              setP(saved);
              setRevision((r) => r + 1);
            }}
          >
            Undo changes
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={!dirty}>
            Save limits
          </Button>
        </div>
      </div>
    </form>
  );
}
