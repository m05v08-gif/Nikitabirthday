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
      className={`group inline-flex items-center justify-between rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-toggle-bg)] p-[var(--tt-pad,4px)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-soft)] [width:var(--tt-surface-w,80px)] [height:var(--tt-surface-h,40px)] ${className ?? ""}`}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span className="relative inline-flex h-[var(--tt-thumb,24px)] w-[calc(var(--tt-surface-w,80px)_-_2*var(--tt-pad,4px))] items-center rounded-full bg-[color:var(--color-toggle-track)] ring-1 ring-black/5">
        <span
          className={`absolute left-0 top-0 h-[var(--tt-thumb,24px)] w-[var(--tt-thumb,24px)] rounded-full bg-[color:var(--color-toggle-knob)] shadow-sm transition-transform duration-300 ease-out ${
            theme === "light" ? "translate-x-0" : "translate-x-[var(--tt-shift,28px)]"
          }`}
        />

        <span className="relative flex w-full items-center justify-between px-[2px]">
          <span
            className={`inline-flex h-[var(--tt-thumb,24px)] w-[var(--tt-thumb,24px)] items-center justify-center rounded-full text-[length:var(--tt-icon,16px)] transition ${
              theme === "light" ? "text-[color:var(--color-app-bg)]" : "text-[color:var(--color-muted-2)]"
            }`}
            aria-hidden="true"
          >
            ☀︎
          </span>
          <span
            className={`inline-flex h-[var(--tt-thumb,24px)] w-[var(--tt-thumb,24px)] items-center justify-center rounded-full text-[length:var(--tt-icon,16px)] transition ${
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
