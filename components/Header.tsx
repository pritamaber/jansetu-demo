import Link from "next/link";
import { logout } from "@/lib/actions";
import { getLang } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export default async function Header({
  title,
  subtitle,
  homeHref,
}: {
  title: string;
  subtitle?: string;
  homeHref: string;
}) {
  const lang = await getLang();
  const t = getDictionary(lang).header;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={homeHref}>
          <div className="font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
        </Link>
        <form action={logout}>
          <button className="text-sm text-slate-500 hover:text-red-600 font-medium">
            {t.logout}
          </button>
        </form>
      </div>
    </header>
  );
}
