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
    <main className="animate-fade-in-up space-y-8">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] motion-safe:hover:bg-[color:var(--color-panel)]"
            aria-label="Назад"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ‹
            </span>
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-muted-2)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--blob-a),var(--blob-c))]"
              />
              Истории
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Intentionally no headline here (reading mode) */}
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -left-6 top-6 h-24 w-24 rotate-12 rounded-3xl border border-[color:var(--color-stroke)] opacity-40" />
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent" />
          <StoryView data={data} loading={loading} storyKey={storyKey} />
        </div>
      </section>

      {/* Reactions */}
      <section className="space-y-3">
        <div className="flex flex-wrap justify-center gap-2">
          {["❤️", "🔥", "😂", "😮", "🥹"].map((emoji) => {
            const active = Boolean(currentReactions?.includes(emoji));
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(emoji)}
                className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.96] ${
                  active
                    ? "scale-[1.04] border-[color-mix(in_oklab,var(--blob-b)_78%,var(--blob-a)_48%)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--blob-b)_36%,var(--color-panel)),color-mix(in_oklab,var(--blob-a)_30%,var(--color-panel)))] text-[color:var(--color-fg)] ring-2 ring-[color-mix(in_oklab,var(--blob-b)_70%,white)] outline outline-2 outline-[color-mix(in_oklab,var(--blob-a)_55%,white)] outline-offset-2 shadow-[var(--shadow-soft)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg)] motion-safe:hover:bg-[color:var(--color-panel)]"
                }`}
                aria-pressed={active}
              >
                <span aria-hidden="true" className={`leading-none ${active ? "scale-[1.06]" : ""}`}>
                  {emoji}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--blob-a)_35%,white),color-mix(in_oklab,var(--blob-b)_35%,white))] px-4 py-3.5 text-sm font-semibold text-[color:var(--color-primary-ink)] shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5"
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

