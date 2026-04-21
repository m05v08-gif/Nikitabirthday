import type { Metadata } from "next";
import { Fraunces, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ArtBackground } from "@/components/art-background";
import { ThemeScript } from "@/components/theme-script";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-art",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Для нас",
  description: "Истории и идеи на вечер — для нас двоих",
  applicationName: "Для нас",
  themeColor: "#0b1220",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${fraunces.variable} min-h-dvh font-sans antialiased`}
      >
        <div className="relative isolate min-h-dvh overflow-x-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
          <ArtBackground />

          <div className="relative mx-auto flex w-full max-w-md justify-end px-4 pt-6 sm:pt-8">
            <ThemeToggle />
          </div>

          <div className="relative mx-auto w-full max-w-md px-4 pb-10 sm:pb-12">{children}</div>
        </div>
      </body>
    </html>
  );
}

