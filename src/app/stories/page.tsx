"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StoryView } from "@/components/story-view";

type RandomStoryResult =
  | { ok: true; story: { id: string; text: string; imageUrl: string } }
  | { ok: false; error: string };

export default function StoriesPage() {
  const [data, setData] = useState<RandomStoryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const storyKey = !data ? "loading" : data.ok ? data.story.id : "error";

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
    <main className="animate-fade-in-up space-y-8">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-muted-2)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--blob-a),var(--blob-c))]" />
          Истории
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-balance-safe text-[2rem] font-semibold leading-[0.95] tracking-[-0.04em] text-[color:var(--color-fg)]">
            Расскажи историю
          </h1>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -left-6 top-6 h-24 w-24 rotate-12 rounded-3xl border border-[color:var(--color-stroke)] opacity-40" />
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent" />
          <StoryView data={data} loading={loading} storyKey={storyKey} />
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--blob-a)_35%,white),color-mix(in_oklab,var(--blob-b)_35%,white))] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-app-bg)] shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5"
        >
          {loading ? "Еще одну…" : "Еще одну историю"}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-[color:var(--color-panel)]"
        >
          Домой
        </Link>
      </div>
    </main>
  );
}

