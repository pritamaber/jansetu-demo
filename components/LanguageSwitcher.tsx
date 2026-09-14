"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-medium shrink-0">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "en" ? "bg-orange-600 text-white" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("bn")}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "bn" ? "bg-orange-600 text-white" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
