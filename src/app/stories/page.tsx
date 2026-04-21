"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StoryView } from "@/components/story-view";

type RandomStoryResult =
  | { ok: true; story: { id: string; text: string; imageUrl: string } }
  | { ok: false; error: string };

export default function StoriesPage() {
  const router = useRouter();

  const [data, setData] = useState<RandomStoryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<Array<{ id: string; text: string; imageUrl: string }>>(
    []
  );
  const [cursor, setCursor] = useState(0);

  const currentStory = useMemo(() => {
    const s = history[cursor];
    return s ? ({ ok: true, story: s } as const) : null;
  }, [cursor, history]);

  const storyKey = useMemo(() => {
    if (currentStory?.ok) return currentStory.story.id;
    if (data && !data.ok) return "error";
    return "loading";
  }, [currentStory, data]);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/story/random", { cache: "no-store" });
      const json = (await res.json()) as RandomStoryResult;
      setData(json);
      if (json.ok) {
        setHistory((prev) => {
          const next = [...prev, json.story];
          setCursor(next.length - 1);
          return next;
        });
      }
    } catch (e) {
      setData({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // First load
    void fetchRandom();
  }, [fetchRandom]);

  const goNext = useCallback(() => {
    if (loading) return;
    if (cursor < history.length - 1) {
      setCursor((c) => c + 1);
      return;
    }
    void fetchRandom();
  }, [cursor, fetchRandom, history.length, loading]);

  const goPrev = useCallback(() => {
    if (loading) return;
    if (cursor > 0) setCursor((c) => c - 1);
  }, [cursor, loading]);

  // Swipe handling
  const startX = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
  }, []);
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      startX.current = null;
      const threshold = 48;
      if (dx <= -threshold) goNext(); // right -> left
      else if (dx >= threshold) goPrev(); // left -> right
    },
    [goNext, goPrev]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
      const dx = endX - touchStartX.current;
      touchStartX.current = null;
      const threshold = 48;
      if (dx <= -threshold) goNext();
      else if (dx >= threshold) goPrev();
    },
    [goNext, goPrev]
  );

  return (
    <main className="animate-fade-in-up space-y-8">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] motion-safe:hover:bg-[color:var(--color-panel)]"
            aria-label="Назад"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ‹
            </span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-muted-2)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--blob-a),var(--blob-c))]"
            />
            Истории
          </div>
        </div>

        {/* Intentionally no headline here (reading mode) */}
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -left-6 top-6 h-24 w-24 rotate-12 rounded-3xl border border-[color:var(--color-stroke)] opacity-40" />
        <div
          className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl sm:p-6"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent" />
          <StoryView data={currentStory ?? data} loading={loading} storyKey={storyKey} />
        </div>
      </section>

      <Link
        href="/"
        className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-[color:var(--color-panel)]"
      >
        Домой
      </Link>
    </main>
  );
}

