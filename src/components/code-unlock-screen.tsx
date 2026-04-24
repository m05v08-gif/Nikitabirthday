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

  const masked = useMemo(() => "*".repeat(value.length), [value.length]);

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
    <main className="gift-screen">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="gift-image"
        src="/intro-code.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="eager"
      />

      <div className="code-input-layer">
        <label className="sr-only" htmlFor="gift-code">
          Код
        </label>

        <div className="relative h-full w-full">
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
            onFocus={() => setError(null)}
            className="h-full w-full rounded-[10px] border border-transparent bg-transparent text-center text-[16px] text-transparent caret-black/40 outline-none"
            aria-invalid={Boolean(error)}
          />

          {/* dots overlay (digits never shown) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(14px,1.9svh,18px)] tracking-[0.42em] text-black/70"
          >
            {masked}
          </div>
        </div>
      </div>

      {error ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 mx-auto w-full max-w-[430px] px-6">
          <div className="mx-auto w-fit rounded-full border border-black/10 bg-white/30 px-4 py-2 text-[0.92rem] leading-[1.35] tracking-[-0.01em] text-black/65 backdrop-blur-md">
            {error}
          </div>
        </div>
      ) : null}
    </main>
  );
}

