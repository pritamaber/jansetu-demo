import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllComplaints } from "@/lib/complaints";
import Header from "@/components/Header";
import ComplaintCard from "@/components/ComplaintCard";

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; booth?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const { q, status, booth } = await searchParams;
  let complaints = getAllComplaints();

  if (q) {
    const query = q.toLowerCase();
    complaints = complaints.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.citizen_name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }
  if (status) complaints = complaints.filter((c) => c.status === status);
  if (booth) complaints = complaints.filter((c) => c.booth_id === booth);

  return (
    <>
      <Header title="Jansetu — Master Admin" homeHref="/admin/dashboard" />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <Link href="/admin/dashboard" className="text-sm text-orange-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-6">
          All Complaints ({complaints.length})
        </h1>

        <form className="flex flex-wrap gap-3 mb-6 bg-white border border-slate-200 rounded-xl p-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by title, ID, citizen, category..."
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option>Submitted</option>
            <option>Under Review</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select
            name="booth"
            defaultValue={booth || ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Booths</option>
            <option value="RJH-DEMO-01">Rajarhat Chowmatha</option>
            <option value="RJH-DEMO-02">Rajarhat Complex</option>
            <option value="RJH-DEMO-03">Rajarhat Newtown</option>
          </select>
          <button className="bg-orange-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-orange-700">
            Filter
          </button>
        </form>

        {complaints.length === 0 ? (
          <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-6 text-center">
            No complaints match your filters.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} href={`/admin/complaints/${c.id}`} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
