import Link from "next/link";

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
  const wash =
    variant === "stories"
      ? "from-[color-mix(in_oklab,var(--blob-a)_22%,transparent)] to-[color-mix(in_oklab,var(--blob-c)_16%,transparent)]"
      : "from-[color-mix(in_oklab,var(--blob-b)_24%,transparent)] to-[color-mix(in_oklab,var(--blob-d)_18%,transparent)]";

  const mark =
    variant === "stories"
      ? "bg-[radial-gradient(circle_at_30%_30%,var(--blob-a),var(--blob-c))]"
      : "bg-[radial-gradient(circle_at_30%_30%,var(--blob-b),var(--blob-d))]";

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-panel)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-xl transition active:scale-[0.99] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-soft)]"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${wash} opacity-90`}
      />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_40%_35%,var(--blob-b),transparent_62%)] opacity-55 blur-2xl transition group-hover:opacity-80" />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div
              aria-hidden="true"
              className={`inline-flex h-1.5 w-14 rounded-full ${mark} opacity-90 ring-1 ring-[color:var(--color-ring)]`}
            />

            <div>
              <div className="font-display text-[1.35rem] font-semibold leading-[1.05] text-[color:var(--color-fg)]">
                {title}
              </div>
              <div className="mt-2 max-w-[18rem] text-sm leading-relaxed text-[color:var(--color-muted)]">
                {subtitle}
              </div>
            </div>
          </div>

          <div className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] transition group-hover:translate-x-0.5">
            <span aria-hidden="true" className="text-xl leading-none">
              →
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[color:var(--color-stroke)] to-transparent opacity-70" />
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="animate-fade-in-up space-y-10">
      <header className="relative space-y-6">
        <div className="pointer-events-none absolute -left-10 top-2 h-28 w-28 rotate-6 rounded-[2rem] border border-[color:var(--color-stroke)] opacity-50" />
        <div className="pointer-events-none absolute right-0 top-24 h-20 w-20 -rotate-12 rounded-full border border-[color:var(--color-stroke)] opacity-35" />

        <div className="inline-flex -rotate-1 items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-muted-2)] shadow-[var(--shadow-card)] ring-1 ring-[color:var(--color-ring)] backdrop-blur-md">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--blob-b),var(--blob-a))]" />
          Для нас двоих
        </div>

        <div className="space-y-4">
          <h1 className="font-display max-w-[14ch] text-balance-safe text-[2.55rem] font-semibold leading-[0.92] tracking-[-0.05em] text-[color:var(--color-fg)] sm:text-[2.75rem]">
            Для нас
          </h1>
          <p className="max-w-prose text-pretty text-[1.05rem] leading-relaxed text-[color:var(--color-muted)]">
            Истории из наших моментов и короткие идеи на вечер.
          </p>
        </div>
      </header>

      <section className="grid gap-4">
        <Tile
          variant="stories"
          title="Истории"
          subtitle="Нажми — и появится случайная история"
          href="/stories"
        />
        <Tile
          variant="ideas"
          title="Идеи на вечер"
          subtitle="3 короткие идеи — без воды"
          href="/ideas"
        />
      </section>

      <footer className="border-t border-[color:var(--color-border)] pt-6 text-[0.72rem] leading-relaxed text-[color:var(--color-muted-2)]">
        Совет: добавь страницу на экран iPhone (Поделиться → На экран «Домой»).
      </footer>
    </main>
  );
}

