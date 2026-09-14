"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import db from "./db";
import { createSession, destroySession, getSession } from "./auth";
import {
  createComplaint,
  findSimilarComplaints,
  supportComplaint,
  updateComplaintStatus,
  reassignComplaint,
} from "./complaints";
import { bookAppointment, cancelAppointment, getAvailability } from "./appointments";

const DEMO_OTP = "123456";

export type ActionResult = { ok: true } | { ok: false; error: string };

// ---------- Citizen auth ----------

export async function verifyCitizenOtp(
  phone: string,
  otp: string
): Promise<{ ok: true; exists: boolean } | { ok: false; error: string }> {
  if (!/^\d{10}$/.test(phone)) {
    return { ok: false, error: "Enter a valid 10-digit Indian mobile number." };
  }
  if (otp !== DEMO_OTP) {
    return { ok: false, error: "Invalid OTP. Use the demo OTP 123456." };
  }
  const citizen = db.prepare("SELECT id, name FROM citizens WHERE phone = ?").get(phone) as
    | { id: number; name: string }
    | undefined;

  if (citizen) {
    await createSession({ role: "citizen", id: citizen.id, name: citizen.name });
    return { ok: true, exists: true };
  }
  return { ok: true, exists: false };
}

export async function registerCitizen(input: {
  name: string;
  phone: string;
  address: string;
  area: string;
  boothId: string;
}): Promise<ActionResult> {
  if (!/^\d{10}$/.test(input.phone)) {
    return { ok: false, error: "Enter a valid 10-digit Indian mobile number." };
  }
  const existing = db.prepare("SELECT id FROM citizens WHERE phone = ?").get(input.phone);
  if (existing) {
    return { ok: false, error: "This phone number is already registered." };
  }
  const result = db
    .prepare(
      "INSERT INTO citizens (name, phone, address, area, booth_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(input.name, input.phone, input.address, input.area, input.boothId);

  await createSession({
    role: "citizen",
    id: result.lastInsertRowid as number,
    name: input.name,
  });
  return { ok: true };
}

// ---------- Agent auth ----------

export async function agentLogin(phone: string, password: string): Promise<ActionResult> {
  const agent = db.prepare("SELECT * FROM agents WHERE phone = ?").get(phone) as
    | { id: number; name: string; password_hash: string; booth_id: string }
    | undefined;
  if (!agent) return { ok: false, error: "No agent found with that phone number." };
  const valid = bcrypt.compareSync(password, agent.password_hash);
  if (!valid) return { ok: false, error: "Incorrect password." };

  await createSession({
    role: "agent",
    id: agent.id,
    name: agent.name,
    boothId: agent.booth_id,
  });
  return { ok: true };
}

// ---------- Admin auth ----------

export async function adminLogin(email: string, password: string): Promise<ActionResult> {
  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email) as
    | { id: number; name: string; password_hash: string }
    | undefined;
  if (!admin) return { ok: false, error: "No admin account found with that email." };
  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) return { ok: false, error: "Incorrect password." };

  await createSession({ role: "master_admin", id: admin.id, name: admin.name });
  return { ok: true };
}

// ---------- Logout ----------

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------- Complaints ----------

export async function checkSimilarComplaints(
  title: string,
  category: string,
  boothId: string
) {
  return findSimilarComplaints(title, category, boothId);
}

const MAX_IMAGES = 5;

// Photos are uploaded separately via POST /api/upload (multipart FormData)
// before this action runs — Server Actions serialize their arguments
// through the RSC "Flight" protocol, which breaks on multi-megabyte string
// payloads, so base64 image data can't be passed through here directly.
// This action only ever receives the resulting /uploads/... paths.
export async function submitComplaint(input: {
  title: string;
  description: string;
  category: string;
  location: string;
  boothId: string;
  priority: string;
  imagePaths: string[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return { ok: false, error: "You must be logged in as a citizen to submit a complaint." };
  }

  const imagePaths = (input.imagePaths || []).filter(
    (p) => typeof p === "string" && p.startsWith("/uploads/")
  );
  if (imagePaths.length === 0) {
    return { ok: false, error: "At least one photo of the issue is required." };
  }
  if (imagePaths.length > MAX_IMAGES) {
    return { ok: false, error: `You can attach at most ${MAX_IMAGES} photos.` };
  }

  const id = createComplaint({
    title: input.title,
    description: input.description,
    category: input.category,
    location: input.location,
    boothId: input.boothId,
    priority: input.priority,
    citizenId: session.id,
    imagePaths,
  });
  revalidatePath("/citizen/dashboard");
  return { ok: true, id };
}

export async function supportExistingComplaint(complaintId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return { ok: false, error: "You must be logged in as a citizen to support an issue." };
  }
  supportComplaint(complaintId, session.id);
  revalidatePath(`/citizen/complaints/${complaintId}`);
  revalidatePath("/citizen/complaints/new");
  return { ok: true };
}

export async function updateStatus(
  complaintId: string,
  status: string,
  note: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || (session.role !== "agent" && session.role !== "master_admin")) {
    return { ok: false, error: "Not authorized to update this complaint." };
  }
  const complaint = db
    .prepare("SELECT booth_id, status FROM complaints WHERE id = ?")
    .get(complaintId) as { booth_id: string; status: string } | undefined;
  if (!complaint) {
    return { ok: false, error: "Complaint not found." };
  }
  if (session.role === "agent" && complaint.booth_id !== session.boothId) {
    return { ok: false, error: "Access Denied" };
  }
  if (complaint.status === status) {
    return {
      ok: false,
      error: `This complaint is already marked as "${status}". Choose a different status to update it.`,
    };
  }
  updateComplaintStatus(complaintId, status, note, session.name);
  revalidatePath(`/citizen/complaints/${complaintId}`);
  revalidatePath(`/agent/complaints/${complaintId}`);
  revalidatePath("/agent/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/complaints");
  return { ok: true };
}

export async function reassignComplaintAgent(
  complaintId: string,
  agentId: number
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "master_admin") {
    return { ok: false, error: "Only the Master Admin can reassign complaints." };
  }
  reassignComplaint(complaintId, agentId);
  revalidatePath(`/admin/complaints/${complaintId}`);
  revalidatePath("/admin/complaints");
  revalidatePath("/agent/dashboard");
  return { ok: true };
}

// ---------- MLA Appointments ----------

export async function checkOfficeAvailability(date: string) {
  return getAvailability(date);
}

export async function bookAppointmentAction(input: {
  officeId: string;
  date: string;
  purpose: string;
}): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return { ok: false, error: "You must be logged in as a citizen to book an appointment." };
  }
  const result = bookAppointment({
    officeId: input.officeId,
    citizenId: session.id,
    date: input.date,
    purpose: input.purpose,
  });
  if (!result.ok) return result;
  revalidatePath("/citizen/appointments");
  revalidatePath("/admin/appointments");
  return { ok: true, id: result.appointment.id };
}

export async function cancelAppointmentAction(appointmentId: number): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return { ok: false, error: "You must be logged in as a citizen to cancel an appointment." };
  }
  const cancelled = cancelAppointment(appointmentId, session.id);
  if (!cancelled) {
    return { ok: false, error: "Appointment not found." };
  }
  revalidatePath("/citizen/appointments");
  revalidatePath("/admin/appointments");
  return { ok: true };
}
