"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { parseNumberedIdeas } from "@/lib/parse-numbered-ideas";

type City = "astana" | "tashkent";
type CompanyType = "with_children" | "with_masha" | "with_friends" | "alone";
type Duration = "1_2_hours" | "2_3_hours";
type Budget = "econom" | "medium" | "premium";
type Mood = "fun" | "calm" | "beautiful" | "legendary" | "surprise";

export default function IdeasPage() {
  const [city, setCity] = useState<City>("astana");
  const [companyType, setCompanyType] = useState<CompanyType>("with_friends");
  const [duration, setDuration] = useState<Duration>("1_2_hours");
  const [budget, setBudget] = useState<Budget>("medium");
  const [mood, setMood] = useState<Mood>("beautiful");

  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => !loading, [loading]);

  const ideaItems = useMemo(() => {
    if (!text) return null;
    return parseNumberedIdeas(text);
  }, [text]);

  const ideaCards = useMemo(() => {
    if (!ideaItems) return null;
    if (ideaItems.length < 3) return null;
    return ideaItems.slice(0, 3);
  }, [ideaItems]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city, companyType, duration, budget, mood })
      });
      const json = (await res.json()) as { ok: boolean; text?: string; error?: string };
      if (!json.ok) {
        setText(null);
        setError(json.error ?? "Не получилось сгенерировать.");
        return;
      }
      setText(json.text ?? "");
    } catch (e) {
      setText(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [budget, city, companyType, duration, mood]);

  const chipBase =
    "ideas-chip relative inline-flex w-full items-center justify-center overflow-hidden min-h-[var(--ideas-chip-h)] rounded-[var(--radius-chip)] border px-4 text-center text-[1rem] font-semibold leading-[1.15] tracking-[-0.01em] transition-[background-color,border-color,box-shadow,transform,color] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]";
  const chipInactive = `${chipBase} border-[color:var(--ideas-border-chip)] bg-[color:var(--ideas-surface-chip)] text-[color:var(--ideas-chip-fg)] shadow-[var(--shadow-chip)]`;
  const chipActive = `${chipBase} border-[color:var(--ideas-border-selected)] bg-[color:var(--ideas-surface-selected)] text-[color:var(--ideas-text-primary)] shadow-[var(--ideas-chip-selected-shadow)]`;

  return (
    <main className="ideas-page relative min-h-[100dvh] w-full overflow-hidden">
      {/* Full-screen background (ideas) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100vh] min-h-[100dvh] w-screen"
      >
        <div className="h-full w-full bg-[image:var(--ideas-artwork)] bg-cover bg-center bg-no-repeat opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_22%_12%,hsl(0_0%_0%_/0.22)_0%,transparent_66%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(0_0%_0%_/0.26)_100%)] opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-20 animate-fade-in-up">
        <div className="mx-auto max-w-[430px] px-[var(--ideas-pad-x)] pb-[calc(32px_+_env(safe-area-inset-bottom))] pt-6">
          <header className="ideas-hero">
            <div className="flex items-center justify-between gap-3">
              <div />
              <ThemeToggle className="ideas-toggle border border-[color:var(--ideas-border-chip)] bg-[color:var(--ideas-badge-bg)] shadow-[var(--shadow-card)] ring-0 backdrop-blur-[var(--blur-surface)] motion-safe:hover:-translate-y-0 motion-safe:hover:shadow-[var(--shadow-card)]" />
            </div>

            <h1 className="ideas-title mt-[18px] max-w-[320px] font-[600] leading-[0.94] tracking-[-0.02em] text-[color:var(--ideas-text-primary)]">
              <span className="block">Как</span>
              <span className="block italic">отпраздновать</span>
              <span className="block">день</span>
              <span className="block">рождения</span>
            </h1>
            <p className="ideas-subtitle mt-3 max-w-[320px] text-[0.98rem] leading-[1.45] tracking-[-0.01em] text-[color:var(--ideas-text-secondary)]">
              Подберу 3 идеи по городу, бюджету, времени и настроению.
            </p>
          </header>

          <section className="mt-7">
          <div className="grid gap-2">
            <div className="ideas-section-label mb-[10px] text-[15px] font-medium leading-5 tracking-[-0.01em] text-[color:var(--ideas-text-muted)]">
              Город
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCity("astana")}
                className={city === "astana" ? chipActive : chipInactive}
              >
                Астана
              </button>
              <button
                type="button"
                onClick={() => setCity("tashkent")}
                className={city === "tashkent" ? chipActive : chipInactive}
              >
                Ташкент
              </button>
            </div>
          </div>

          <div className="mt-[18px] grid gap-2">
            <div className="ideas-section-label mb-[10px] text-[15px] font-medium leading-5 tracking-[-0.01em] text-[color:var(--ideas-text-muted)]">
              С кем
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompanyType("with_children")}
                className={companyType === "with_children" ? chipActive : chipInactive}
              >
                С детьми
              </button>
              <button
                type="button"
                onClick={() => setCompanyType("with_masha")}
                className={companyType === "with_masha" ? chipActive : chipInactive}
              >
                Вдвоем с Машей
              </button>
              <button
                type="button"
                onClick={() => setCompanyType("with_friends")}
                className={companyType === "with_friends" ? chipActive : chipInactive}
              >
                С друзьями
              </button>
              <button
                type="button"
                onClick={() => setCompanyType("alone")}
                className={companyType === "alone" ? chipActive : chipInactive}
              >
                Один
              </button>
            </div>
          </div>

          <div className="mt-[18px] grid gap-2">
            <div className="ideas-section-label mb-[10px] text-[15px] font-medium leading-5 tracking-[-0.01em] text-[color:var(--ideas-text-muted)]">
              Сколько времени
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDuration("1_2_hours")}
                className={duration === "1_2_hours" ? chipActive : chipInactive}
              >
                1–2 часа
              </button>
              <button
                type="button"
                onClick={() => setDuration("2_3_hours")}
                className={duration === "2_3_hours" ? chipActive : chipInactive}
              >
                2–3 часа
              </button>
            </div>
          </div>

          <div className="mt-[18px] grid gap-2">
            <div className="ideas-section-label mb-[10px] text-[15px] font-medium leading-5 tracking-[-0.01em] text-[color:var(--ideas-text-muted)]">
              Бюджет
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setBudget("econom")}
                className={`${budget === "econom" ? chipActive : chipInactive} min-h-[76px] px-3`}
              >
                Экономно
              </button>
              <button
                type="button"
                onClick={() => setBudget("medium")}
                className={`${budget === "medium" ? chipActive : chipInactive} min-h-[76px] px-3`}
              >
                Средне
              </button>
              <button
                type="button"
                onClick={() => setBudget("premium")}
                className={`${budget === "premium" ? chipActive : chipInactive} min-h-[76px] px-3`}
              >
                Можно красиво
              </button>
            </div>
          </div>

          <div className="mt-[18px] grid gap-2">
            <div className="ideas-section-label mb-[10px] text-[15px] font-medium leading-5 tracking-[-0.01em] text-[color:var(--ideas-text-muted)]">
              Настроение
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMood("fun")}
                className={mood === "fun" ? chipActive : chipInactive}
              >
                Весело
              </button>
              <button
                type="button"
                onClick={() => setMood("calm")}
                className={mood === "calm" ? chipActive : chipInactive}
              >
                Спокойно
              </button>
              <button
                type="button"
                onClick={() => setMood("beautiful")}
                className={mood === "beautiful" ? chipActive : chipInactive}
              >
                Красиво
              </button>
              <button
                type="button"
                onClick={() => setMood("legendary")}
                className={mood === "legendary" ? chipActive : chipInactive}
              >
                Легендарно
              </button>
              <button
                type="button"
                onClick={() => setMood("surprise")}
                className={`${mood === "surprise" ? chipActive : chipInactive} col-span-2`}
              >
                Удиви меня
              </button>
            </div>
          </div>
          </section>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={generate}
            className="ideas-cta mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-cta)] border border-[color:var(--ideas-cta-border)] bg-[image:var(--ideas-cta-bg)] px-5 text-[18px] font-bold leading-6 tracking-[-0.01em] text-[color:var(--ideas-cta-fg)] shadow-[var(--shadow-cta)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ height: "var(--ideas-cta-h)" }}
          >
            <span aria-hidden="true" className="text-[16px] opacity-80">
              ✦
            </span>
            {loading ? "Подбираю…" : "Подобрать 3 идеи"}
          </button>

          {!text && !error ? (
            <div className="ideas-helper mt-5 flex w-full items-start gap-[14px] rounded-[var(--radius-cta)] border border-[color:var(--ideas-border-main)] bg-[color:var(--ideas-helper-bg)] p-[18px] shadow-[var(--ideas-shadow-helper)] backdrop-blur-[var(--blur-surface)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--ideas-helper-icon-bg)]">
                <span aria-hidden="true" className="opacity-80">
                  ✦
                </span>
              </div>
              <div className="text-[16px] leading-[1.5] tracking-[-0.01em] text-[color:var(--ideas-text-secondary)]">
                Появятся 3 идеи с атмосферой, примерным бюджетом и понятным планом.
              </div>
            </div>
          ) : (
            <div className="ideas-results mt-5 w-full rounded-[28px] border border-[color:var(--ideas-results-border)] bg-[color:var(--ideas-results-bg)] p-[14px] shadow-[var(--ideas-shadow-results)] backdrop-blur-[var(--blur-surface)]">
              {error ? (
                <pre className="whitespace-pre-wrap text-[16px] leading-[1.5] tracking-[-0.01em] text-[color:var(--ideas-text-secondary)]">
                  {error}
                </pre>
              ) : text ? (
                ideaCards ? (
                  <div className="flex flex-col gap-[14px]">
                    {ideaCards.map((idea, idx) => (
                      <div
                        key={`${idx}-${idea.slice(0, 12)}`}
                        className="ideas-result-card relative overflow-hidden grid grid-cols-[34px_1fr] items-start gap-x-[14px] rounded-[var(--radius-result-card)] border border-[color:var(--ideas-result-border)] bg-[color:var(--ideas-result-bg)] p-[18px] shadow-[var(--ideas-shadow-result)]"
                      >
                        <div className="ideas-result-num pt-[2px] leading-none text-[28px] text-[color:var(--ideas-text-primary)]">
                          {idx + 1}
                        </div>
                        <div className="text-[16px] leading-[1.62] tracking-[-0.01em] text-[color:var(--ideas-result-fg)]">
                          {idea}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-[16px] leading-[1.62] tracking-[-0.01em] text-[color:var(--ideas-result-fg)]">
                    {text}
                  </pre>
                )
              ) : null}
            </div>
          )}

          <Link
            href="/"
            className="ideas-bottom mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius-bottom-button)] border border-[color:var(--ideas-border-main)] bg-[color:var(--ideas-bottom-bg)] text-[18px] font-bold leading-6 tracking-[-0.01em] text-[color:var(--ideas-text-primary)] shadow-[var(--ideas-shadow-bottom)] backdrop-blur-[var(--blur-surface)] transition active:scale-[0.99]"
            style={{ height: "64px" }}
          >
            Домой
          </Link>
        </div>
      </div>
    </main>
  );
}
