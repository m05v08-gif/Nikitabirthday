"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type RandomStoryResult =
  | { ok: true; story: { id: string; text: string; imageUrl: string } }
  | { ok: false; error: string };

export function StoryView({
  data,
  loading,
  storyKey,
  tag
}: {
  data: RandomStoryResult | null;
  loading: boolean;
  storyKey: string;
  tag?: string | null;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [storyKey]);

  if (data === null) {
    return (
      <div className="space-y-5">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] bg-[color:var(--color-panel-2)] ring-1 ring-[color:var(--color-ring)]">
          <div className="animate-pulse-soft absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--blob-a),transparent_60%)] opacity-70" />
          <div className="absolute inset-x-8 top-8 h-3 rounded-full bg-[color:var(--color-fg)] opacity-10" />
          <div className="absolute inset-x-8 top-14 h-3 w-2/3 rounded-full bg-[color:var(--color-fg)] opacity-8" />
          <div className="absolute bottom-6 left-6 right-6 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-muted-2)]">
            …
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-4/5 rounded-full bg-[color:var(--color-fg)] opacity-10" />
          <div className="h-3 w-full rounded-full bg-[color:var(--color-fg)] opacity-8" />
          <div className="h-3 w-2/3 rounded-full bg-[color:var(--color-fg)] opacity-7" />
        </div>
        <div className="text-sm text-[color:var(--color-muted)]">Загружаю…</div>
      </div>
    );
  }

  if (!data.ok) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-[color:var(--color-muted)]">
          Пока не получилось загрузить историю.
        </div>
        <pre className="whitespace-pre-wrap rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] p-3 text-xs leading-relaxed text-[color:var(--color-muted-2)]">
          {data.error}
        </pre>
      </div>
    );
  }

  return (
    <div
      className={`space-y-5 transition duration-300 ${
        loading ? "opacity-55 blur-[0.3px]" : "opacity-100 blur-0"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-[1.35rem] ring-1 ring-[color:var(--color-ring)] transition duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
          entered ? "translate-y-0 scale-[1] opacity-100" : "translate-y-2 scale-[0.992] opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--blob-b),transparent_62%)] opacity-80 blur-2xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_40%_40%,var(--blob-a),transparent_62%)] opacity-70 blur-2xl" />

        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--color-panel-2)]">
          <Image
            src={data.story.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {tag ? (
            <div className="absolute left-4 top-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[0.72rem] font-semibold tracking-wide text-white shadow-[var(--shadow-card)] backdrop-blur-md">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/70" />
                {tag}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-5 shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl transition duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
          entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent" />
        <div className="whitespace-pre-wrap text-[1.02rem] leading-relaxed text-[color:var(--color-fg)]">
          {data.story.text}
        </div>
      </div>
    </div>
  );
}
