import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAppointmentsByCitizen } from "@/lib/appointments";
import Header from "@/components/Header";
import CancelAppointmentButton from "@/components/CancelAppointmentButton";

export default async function CitizenAppointmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/login");

  const appointments = getAppointmentsByCitizen(session.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter(
    (a) => a.status !== "Cancelled" && a.appointment_date >= today
  );
  const past = appointments.filter((a) => a.status === "Cancelled" || a.appointment_date < today);

  return (
    <>
      <Header title="Jansetu — Citizen Portal" homeHref="/citizen/dashboard" />
      <main className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MLA Appointments</h1>
            <p className="text-slate-500 text-sm mt-1">
              Book a slot at any of the three MLA offices — 10:00 AM to 2:00 PM daily.
            </p>
          </div>
          <Link
            href="/citizen/appointments/new"
            className="bg-orange-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-orange-700 whitespace-nowrap"
          >
            + Book Appointment
          </Link>
        </div>

        <h2 className="font-semibold text-slate-800 mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-6 text-center mb-8">
            No upcoming appointments.
          </p>
        ) : (
          <div className="space-y-3 mb-8">
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4 flex-wrap"
              >
                <div>
                  <div className="font-semibold text-slate-900">{a.office_name}</div>
                  <div className="text-sm text-slate-500">{a.office_address}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    📅 {a.appointment_date} &nbsp;·&nbsp; 🕐 {a.slot_time} &nbsp;·&nbsp; Token #
                    {a.slot_number}
                  </div>
                  {a.purpose && (
                    <div className="text-sm text-slate-500 mt-1">Purpose: {a.purpose}</div>
                  )}
                  <span className="inline-block mt-2 text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    {a.status}
                  </span>
                </div>
                <CancelAppointmentButton appointmentId={a.id} />
              </div>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="font-semibold text-slate-800 mb-3">Past / Cancelled</h2>
            <div className="space-y-3">
              {past.map((a) => (
                <div
                  key={a.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 opacity-70"
                >
                  <div className="font-semibold text-slate-900">{a.office_name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    📅 {a.appointment_date} · 🕐 {a.slot_time} · Token #{a.slot_number}
                  </div>
                  <span className="inline-block mt-2 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
