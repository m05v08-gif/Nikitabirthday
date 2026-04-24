"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GiftIntroScreen } from "@/components/gift-intro-screen";
import { CodeUnlockScreen } from "@/components/code-unlock-screen";
import { MainHomeScreen } from "@/components/main-home-screen";

type Step = "gift" | "code" | "home";

const UNLOCK_KEY = "gift:unlocked:v1";
const CODE = "109";

function forceLightTheme() {
  document.documentElement.dataset.theme = "light";
  document.documentElement.style.colorScheme = "light";
}

export function HomeEntry() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("gift");

  const shouldReset = useMemo(() => {
    if (process.env.NODE_ENV === "production") return false;
    return searchParams?.get("resetGift") === "1";
  }, [searchParams]);

  useEffect(() => {
    if (shouldReset) {
      try {
        localStorage.removeItem(UNLOCK_KEY);
      } catch {
        // ignore
      }
    }

    try {
      const unlocked = localStorage.getItem(UNLOCK_KEY) === "1";
      setStep(unlocked ? "home" : "gift");
    } catch {
      setStep("gift");
    }
  }, [shouldReset]);

  useEffect(() => {
    if (step === "home") return;
    forceLightTheme();
  }, [step]);

  if (step === "gift") {
    return (
      <div className="intro-step animate-[intro-reveal_650ms_ease-out_both]">
        <GiftIntroScreen onOpenEnvelope={() => setStep("code")} />
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="intro-step animate-[intro-reveal_650ms_ease-out_both]">
        <CodeUnlockScreen
          code={CODE}
          onUnlocked={() => {
            try {
              localStorage.setItem(UNLOCK_KEY, "1");
            } catch {
              // ignore
            }
            setStep("home");
          }}
        />
      </div>
    );
  }

  return (
    <div className="intro-step animate-[intro-reveal_650ms_ease-out_both]">
      <MainHomeScreen />
    </div>
  );
}

