import db from "./db";

export const DAILY_CAPACITY = 20;
export const SLOT_WINDOW_START_MINUTES = 10 * 60; // 10:00
export const SLOT_WINDOW_END_MINUTES = 14 * 60; // 14:00
const SLOT_INTERVAL_MINUTES = (SLOT_WINDOW_END_MINUTES - SLOT_WINDOW_START_MINUTES) / DAILY_CAPACITY;

export type MlaOffice = { id: string; name: string; address: string };

export type Appointment = {
  id: number;
  office_id: string;
  citizen_id: number;
  appointment_date: string;
  slot_number: number;
  slot_time: string;
  purpose: string | null;
  status: string;
  created_at: string;
};

export type AppointmentWithJoins = Appointment & {
  office_name: string;
  office_address: string;
  citizen_name: string;
};

export function getOffices(): MlaOffice[] {
  return db.prepare("SELECT * FROM mla_offices ORDER BY id").all() as MlaOffice[];
}

export function getOfficeById(id: string): MlaOffice | undefined {
  return db.prepare("SELECT * FROM mla_offices WHERE id = ?").get(id) as MlaOffice | undefined;
}

function slotTimeForNumber(slotNumber: number): string {
  const minutes = SLOT_WINDOW_START_MINUTES + (slotNumber - 1) * SLOT_INTERVAL_MINUTES;
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

export function getBookedCount(officeId: string, date: string): number {
  return (
    db
      .prepare(
        "SELECT COUNT(*) c FROM appointments WHERE office_id = ? AND appointment_date = ? AND status != 'Cancelled'"
      )
      .get(officeId, date) as { c: number }
  ).c;
}

export function getAvailability(date: string): Array<MlaOffice & { booked: number; remaining: number }> {
  return getOffices().map((office) => {
    const booked = getBookedCount(office.id, date);
    return { ...office, booked, remaining: Math.max(0, DAILY_CAPACITY - booked) };
  });
}

export function bookAppointment(input: {
  officeId: string;
  citizenId: number;
  date: string;
  purpose: string;
}): { ok: true; appointment: Appointment } | { ok: false; error: string } {
  const office = getOfficeById(input.officeId);
  if (!office) return { ok: false, error: "Selected office was not found." };

  const today = new Date().toISOString().slice(0, 10);
  if (input.date < today) {
    return { ok: false, error: "Please choose a date from today onward." };
  }

  const existing = db
    .prepare(
      "SELECT id FROM appointments WHERE citizen_id = ? AND appointment_date = ? AND status != 'Cancelled'"
    )
    .get(input.citizenId, input.date);
  if (existing) {
    return { ok: false, error: "You already have an appointment booked for this date." };
  }

  // Run the availability check + insert in one transaction so two
  // simultaneous bookings for the last open slot can't both succeed.
  const run = db.transaction(() => {
    const booked = getBookedCount(input.officeId, input.date);
    if (booked >= DAILY_CAPACITY) {
      return { ok: false as const, error: "Sorry, this office is fully booked for the selected date." };
    }
    const slotNumber = booked + 1;
    const slotTime = slotTimeForNumber(slotNumber);
    const result = db
      .prepare(
        `INSERT INTO appointments (office_id, citizen_id, appointment_date, slot_number, slot_time, purpose, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')`
      )
      .run(input.officeId, input.citizenId, input.date, slotNumber, slotTime, input.purpose || null);

    const appointment = db
      .prepare("SELECT * FROM appointments WHERE id = ?")
      .get(result.lastInsertRowid) as Appointment;
    return { ok: true as const, appointment };
  });

  return run();
}

export function cancelAppointment(appointmentId: number, citizenId: number): boolean {
  const result = db
    .prepare("UPDATE appointments SET status = 'Cancelled' WHERE id = ? AND citizen_id = ?")
    .run(appointmentId, citizenId);
  return result.changes > 0;
}

const APPOINTMENT_BASE_SELECT = `
  SELECT a.*, o.name AS office_name, o.address AS office_address, c.name AS citizen_name
  FROM appointments a
  JOIN mla_offices o ON o.id = a.office_id
  JOIN citizens c ON c.id = a.citizen_id
`;

export function getAppointmentsByCitizen(citizenId: number): AppointmentWithJoins[] {
  return db
    .prepare(
      `${APPOINTMENT_BASE_SELECT} WHERE a.citizen_id = ? ORDER BY a.appointment_date DESC, a.slot_number ASC`
    )
    .all(citizenId) as AppointmentWithJoins[];
}

export function getAllAppointments(): AppointmentWithJoins[] {
  return db
    .prepare(`${APPOINTMENT_BASE_SELECT} ORDER BY a.appointment_date DESC, a.slot_number ASC`)
    .all() as AppointmentWithJoins[];
}
