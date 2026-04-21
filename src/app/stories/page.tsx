"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type RandomStoryResult =
  | { ok: true; story: { id: string; text: string; imageUrl: string } }
  | { ok: false; error: string };

export default function StoriesPage() {
  const [data, setData] = useState<RandomStoryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/story/random", { cache: "no-store" });
      const json = (await res.json()) as RandomStoryResult;
      setData(json);
    } catch (e) {
      setData({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="animate-fade-in-up space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[0.75rem] font-medium text-[color:var(--color-muted)] ring-1 ring-white/10 backdrop-blur-md">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[hsl(214_85%_62%)] shadow-[0_0_0_6px_hsl(214_85%_62%/0.10)]"
          />
          Истории
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-balance-safe text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[color:var(--color-fg)]">
            Расскажи историю
          </h1>
        </div>
      </header>

      <div className="relative overflow-hidden rounded-3xl bg-[color:var(--color-panel)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white/10 to-transparent p-[1px]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[linear-gradient(180deg,hsl(220_30%_16%/0.55),hsl(222_35%_11%/0.35))] p-4 sm:p-5">
            {data === null ? (
              <div className="space-y-4">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent ring-1 ring-white/10">
                  <div className="animate-pulse-soft absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,hsl(214_85%_62%/0.12),transparent_60%)]" />
                  <div className="absolute inset-x-6 top-6 h-3 rounded-full bg-white/10" />
                  <div className="absolute inset-x-6 top-12 h-3 w-3/5 rounded-full bg-white/8" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-4/5 rounded-full bg-white/10" />
                  <div className="h-3 w-full rounded-full bg-white/8" />
                  <div className="h-3 w-2/3 rounded-full bg-white/7" />
                </div>
                <div className="text-sm text-[color:var(--color-muted)]">Загружаю…</div>
              </div>
            ) : !data.ok ? (
              <div className="space-y-3">
                <div className="text-sm text-[color:var(--color-muted)]">
                  Пока не получилось загрузить историю.
                </div>
                <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-[color:var(--color-muted-2)]">
                  {data.error}
                </pre>
              </div>
            ) : (
              <div
                className={`space-y-4 transition duration-300 ${
                  loading ? "opacity-55" : "opacity-100"
                }`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/10">
                  <Image
                    src={data.story.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
                <div className="whitespace-pre-wrap text-[0.98rem] leading-relaxed text-[color:var(--color-fg)]">
                  {data.story.text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_55px_hsl(222_55%_5%/0.35)] ring-1 ring-white/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_22px_65px_hsl(222_55%_5%/0.45)]"
        >
          {loading ? "Еще одну…" : "Еще одну историю"}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-fg)] ring-1 ring-white/10 backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-white/[0.06]"
        >
          Домой
        </Link>
      </div>
    </main>
  );
}

