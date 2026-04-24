"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CodeUnlockScreenProps = {
  code: string;
  onUnlocked: () => void;
};

export function CodeUnlockScreen({ code, onUnlocked }: CodeUnlockScreenProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const masked = useMemo(() => "•".repeat(value.length), [value.length]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 160);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (value.length !== 3) return;
    if (value === code) {
      onUnlocked();
      return;
    }
    setError("Кажется, это не тот код");
  }, [code, onUnlocked, value]);

  return (
    <main className="intro-root relative h-[100svh] w-full overflow-hidden bg-[color:var(--color-app-bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100vh] min-h-[100svh] w-screen"
      >
        <div className="h-full w-full bg-[image:url('/intro-code.png')] bg-cover bg-center bg-no-repeat opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(110%_88%_at_52%_48%,hsl(0_0%_0%_/0.10)_0%,transparent_62%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(0_0%_0%_/0.22)_100%)] opacity-60" />
      </div>

      <div className="relative z-20 mx-auto flex h-full w-full max-w-[430px] flex-col justify-end px-6 pb-[calc(32px_+_env(safe-area-inset-bottom))] pt-10">
        <div className="intro-card rounded-[22px] border border-black/10 bg-white/42 p-5 backdrop-blur-xl">
          <div className="font-display text-[1.22rem] font-semibold leading-[1.1] tracking-[-0.02em] text-black/82">
            С днём рождения, Chouchou!
          </div>
          <div className="mt-2 text-[0.98rem] leading-[1.45] tracking-[-0.01em] text-black/72">
            Чтобы открыть подарок, введи код.
          </div>
          <div className="mt-2 text-[0.92rem] leading-[1.45] tracking-[-0.01em] text-black/58">
            Подсказка: код на жёлтом чемодане
          </div>

          <div className="mt-4">
            <label className="sr-only" htmlFor="gift-code">
              Код
            </label>
            <div className="relative">
              <input
                id="gift-code"
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                autoComplete="one-time-code"
                value={value}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, "").slice(0, 3);
                  setValue(next);
                  setError(null);
                }}
                className="w-full rounded-[18px] border border-black/10 bg-white/55 px-4 py-3 text-center text-[1.1rem] tracking-[0.28em] text-transparent caret-black/40 shadow-[0_10px_26px_rgba(0,0,0,0.06)] outline-none ring-1 ring-black/5 backdrop-blur-md focus:border-black/15 focus:bg-white/70 focus:ring-black/10"
                aria-invalid={Boolean(error)}
              />

              {/* custom dots overlay (so digits never show) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-[1.25rem] tracking-[0.55em] text-black/70"
              >
                {masked}
              </div>
            </div>

            {error ? (
              <div className="mt-3 rounded-[14px] border border-black/10 bg-white/40 px-3 py-2 text-[0.92rem] leading-[1.35] tracking-[-0.01em] text-black/62">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

