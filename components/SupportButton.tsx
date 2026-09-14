"use client";

import { useState, useTransition } from "react";
import { supportExistingComplaint } from "@/lib/actions";

export default function SupportButton({
  complaintId,
  initiallySupporting,
}: {
  complaintId: string;
  initiallySupporting: boolean;
}) {
  const [supporting, setSupporting] = useState(initiallySupporting);
  const [pending, startTransition] = useTransition();

  if (supporting) {
    return (
      <span className="text-sm font-medium text-green-700 flex items-center gap-1">
        ✓ Supporting
      </span>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await supportExistingComplaint(complaintId);
          setSupporting(true);
        })
      }
      className="bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-1.5 hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? "Supporting..." : "Support This Issue"}
    </button>
  );
}
