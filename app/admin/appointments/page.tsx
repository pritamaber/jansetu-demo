import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllAppointments, getOffices, DAILY_CAPACITY } from "@/lib/appointments";
import Header from "@/components/Header";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string; date?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/admin/login");

  const { office, date } = await searchParams;
  const offices = getOffices();
  let appointments = getAllAppointments();

  if (office) appointments = appointments.filter((a) => a.office_id === office);
  if (date) appointments = appointments.filter((a) => a.appointment_date === date);

  const today = new Date().toISOString().slice(0, 10);
  const activeToday = appointments.filter(
    (a) => a.status !== "Cancelled" && a.appointment_date === today
  ).length;

  return (
    <>
      <Header title="Jansetu — Master Admin" homeHref="/admin/dashboard" />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <Link href="/admin/dashboard" className="text-sm text-orange-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">MLA Appointments</h1>
        <p className="text-sm text-slate-500 mb-6">
          {offices.length} offices · {DAILY_CAPACITY} slots/day each (10:00 AM–2:00 PM) ·{" "}
          {activeToday} booked today
        </p>

        <form className="flex flex-wrap gap-3 mb-6 bg-white border border-slate-200 rounded-xl p-4">
          <select
            name="office"
            defaultValue={office || ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Offices</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button className="bg-orange-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-orange-700">
            Filter
          </button>
          {(office || date) && (
            <Link
              href="/admin/appointments"
              className="text-sm text-slate-500 self-center hover:underline"
            >
              Clear
            </Link>
          )}
        </form>

        {appointments.length === 0 ? (
          <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-6 text-center">
            No appointments match your filters.
          </p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Citizen</th>
                  <th className="text-left px-4 py-2">Office</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Time</th>
                  <th className="text-left px-4 py-2">Token #</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800 font-medium">{a.citizen_name}</td>
                    <td className="px-4 py-2 text-slate-600">{a.office_name}</td>
                    <td className="px-4 py-2 text-slate-600">{a.appointment_date}</td>
                    <td className="px-4 py-2 text-slate-600">{a.slot_time}</td>
                    <td className="px-4 py-2 text-slate-600">#{a.slot_number}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          a.status === "Cancelled"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
