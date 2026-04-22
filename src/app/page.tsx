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
    <main className={`${playfairHome.variable} home-page relative min-h-[100dvh] w-full`}>
      {/* Full-screen background: viewport-fixed so it is not clipped by layout max-w-md / padding */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100dvh] min-h-[100dvh] w-full"
      >
        <div className="h-full w-full bg-[image:var(--home-artwork)] bg-cover bg-center bg-no-repeat opacity-[0.92] [filter:saturate(0.94)_contrast(0.94)]" />
        <div className="absolute inset-0 bg-[color:var(--home-art-overlay)]" />
      </div>

      {/* Theme toggle — fixed top-right over the artwork */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <div className="pointer-events-auto">
          <ThemeToggle className="home-hero-toggle border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] bg-[color:color-mix(in_oklab,var(--color-toggle-bg)_48%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_48%,transparent)] backdrop-blur-[14px]" />
        </div>
      </div>

      {/* Content (hero + cards) stays in layout column; no toggle inside hero */}
      <div className="relative z-20 w-full pb-10 pt-[4.75rem] sm:pb-12 sm:pt-[5.25rem]">
        <header className="space-y-4">
          <h1 className="home-hero-title text-balance-safe text-[2.1rem] leading-[1.08] sm:text-[2.35rem]">
            <span className="block">Какой красивый мир</span>
            <span className="block">мы создаём вместе.</span>
          </h1>
          <p className="home-hero-sub home-hero-tagline text-pretty text-[0.95rem] leading-relaxed sm:text-[1rem]">
            Посиди, отдохни, почитай, улыбнись
          </p>
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

        <p className="home-helper mt-8 text-center text-[0.68rem] leading-relaxed opacity-90">
          <span className="block">Совет: добавь страницу на экран телефона</span>
          <span className="block">Поделиться → На экран «Домой»</span>
        </p>
      </div>
    </main>
  );
}
