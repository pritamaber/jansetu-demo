import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getComplaintById,
  getComplaintImages,
  getSupporters,
  getStatusHistory,
  isSupporter,
} from "@/lib/complaints";
import Header from "@/components/Header";
import SupportButton from "@/components/SupportButton";
import StatusTimeline from "@/components/StatusTimeline";
import ComplaintGallery from "@/components/ComplaintGallery";
import { getLang } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}

export default async function CitizenComplaintDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/login");

  const complaint = getComplaintById(id);
  if (!complaint) notFound();

  const supporters = getSupporters(id);
  const history = getStatusHistory(id);
  const images = getComplaintImages(id);
  const alreadySupporting = isSupporter(id, session.id);
  const isOwner = complaint.citizen_id === session.id;

  const lang = await getLang();
  const dict = getDictionary(lang);
  const t = dict.complaintDetail;
  const category = dict.categories[complaint.category as keyof typeof dict.categories] || complaint.category;
  const priority = dict.priorities[complaint.priority as keyof typeof dict.priorities] || complaint.priority;
  const status = dict.statuses[complaint.status as keyof typeof dict.statuses] || complaint.status;

  return (
    <>
      <Header title="Jansetu — Citizen Portal" homeHref="/citizen/dashboard" />
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 w-full flex-1">
        <Link href="/citizen/dashboard" className="text-sm text-orange-600 hover:underline">
          {t.backCitizen}
        </Link>

        <div className="mt-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono text-slate-400">{complaint.id}</div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                  {complaint.title}
                </h1>
                {isOwner && (
                  <span className="inline-block mt-2 text-xs font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                    {t.youReported}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                    STATUS_STYLES[complaint.status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                    PRIORITY_STYLES[complaint.priority] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-5 pt-4 border-t border-slate-100">
              <MetaItem label={t.location} value={complaint.location} />
              <MetaItem label={t.booth} value={complaint.booth_name} />
              <MetaItem label={t.assignedTo} value={complaint.agent_name || t.unassigned} />
              <MetaItem label={t.category} value={category} />
            </div>

            {complaint.description && (
              <p className="mt-4 pt-4 border-t border-slate-100 text-slate-700 text-sm leading-relaxed">
                {complaint.description}
              </p>
            )}
          </div>

          {images.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
              <ComplaintGallery images={images} />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              👥 {t.supportedBy} <strong>{supporters.length}</strong> {t.citizens}
            </span>
            <SupportButton complaintId={complaint.id} initiallySupporting={alreadySupporting} />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
            <h2 className="font-semibold text-slate-800 mb-4">{t.timeline}</h2>
            <StatusTimeline history={history} />
          </div>
        </div>
      </main>
    </>
  );
}
