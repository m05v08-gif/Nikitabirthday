"use client";

type GiftIntroScreenProps = {
  onOpenEnvelope: () => void;
};

export function GiftIntroScreen({ onOpenEnvelope }: GiftIntroScreenProps) {
  return (
    <main className="intro-root relative h-[100svh] w-full overflow-hidden bg-[color:var(--color-app-bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] h-[100vh] min-h-[100svh] w-screen"
      >
        <div className="h-full w-full bg-[image:url('/intro-gift.png')] bg-cover bg-center bg-no-repeat opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_52%_56%,hsl(0_0%_0%_/0.10)_0%,transparent_60%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(0_0%_0%_/0.18)_100%)] opacity-60" />
      </div>

      {/* Tap target — larger than the visible envelope */}
      <button
        type="button"
        onClick={onOpenEnvelope}
        className="intro-envelope-hit absolute left-1/2 top-[56%] z-20 h-[26%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-transparent"
        aria-label="Открыть конверт"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-[max(32px,calc(env(safe-area-inset-bottom)_+_16px))]">
        <div className="mx-auto w-full max-w-[430px] px-6">
          <div className="mx-auto grid w-fit justify-items-center gap-2">
            <div className="intro-hint w-fit rounded-full border border-black/10 bg-white/30 px-4 py-2 text-[0.9rem] font-medium tracking-[-0.01em] text-black/75 backdrop-blur-md">
              Нажми на конверт
            </div>
            <div className="text-center text-[0.74rem] font-semibold leading-relaxed tracking-[0.01em] text-black/70">
              <span className="block">Совет: добавь страницу на экран телефона</span>
              <span className="block">Поделиться → На экран «Домой»</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

