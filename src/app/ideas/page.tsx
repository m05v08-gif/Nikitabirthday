"use client";

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

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm text-zinc-400">Идеи на вечер</div>
        <h1 className="text-2xl font-semibold tracking-tight">Сегодня</h1>
      </header>

      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-sm font-semibold text-zinc-100">Настройки</div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-400">Где</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("home")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                mode === "home"
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-100"
              }`}
            >
              Дома
            </button>
            <button
              type="button"
              onClick={() => setMode("out")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                mode === "out"
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-100"
              }`}
            >
              Вне дома
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-400">Время</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDuration("short")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                duration === "short"
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-100"
              }`}
            >
              30–60 мин
            </button>
            <button
              type="button"
              onClick={() => setDuration("medium")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                duration === "medium"
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-100"
              }`}
            >
              2–3 часа
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-400">Бюджет</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBudget("zero")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                budget === "zero"
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-100"
              }`}
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setBudget("small")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                budget === "small"
                  ? "border-white bg-white text-zinc-950"
                  : "border-zinc-800 bg-zinc-950/40 text-zinc-100"
              }`}
            >
              Небольшой
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        disabled={!canGenerate}
        onClick={generate}
        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
      >
        {loading ? "Генерирую…" : "Сгенерировать идеи"}
      </button>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        {error ? (
          <pre className="whitespace-pre-wrap text-sm text-zinc-300">{error}</pre>
        ) : text ? (
          <pre className="whitespace-pre-wrap text-sm text-zinc-100">{text}</pre>
        ) : (
          <div className="text-sm text-zinc-300">
            Нажми кнопку — появятся 3 короткие идеи на вечер.
          </div>
        )}
      </div>

      <a
        href="/"
        className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm font-semibold text-zinc-100"
      >
        Домой
      </a>
    </main>
  );
}
