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

  type SlideState = "center" | "exit-left" | "exit-right" | "enter-left" | "enter-right";
  const [slide, setSlide] = useState<SlideState>("center");
  const [animating, setAnimating] = useState(false);
  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

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

  const slideTo = useCallback(
    (nextCursor: number, dir: "next" | "prev") => {
      if (animating) return;
      clearTimers();
      setAnimating(true);

      // Exit current card
      setSlide(dir === "next" ? "exit-left" : "exit-right");

      // After exit: swap story, then enter from opposite side
      timers.current.push(
        window.setTimeout(() => {
          setCursor(nextCursor);
          setSlide(dir === "next" ? "enter-right" : "enter-left");
          timers.current.push(
            window.setTimeout(() => {
              // trigger transition to center
              setSlide("center");
              timers.current.push(
                window.setTimeout(() => {
                  setAnimating(false);
                }, 260)
              );
            }, 16)
          );
        }, 220)
      );
    },
    [animating, clearTimers]
  );

  useEffect(() => {
    // First load
    void fetchRandom();
  }, [fetchRandom]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const goNext = useCallback(() => {
    if (loading || animating) return;
    if (cursor < history.length - 1) {
      slideTo(cursor + 1, "next");
      return;
    }
    // Need a fresh story: fetch then animate to it
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/story/random", { cache: "no-store" });
        const json = (await res.json()) as RandomStoryResult;
        setData(json);
        if (!json.ok) return;
        setHistory((prev) => {
          const next = [...prev, json.story];
          // Animate to the appended story
          slideTo(next.length - 1, "next");
          return next;
        });
      } catch (e) {
        setData({ ok: false, error: e instanceof Error ? e.message : String(e) });
      } finally {
        setLoading(false);
      }
    })();
  }, [animating, cursor, history.length, loading, slideTo]);

  const goPrev = useCallback(() => {
    if (loading || animating) return;
    if (cursor > 0) slideTo(cursor - 1, "prev");
  }, [animating, cursor, loading, slideTo]);

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

  const slideClass =
    slide === "center"
      ? "translate-x-0 opacity-100"
      : slide === "exit-left"
        ? "-translate-x-[32%] opacity-0"
        : slide === "exit-right"
          ? "translate-x-[32%] opacity-0"
          : slide === "enter-left"
            ? "-translate-x-[32%] opacity-0"
            : "translate-x-[32%] opacity-0";

  // When entering, we want to start off-screen (opacity 0) and then animate to center.
  // We do that by switching slide -> enter-* -> (next tick) center.

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
          <div
            className={`will-change-transform transition-[transform,opacity] duration-[260ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] ${slideClass}`}
          >
            <StoryView data={currentStory ?? data} loading={loading} storyKey={storyKey} />
          </div>
        </div>
      </section>

      <Link
        href="/"
        className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.99] motion-safe:hover:bg-[color:var(--color-panel)]"
      >
        Назад
      </Link>
    </main>
  );
}

