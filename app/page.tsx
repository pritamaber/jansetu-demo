import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLang } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "citizen") redirect("/citizen/dashboard");
  if (session?.role === "agent") redirect("/agent/dashboard");
  if (session?.role === "master_admin") redirect("/admin/dashboard");

  const lang = await getLang();
  const t = getDictionary(lang).home;

  return (
    <main className="flex-1 flex flex-col items-center bg-slate-50">
      {/* Tricolor banner — party symbol + the MLA this demo is built for. No other
          individuals' photos are used here (see project notes on that boundary). */}
      <div className="w-full bg-gradient-to-r from-orange-500 via-white to-green-600 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bjplogo.jpg"
            alt="Party symbol"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md shrink-0"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mlaimage.png"
            alt="Piyush Kanodia"
            className="w-12 h-12 rounded-full object-cover object-top border-2 border-white shadow-md shrink-0"
          />
          <div className="min-w-0 text-left">
            <div className="text-[10px] font-semibold text-slate-700 uppercase tracking-wide leading-none">
              {t.demoBuiltFor}
            </div>
            <div className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
              Piyush Kanodia
            </div>
            <div className="text-xs text-slate-700">{t.mlaTitle}</div>
          </div>
        </div>
        <div className="bg-slate-900/85 text-white text-center py-1.5 px-4">
          <div className="text-xs sm:text-sm font-semibold">{t.tagline1}</div>
        </div>
      </div>

      <div className="max-w-md w-full px-4 py-6">
        <div className="text-center mb-6">
          <div className="inline-block bg-orange-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            {t.badge}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{t.title}</h1>
        </div>

        <div className="space-y-2">
          <Link
            href="/login"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-orange-300 hover:shadow-sm transition"
          >
            <span className="text-2xl shrink-0">🧑‍🤝‍🧑</span>
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900 text-sm group-hover:text-orange-700">
                {t.citizenLogin}
              </span>
              <span className="block text-xs text-slate-500">{t.citizenLoginDesc}</span>
            </span>
          </Link>
          <Link
            href="/agent/login"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-orange-300 hover:shadow-sm transition"
          >
            <span className="text-2xl shrink-0">🏢</span>
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900 text-sm group-hover:text-orange-700">
                {t.agentLogin}
              </span>
              <span className="block text-xs text-slate-500">{t.agentLoginDesc}</span>
            </span>
          </Link>
          <Link
            href="/admin/login"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-orange-300 hover:shadow-sm transition"
          >
            <span className="text-2xl shrink-0">🛡️</span>
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900 text-sm group-hover:text-orange-700">
                {t.adminLogin}
              </span>
              <span className="block text-xs text-slate-500">{t.adminLoginDesc}</span>
            </span>
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400 leading-relaxed">
          {t.citizenOtp}: <code className="text-slate-500">123456</code> · {t.agentPassword}:{" "}
          <code className="text-slate-500">agent123</code> · {t.adminPassword}:{" "}
          <code className="text-slate-500">admin123</code>
        </p>
      </div>
    </main>
  );
}
