import Link from "next/link";

function Tile({
  title,
  subtitle,
  href
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl bg-[color:var(--color-panel)] p-[1px] shadow-[var(--shadow-card)] ring-1 ring-white/10 backdrop-blur-xl transition active:scale-[0.99] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_18px_55px_hsl(222_55%_5%/0.38)] motion-safe:hover:ring-white/15"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(32_92%_62%/0.10),transparent_62%)] blur-2xl transition group-hover:opacity-95" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_40%_40%,hsl(214_80%_62%/0.07),transparent_62%)] blur-2xl transition group-hover:opacity-95" />

      <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white/10 to-transparent p-[1px]">
        <div className="rounded-[calc(1.5rem-2px)] bg-[linear-gradient(180deg,hsl(220_30%_16%/0.55),hsl(222_35%_11%/0.35))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-[1.15rem] font-semibold text-[color:var(--color-fg)]">
                {title}
              </div>
              <div className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">
                {subtitle}
              </div>
            </div>
            <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white/85 ring-1 ring-white/10 transition group-hover:bg-white/8">
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="animate-fade-in-up space-y-8">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[0.75rem] font-medium text-[color:var(--color-muted)] ring-1 ring-white/10 backdrop-blur-md">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[hsl(32_92%_58%)] shadow-[0_0_0_6px_hsl(32_92%_58%/0.14)]"
          />
          Для вас двоих
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-balance-safe text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[color:var(--color-fg)] sm:text-[2.25rem]">
            Для нас
          </h1>
          <p className="max-w-prose text-pretty text-base leading-relaxed text-[color:var(--color-muted)]">
            Истории из наших моментов и короткие идеи на вечер.
          </p>
        </div>
      </header>

      <section className="grid gap-3">
        <Tile
          title="Истории"
          subtitle="Нажми — и появится случайная история"
          href="/stories"
        />
        <Tile
          title="Идеи на вечер"
          subtitle="3 короткие идеи — без воды"
          href="/ideas"
        />
      </section>

      <footer className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.75rem] leading-relaxed text-[color:var(--color-muted-2)] ring-1 ring-white/5 backdrop-blur-md">
        Совет: добавь страницу на экран iPhone (Поделиться → На экран «Домой»).
      </footer>
    </main>
  );
}

