import Link from "next/link";
import type { ComplaintWithJoins } from "@/lib/complaints";
import { getLang } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
};

const PRIORITY_DOT: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-slate-400",
};

export default async function ComplaintCard({
  complaint,
  href,
}: {
  complaint: ComplaintWithJoins;
  href: string;
}) {
  const lang = await getLang();
  const dict = getDictionary(lang);
  const statusLabel =
    dict.statuses[complaint.status as keyof typeof dict.statuses] || complaint.status;

  return (
    <Link
      href={href}
      className="flex gap-3 min-w-0 bg-white border border-slate-200 rounded-xl p-3 hover:border-orange-300 hover:shadow-sm transition"
    >
      {complaint.image_path ? (
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={complaint.image_path}
            alt=""
            className="w-12 h-12 rounded-lg object-cover"
          />
          {complaint.image_count > 1 && (
            <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-medium px-1 py-px rounded-full leading-none">
              +{complaint.image_count - 1}
            </span>
          )}
        </div>
      ) : (
        <div
          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[complaint.priority] || "bg-slate-300"}`}
          title={`${complaint.priority} priority`}
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-slate-900 text-sm leading-snug truncate">
            {complaint.title}
          </h3>
          {complaint.image_path && (
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[complaint.priority] || "bg-slate-300"}`}
              title={`${complaint.priority} priority`}
            />
          )}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {complaint.location} · {complaint.agent_name || "Unassigned"}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-slate-400">
            {complaint.id} · 👥 {complaint.supporter_count}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
              STATUS_STYLES[complaint.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
