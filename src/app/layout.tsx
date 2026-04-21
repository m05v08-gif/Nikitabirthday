import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

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
    <html lang="ru">
      <body
        className={`${inter.variable} ${manrope.variable} min-h-dvh font-sans antialiased`}
      >
        <div className="relative isolate min-h-dvh overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-44 -top-44 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(214_85%_62%/0.09),transparent_62%)] blur-3xl" />
            <div className="absolute -right-48 top-16 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_45%_35%,hsl(28_92%_62%/0.11),transparent_62%)] blur-3xl" />
            <div className="absolute left-1/2 top-[56%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_45%,hsl(38_90%_62%/0.07),transparent_64%)] blur-3xl" />
            <div className="bg-noise absolute inset-0" />
          </div>

          <div className="relative mx-auto w-full max-w-md px-4 py-8 sm:py-10">{children}</div>
        </div>
      </body>
    </html>
  );
}

