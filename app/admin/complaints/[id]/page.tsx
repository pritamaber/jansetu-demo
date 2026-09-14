import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getComplaintById, getComplaintImages, getSupporters, getStatusHistory } from "@/lib/complaints";
import db from "@/lib/db";
import Header from "@/components/Header";
import StatusTimeline from "@/components/StatusTimeline";
import StatusUpdateForm from "@/components/StatusUpdateForm";
import ReassignForm from "@/components/ReassignForm";
import ComplaintGallery from "@/components/ComplaintGallery";
import ComplaintHeader from "@/components/ComplaintHeader";

export default async function AdminComplaintDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const complaint = getComplaintById(id);
  if (!complaint) notFound();

  const supporters = getSupporters(id);
  const history = getStatusHistory(id);
  const images = getComplaintImages(id);
  const agentsAtBooth = db
    .prepare("SELECT id, name FROM agents WHERE booth_id = ?")
    .all(complaint.booth_id) as { id: number; name: string }[];

  return (
    <>
      <Header title="Jansetu — Master Admin" homeHref="/admin/dashboard" />
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 w-full flex-1">
        <Link href="/admin/complaints" className="text-sm text-orange-600 hover:underline">
          ← Back to Complaints
        </Link>

        <div className="mt-4 space-y-4">
          <ComplaintHeader complaint={complaint} supporterCount={supporters.length} showCitizen />

          {images.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
              <ComplaintGallery images={images} />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Reassign Agent</h2>
            <ReassignForm
              complaintId={complaint.id}
              currentAgentId={complaint.agent_id}
              agents={agentsAtBooth}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Update Status</h2>
            <StatusUpdateForm complaintId={complaint.id} currentStatus={complaint.status} />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Complaint Timeline</h2>
            <StatusTimeline history={history} />
          </div>
        </div>
      </main>
    </>
  );
}
