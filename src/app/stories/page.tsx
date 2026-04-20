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
    <main className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm text-zinc-400">Истории</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Расскажи историю
        </h1>
      </header>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        {data === null || loading ? (
          <div className="text-sm text-zinc-300">Загружаю…</div>
        ) : !data.ok ? (
          <div className="space-y-2">
            <div className="text-sm text-zinc-300">
              Пока не получилось загрузить историю.
            </div>
            <pre className="whitespace-pre-wrap text-xs text-zinc-500">
              {data.error}
            </pre>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <Image
                src={data.story.imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
                priority
              />
            </div>
            <div className="whitespace-pre-wrap text-zinc-100">
              {data.story.text}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950"
        >
          {loading ? "Еще одну…" : "Еще одну историю"}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm font-semibold text-zinc-100"
        >
          Домой
        </Link>
      </div>
    </main>
  );
}

