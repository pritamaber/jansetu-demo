import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getComplaintsByCitizen } from "@/lib/complaints";
import db from "@/lib/db";
import Header from "@/components/Header";
import ComplaintCard from "@/components/ComplaintCard";
import { getLang } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

const STATUS_FILTERS = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

export default async function CitizenDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/login");

  const citizen = db.prepare("SELECT * FROM citizens WHERE id = ?").get(session.id) as
    | { name: string; area: string; booth_id: string }
    | undefined;
  if (!citizen) redirect("/login");

  const lang = await getLang();
  const dict = getDictionary(lang);
  const t = dict.citizenDashboard;

  const { q, status } = await searchParams;
  const allComplaints = getComplaintsByCitizen(session.id);
  const total = allComplaints.length;

  const statusCounts = STATUS_FILTERS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = allComplaints.filter((c) => c.status === s).length;
    return acc;
  }, {});
  const visibleFilters = STATUS_FILTERS.filter((s) => statusCounts[s] > 0 || status === s);

  let myComplaints = allComplaints;
  if (status) {
    myComplaints = myComplaints.filter((c) => c.status === status);
  }
  if (q) {
    const query = q.trim().toLowerCase();
    myComplaints = myComplaints.filter(
      (c) =>
        c.id.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }

  function filterHref(nextStatus?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextStatus) params.set("status", nextStatus);
    const qs = params.toString();
    return qs ? `/citizen/dashboard?${qs}` : "/citizen/dashboard";
  }

  return (
    <>
      <Header title="Jansetu — Citizen Portal" homeHref="/citizen/dashboard" />
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="text-lg font-semibold text-slate-900">
            {t.hi}, {citizen.name.split(" ")[0]}
          </h1>
        </div>
        <p className="text-xs text-slate-500 mb-4">📍 {citizen.area}</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <Link
            href="/citizen/appointments"
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg py-2.5 hover:border-orange-300"
          >
            📅 {t.appointment}
          </Link>
          <Link
            href="/citizen/complaints/new"
            className="flex items-center justify-center gap-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-orange-700"
          >
            + {t.reportProblem}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {t.complaints} {total > 0 && <span className="text-slate-400 font-normal">({total})</span>}
          </h2>
        </div>

        {total > 0 && (
          <>
            <form className="mb-3">
              {status && <input type="hidden" name="status" value={status} />}
              <input
                name="q"
                defaultValue={q}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </form>

            <div className="flex flex-wrap gap-1.5 mb-4">
              <Link
                href={filterHref(undefined)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
                  !status
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.all}
              </Link>
              {visibleFilters.map((s) => (
                <Link
                  key={s}
                  href={filterHref(s)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
                    status === s
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {dict.statuses[s as keyof typeof dict.statuses]} · {statusCounts[s]}
                </Link>
              ))}
              {(q || status) && (
                <Link
                  href="/citizen/dashboard"
                  className="text-xs text-slate-400 self-center ml-1 hover:underline"
                >
                  {t.clear}
                </Link>
              )}
            </div>
          </>
        )}

        {myComplaints.length === 0 ? (
          <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-6 text-center">
            {q || status ? t.noMatch : t.noComplaints}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2.5">
            {myComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} href={`/citizen/complaints/${c.id}`} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
