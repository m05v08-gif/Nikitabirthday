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
      className="group inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-toggle-bg)] p-1 shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-soft)]"
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span className="relative inline-flex h-8 w-[72px] items-center rounded-full bg-[color:var(--color-toggle-track)] ring-1 ring-black/5">
        <span
          className={`absolute left-1 top-1 h-6 w-9 rounded-full bg-[color:var(--color-toggle-knob)] shadow-sm transition-transform duration-300 ease-out ${
            theme === "light" ? "translate-x-0" : "translate-x-[28px]"
          }`}
        />

        <span className="relative grid w-full grid-cols-2 items-center px-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm transition ${
              theme === "light" ? "text-[color:var(--color-app-bg)]" : "text-[color:var(--color-muted-2)]"
            }`}
            aria-hidden="true"
          >
            ☀︎
          </span>
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm transition ${
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
