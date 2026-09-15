import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

// DATA_DIR lets deployment platforms (e.g. Railway) point this at a
// persistent volume; defaults to ./data for local development.
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "jansetu.db");
const isNew = !fs.existsSync(dbPath);

const raw = new DatabaseSync(dbPath);
// Next.js's build-time page-data collection opens this module from many
// worker processes at once; without a busy_timeout, concurrent first-time
// WAL conversion on the same file fails immediately with SQLITE_BUSY
// ("database is locked") instead of waiting for the lock to clear.
raw.exec("PRAGMA busy_timeout = 5000");
raw.exec("PRAGMA journal_mode = WAL");
raw.exec("PRAGMA foreign_keys = ON");

// node:sqlite has no built-in .transaction() helper like better-sqlite3 did,
// so this shim reproduces the "db.transaction(fn)() " call pattern used
// throughout the codebase with a plain BEGIN/COMMIT/ROLLBACK wrapper.
function transaction<T>(fn: () => T): () => T {
  return () => {
    raw.exec("BEGIN");
    try {
      const result = fn();
      raw.exec("COMMIT");
      return result;
    } catch (err) {
      raw.exec("ROLLBACK");
      throw err;
    }
  };
}

const db = Object.assign(raw, { transaction });

db.exec(`
CREATE TABLE IF NOT EXISTS booths (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'master_admin'
);

CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  booth_id TEXT NOT NULL REFERENCES booths(id),
  address TEXT
);

CREATE TABLE IF NOT EXISTS citizens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  area TEXT,
  booth_id TEXT REFERENCES booths(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  booth_id TEXT NOT NULL REFERENCES booths(id),
  citizen_id INTEGER NOT NULL REFERENCES citizens(id),
  agent_id INTEGER REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'Submitted',
  priority TEXT NOT NULL DEFAULT 'Medium',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS complaint_supporters (
  complaint_id TEXT NOT NULL REFERENCES complaints(id),
  citizen_id INTEGER NOT NULL REFERENCES citizens(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (complaint_id, citizen_id)
);

CREATE TABLE IF NOT EXISTS complaint_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id TEXT NOT NULL REFERENCES complaints(id),
  status TEXT NOT NULL,
  note TEXT,
  actor TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS complaint_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id TEXT NOT NULL REFERENCES complaints(id),
  image_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mla_offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  office_id TEXT NOT NULL REFERENCES mla_offices(id),
  citizen_id INTEGER NOT NULL REFERENCES citizens(id),
  appointment_date TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  slot_time TEXT NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_office_date ON appointments(office_id, appointment_date);
`);

// Migration: add complaints.image_path for databases created before photo
// evidence was required on new complaints.
const complaintColumns = db.prepare("PRAGMA table_info(complaints)").all() as { name: string }[];
if (!complaintColumns.some((c) => c.name === "image_path")) {
  // Next.js's build-time page-data collection loads this module from many
  // worker processes concurrently, so two workers can both see the column
  // missing and race to add it; ignore the loser's "already exists" error.
  try {
    db.exec("ALTER TABLE complaints ADD COLUMN image_path TEXT");
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes("duplicate column name")) throw err;
  }
}

// Migration: carry forward any single image_path (from before multi-image
// support) into complaint_images, so older complaints still show their photo.
db.exec(`
  INSERT INTO complaint_images (complaint_id, image_path)
  SELECT id, image_path FROM complaints
  WHERE image_path IS NOT NULL
    AND id NOT IN (SELECT complaint_id FROM complaint_images)
`);

// Migration: collapse the booth/agent roster down to exactly 3 fixed
// booths and 3 fixed agents. Runs once — guarded by the presence of a
// retired booth id — and remaps any citizens/complaints on a retired
// booth onto its replacement so nothing is orphaned.
const BOOTH_REMAP: Record<string, string> = {
  "RJH-DEMO-04": "RJH-DEMO-02",
  "RJH-DEMO-05": "RJH-DEMO-03",
};
const BOOTH_INFO: Record<string, { name: string; area: string; address: string }> = {
  "RJH-DEMO-01": {
    name: "Rajarhat Chowmatha Booth Office",
    area: "Rajarhat Chowmatha",
    address: "Rajarhat Chowmatha, Rajarhat",
  },
  "RJH-DEMO-02": {
    name: "Rajarhat Complex Booth Office",
    area: "Rajarhat Complex",
    address: "Rajarhat Complex, Rajarhat",
  },
  "RJH-DEMO-03": {
    name: "Rajarhat Newtown Booth Office",
    area: "Rajarhat Newtown",
    address: "Rajarhat Newtown, Rajarhat",
  },
};
const NEW_AGENTS = [
  { name: "Rick Sonkar", phone: "9000000001", boothId: "RJH-DEMO-01" },
  { name: "Bandana Majumdar", phone: "9000000002", boothId: "RJH-DEMO-02" },
  { name: "Ayan Daniyari", phone: "9000000003", boothId: "RJH-DEMO-03" },
];
const AGENT_PASSWORD = "agent123";

const hasLegacyBooth = db.prepare("SELECT 1 FROM booths WHERE id = 'RJH-DEMO-04'").get();
if (hasLegacyBooth) {
  const migrate = db.transaction(() => {
    for (const [oldId, newId] of Object.entries(BOOTH_REMAP)) {
      db.prepare("UPDATE citizens SET booth_id = ? WHERE booth_id = ?").run(newId, oldId);
      db.prepare("UPDATE complaints SET booth_id = ? WHERE booth_id = ?").run(newId, oldId);
    }

    for (const [id, info] of Object.entries(BOOTH_INFO)) {
      db.prepare("UPDATE booths SET name = ?, area = ?, address = ? WHERE id = ?").run(
        info.name,
        info.area,
        info.address,
        id
      );
      db.prepare("UPDATE citizens SET area = ? WHERE booth_id = ?").run(info.area, id);
      db.prepare("UPDATE complaints SET location = ? WHERE booth_id = ?").run(info.area, id);
    }

    // Agents reference booths by FK, so the old agent roster (including any
    // agents still pointing at the two retired booths) must go before those
    // booths can be dropped.
    db.prepare("UPDATE complaints SET agent_id = NULL").run();
    db.prepare("DELETE FROM agents").run();
    db.prepare("DELETE FROM booths WHERE id IN ('RJH-DEMO-04', 'RJH-DEMO-05')").run();

    const passwordHash = bcrypt.hashSync(AGENT_PASSWORD, 10);
    const insertAgent = db.prepare(
      "INSERT INTO agents (name, phone, password_hash, booth_id, address) VALUES (?, ?, ?, ?, ?)"
    );
    for (const a of NEW_AGENTS) {
      insertAgent.run(a.name, a.phone, passwordHash, a.boothId, `${BOOTH_INFO[a.boothId].area} Area, Rajarhat`);
    }

    const getAgentForBooth = db.prepare("SELECT id FROM agents WHERE booth_id = ?");
    const setComplaintAgent = db.prepare("UPDATE complaints SET agent_id = ? WHERE id = ?");
    const complaints = db.prepare("SELECT id, booth_id FROM complaints").all() as {
      id: string;
      booth_id: string;
    }[];
    for (const c of complaints) {
      const agent = getAgentForBooth.get(c.booth_id) as { id: number } | undefined;
      if (agent) setComplaintAgent.run(agent.id, c.id);
    }
  });
  migrate();
}

export default db;
export { isNew };
