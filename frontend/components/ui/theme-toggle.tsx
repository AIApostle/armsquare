"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function current(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, current, () => null);

  // Re-apply the saved theme after React's dev remount clears it. No-op in production.
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  function toggle() {
    const next: Theme = current() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-control text-ink-2 transition-colors duration-150 hover:bg-panel-raised hover:text-ink"
    >
      {theme === "dark" ? (
        <Sun aria-hidden className="size-4.5" strokeWidth={1.75} />
      ) : (
        <Moon aria-hidden className="size-4.5" strokeWidth={1.75} />
      )}
    </button>
  );
}
