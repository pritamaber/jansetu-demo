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

export default async function ComplaintHeader({
  complaint,
  supporterCount,
  showCitizen = false,
}: {
  complaint: ComplaintWithJoins;
  supporterCount: number;
  showCitizen?: boolean;
}) {
  const lang = await getLang();
  const dict = getDictionary(lang);
  const category = dict.categories[complaint.category as keyof typeof dict.categories] || complaint.category;
  const priority = dict.priorities[complaint.priority as keyof typeof dict.priorities] || complaint.priority;
  const status = dict.statuses[complaint.status as keyof typeof dict.statuses] || complaint.status;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-mono text-slate-400">{complaint.id}</div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
            {complaint.title}
          </h1>
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
        {showCitizen && <MetaItem label="Citizen" value={complaint.citizen_name} />}
        <MetaItem label="Location" value={complaint.location} />
        <MetaItem label="Booth" value={complaint.booth_name} />
        <MetaItem label="Agent" value={complaint.agent_name || "Unassigned"} />
        <MetaItem label="Category" value={category} />
        <MetaItem label="Supporters" value={`👥 ${supporterCount}`} />
      </div>

      {complaint.description && (
        <p className="mt-4 pt-4 border-t border-slate-100 text-slate-700 text-sm leading-relaxed">
          {complaint.description}
        </p>
      )}
    </div>
  );
}
