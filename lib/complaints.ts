import db from "./db";

export type Complaint = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  booth_id: string;
  citizen_id: number;
  agent_id: number | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

export type ComplaintWithJoins = Complaint & {
  booth_name: string;
  citizen_name: string;
  agent_name: string | null;
  supporter_count: number;
  // First uploaded photo, for thumbnails — use getComplaintImages() for the full set.
  image_path: string | null;
  image_count: number;
};

const BASE_SELECT = `
  SELECT
    c.id, c.title, c.description, c.category, c.location, c.booth_id, c.citizen_id,
    c.agent_id, c.status, c.priority, c.created_at, c.updated_at,
    b.name AS booth_name,
    ci.name AS citizen_name,
    a.name AS agent_name,
    (SELECT COUNT(*) FROM complaint_supporters s WHERE s.complaint_id = c.id) AS supporter_count,
    (SELECT image_path FROM complaint_images i WHERE i.complaint_id = c.id ORDER BY i.id ASC LIMIT 1) AS image_path,
    (SELECT COUNT(*) FROM complaint_images i WHERE i.complaint_id = c.id) AS image_count
  FROM complaints c
  JOIN booths b ON b.id = c.booth_id
  JOIN citizens ci ON ci.id = c.citizen_id
  LEFT JOIN agents a ON a.id = c.agent_id
`;

export function getAllComplaints(): ComplaintWithJoins[] {
  return db.prepare(`${BASE_SELECT} ORDER BY c.created_at DESC`).all() as ComplaintWithJoins[];
}

export function getComplaintsByBooth(boothId: string): ComplaintWithJoins[] {
  return db
    .prepare(`${BASE_SELECT} WHERE c.booth_id = ? ORDER BY c.created_at DESC`)
    .all(boothId) as ComplaintWithJoins[];
}

export function getComplaintsByCitizen(citizenId: number): ComplaintWithJoins[] {
  return db
    .prepare(`${BASE_SELECT} WHERE c.citizen_id = ? ORDER BY c.created_at DESC`)
    .all(citizenId) as ComplaintWithJoins[];
}

export function getComplaintById(id: string): ComplaintWithJoins | undefined {
  return db.prepare(`${BASE_SELECT} WHERE c.id = ?`).get(id) as ComplaintWithJoins | undefined;
}

export function getSupporters(complaintId: string) {
  return db
    .prepare(
      `SELECT ci.id, ci.name FROM complaint_supporters s JOIN citizens ci ON ci.id = s.citizen_id WHERE s.complaint_id = ? ORDER BY s.created_at ASC`
    )
    .all(complaintId) as { id: number; name: string }[];
}

export function isSupporter(complaintId: string, citizenId: number): boolean {
  const row = db
    .prepare("SELECT 1 FROM complaint_supporters WHERE complaint_id = ? AND citizen_id = ?")
    .get(complaintId, citizenId);
  return !!row;
}

export function getComplaintImages(complaintId: string): string[] {
  return (
    db
      .prepare("SELECT image_path FROM complaint_images WHERE complaint_id = ? ORDER BY id ASC")
      .all(complaintId) as { image_path: string }[]
  ).map((r) => r.image_path);
}

export function getStatusHistory(complaintId: string) {
  return db
    .prepare(
      "SELECT * FROM complaint_status_history WHERE complaint_id = ? ORDER BY created_at ASC, id ASC"
    )
    .all(complaintId) as { id: number; status: string; note: string | null; actor: string | null; created_at: string }[];
}

// Simple similarity heuristic for duplicate detection: same booth + category,
// or significant keyword overlap in the title, within the same location.
export function findSimilarComplaints(
  title: string,
  category: string,
  boothId: string
): ComplaintWithJoins[] {
  const candidates = getComplaintsByBooth(boothId).filter((c) => c.category === category);
  if (candidates.length > 0) return candidates.slice(0, 5);

  const titleWords = new Set(
    title
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );
  if (titleWords.size === 0) return [];

  const all = getComplaintsByBooth(boothId);
  const scored = all
    .map((c) => {
      const otherWords = new Set(
        c.title
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 3)
      );
      let overlap = 0;
      for (const w of titleWords) if (otherWords.has(w)) overlap++;
      return { c, overlap };
    })
    .filter((x) => x.overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.map((x) => x.c).slice(0, 5);
}

function nextComplaintId(): string {
  const year = new Date().getFullYear();
  const row = db
    .prepare("SELECT id FROM complaints WHERE id LIKE ? ORDER BY id DESC LIMIT 1")
    .get(`RJH-${year}-%`) as { id: string } | undefined;
  let next = 1;
  if (row) {
    const parts = row.id.split("-");
    next = parseInt(parts[2], 10) + 1;
  }
  return `RJH-${year}-${String(next).padStart(3, "0")}`;
}

export function createComplaint(input: {
  title: string;
  description: string;
  category: string;
  location: string;
  boothId: string;
  citizenId: number;
  priority: string;
  imagePaths: string[];
}): string {
  const id = nextComplaintId();
  const agent = db
    .prepare("SELECT id FROM agents WHERE booth_id = ? LIMIT 1")
    .get(input.boothId) as { id: number } | undefined;

  db.prepare(
    `INSERT INTO complaints (id, title, description, category, location, booth_id, citizen_id, agent_id, status, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)`
  ).run(
    id,
    input.title,
    input.description,
    input.category,
    input.location,
    input.boothId,
    input.citizenId,
    agent ? agent.id : null,
    input.priority
  );

  const insertImage = db.prepare(
    "INSERT INTO complaint_images (complaint_id, image_path) VALUES (?, ?)"
  );
  for (const imagePath of input.imagePaths) {
    insertImage.run(id, imagePath);
  }

  db.prepare(
    "INSERT INTO complaint_status_history (complaint_id, status, note, actor) VALUES (?, 'Submitted', 'Complaint submitted by citizen.', 'Citizen')"
  ).run(id);

  // The submitting citizen automatically supports their own complaint.
  db.prepare(
    "INSERT OR IGNORE INTO complaint_supporters (complaint_id, citizen_id) VALUES (?, ?)"
  ).run(id, input.citizenId);

  return id;
}

export function supportComplaint(complaintId: string, citizenId: number) {
  db.prepare(
    "INSERT OR IGNORE INTO complaint_supporters (complaint_id, citizen_id) VALUES (?, ?)"
  ).run(complaintId, citizenId);
}

export function updateComplaintStatus(
  complaintId: string,
  status: string,
  note: string | undefined,
  actor: string
) {
  db.prepare("UPDATE complaints SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    complaintId
  );
  db.prepare(
    "INSERT INTO complaint_status_history (complaint_id, status, note, actor) VALUES (?, ?, ?, ?)"
  ).run(complaintId, status, note || null, actor);
}

export function reassignComplaint(complaintId: string, agentId: number) {
  db.prepare("UPDATE complaints SET agent_id = ?, updated_at = datetime('now') WHERE id = ?").run(
    agentId,
    complaintId
  );
}

export function getStats() {
  const totalCitizens = (db.prepare("SELECT COUNT(*) c FROM citizens").get() as { c: number }).c;
  const totalAgents = (db.prepare("SELECT COUNT(*) c FROM agents").get() as { c: number }).c;
  const totalBooths = (db.prepare("SELECT COUNT(*) c FROM booths").get() as { c: number }).c;
  const totalIssues = (db.prepare("SELECT COUNT(*) c FROM complaints").get() as { c: number }).c;
  const newIssues = (
    db.prepare("SELECT COUNT(*) c FROM complaints WHERE status = 'Submitted'").get() as {
      c: number;
    }
  ).c;
  const inProgress = (
    db
      .prepare("SELECT COUNT(*) c FROM complaints WHERE status IN ('In Progress','Assigned','Under Review')")
      .get() as { c: number }
  ).c;
  const resolved = (
    db.prepare("SELECT COUNT(*) c FROM complaints WHERE status = 'Resolved'").get() as {
      c: number;
    }
  ).c;
  const highPriority = (
    db.prepare("SELECT COUNT(*) c FROM complaints WHERE priority = 'High'").get() as {
      c: number;
    }
  ).c;

  const mostReported = db
    .prepare(
      `SELECT c.id, c.title, (SELECT COUNT(*) FROM complaint_supporters s WHERE s.complaint_id = c.id) AS supporter_count
       FROM complaints c ORDER BY supporter_count DESC LIMIT 5`
    )
    .all() as { id: string; title: string; supporter_count: number }[];

  return {
    totalCitizens,
    totalAgents,
    totalBooths,
    totalIssues,
    newIssues,
    inProgress,
    resolved,
    highPriority,
    mostReported,
  };
}
