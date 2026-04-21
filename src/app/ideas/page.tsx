"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { parseNumberedIdeas } from "@/lib/parse-numbered-ideas";

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

  const ideaItems = useMemo(() => {
    if (!text) return null;
    return parseNumberedIdeas(text);
  }, [text]);

  const ideaCards = useMemo(() => {
    if (!ideaItems) return null;
    if (ideaItems.length < 3) return null;
    return ideaItems.slice(0, 3);
  }, [ideaItems]);

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
    "border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-[color:var(--color-panel)]";
  const segActive =
    "border-2 border-[color-mix(in_oklab,var(--blob-b)_70%,var(--blob-a)_30%)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--blob-b)_38%,var(--color-panel)),color-mix(in_oklab,var(--blob-a)_28%,var(--color-panel)))] text-[color:var(--color-fg)] shadow-[var(--shadow-soft)] ring-2 ring-[color-mix(in_oklab,var(--blob-b)_55%,white)] outline outline-2 outline-[color-mix(in_oklab,var(--blob-b)_55%,var(--blob-a)_45%)] outline-offset-2 backdrop-blur-md";

  return (
    <main className="animate-fade-in-up space-y-8">
      <header className="relative space-y-4">
        <div className="pointer-events-none absolute -right-6 top-0 h-24 w-24 rotate-12 rounded-3xl border border-[color:var(--color-stroke)] opacity-35" />

        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-muted-2)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-10 rounded-full bg-[radial-gradient(circle_at_20%_30%,var(--blob-b),var(--blob-a))]"
          />
          Идеи на вечер
        </div>

        <h1 className="font-display text-balance-safe text-[2.15rem] font-semibold leading-[0.95] tracking-[-0.05em] text-[color:var(--color-fg)]">
          Сегодня
        </h1>
      </header>

      <section className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_40%_35%,var(--blob-c),transparent_62%)] opacity-55 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_50%_45%,var(--blob-b),transparent_62%)] opacity-45 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex items-end justify-between gap-3">
            <div className="text-sm font-semibold text-[color:var(--color-fg)]">Настройки</div>
            <div
              aria-hidden="true"
              className="h-2 w-16 rounded-full bg-[radial-gradient(circle_at_20%_30%,var(--blob-c),var(--blob-a))] opacity-80 ring-1 ring-[color:var(--color-ring)]"
            />
          </div>

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
      </section>

      <button
        type="button"
        disabled={!canGenerate}
        onClick={generate}
        className="w-full rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--blob-b)_30%,white),color-mix(in_oklab,var(--blob-a)_26%,white))] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-app-bg)] shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5"
      >
        {loading ? "Генерирую…" : "Сгенерировать идеи"}
      </button>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent" />
        <div className="relative">
            {error ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-muted)]">
                {error}
              </pre>
            ) : text ? (
              ideaCards ? (
                <div className="grid gap-3">
                  {ideaCards.map((idea, idx) => {
                    const accents = [
                      "from-[color-mix(in_oklab,var(--blob-a)_22%,transparent)] to-[color-mix(in_oklab,var(--blob-c)_14%,transparent)]",
                      "from-[color-mix(in_oklab,var(--blob-b)_24%,transparent)] to-[color-mix(in_oklab,var(--blob-d)_16%,transparent)]",
                      "from-[color-mix(in_oklab,var(--blob-c)_20%,transparent)] to-[color-mix(in_oklab,var(--blob-a)_12%,transparent)]"
                    ];
                    const accent = accents[idx % accents.length];
                    return (
                      <div
                        key={`${idx}-${idea.slice(0, 12)}`}
                        className="relative overflow-hidden rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] p-4 shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)]"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-90`}
                        />
                        <div className="relative flex gap-3">
                          <div className="font-display text-2xl font-semibold tabular-nums text-[color:var(--color-fg)] opacity-90">
                            {idx + 1}
                          </div>
                          <div className="text-sm leading-relaxed text-[color:var(--color-fg)]">
                            {idea}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg)]">
                  {text}
                </pre>
              )
            ) : (
              <div className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                Нажми кнопку — появятся 3 короткие идеи на вечер.
              </div>
            )}
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-[color:var(--color-panel)]"
      >
        Домой
      </Link>
    </main>
  );
}
