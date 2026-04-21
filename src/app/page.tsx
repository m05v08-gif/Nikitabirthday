import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";

const playfairHome = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800"],
  style: ["normal", "italic"],
  variable: "--font-home-display",
  display: "swap"
});

function Tile({
  title,
  subtitle,
  href,
  variant
}: {
  title: string;
  subtitle: string;
  href: string;
  variant: "stories" | "ideas";
}) {
  const panel =
    variant === "stories"
      ? "bg-[color:color-mix(in_oklab,var(--color-panel)_32%,transparent)]"
      : "bg-[color:color-mix(in_oklab,var(--color-panel)_28%,transparent)]";
  const glow =
    variant === "stories"
      ? "bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--blob-b)_16%,transparent),transparent_58%),radial-gradient(circle_at_80%_70%,color-mix(in_oklab,var(--blob-a)_14%,transparent),transparent_62%)]"
      : "bg-[radial-gradient(circle_at_20%_30%,color-mix(in_oklab,var(--blob-a)_14%,transparent),transparent_60%),radial-gradient(circle_at_75%_25%,color-mix(in_oklab,var(--blob-c)_12%,transparent),transparent_62%)]";

  return (
    <Link
      href={href}
      className={`home-tile group relative block overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--color-border)_50%,transparent)] ${panel} p-[1.05rem] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_38%,transparent)] backdrop-blur-[11px] transition active:scale-[0.99] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--color-panel)_42%,transparent)]`}
    >
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${glow} opacity-55`} />

      <div className="relative space-y-1.5">
        <div className="home-card-title text-[1.2rem] leading-[1.08] sm:text-[1.22rem]">{title}</div>
        <div className="home-card-body text-sm leading-relaxed">{subtitle}</div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className={`${playfairHome.variable} home-page relative w-full min-h-[100dvh] overflow-hidden`}>
      {/* Full-screen background (home only) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[image:var(--home-artwork)] bg-cover bg-center bg-no-repeat opacity-[0.92] [filter:saturate(0.94)_contrast(0.94)]" />
        <div className="absolute inset-0 bg-[color:var(--home-art-overlay)]" />
      </div>

      {/* Content layer */}
      <div className="relative mx-auto w-full max-w-md px-0 pb-10 pt-4 sm:pb-12 sm:pt-6">
        <header className="relative space-y-5">
          <div className="space-y-3">
            <h1 className="home-hero-title text-balance-safe text-[2.35rem] leading-[1.02] sm:text-[2.58rem]">
              Наш <span className="home-hero-accent">маленький</span> мир
            </h1>
            <p className="home-hero-sub text-pretty text-[1.02rem] leading-relaxed">
              Уютный уголок — мир, который мы создаём сами.
            </p>
          </div>

          <div className="flex items-center">
            <ThemeToggle className="home-hero-toggle border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-toggle-bg)_48%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_48%,transparent)] backdrop-blur-[14px]" />
          </div>
        </header>

        <section className="mt-8 grid gap-3">
          <Tile
            variant="stories"
            title="Воспоминания"
            subtitle="Нажми — и появится случайная история"
            href="/stories"
          />
          <Tile
            variant="ideas"
            title="Вдохновения"
            subtitle="Разные идеи на вечер"
            href="/ideas"
          />
        </section>

        <p className="home-helper mt-8 text-[0.68rem] leading-relaxed opacity-90">
          Совет: добавь страницу на экран iPhone (Поделиться → На экран «Домой»).
        </p>
      </div>
    </main>
  );
}
