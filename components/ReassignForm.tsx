"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reassignComplaintAgent } from "@/lib/actions";

export default function ReassignForm({
  complaintId,
  currentAgentId,
  agents,
}: {
  complaintId: string;
  currentAgentId: number | null;
  agents: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [agentId, setAgentId] = useState(currentAgentId ? String(currentAgentId) : "");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agentId) return;
    startTransition(async () => {
      await reassignComplaintAgent(complaintId, Number(agentId));
      setDone(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Booth Agent</label>
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Select agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <button
        disabled={pending || !agentId}
        className="bg-orange-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? "Reassigning..." : "Reassign"}
      </button>
      {done && !pending && <span className="text-sm text-green-700">✓ Reassigned</span>}
    </form>
  );
}
