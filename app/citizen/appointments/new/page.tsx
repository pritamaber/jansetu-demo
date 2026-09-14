"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkOfficeAvailability, bookAppointmentAction } from "@/lib/actions";

// Kept in sync with DAILY_CAPACITY in lib/appointments.ts — not imported
// directly since that module pulls in the server-only database client.
const DAILY_CAPACITY = 20;

type OfficeAvailability = {
  id: string;
  name: string;
  address: string;
  booked: number;
  remaining: number;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayIso());
  const [officeId, setOfficeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [availability, setAvailability] = useState<OfficeAvailability[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadingAvailability = availabilityDate !== date;

  useEffect(() => {
    let cancelled = false;
    checkOfficeAvailability(date).then((result) => {
      if (cancelled) return;
      setAvailability(result);
      setAvailabilityDate(date);
      setOfficeId((current) => {
        if (current && result.some((o) => o.id === current)) return current;
        return result.find((o) => o.remaining > 0)?.id || result[0]?.id || "";
      });
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const selectedOffice = availability.find((o) => o.id === officeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!officeId) {
      setError("Please select an office.");
      return;
    }
    setSubmitting(true);
    const res = await bookAppointmentAction({ officeId, date, purpose });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/citizen/appointments");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full">
        <Link href="/citizen/appointments" className="text-sm text-orange-600 hover:underline">
          ← Back to My Appointments
        </Link>
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Book MLA Appointment</h1>
          <p className="text-sm text-slate-500 mb-6">
            Choose an office and date — appointments run 10:00 AM to 2:00 PM, {DAILY_CAPACITY} slots
            per office per day.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                min={todayIso()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Choose an Office</label>
              {loadingAvailability ? (
                <p className="text-sm text-slate-400">Checking availability...</p>
              ) : (
                <div className="space-y-2">
                  {availability.map((office) => (
                    <label
                      key={office.id}
                      className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition ${
                        officeId === office.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 hover:border-slate-300"
                      } ${office.remaining === 0 ? "opacity-60" : ""}`}
                    >
                      <input
                        type="radio"
                        name="office"
                        value={office.id}
                        checked={officeId === office.id}
                        onChange={() => setOfficeId(office.id)}
                        disabled={office.remaining === 0}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{office.name}</div>
                        <div className="text-sm text-slate-500">{office.address}</div>
                        <div
                          className={`text-xs font-medium mt-1 ${
                            office.remaining === 0
                              ? "text-red-600"
                              : office.remaining <= 5
                              ? "text-amber-600"
                              : "text-green-700"
                          }`}
                        >
                          {office.remaining === 0
                            ? "Fully booked for this date"
                            : `${office.remaining} of ${DAILY_CAPACITY} slots available`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Purpose of Visit (optional)
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Discuss road repair request for our locality"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              disabled={submitting || loadingAvailability || !selectedOffice || selectedOffice.remaining === 0}
              className="w-full bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
