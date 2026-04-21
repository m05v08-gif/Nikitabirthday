"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type Mode = "home" | "out";
type Duration = "short" | "medium";
type Budget = "zero" | "small";

export default function IdeasPage() {
  const [mode, setMode] = useState<Mode>("home");
  const [duration, setDuration] = useState<Duration>("short");
  const [budget, setBudget] = useState<Budget>("small");

  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => !loading, [loading]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, duration, budget })
      });
      const json = (await res.json()) as { ok: boolean; text?: string; error?: string };
      if (!json.ok) {
        setText(null);
        setError(json.error ?? "Не получилось сгенерировать.");
        return;
      }
      setText(json.text ?? "");
    } catch (e) {
      setText(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [budget, duration, mode]);

  const segInactive =
    "border border-white/10 bg-white/[0.03] text-[color:var(--color-fg)] ring-1 ring-white/10 backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-white/[0.05]";
  const segActive =
    "border border-[hsl(32_90%_58%/0.55)] bg-gradient-to-b from-white/14 to-white/[0.06] text-[color:var(--color-fg)] shadow-[0_14px_45px_hsl(28_85%_20%/0.22)] ring-1 ring-[hsl(32_90%_58%/0.24)] backdrop-blur-md";

  return (
    <main className="animate-fade-in-up space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[0.75rem] font-medium text-[color:var(--color-muted)] ring-1 ring-white/10 backdrop-blur-md">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[hsl(32_92%_58%)] shadow-[0_0_0_6px_hsl(32_92%_58%/0.14)]"
          />
          Идеи на вечер
        </div>

        <h1 className="font-display text-balance-safe text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[color:var(--color-fg)]">
          Сегодня
        </h1>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-[color:var(--color-panel)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white/10 to-transparent p-[1px]">
          <div className="space-y-5 rounded-[calc(1.5rem-2px)] bg-[linear-gradient(180deg,hsl(220_30%_16%/0.55),hsl(222_35%_11%/0.35))] p-4 sm:p-5">
            <div className="text-sm font-semibold text-[color:var(--color-fg)]">Настройки</div>

            <div className="grid gap-2">
              <div className="text-xs tracking-wide text-[color:var(--color-muted-2)]">Где</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("home")}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    mode === "home" ? segActive : segInactive
                  }`}
                >
                  Дома
                </button>
                <button
                  type="button"
                  onClick={() => setMode("out")}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    mode === "out" ? segActive : segInactive
                  }`}
                >
                  Вне дома
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs tracking-wide text-[color:var(--color-muted-2)]">Время</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDuration("short")}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    duration === "short" ? segActive : segInactive
                  }`}
                >
                  30–60 мин
                </button>
                <button
                  type="button"
                  onClick={() => setDuration("medium")}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    duration === "medium" ? segActive : segInactive
                  }`}
                >
                  2–3 часа
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs tracking-wide text-[color:var(--color-muted-2)]">Бюджет</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBudget("zero")}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    budget === "zero" ? segActive : segInactive
                  }`}
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setBudget("small")}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    budget === "small" ? segActive : segInactive
                  }`}
                >
                  Небольшой
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        disabled={!canGenerate}
        onClick={generate}
        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_55px_hsl(222_55%_5%/0.35)] ring-1 ring-white/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_22px_65px_hsl(222_55%_5%/0.45)]"
      >
        {loading ? "Генерирую…" : "Сгенерировать идеи"}
      </button>

      <div className="relative overflow-hidden rounded-3xl bg-[color:var(--color-panel)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white/10 to-transparent p-[1px]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[linear-gradient(180deg,hsl(220_30%_16%/0.55),hsl(222_35%_11%/0.35))] p-4 sm:p-5">
            {error ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-muted)]">
                {error}
              </pre>
            ) : text ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
                {text}
              </pre>
            ) : (
              <div className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                Нажми кнопку — появятся 3 короткие идеи на вечер.
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-fg)] ring-1 ring-white/10 backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-white/[0.06]"
      >
        Домой
      </Link>
    </main>
  );
}
