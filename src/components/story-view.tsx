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
}: {
  data: RandomStoryResult | null;
  loading: boolean;
  storyKey: string;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [storyKey]);

  if (data === null) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[color:var(--story-frame-border)] bg-[color:var(--story-frame-bg)] shadow-[var(--story-frame-shadow)] ring-1 ring-[color:var(--story-frame-ring)] backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-[image:var(--story-frame-glow)] opacity-80" />

        <div className="relative p-4 sm:p-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.15rem] bg-[color:var(--story-image-bg)] ring-1 ring-[color:var(--story-image-ring)]">
            <div className="animate-pulse-soft absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--blob-b),transparent_62%)] opacity-55" />
            <div className="absolute inset-x-6 bottom-6 space-y-2">
              <div className="h-2.5 w-4/5 rounded-full bg-black/10 dark:bg-white/10" />
              <div className="h-2.5 w-2/3 rounded-full bg-black/8 dark:bg-white/8" />
            </div>
          </div>

          <div className="mt-4 space-y-2 px-1 pb-1">
            <div className="h-2.5 w-5/6 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="h-2.5 w-full rounded-full bg-black/8 dark:bg-white/8" />
            <div className="h-2.5 w-2/3 rounded-full bg-black/7 dark:bg-white/7" />
          </div>
        </div>
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
      className={`transition duration-300 ${loading ? "opacity-60 blur-[0.2px]" : "opacity-100 blur-0"}`}
    >
      <div
        className={`relative overflow-hidden rounded-[1.55rem] border border-[color:var(--story-frame-border)] bg-[color:var(--story-frame-bg)] shadow-[var(--story-frame-shadow)] ring-1 ring-[color:var(--story-frame-ring)] backdrop-blur-md transition duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
          entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[image:var(--story-frame-glow)] opacity-85" />

        <div className="relative p-4 sm:p-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.2rem] bg-[color:var(--story-image-bg)] ring-1 ring-[color:var(--story-image-ring)] shadow-[var(--story-image-shadow)]">
            <Image
              src={data.story.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover object-[center_35%]"
              priority
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[image:var(--story-image-wash)]" />
          </div>

          <div className="mt-4 px-1 pb-1">
            <div className="pointer-events-none mb-3 h-px bg-[image:var(--story-caption-divider)] opacity-70" />
            <div className="whitespace-pre-wrap text-[0.98rem] leading-relaxed text-[color:var(--story-caption-fg)]">
              {data.story.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
