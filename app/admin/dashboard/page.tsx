import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllComplaints, getStats } from "@/lib/complaints";
import Header from "@/components/Header";
import ComplaintCard from "@/components/ComplaintCard";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const stats = getStats();
  const recent = getAllComplaints().slice(0, 8);

  return (
    <>
      <Header title="Jansetu — Master Admin" homeHref="/admin/dashboard" />
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome, {session.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Master Admin Dashboard</p>
        </div>

        <nav className="flex flex-wrap gap-1.5 mb-5 text-xs sm:text-sm">
          <Link href="/admin/complaints" className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300">
            Complaints
          </Link>
          <Link href="/admin/agents" className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300">
            Agents
          </Link>
          <Link href="/admin/booths" className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300">
            Booths
          </Link>
          <Link href="/admin/citizens" className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300">
            Citizens
          </Link>
          <Link href="/admin/appointments" className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300">
            Appointments
          </Link>
        </nav>

        <div className="grid grid-cols-4 gap-2 mb-2">
          <StatCard label="Citizens" value={stats.totalCitizens} color="bg-slate-50 text-slate-700" />
          <StatCard label="Agents" value={stats.totalAgents} color="bg-slate-50 text-slate-700" />
          <StatCard label="Booths" value={stats.totalBooths} color="bg-slate-50 text-slate-700" />
          <StatCard label="Issues" value={stats.totalIssues} color="bg-slate-50 text-slate-700" />
        </div>
        <div className="grid grid-cols-4 gap-2 mb-6">
          <StatCard label="New" value={stats.newIssues} color="bg-slate-50 text-slate-700" />
          <StatCard label="In Progress" value={stats.inProgress} color="bg-indigo-50 text-indigo-700" />
          <StatCard label="Resolved" value={stats.resolved} color="bg-green-50 text-green-700" />
          <StatCard label="High Priority" value={stats.highPriority} color="bg-red-50 text-red-700" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">Recent Complaints</h2>
              <Link href="/admin/complaints" className="text-sm text-orange-600 hover:underline">
                View all →
              </Link>
            </div>

            {/* Compact card list on small screens — avoids a horizontally
                scrolling table on mobile. */}
            <div className="sm:hidden space-y-2">
              {recent.map((c) => (
                <ComplaintCard key={c.id} complaint={c} href={`/admin/complaints/${c.id}`} />
              ))}
            </div>

            <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-2">Complaint</th>
                    <th className="text-left px-4 py-2">Citizen</th>
                    <th className="text-left px-4 py-2">Area</th>
                    <th className="text-left px-4 py-2">Agent</th>
                    <th className="text-left px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2">
                        <Link href={`/admin/complaints/${c.id}`} className="text-orange-600 hover:underline">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{c.citizen_name}</td>
                      <td className="px-4 py-2 text-slate-600">{c.location}</td>
                      <td className="px-4 py-2 text-slate-600">{c.agent_name || "—"}</td>
                      <td className="px-4 py-2 text-slate-600">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Most Reported Issues</h2>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {stats.mostReported.map((m, i) => (
                <Link
                  key={m.id}
                  href={`/admin/complaints/${m.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">#{i + 1}</div>
                    <div className="text-sm font-medium text-slate-800 truncate">{m.title}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-600 shrink-0 ml-3">
                    👥 {m.supporter_count}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg px-2 py-2.5 text-center ${color}`}>
      <div className="text-lg font-bold leading-none">{value}</div>
      <div className="text-[10px] leading-tight font-medium mt-1">{label}</div>
    </div>
  );
}
