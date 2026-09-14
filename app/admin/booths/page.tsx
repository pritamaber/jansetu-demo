import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";

export default async function AdminBoothsPage() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const booths = db
    .prepare(
      `SELECT b.*,
        (SELECT COUNT(*) FROM complaints c WHERE c.booth_id = b.id) AS complaint_count,
        (SELECT COUNT(*) FROM citizens ci WHERE ci.booth_id = b.id) AS citizen_count,
        (SELECT a.name FROM agents a WHERE a.booth_id = b.id LIMIT 1) AS agent_name
       FROM booths b ORDER BY b.id`
    )
    .all() as {
    id: string;
    name: string;
    area: string;
    address: string;
    complaint_count: number;
    citizen_count: number;
    agent_name: string | null;
  }[];

  return (
    <>
      <Header title="Jansetu — Master Admin" homeHref="/admin/dashboard" />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <Link href="/admin/dashboard" className="text-sm text-orange-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">
          Booth Offices ({booths.length})
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Demo booth records inspired by Rajarhat-area locations — not official election booth
          numbers or government offices.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {booths.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-mono text-slate-400">{b.id}</div>
              <div className="font-semibold text-slate-900">{b.name}</div>
              <div className="text-sm text-slate-500 mt-1">📍 {b.area}</div>
              <div className="text-sm text-slate-500">{b.address}</div>
              <div className="text-sm text-slate-500 mt-1">🧑‍💼 Agent: {b.agent_name || "—"}</div>
              <div className="text-sm text-slate-500">
                👥 {b.citizen_count} citizens · 📋 {b.complaint_count} complaints
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
