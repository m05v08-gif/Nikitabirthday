"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { YakutWordQuest } from "@/components/yakut-word-quest";

export default function YakutQuestPage() {
  return (
    <main className="yakut-quest-page relative min-h-[100dvh] w-full overflow-hidden">
      {/* Background: align with Stories/Ideas fixed full-screen treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100vh] min-h-[100dvh] w-screen"
      >
        <div className="h-full w-full bg-[image:var(--home-artwork)] bg-cover bg-center bg-no-repeat opacity-100 [filter:brightness(var(--home-bg-brightness))]" />
        <div className="absolute left-0 top-0 h-[46dvh] w-full bg-[image:var(--home-top-scrim)] opacity-[var(--home-top-scrim-opacity)]" />
        <div className="absolute bottom-0 left-0 h-[34dvh] w-full bg-[image:var(--home-bottom-scrim)] opacity-[var(--home-bottom-scrim-opacity)]" />
      </div>

      <div className="relative z-20 animate-fade-in-up">
        <div className="mx-auto max-w-[430px] px-4 pb-[calc(28px_+_env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
          {/* Top panel */}
          <header className="pt-2 sm:pt-3">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--color-border)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel-2)_30%,transparent)] text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_45%,transparent)] backdrop-blur-sm transition active:scale-[0.98] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--color-panel)_36%,transparent)]"
                aria-label="Назад"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ‹
                </span>
              </Link>

              <ThemeToggle className="yakut-toggle border-[color:color-mix(in_oklab,var(--color-border)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--color-toggle-bg)_28%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_34%,transparent)] backdrop-blur-[18px] motion-safe:hover:translate-y-0 motion-safe:hover:shadow-[var(--shadow-card)]" />
            </div>
          </header>

          {/* Hero */}
          <div className="mt-6">
            <h1 className="yakut-title text-balance-safe text-[2.05rem] leading-[1.06] sm:text-[2.25rem]">
              <span className="block">Угадай</span>
              <span className="block italic">якутское</span>
              <span className="block">слово</span>
            </h1>
            <p className="home-hero-sub mt-3 text-pretty text-[0.98rem] leading-relaxed text-[color:var(--home-hero-sub)]">
              Пока просто угадывай. Понимание придёт позже
            </p>
          </div>

          {/* Quest */}
          <div className="mt-6">
            <YakutWordQuest />
          </div>

          {/* Back to home */}
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-panel-2)_40%,transparent)] px-4 py-3.5 text-[0.98rem] font-semibold tracking-[-0.01em] text-[color:color-mix(in_oklab,var(--color-fg)_88%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_26%,transparent)] backdrop-blur-[16px] transition active:scale-[0.99] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--color-panel)_40%,transparent)]"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

