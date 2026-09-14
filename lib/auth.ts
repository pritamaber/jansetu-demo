import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "jansetu-demo-secret-key-not-for-production";
const COOKIE_NAME = "jansetu_session";

export type SessionRole = "citizen" | "agent" | "master_admin";

export type SessionPayload = {
  role: SessionRole;
  id: number;
  name: string;
  boothId?: string;
};

function sign(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

function encode(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const base = Buffer.from(json).toString("base64url");
  const sig = sign(base);
  return `${base}.${sig}`;
}

function decode(token: string): SessionPayload | null {
  const [base, sig] = token.split(".");
  if (!base || !sig) return null;
  if (sign(base) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(base, "base64url").toString());
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decode(token);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
