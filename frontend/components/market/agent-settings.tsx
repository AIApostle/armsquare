"use client";

import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { api, type CustomerAgentSettings } from "@/lib/api";
import { cx, moneyWhole } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { CoinMeter, LimitControl } from "@/components/ui/limit";
import { ErrorNotice } from "@/components/ui/notice";
import { Picto } from "@/components/ui/picto";

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
      <ErrorNotice className="mt-6">
        We couldn&apos;t load your assistant&apos;s rules. Please reload; your assistant keeps following the saved ones.
      </ErrorNotice>
    );
  }
  if (!settings) {
    return <div className="mt-8 h-96 animate-pulse rounded-card bg-panel-raised" aria-busy="true" aria-label="Loading your assistant" />;
  }
  return (
    <>
      <div className="card mt-8 flex items-center gap-4 p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-info-wash">
          <Picto name="person" tone="assistant" className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink">{settings.agentName}</p>
          <p className="text-base text-ink-2">Shopping for {settings.ownerName}</p>
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
        <h2 id="money-heading" className="text-xl font-bold text-ink">
          Money
        </h2>
        <div className="card mt-4 grid gap-x-12 gap-y-10 p-6 md:grid-cols-2">
          <LimitControl
            label="Most it can spend on one thing"
            min={50}
            max={1000}
            step={10}
            unit="usd"
            defaultValue={s.errandBudget.amount}
            onChange={(v) => set({ errandBudget: usd(v) })}
            note="It won't show you offers that cost more than this."
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
                ? "It will ask you before every purchase."
                : `Anything over ${moneyWhole(s.autoApproveUnder.amount)} waits for your yes.`
            }
          />
          <LimitControl
            label="Biggest discount it asks for"
            min={0}
            max={40}
            step={1}
            unit="pct"
            defaultValue={s.maxDiscountAsk}
            onChange={(v) => set({ maxDiscountAsk: v })}
            note="It never pays more than the shop's usual price."
          />
          <CoinMeter
            label="Spent this month"
            used={s.spentThisMonth.amount}
            limit={s.monthlyLimit.amount}
            note="armsquare stops purchases past your monthly limit."
          />
        </div>
        {autoTooHigh && (
          <p className="mt-3 text-base text-danger" role="alert">
            &ldquo;Buy without asking&rdquo; is more than the most it can spend on one thing. Lower it to{" "}
            {moneyWhole(s.errandBudget.amount)} or less.
          </p>
        )}
      </section>

      <section aria-labelledby="who-heading">
        <h2 id="who-heading" className="text-xl font-bold text-ink">
          Where it shops
        </h2>
        <div className="card mt-4 flex flex-col gap-8 p-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={s.verifiedSellersOnly}
              onChange={(e) => set({ verifiedSellersOnly: e.target.checked })}
              className="mt-1 size-5 accent-[var(--info)]"
            />
            <span>
              <span className="block text-base font-medium text-ink">Only shops checked by armsquare</span>
              <span className="block text-sm text-ink-3">
                Skip shops we haven&apos;t checked yet, even if they&apos;re cheaper.
              </span>
            </span>
          </label>
          <TextField
            id="delivery-area"
            label="Delivery area"
            value={s.deliveryArea}
            onChange={(e) => set({ deliveryArea: e.target.value })}
            hint="It only asks shops that deliver here."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <TagEditor
              id="prefer"
              label="Things you like"
              hint="When offers are close, it picks ones with these."
              values={s.preferences}
              onChange={(preferences) => set({ preferences })}
            />
            <TagEditor
              id="avoid"
              label="Never buy"
              hint="It always says no to offers with these."
              values={s.avoid}
              onChange={(avoid) => set({ avoid })}
            />
          </div>
        </div>
      </section>

      <div
        className={cx(
          "card -mx-4 flex flex-wrap items-center justify-between gap-3 rounded-none px-4 py-4 sm:mx-0 sm:rounded-card sm:px-6",
          dirty && "sticky bottom-0 shadow-raised",
        )}
      >
        <p className="text-base text-ink-2" aria-live="polite">
          {saving ? "Saving…" : saveError ? (
            <span className="text-danger">That didn&apos;t save. Your assistant is still using the old rules; please try again.</span>
          ) : dirty ? "You have changes. They apply to new requests once saved." : (
            <span className="inline-flex items-center gap-1.5">
              <Check aria-hidden className="size-5 text-success" strokeWidth={2.5} />
              Saved. Your assistant is using these rules.
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="quiet" disabled={!dirty || saving} onClick={() => setS(saved)}>
            Undo changes
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
      <label htmlFor={id} className="text-base font-medium text-ink">
        {label}
      </label>
      <ul className="mt-2 flex min-h-9 flex-wrap gap-2">
        {values.length === 0 && <li className="text-base text-ink-3">Nothing yet</li>}
        {values.map((v) => (
          <li key={v} className="inline-flex items-center gap-1 rounded-full bg-info-wash py-1 pr-1 pl-3 text-base text-ink">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="grid size-7 place-items-center rounded-full text-ink-2 hover:bg-surface hover:text-ink"
            >
              <X aria-hidden className="size-4" strokeWidth={2.25} />
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
          placeholder="Type and press Add"
          className={cx(
            "h-11 min-w-0 flex-1 rounded-control border border-rule-strong bg-surface px-4 text-base text-ink",
            "placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-info focus-visible:outline-offset-0",
          )}
        />
        <Button variant="secondary" onClick={add} disabled={!draft.trim()} icon={<Plus aria-hidden className="size-4" strokeWidth={2.25} />}>
          Add
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-3">{hint}</p>
    </div>
  );
}
