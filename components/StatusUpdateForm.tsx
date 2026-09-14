"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStatus } from "@/lib/actions";

const STATUSES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

export default function StatusUpdateForm({
  complaintId,
  currentStatus,
}: {
  complaintId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState(currentStatus);
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const isUnchanged = status === activeStatus;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);
    if (isUnchanged) {
      setError(`This complaint is already marked as "${status}". Choose a different status to update it.`);
      return;
    }
    startTransition(async () => {
      const res = await updateStatus(complaintId, status, note);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setActiveStatus(status);
      setDone(true);
      setNote("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setError("");
              setDone(false);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} disabled={s === activeStatus}>
                {s === activeStatus ? `${s} (current)` : s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Public Update (visible to citizen)
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Our local team has reviewed the issue and the concerned department has been informed."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && !pending && !error && <p className="text-sm text-green-700">✓ Status updated.</p>}
      <button
        disabled={pending || isUnchanged}
        className="bg-orange-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Updating..." : "Update Status"}
      </button>
    </form>
  );
}
