import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getComplaintsByBooth } from "@/lib/complaints";
import db from "@/lib/db";
import Header from "@/components/Header";
import ComplaintCard from "@/components/ComplaintCard";

const PRIORITY_FILTERS = ["High", "Medium", "Low"];

export default async function AgentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ priority?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "agent") redirect("/agent/login");

  const booth = db.prepare("SELECT * FROM booths WHERE id = ?").get(session.boothId) as
    | { name: string; area: string }
    | undefined;

  const allComplaints = getComplaintsByBooth(session.boothId!);

  const newCount = allComplaints.filter((c) => c.status === "Submitted").length;
  const inProgressCount = allComplaints.filter((c) =>
    ["In Progress", "Assigned", "Under Review"].includes(c.status)
  ).length;
  const resolvedCount = allComplaints.filter((c) => c.status === "Resolved").length;
  const highPriorityCount = allComplaints.filter((c) => c.priority === "High").length;

  const { priority } = await searchParams;
  // Resolved complaints are excluded from the active list by default — the
  // stats above still count them, but agents work off what's still open.
  const activeComplaints = allComplaints.filter((c) => c.status !== "Resolved");
  const priorityCounts = PRIORITY_FILTERS.reduce<Record<string, number>>((acc, p) => {
    acc[p] = activeComplaints.filter((c) => c.priority === p).length;
    return acc;
  }, {});
  const complaints = priority
    ? activeComplaints.filter((c) => c.priority === priority)
    : activeComplaints;

  return (
    <>
      <Header title="Jansetu — Agent Portal" homeHref="/agent/dashboard" />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {session.name}</h1>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          Assigned Area: <strong>{booth?.area}</strong> · {booth?.name}
        </p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <StatCard label="New" value={newCount} color="bg-slate-50 text-slate-700" />
          <StatCard label="In Progress" value={inProgressCount} color="bg-indigo-50 text-indigo-700" />
          <StatCard label="Resolved" value={resolvedCount} color="bg-green-50 text-green-700" />
          <StatCard label="High Priority" value={highPriorityCount} color="bg-red-50 text-red-700" />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <h2 className="font-semibold text-slate-800">
            Active Complaints — {booth?.name}{" "}
            <span className="text-slate-400 font-normal">({activeComplaints.length})</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <Link
            href="/agent/dashboard"
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              !priority
                ? "bg-orange-600 border-orange-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
            }`}
          >
            All ({activeComplaints.length})
          </Link>
          {PRIORITY_FILTERS.map((p) => (
            <Link
              key={p}
              href={`/agent/dashboard?priority=${p}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                priority === p
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
              }`}
            >
              {p} ({priorityCounts[p]})
            </Link>
          ))}
        </div>

        {complaints.length === 0 ? (
          <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-6 text-center">
            {priority
              ? `No active ${priority.toLowerCase()} priority complaints.`
              : "No active complaints assigned to your booth."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} href={`/agent/complaints/${c.id}`} />
            ))}
          </div>
        )}
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
