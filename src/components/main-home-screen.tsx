import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

function Tile({
  title,
  subtitle,
  href,
  variant
}: {
  title: string;
  subtitle: string;
  href: string;
  variant: "stories" | "ideas" | "yakut";
}) {
  const variantClass =
    variant === "stories" ? "home-tile--stories" : variant === "ideas" ? "home-tile--ideas" : "home-tile--yakut";
  const panel =
    variant === "stories"
      ? "bg-[color:color-mix(in_oklab,var(--color-panel)_22%,transparent)]"
      : "bg-[color:color-mix(in_oklab,var(--color-panel)_20%,transparent)]";
  const glow =
    variant === "stories"
      ? "bg-[radial-gradient(circle_at_18%_18%,color-mix(in_oklab,var(--blob-b)_14%,transparent),transparent_62%),radial-gradient(circle_at_82%_78%,color-mix(in_oklab,var(--blob-a)_12%,transparent),transparent_66%)]"
      : variant === "ideas"
        ? "bg-[radial-gradient(circle_at_20%_28%,color-mix(in_oklab,var(--blob-a)_12%,transparent),transparent_64%),radial-gradient(circle_at_78%_22%,color-mix(in_oklab,var(--blob-c)_10%,transparent),transparent_66%)]"
        : "bg-[radial-gradient(circle_at_20%_28%,color-mix(in_oklab,var(--blob-c)_12%,transparent),transparent_64%),radial-gradient(circle_at_78%_22%,color-mix(in_oklab,var(--blob-b)_10%,transparent),transparent_66%)]";

  return (
    <Link
      href={href}
      className={`home-tile ${variantClass} group relative block overflow-hidden rounded-[1.25rem] border border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] ${panel} p-[1.1rem] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_34%,transparent)] backdrop-blur-[16px] transition active:scale-[0.99] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--color-panel)_30%,transparent)]`}
    >
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${glow} opacity-45`} />

      <div className="relative space-y-1.5">
        <div className="home-card-title text-[1.22rem] leading-[1.06] sm:text-[1.24rem]">{title}</div>
        <div className="home-card-body text-[0.95rem] leading-relaxed">{subtitle}</div>
      </div>
    </Link>
  );
}

export function MainHomeScreen() {
  return (
    <main className="home-page relative min-h-[100svh] w-full">
      {/* Full-screen background: viewport-fixed so it is not clipped by layout max-w-md / padding */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100vh] min-h-[100svh] w-screen"
      >
        {/* Keep the original artwork brightness (no filters / global overlays) */}
        <div className="h-full w-full bg-[image:var(--home-artwork)] bg-cover bg-center bg-no-repeat opacity-100 [filter:brightness(var(--home-bg-brightness))]" />

        {/* Local readability only (not affecting the whole image) */}
        <div className="absolute left-0 top-0 h-[46svh] w-full bg-[image:var(--home-top-scrim)] opacity-[var(--home-top-scrim-opacity)]" />
        <div className="absolute bottom-0 left-0 h-[34svh] w-full bg-[image:var(--home-bottom-scrim)] opacity-[var(--home-bottom-scrim-opacity)]" />
      </div>

      {/* Theme toggle — fixed top-right over the artwork */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <div className="pointer-events-auto">
          <ThemeToggle className="home-hero-toggle border-[color:color-mix(in_oklab,var(--color-border)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--color-toggle-bg)_28%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_34%,transparent)] backdrop-blur-[18px] motion-safe:hover:translate-y-0 motion-safe:hover:shadow-[var(--shadow-card)]" />
        </div>
      </div>

      {/* Content (hero + cards) stays in layout column; no toggle inside hero */}
      <div className="relative z-20 w-full pb-10 pt-[5.15rem] sm:pb-12 sm:pt-[5.7rem]">
        <header className="relative space-y-4 px-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 -top-6 h-[34svh] w-[120%] bg-[image:var(--home-hero-underlay)] opacity-100"
          />
          <h1 className="home-hero-title text-balance-safe text-[2.22rem] leading-[1.06] sm:text-[2.5rem]">
            <span className="block">Какой красивый мир</span>
            <span className="block">мы создаём вместе.</span>
          </h1>
          <p className="home-hero-sub home-hero-tagline text-pretty text-[0.98rem] leading-relaxed sm:text-[1.02rem]">
            Посиди, отдохни, почитай, улыбнись
          </p>
        </header>

        <section className="mt-9 grid gap-3.5">
          <Tile
            variant="stories"
            title="Воспоминания"
            subtitle="Нажми — и появится случайная история"
            href="/stories"
          />
          <Tile variant="ideas" title="Вдохновения" subtitle="Разные идеи на вечер" href="/ideas" />
          <Tile variant="yakut" title="Угадай якутское слово" subtitle="Маленький квест" href="/yakut-quest" />
        </section>
      </div>
    </main>
  );
}

