import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Для нас",
  description: "Истории и идеи на вечер — для нас двоих",
  applicationName: "Для нас",
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
      <body className="min-h-dvh bg-zinc-950 text-zinc-50">
        <div className="mx-auto w-full max-w-md px-4 py-6">{children}</div>
      </body>
    </html>
  );
}

