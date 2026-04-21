"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StoryView } from "@/components/story-view";

type RandomStoryResult =
  | { ok: true; story: { id: string; text: string; imageUrl: string } }
  | { ok: false; error: string };

type StoryTag = "смешное" | "милое" | "легендарное";
type Vibe = "any" | StoryTag;

function normalizeText(s: string) {
  return s.toLowerCase();
}

function extractTagFromHashtag(text: string): { tag: StoryTag | null; cleanText: string } {
  const re = /(^|\s)#(смешное|милое|мило|легендарное)\b/giu;
  let tag: StoryTag | null = null;
  let clean = text;

  clean = clean.replace(re, (_, p1: string, raw: string) => {
    const normalized = raw.toLowerCase();
    if (!tag) {
      if (normalized === "мило" || normalized === "милое") tag = "милое";
      else if (normalized === "смешное") tag = "смешное";
      else if (normalized === "легендарное") tag = "легендарное";
    }
    return p1;
  });

  // normalize whitespace after removals
  clean = clean.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return { tag, cleanText: clean };
}

function autoTagByText(text: string): StoryTag {
  const t = normalizeText(text);

  const score = (markers: string[]) =>
    markers.reduce((acc, m) => (t.includes(m) ? acc + 1 : acc), 0);

  const funny = score(["ахаха", "аха", "лол", "смешн", "ржу", "😂", "🤣", "угар", "шутк"]);
  const cute = score(["мил", "люблю", "❤️", "🥹", "обним", "целую", "кот", "кошк", "сладк"]);
  const legend = score(["легенд", "эпик", "эпично", "велич", "историч", "🔥", "навсегда"]);

  const max = Math.max(funny, cute, legend);
  if (max === 0) return "милое"; // gentle default
  if (max === funny) return "смешное";
  if (max === legend) return "легендарное";
  return "милое";
}

function deriveTagAndCleanText(text: string): { tag: StoryTag; cleanText: string; source: "hashtag" | "auto" } {
  const fromHash = extractTagFromHashtag(text);
  if (fromHash.tag) return { tag: fromHash.tag, cleanText: fromHash.cleanText, source: "hashtag" };
  return { tag: autoTagByText(text), cleanText: text.trim(), source: "auto" };
}

export default function StoriesPage() {
  const router = useRouter();

  const [data, setData] = useState<RandomStoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [vibe, setVibe] = useState<Vibe>("any");
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

  const load = useCallback(async (targetVibe?: Vibe) => {
    setLoading(true);
    try {
      const desired = targetVibe ?? vibe;
      const attempts = desired === "any" ? 1 : 6;
      let chosen: RandomStoryResult | null = null;

      for (let i = 0; i < attempts; i += 1) {
        const res = await fetch("/api/story/random", { cache: "no-store" });
        const json = (await res.json()) as RandomStoryResult;
        chosen = json;

        if (!json.ok) break;
        if (desired === "any") break;

        const derived = deriveTagAndCleanText(json.story.text);
        if (derived.tag === desired) break;
      }

      setData(chosen);
    } catch (e) {
      setData({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  }, [vibe]);

  useEffect(() => {
    // First load
    void load();
  }, [load]);

  const derived = useMemo(() => {
    if (!data?.ok) return null;
    return deriveTagAndCleanText(data.story.text);
  }, [data]);

  const viewData = useMemo(() => {
    if (!data?.ok) return data;
    if (!derived) return data;
    return {
      ok: true,
      story: {
        ...data.story,
        text: derived.cleanText
      }
    } as const;
  }, [data, derived]);

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
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent" />
          <StoryView
            data={viewData}
            loading={loading}
            storyKey={storyKey}
            tag={derived?.tag ?? null}
          />
        </div>
      </section>

      {/* Reactions */}
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {["❤️", "🔥", "😂", "😮", "🥹"].map((emoji) => {
            const active = Boolean(currentReactions?.includes(emoji));
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(emoji)}
                className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.96] ${
                  active
                    ? "border-[color-mix(in_oklab,var(--blob-b)_85%,var(--blob-a)_65%)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--blob-b)_40%,black),color-mix(in_oklab,var(--blob-a)_30%,black))] text-white ring-2 ring-[color-mix(in_oklab,var(--blob-b)_55%,white)] shadow-[var(--shadow-soft)]"
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

      {/* Vibe chips (under main buttons) */}
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "any" as const, label: "Случайный вайб" },
            { id: "смешное" as const, label: "Давай что-то смешное" },
            { id: "милое" as const, label: "Давай что-то милое" },
            { id: "легендарное" as const, label: "Давай что-то легендарное" }
          ].map((opt) => {
            const active = vibe === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setVibe(opt.id);
                  void load(opt.id);
                }}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-[0.82rem] font-semibold shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md transition active:scale-[0.98] ${
                  active
                    ? "border-[color-mix(in_oklab,var(--blob-a)_60%,var(--blob-b)_50%)] bg-[color-mix(in_oklab,var(--blob-a)_28%,var(--color-panel))] text-[color:var(--color-fg)] ring-2 ring-[color-mix(in_oklab,var(--blob-a)_45%,white)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg)] motion-safe:hover:bg-[color:var(--color-panel)]"
                }`}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs leading-relaxed text-[color:var(--color-muted-2)]">
          Режим:{" "}
          <span className="font-semibold text-[color:var(--color-fg)]">
            {vibe === "any" ? "случайный" : vibe}
          </span>
          {derived?.source === "hashtag" ? (
            <>
              {" "}
              ·{" "}
              <span className="text-[color:var(--color-muted)]">тег из хештега</span>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}

