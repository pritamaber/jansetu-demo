import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";

export default async function AdminAgentsPage() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const agents = db
    .prepare(
      `SELECT a.*, b.name AS booth_name, b.area AS booth_area,
        (SELECT COUNT(*) FROM complaints c WHERE c.agent_id = a.id) AS complaint_count
       FROM agents a JOIN booths b ON b.id = a.booth_id ORDER BY a.name`
    )
    .all() as {
    id: number;
    name: string;
    phone: string;
    booth_name: string;
    booth_area: string;
    address: string | null;
    complaint_count: number;
  }[];

  return (
    <>
      <Header title="Jansetu — Master Admin" homeHref="/admin/dashboard" />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <Link href="/admin/dashboard" className="text-sm text-orange-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-6">
          Booth Agents ({agents.length})
        </h1>

        <div className="grid sm:grid-cols-2 gap-4">
          {agents.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="font-semibold text-slate-900">{a.name}</div>
              <div className="text-sm text-slate-500 mt-1">📞 {a.phone}</div>
              <div className="text-sm text-slate-500">
                🏢 {a.booth_name} ({a.booth_area})
              </div>
              {a.address && <div className="text-sm text-slate-500">📍 {a.address}</div>}
              <div className="text-sm text-slate-500 mt-1">
                📋 {a.complaint_count} complaints handled
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
