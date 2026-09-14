import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jansetu Demo — Rajarhat / New Town",
  description: "Demo civic complaint platform for Rajarhat–New Town, West Bengal (fictional demo data).",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const t = getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider initialLang={lang}>
          <div className="w-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium py-2 px-3 border-b border-amber-200 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-center">🧪 {t.demoBanner}</span>
            <LanguageSwitcher />
          </div>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
