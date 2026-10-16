"use client";

import { useId, useState } from "react";
import { moneyWhole } from "@/lib/format";

function fmt(value: number, unit: "usd" | "pct") {
  return unit === "usd" ? moneyWhole(value) : `${value}%`;
}

/** Read-only meter: a thin bar with mono figures, never a ring. */
export function LimitMeter({
  label,
  used,
  limit,
  unit,
  note,
}: {
  label: string;
  used: number | null;
  limit: number;
  unit: "usd" | "pct";
  note?: string;
}) {
  const pct = used === null ? null : Math.min(100, (used / limit) * 100);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="figure text-xl text-ink">
        {used !== null ? (
          <>
            {fmt(used, unit)} <span className="text-ink-3">/ {fmt(limit, unit)}</span>
          </>
        ) : (
          fmt(limit, unit)
        )}
      </div>
      {pct !== null && (
        <div
          className="h-1 overflow-hidden rounded-full bg-rule"
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used ?? 0}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      )}
      {note && <p className="text-xs text-ink-3">{note}</p>}
    </div>
  );
}

/** Editable limit with a live mono readout bound to the slider. */
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
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <output htmlFor={id} className="figure text-xl text-primary-ink">
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
      <div className="figure flex justify-between text-xs text-ink-3">
        <span>{fmt(min, unit)}</span>
        <span>{fmt(max, unit)}</span>
      </div>
      {note && <p className="text-xs text-ink-3">{note}</p>}
    </div>
  );
}
