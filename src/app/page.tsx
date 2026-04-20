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
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/60"
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-zinc-300">{subtitle}</div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-zinc-400">Для вас двоих</div>
        <h1 className="text-2xl font-semibold tracking-tight">Для нас</h1>
        <p className="text-zinc-300">
          Истории из наших моментов и короткие идеи на вечер.
        </p>
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

      <footer className="pt-2 text-xs text-zinc-500">
        Совет: добавь страницу на экран iPhone (Поделиться → На экран «Домой»).
      </footer>
    </main>
  );
}

