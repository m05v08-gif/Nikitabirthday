"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "dark";
}

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const apply = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next === "dark" ? "dark" : "light";
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    apply(theme === "dark" ? "light" : "dark");
  }, [apply, theme]);

  return (
    <button
      type="button"
      onClick={toggle}
      style={
        {
          "--tt-surface-w": "auto",
          "--tt-surface-h": "auto",
          "--tt-pad": "4px",
          "--tt-thumb": "24px",
          "--tt-icon": "16px",
          "--tt-shift": "28px",
        } as React.CSSProperties
      }
      className={`group inline-flex items-center justify-between rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-toggle-bg)] p-[var(--tt-pad)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-soft)] [width:var(--tt-surface-w)] [height:var(--tt-surface-h)] ${className ?? ""}`}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span className="relative inline-flex [height:calc(var(--tt-surface-h)_-_2*var(--tt-pad))] [width:calc(var(--tt-surface-w)_-_2*var(--tt-pad))] items-center rounded-full bg-[color:var(--color-toggle-track)] ring-1 ring-black/5">
        <span
          className={`absolute left-[var(--tt-pad)] top-[var(--tt-pad)] h-[var(--tt-thumb)] w-[var(--tt-thumb)] rounded-full bg-[color:var(--color-toggle-knob)] shadow-sm transition-transform duration-300 ease-out ${
            theme === "light" ? "translate-x-0" : "translate-x-[var(--tt-shift)]"
          }`}
        />

        <span className="relative grid w-full grid-cols-2 items-center px-[calc(var(--tt-pad)_+_2px)]">
          <span
            className={`inline-flex h-[var(--tt-thumb)] w-[var(--tt-thumb)] items-center justify-center rounded-full text-[length:var(--tt-icon)] transition ${
              theme === "light" ? "text-[color:var(--color-app-bg)]" : "text-[color:var(--color-muted-2)]"
            }`}
            aria-hidden="true"
          >
            ☀︎
          </span>
          <span
            className={`inline-flex h-[var(--tt-thumb)] w-[var(--tt-thumb)] items-center justify-center rounded-full text-[length:var(--tt-icon)] transition ${
              theme === "dark" ? "text-[color:var(--color-app-bg)]" : "text-[color:var(--color-muted-2)]"
            }`}
            aria-hidden="true"
          >
            ☾
          </span>
        </span>
      </span>
    </button>
  );
}
