"use client";

import { useId, useState } from "react";
import { moneyWhole } from "@/lib/format";
import { CoinRow } from "./picto";

function fmt(value: number, unit: "usd" | "pct") {
  return unit === "usd" ? moneyWhole(value) : `${value}%`;
}

/** How much of a money limit is used, counted in keyed coins. The figures say it in words too. */
export function CoinMeter({ label, used, limit, note }: { label: string; used: number; limit: number; note?: string }) {
  const left = Math.max(0, limit - used);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="text-base font-medium text-ink">{label}</div>
      <div className="figure text-2xl font-bold text-ink">
        {moneyWhole(used)} <span className="text-lg font-normal text-ink-3">of {moneyWhole(limit)}</span>
      </div>
      <CoinRow amount={used} limit={limit} mode="spent" />
      <p className="text-sm text-ink-3">
        {moneyWhole(left)} left.{note ? ` ${note}` : ""}
      </p>
    </div>
  );
}

/** An editable rule: a slider with the value written large beside its label. */
export function LimitControl({
  label,
  min,
  max,
  step,
  defaultValue,
  unit,
  note,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: "usd" | "pct";
  note?: string;
  onChange?: (value: number) => void;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-base font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="figure text-2xl font-bold text-info">
          {fmt(value, unit)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="limit-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          setValue(next);
          onChange?.(next);
        }}
        style={{ ["--fill" as string]: `${fill}%` }}
      />
      <div className="figure flex justify-between text-sm text-ink-3">
        <span>{fmt(min, unit)}</span>
        <span>{fmt(max, unit)}</span>
      </div>
      {note && <p className="text-sm text-ink-3">{note}</p>}
    </div>
  );
}
