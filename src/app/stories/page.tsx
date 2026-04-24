"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { StoryView } from "@/components/story-view";

type RandomStoryResult =
  | { ok: true; story: { id: string; text: string; imageUrl: string } }
  | { ok: false; error: string };

export default function StoriesPage() {
  const router = useRouter();

  const [data, setData] = useState<RandomStoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [reactionByStoryId, setReactionByStoryId] = useState<Record<string, string[]>>({});

  const storyKey = useMemo(() => {
    if (!data) return "loading";
    return data.ok ? data.story.id : "error";
  }, [data]);

  // reactions persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem("reactions:v2") ?? localStorage.getItem("reactions:v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return;

      // Backward compat:
      // - v1: { [storyId]: "❤️" }
      // - v2: { [storyId]: ["❤️","🔥"] }
      const next: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (Array.isArray(v)) {
          next[k] = v.filter((x) => typeof x === "string") as string[];
        } else if (typeof v === "string" && v.trim().length > 0) {
          next[k] = [v];
        }
      }
      setReactionByStoryId(next);
    } catch {
      // ignore
    }
  }, []);

  const persistReactions = useCallback((next: Record<string, string[]>) => {
    try {
      localStorage.setItem("reactions:v2", JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

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
    // First load
    void load();
  }, [load]);

  const currentReactions = useMemo(() => {
    if (!data?.ok) return null;
    return reactionByStoryId[data.story.id] ?? [];
  }, [data, reactionByStoryId]);

  const toggleReaction = useCallback(
    (emoji: string) => {
      if (!data?.ok) return;
      const id = data.story.id;
      setReactionByStoryId((prev) => {
        const existing = prev[id] ?? [];
        const has = existing.includes(emoji);
        const updated = has ? existing.filter((e) => e !== emoji) : [...existing, emoji];
        const next = { ...prev, [id]: updated };
        if (next[id].length === 0) delete next[id];
        persistReactions(next);
        return next;
      });
    },
    [data, persistReactions]
  );

  return (
    <main className="stories-page relative min-h-[100dvh] w-full space-y-8 overflow-hidden">
      {/* Full-screen background (stories) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100vh] min-h-[100dvh] w-screen"
      >
        <div className="h-full w-full bg-[image:var(--stories-artwork)] bg-cover bg-center bg-no-repeat opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_22%_12%,hsl(0_0%_0%_/0.28)_0%,transparent_66%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(0_0%_0%_/0.30)_100%)] opacity-55" />
      </div>

      {/* Content */}
      <div className="relative z-20 animate-fade-in-up">
      <header className="space-y-3 pt-2 sm:pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel-2)_30%,transparent)] text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_45%,transparent)] backdrop-blur-sm transition active:scale-[0.98] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--color-panel)_36%,transparent)]"
            aria-label="Назад"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ‹
            </span>
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <ThemeToggle className="stories-toggle border-[color:color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-toggle-bg)_30%,transparent)] shadow-none ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_55%,transparent)] backdrop-blur-sm motion-safe:hover:shadow-none motion-safe:hover:-translate-y-0" />
          </div>
        </div>

        {/* Intentionally no headline here (reading mode) */}
      </header>

      <section className="space-y-5 pt-2 sm:pt-3">
        <StoryView data={data} loading={loading} storyKey={storyKey} />

        <div className="stories-reactions flex flex-wrap justify-center gap-2 pt-1">
          {["❤️", "🥹", "😂", "✨"].map((emoji) => {
            const active = Boolean(currentReactions?.includes(emoji));
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(emoji)}
                className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-[0.95rem] shadow-[var(--story-chip-shadow)] ring-1 ring-[color:var(--story-chip-ring)] backdrop-blur-sm transition active:scale-[0.98] ${
                  active
                    ? "scale-[1.02] border-[color:var(--story-chip-border-active)] bg-[color:var(--story-chip-bg-active)] text-[color:var(--story-chip-fg-active)] shadow-[var(--story-chip-shadow-active)] ring-2 ring-[color:var(--story-chip-ring-active)]"
                    : "border-[color:var(--story-chip-border)] bg-[color:var(--story-chip-bg)] text-[color:var(--story-chip-fg)] motion-safe:hover:bg-[color:var(--story-chip-bg-hover)]"
                }`}
                aria-pressed={active}
              >
                <span aria-hidden="true" className={active ? "translate-y-[0.5px]" : ""}>
                  {emoji}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--blob-b)_16%,color-mix(in_oklab,var(--color-panel)_20%,transparent))] px-4 py-3.5 text-sm font-semibold text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--blob-b)_14%,color-mix(in_oklab,var(--color-ring)_28%,transparent))] backdrop-blur-[16px] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:bg-[color:color-mix(in_oklab,var(--blob-b)_20%,color-mix(in_oklab,var(--color-panel)_26%,transparent))]"
          >
            {loading ? "Еще…" : "Еще история"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel)_20%,transparent)] px-4 py-3.5 text-sm font-semibold text-[color:color-mix(in_oklab,var(--color-fg)_88%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_30%,transparent)] backdrop-blur-[16px] transition active:scale-[0.99] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--color-panel)_28%,transparent)]"
          >
            На главную
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}

