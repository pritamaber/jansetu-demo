type HistoryItem = {
  id: number;
  status: string;
  note: string | null;
  actor: string | null;
  created_at: string;
};

export default function StatusTimeline({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-400">No updates yet.</p>;
  }
  return (
    <ol className="space-y-4">
      {history.map((h, i) => (
        <li key={h.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mt-1 ${
                i === history.length - 1 ? "bg-orange-600" : "bg-slate-300"
              }`}
            />
            {i < history.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
          </div>
          <div className="pb-2">
            <div className="text-sm font-medium text-slate-900">{h.status}</div>
            {h.note && <div className="text-sm text-slate-600 mt-0.5">{h.note}</div>}
            <div className="text-xs text-slate-400 mt-0.5">
              {h.actor ? `${h.actor} · ` : ""}
              {h.created_at}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
