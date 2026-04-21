"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "dark";
}

export function ThemeToggle() {
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
      className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-toggle-bg)] px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-soft)]"
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span
        aria-hidden="true"
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-[color:var(--color-toggle-track)] ring-1 ring-black/5"
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-toggle-knob)] shadow-sm transition-transform duration-300 ease-out ${
            theme === "light" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span className="hidden min-[360px]:inline">
        {theme === "dark" ? "Тёмная" : "Светлая"}
      </span>
    </button>
  );
}
