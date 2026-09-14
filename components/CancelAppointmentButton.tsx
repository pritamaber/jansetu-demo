"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointmentAction } from "@/lib/actions";

export default function CancelAppointmentButton({ appointmentId }: { appointmentId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 shrink-0"
      >
        Cancel
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await cancelAppointmentAction(appointmentId);
              if (!res.ok) {
                setError(res.error);
                return;
              }
              router.refresh();
            })
          }
          className="text-sm bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Cancelling..." : "Confirm Cancel"}
        </button>
        <button
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
        >
          Keep
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
