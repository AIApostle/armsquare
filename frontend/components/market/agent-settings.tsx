"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert, Plus, X } from "lucide-react";
import { api, type CustomerAgentSettings } from "@/lib/api";
import { cx, moneyWhole } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { LimitControl, LimitMeter } from "@/components/ui/limit";

const usd = (amount: number) => ({ amount, currency: "USD" as const });

/** Loads the shopper's agent settings in the browser, where their session lives. */
export function AgentSettingsPanel() {
  const [settings, setSettings] = useState<CustomerAgentSettings | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .getAgentSettings()
      .then((s) => live && setSettings(s))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return (
      <p role="alert" className="mt-6 flex items-start gap-2 rounded-control border border-danger bg-danger-wash px-3 py-2 text-sm text-ink">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
        Couldn&apos;t load your agent&apos;s rules. Reload to try again; your agent keeps following the saved ones.
      </p>
    );
  }
  if (!settings) {
    return <div className="mt-6 h-96 animate-pulse rounded-panel bg-panel-raised" aria-busy="true" aria-label="Loading your agent" />;
  }
  return (
    <>
      <div className="plate mt-6 flex items-center gap-3 px-4 py-3.5">
        <span aria-hidden className="socket" data-lamp="closed" />
        <div className="min-w-0">
          <p className="text-base font-bold text-ink">{settings.agentName}</p>
          <p className="text-sm text-ink-2">
            Acting for {settings.ownerName} <span className="figure text-xs text-ink-3">· {settings.agentId}</span>
          </p>
        </div>
      </div>
      <div className="mt-8">
        <AgentSettingsForm initial={settings} />
      </div>
    </>
  );
}

function AgentSettingsForm({ initial }: { initial: CustomerAgentSettings }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState<CustomerAgentSettings>(initial);
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  const set = (patch: Partial<CustomerAgentSettings>) => setS((v) => ({ ...v, ...patch }));
  const autoTooHigh = s.autoApproveUnder.amount > s.errandBudget.amount;

  async function save() {
    setSaving(true);
    setSaveError(false);
    try {
      const next = await api.updateAgentSettings(s);
      setSaved(next);
      setS(next);
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
        if (!autoTooHigh) save();
      }}
      className="flex flex-col gap-8"
    >
      <section aria-labelledby="money-heading">
        <h2 id="money-heading" className="text-sm font-semibold text-ink-2">
          Money
        </h2>
        <div className="surface mt-2 grid gap-x-10 gap-y-8 p-5 md:grid-cols-2">
          <LimitControl
            label="Most it may spend on one errand"
            min={50}
            max={1000}
            step={10}
            unit="usd"
            defaultValue={s.errandBudget.amount}
            onChange={(v) => set({ errandBudget: usd(v) })}
            note="Your agent won't bring back offers above this."
          />
          <LimitControl
            label="Buy without asking me, up to"
            min={0}
            max={500}
            step={10}
            unit="usd"
            defaultValue={s.autoApproveUnder.amount}
            onChange={(v) => set({ autoApproveUnder: usd(v) })}
            note={
              s.autoApproveUnder.amount === 0
                ? "Your agent will ask you before every purchase."
                : `Above ${moneyWhole(s.autoApproveUnder.amount)}, it waits for your approval.`
            }
          />
          <LimitControl
            label="Most it may ask a seller to come down"
            min={0}
            max={40}
            step={1}
            unit="pct"
            defaultValue={s.maxDiscountAsk}
            onChange={(v) => set({ maxDiscountAsk: v })}
            note="It never accepts worse than list price."
          />
          <LimitMeter
            label="Monthly spending limit"
            used={s.spentThisMonth.amount}
            limit={s.monthlyLimit.amount}
            unit="usd"
            note="The platform blocks purchases past this, whatever the agent decides."
          />
        </div>
        {autoTooHigh && (
          <p className="mt-2 text-sm text-danger" role="alert">
            &ldquo;Buy without asking&rdquo; is higher than the errand limit. Lower it to{" "}
            {moneyWhole(s.errandBudget.amount)} or less.
          </p>
        )}
      </section>

      <section aria-labelledby="who-heading">
        <h2 id="who-heading" className="text-sm font-semibold text-ink-2">
          Who it buys from
        </h2>
        <div className="surface mt-2 flex flex-col gap-6 p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={s.verifiedSellersOnly}
              onChange={(e) => set({ verifiedSellersOnly: e.target.checked })}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Verified sellers only</span>
              <span className="block text-xs text-ink-3">
                Skip businesses armsquare hasn&apos;t verified, even if they&apos;re cheaper.
              </span>
            </span>
          </label>
          <TextField
            id="delivery-area"
            label="Delivery area"
            value={s.deliveryArea}
            onChange={(e) => set({ deliveryArea: e.target.value })}
            hint="Your agent only asks businesses that deliver here."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <TagEditor
              id="prefer"
              label="Prefer"
              hint="Your agent ranks these higher when offers are close."
              values={s.preferences}
              onChange={(preferences) => set({ preferences })}
            />
            <TagEditor
              id="avoid"
              label="Never buy"
              hint="Hard rule: offers containing these are declined."
              values={s.avoid}
              onChange={(avoid) => set({ avoid })}
            />
          </div>
        </div>
      </section>

      <div
        className={cx(
          "-mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-panel px-4 py-3 sm:mx-0 sm:rounded-control sm:border sm:px-4",
          dirty && "sticky bottom-0 shadow-raised",
        )}
      >
        <p className="text-sm text-ink-2" aria-live="polite">
          {saving ? "Saving…" : saveError ? (
            <span className="text-danger">Didn&apos;t save. Your agent is still on the old rules; try again.</span>
          ) : dirty ? "Unsaved changes. They apply to new errands." : (
            <span className="inline-flex items-center gap-1.5">
              <Check aria-hidden className="size-4 text-success" strokeWidth={2.5} />
              Saved. In this demo, settings last until you reload.
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="quiet" disabled={!dirty || saving} onClick={() => setS(saved)}>
            Discard
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={!dirty || autoTooHigh}>
            Save rules
          </Button>
        </div>
      </div>
    </form>
  );
}

function TagEditor({
  id,
  label,
  hint,
  values,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <ul className="mt-1.5 flex min-h-8 flex-wrap gap-1.5">
        {values.length === 0 && <li className="text-sm text-ink-3">Nothing yet</li>}
        {values.map((v) => (
          <li key={v} className="inline-flex items-center gap-1 rounded-full bg-panel-raised py-0.5 pr-1 pl-2.5 text-sm text-ink">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="grid size-5 place-items-center rounded-full text-ink-3 hover:bg-rule hover:text-ink"
            >
              <X aria-hidden className="size-3.5" strokeWidth={2.25} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add one"
          className={cx(
            "h-9 min-w-0 flex-1 rounded-control border border-rule-strong bg-surface px-3 text-sm text-ink",
            "placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-primary focus-visible:outline-offset-0",
          )}
        />
        <Button size="sm" variant="secondary" onClick={add} disabled={!draft.trim()} icon={<Plus aria-hidden className="size-4" strokeWidth={2} />}>
          Add
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-ink-3">{hint}</p>
    </div>
  );
}
