import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/Header";

export default async function AdminCitizensPage() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const citizens = db
    .prepare(
      `SELECT ci.*, b.name AS booth_name,
        (SELECT COUNT(*) FROM complaints c WHERE c.citizen_id = ci.id) AS complaint_count
       FROM citizens ci LEFT JOIN booths b ON b.id = ci.booth_id ORDER BY ci.created_at DESC`
    )
    .all() as {
    id: number;
    name: string;
    phone: string;
    area: string | null;
    booth_name: string | null;
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
          Citizens ({citizens.length})
        </h1>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Area</th>
                <th className="text-left px-4 py-2">Booth</th>
                <th className="text-left px-4 py-2">Complaints</th>
              </tr>
            </thead>
            <tbody>
              {citizens.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-2 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-2 text-slate-600">{c.area}</td>
                  <td className="px-4 py-2 text-slate-600">{c.booth_name}</td>
                  <td className="px-4 py-2 text-slate-600">{c.complaint_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
