"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

type Vote = "like" | "dislike";

type StyleCard = {
  id: string;
  title: string | null;
  imageUrl: string;
  contentType: "full_look" | "detail" | "accessory" | "single_item";
  styleFamilies: string[];
  occasionTags: string[];
  clothingTags: string[];
  accessoryTags: string[];
  colorTags: string[];
  seasonTags: string[];
  fitTags: string[];
  vibeTags: string[];
  formalityLevel: number | null;
  notes: string | null;
  sourcePageUrl: string | null;
  attribution: { photographerName?: string | null; sourceType?: string | null } | null;
};

type NextResponse =
  | { ok: true; card: StyleCard }
  | { ok: true; empty: true }
  | { ok: false; error: string };

type LikedResponse =
  | { ok: true; cards: Array<Pick<StyleCard, "id" | "imageUrl" | "contentType">> }
  | { ok: false; error: string };

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem("stylist:session:v1");
    if (existing && existing.length > 8) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem("stylist:session:v1", id);
    return id;
  } catch {
    return "anonymous";
  }
}

export default function StylistPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("anonymous");
  const [card, setCard] = useState<StyleCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<Array<Pick<StyleCard, "id" | "imageUrl" | "contentType">>>([]);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const canSwipe = useMemo(() => Boolean(card) && !loading, [card, loading]);

  const loadNext = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/style/next?sessionId=${encodeURIComponent(sessionId)}`, {
        cache: "no-store"
      });
      const json = (await res.json()) as NextResponse;
      if (!json.ok) {
        setCard(null);
        setError(json.error ?? "Не получилось загрузить карточку.");
        return;
      }
      if ("empty" in json && json.empty) {
        setCard(null);
        return;
      }
      if ("card" in json) {
        setCard(json.card);
        return;
      }
      setCard(null);
      setError("Не получилось загрузить карточку.");
      return;
    } catch (e) {
      setCard(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const refreshLiked = async () => {
    try {
      const res = await fetch(`/api/style/liked?sessionId=${encodeURIComponent(sessionId)}`, {
        cache: "no-store"
      });
      const json = (await res.json()) as LikedResponse;
      if (!json.ok) return;
      setLiked(json.cards);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!sessionId || sessionId === "anonymous") return;
    void loadNext();
    void refreshLiked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const vote = async (v: Vote) => {
    if (!card) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/style/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, imageId: card.id, vote: v })
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(json.error ?? "Не получилось сохранить.");
        setLoading(false);
        return;
      }
      await refreshLiked();
      await loadNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]">
        <div className="h-full w-full bg-[radial-gradient(110%_80%_at_20%_18%,color-mix(in_oklab,var(--blob-b)_12%,transparent),transparent_64%),radial-gradient(110%_80%_at_78%_22%,color-mix(in_oklab,var(--blob-a)_10%,transparent),transparent_66%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(0_0%_0%_/0.22)_100%)] opacity-45" />
      </div>

      <div className="relative z-20 mx-auto max-w-[430px] px-4 pb-[calc(28px_+_env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel-2)_30%,transparent)] text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_45%,transparent)] backdrop-blur-sm transition active:scale-[0.98]"
            aria-label="Назад"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ‹
            </span>
          </button>

          <ThemeToggle className="border-[color:color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-toggle-bg)_30%,transparent)] shadow-none ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_55%,transparent)] backdrop-blur-sm motion-safe:hover:shadow-none motion-safe:hover:-translate-y-0" />
        </header>

        <div className="mt-5 space-y-2">
          <h1 className="text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-fg)]">
            Стилист
          </h1>
          <p className="text-[0.98rem] leading-relaxed text-[color:var(--color-muted)]">
            Свайпай вправо — нравится. Влево — не твоё. Ниже соберётся подборка.
          </p>
        </div>

        <section className="mt-5 space-y-3">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-[color:color-mix(in_oklab,var(--color-border)_50%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel)_22%,transparent)] shadow-[var(--shadow-card)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_34%,transparent)] backdrop-blur-[18px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_oklab,var(--blob-b)_16%,transparent),transparent_62%)] opacity-60" />

            <div className="relative p-3.5">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.25rem] bg-black/5 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
                {card ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageUrl}
                    alt={card.title ?? ""}
                    className={`h-full w-full object-cover transition ${loading ? "opacity-70" : "opacity-100"}`}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-sm text-[color:var(--color-muted)]">
                    {error ? "Ошибка" : "Пусто"}
                  </div>
                )}
              </div>

              {error ? (
                <div className="mt-3 rounded-[1.1rem] border border-[color:color-mix(in_oklab,var(--color-border)_50%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel-2)_30%,transparent)] p-3 text-sm text-[color:var(--color-muted)]">
                  {error}
                </div>
              ) : null}

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  disabled={!canSwipe}
                  onClick={() => void vote("dislike")}
                  className="inline-flex flex-1 items-center justify-center rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel)_22%,transparent)] px-4 py-3.5 text-sm font-semibold text-[color:color-mix(in_oklab,var(--color-fg)_88%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_30%,transparent)] backdrop-blur-[16px] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Не моё
                </button>
                <button
                  type="button"
                  disabled={!canSwipe}
                  onClick={() => void vote("like")}
                  className="inline-flex flex-1 items-center justify-center rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--blob-b)_16%,color-mix(in_oklab,var(--color-panel)_20%,transparent))] px-4 py-3.5 text-sm font-semibold text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--blob-b)_14%,color-mix(in_oklab,var(--color-ring)_28%,transparent))] backdrop-blur-[16px] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Нравится
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-[color:var(--color-muted)]">Понравилось: {liked.length}</div>
            <Link
              href="/"
              className="text-sm font-semibold text-[color:color-mix(in_oklab,var(--color-fg)_90%,transparent)] underline decoration-[color:color-mix(in_oklab,var(--color-ring)_40%,transparent)] underline-offset-4"
            >
              На главную
            </Link>
          </div>

          {liked.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {liked.slice(0, 12).map((x) => (
                <div
                  key={x.id}
                  className="relative aspect-[1/1] overflow-hidden rounded-[1rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel)_18%,transparent)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={x.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel)_18%,transparent)] p-3 text-sm text-[color:var(--color-muted)]">
              Пока пусто. Свайпни пару карточек вправо.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

