import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getComplaintById, getComplaintImages, getSupporters, getStatusHistory } from "@/lib/complaints";
import Header from "@/components/Header";
import StatusTimeline from "@/components/StatusTimeline";
import StatusUpdateForm from "@/components/StatusUpdateForm";
import ComplaintGallery from "@/components/ComplaintGallery";
import ComplaintHeader from "@/components/ComplaintHeader";

export default async function AgentComplaintDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "agent") redirect("/agent/login");

  const complaint = getComplaintById(id);
  if (!complaint) notFound();

  if (complaint.booth_id !== session.boothId) {
    return (
      <>
        <Header title="Jansetu — Agent Portal" homeHref="/agent/dashboard" />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="text-4xl mb-3">🚫</div>
            <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              This complaint belongs to another booth office. You can only view and manage
              complaints assigned to your own booth.
            </p>
            <Link
              href="/agent/dashboard"
              className="inline-block mt-6 text-sm text-orange-600 hover:underline"
            >
              ← Back to your dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  const supporters = getSupporters(id);
  const history = getStatusHistory(id);
  const images = getComplaintImages(id);

  return (
    <>
      <Header title="Jansetu — Agent Portal" homeHref="/agent/dashboard" />
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 w-full flex-1">
        <Link href="/agent/dashboard" className="text-sm text-orange-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-4 space-y-4">
          <ComplaintHeader complaint={complaint} supporterCount={supporters.length} showCitizen />

          {images.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
              <ComplaintGallery images={images} />
            </div>
          )}

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
