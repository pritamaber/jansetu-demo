import db from "./db";
import bcrypt from "bcryptjs";

// NOTE: seed() is intentionally non-destructive. It only inserts the fixed
// demo rows below (by their fixed id / phone / email) if they don't already
// exist, and never deletes or overwrites anything else in the database —
// so it's safe to re-run at any time without wiping real citizen
// registrations, agent status updates, or complaints created through the app.

const booths = [
  { id: "RJH-DEMO-01", name: "Rajarhat Chowmatha Booth Office", area: "Rajarhat Chowmatha", address: "Rajarhat Chowmatha, Rajarhat" },
  { id: "RJH-DEMO-02", name: "Rajarhat Complex Booth Office", area: "Rajarhat Complex", address: "Rajarhat Complex, Rajarhat" },
  { id: "RJH-DEMO-03", name: "Rajarhat Newtown Booth Office", area: "Rajarhat Newtown", address: "Rajarhat Newtown, Rajarhat" },
];

// Legacy demo citizens/complaints below were authored against a 5-booth
// layout. This maps the two retired booths onto their nearest surviving
// one so the fixed seed data still lines up with the current 3-booth roster.
const LEGACY_BOOTH_REMAP: Record<string, string> = {
  "RJH-DEMO-01": "RJH-DEMO-01",
  "RJH-DEMO-02": "RJH-DEMO-02",
  "RJH-DEMO-03": "RJH-DEMO-03",
  "RJH-DEMO-04": "RJH-DEMO-02",
  "RJH-DEMO-05": "RJH-DEMO-03",
};
function currentBoothId(legacyBoothId: string): string {
  return LEGACY_BOOTH_REMAP[legacyBoothId] || legacyBoothId;
}
function currentArea(legacyBoothId: string): string {
  return booths.find((b) => b.id === currentBoothId(legacyBoothId))!.area;
}

const mlaOffices = [
  { id: "MLA-OFFICE-01", name: "New Town Office", address: "New Town, Rajarhat" },
  { id: "MLA-OFFICE-02", name: "Rajarhat Office", address: "Beside NES School, Rajarhat" },
  { id: "MLA-OFFICE-03", name: "Salt Lake Office", address: "Salt Lake, Kolkata" },
];

const agents = [
  { name: "Rick Sonkar", phone: "9000000001", boothId: "RJH-DEMO-01", address: "Rajarhat Chowmatha Area, Rajarhat" },
  { name: "Bandana Majumdar", phone: "9000000002", boothId: "RJH-DEMO-02", address: "Rajarhat Complex Area, Rajarhat" },
  { name: "Ayan Daniyari", phone: "9000000003", boothId: "RJH-DEMO-03", address: "Rajarhat Newtown Area, Rajarhat" },
];

const citizens = [
  { name: "Sourav Mondal", phone: "9800000001", area: "Rajarhat Gopalpur", boothId: "RJH-DEMO-01" },
  { name: "Priyanka Das", phone: "9800000002", area: "Hatiara", boothId: "RJH-DEMO-02" },
  { name: "Abhishek Roy", phone: "9800000003", area: "Chinar Park", boothId: "RJH-DEMO-03" },
  { name: "Moumita Chakraborty", phone: "9800000004", area: "Jyangra", boothId: "RJH-DEMO-04" },
  { name: "Rohit Sharma", phone: "9800000005", area: "Teghoria", boothId: "RJH-DEMO-05" },
  { name: "Ananya Dutta", phone: "9800000006", area: "Rajarhat", boothId: "RJH-DEMO-01" },
  { name: "Sayan Ghosh", phone: "9800000007", area: "Hatiara", boothId: "RJH-DEMO-02" },
  { name: "Riya Mukherjee", phone: "9800000008", area: "Chinar Park", boothId: "RJH-DEMO-03" },
  { name: "Debasish Paul", phone: "9800000009", area: "Jyangra", boothId: "RJH-DEMO-04" },
  { name: "Aniket Das", phone: "9800000010", area: "Teghoria", boothId: "RJH-DEMO-05" },
  // demo citizen used for the presentation flow's Step 1 login
  { name: "Demo Citizen", phone: "9000000000", area: "Rajarhat Gopalpur", boothId: "RJH-DEMO-01" },
  // extra citizens to pad out support counts realistically
  { name: "Tanmoy Basak", phone: "9800000011", area: "Rajarhat Gopalpur", boothId: "RJH-DEMO-01" },
  { name: "Ipsita Saha", phone: "9800000012", area: "Hatiara", boothId: "RJH-DEMO-02" },
  { name: "Kunal Biswas", phone: "9800000013", area: "Chinar Park", boothId: "RJH-DEMO-03" },
  { name: "Sneha Adhikari", phone: "9800000014", area: "Jyangra", boothId: "RJH-DEMO-04" },
  { name: "Partha Sarkar", phone: "9800000015", area: "Teghoria", boothId: "RJH-DEMO-05" },
];

type ComplaintSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  boothId: string;
  agentPhone: string;
  citizenPhone: string;
  status: string;
  priority: string;
  supporterPhones: string[];
};

const complaints: ComplaintSeed[] = [
  {
    id: "RJH-2026-001",
    title: "Street lights not working near Rajarhat Main Road",
    description:
      "Several street lights near Rajarhat Main Road have not been functioning for the last few days. The road becomes very dark during the evening and creates difficulty for pedestrians and local residents.",
    category: "Street Light",
    location: "Rajarhat Gopalpur",
    boothId: "RJH-DEMO-01",
    agentPhone: "9000001001",
    citizenPhone: "9800000001",
    status: "In Progress",
    priority: "High",
    supporterPhones: ["9800000001", "9800000006", "9000000000", "9800000011", "9800000002", "9800000003", "9800000004", "9800000005", "9800000007", "9800000008"],
  },
  {
    id: "RJH-2026-002",
    title: "Water logging after rainfall in Hatiara",
    description:
      "Water accumulates on the local road after moderate rainfall, making it difficult for residents and vehicles to move through the area.",
    category: "Water Logging",
    location: "Hatiara",
    boothId: "RJH-DEMO-02",
    agentPhone: "9000001002",
    citizenPhone: "9800000002",
    status: "Under Review",
    priority: "High",
    supporterPhones: ["9800000002", "9800000007", "9800000012", "9800000001", "9800000003", "9800000004", "9800000005"],
  },
  {
    id: "RJH-2026-003",
    title: "Damaged road near Chinar Park residential area",
    description:
      "A portion of the local road has developed multiple potholes and damaged surfaces. Residents are facing difficulties, especially during rain.",
    category: "Road Damage",
    location: "Chinar Park",
    boothId: "RJH-DEMO-03",
    agentPhone: "9000001003",
    citizenPhone: "9800000003",
    status: "Assigned",
    priority: "Medium",
    supporterPhones: ["9800000003", "9800000008", "9800000013", "9800000001", "9800000002"],
  },
  {
    id: "RJH-2026-004",
    title: "Drainage overflow in Jyangra locality",
    description:
      "Drains in the Jyangra locality are overflowing, causing waste water to spill onto the road and creating an unhygienic environment for nearby residents.",
    category: "Drainage",
    location: "Jyangra",
    boothId: "RJH-DEMO-04",
    agentPhone: "9000001004",
    citizenPhone: "9800000004",
    status: "In Progress",
    priority: "High",
    supporterPhones: ["9800000004", "9800000009", "9800000014", "9800000001", "9800000002", "9800000003", "9800000005", "9800000006", "9800000007", "9800000008", "9800000010", "9800000011"],
  },
  {
    id: "RJH-2026-005",
    title: "Irregular drinking water supply in Teghoria",
    description:
      "Residents of Teghoria are experiencing irregular and insufficient drinking water supply over the past week, affecting daily household needs.",
    category: "Drinking Water",
    location: "Teghoria",
    boothId: "RJH-DEMO-05",
    agentPhone: "9000001005",
    citizenPhone: "9800000005",
    status: "Under Review",
    priority: "High",
    supporterPhones: ["9800000005", "9800000010", "9800000015", "9800000001", "9800000002", "9800000003", "9800000004", "9800000006"],
  },
  // Rajarhat Gopalpur extras
  {
    id: "RJH-2026-006",
    title: "Broken street light near local market",
    description: "The street light near the Rajarhat Gopalpur local market has been broken for over a week, making the market area unsafe after dark.",
    category: "Street Light",
    location: "Rajarhat Gopalpur",
    boothId: "RJH-DEMO-01",
    agentPhone: "9000001001",
    citizenPhone: "9800000006",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000006", "9800000011", "9800000001", "9000000000"],
  },
  {
    id: "RJH-2026-007",
    title: "Garbage collection delay near Rajarhat market",
    description: "Garbage has not been collected from the Rajarhat Gopalpur market area for several days, leading to a buildup of waste.",
    category: "Sanitation",
    location: "Rajarhat Gopalpur",
    boothId: "RJH-DEMO-01",
    agentPhone: "9000001001",
    citizenPhone: "9800000011",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000011", "9800000001", "9800000006", "9000000000"],
  },
  {
    id: "RJH-2026-008",
    title: "Water logging near residential lane",
    description: "A residential lane in Rajarhat Gopalpur floods regularly after rainfall due to poor drainage, affecting households nearby.",
    category: "Water Logging",
    location: "Rajarhat Gopalpur",
    boothId: "RJH-DEMO-01",
    agentPhone: "9000001001",
    citizenPhone: "9000000000",
    status: "Under Review",
    priority: "Medium",
    supporterPhones: ["9000000000", "9800000001", "9800000006", "9800000011", "9800000002", "9800000003"],
  },
  {
    id: "RJH-2026-009",
    title: "Request for medical assistance camp in Rajarhat Gopalpur",
    description: "Residents have requested a local medical assistance camp to be organized in Rajarhat Gopalpur for basic health checkups.",
    category: "Medical Assistance",
    location: "Rajarhat Gopalpur",
    boothId: "RJH-DEMO-01",
    agentPhone: "9000001001",
    citizenPhone: "9800000001",
    status: "Resolved",
    priority: "Low",
    supporterPhones: ["9800000001", "9800000006"],
  },
  // Hatiara extras
  {
    id: "RJH-2026-010",
    title: "Road drainage blockage near Hatiara Main Road",
    description: "A blocked drainage channel near Hatiara Main Road is causing waste water to stagnate on the roadside.",
    category: "Drainage",
    location: "Hatiara",
    boothId: "RJH-DEMO-02",
    agentPhone: "9000001002",
    citizenPhone: "9800000007",
    status: "In Progress",
    priority: "Medium",
    supporterPhones: ["9800000007", "9800000002", "9800000012"],
  },
  {
    id: "RJH-2026-011",
    title: "Water logging in Hatiara residential block",
    description: "A residential block in Hatiara experiences persistent water logging after even light rainfall.",
    category: "Water Logging",
    location: "Hatiara",
    boothId: "RJH-DEMO-02",
    agentPhone: "9000001002",
    citizenPhone: "9800000012",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000012", "9800000002", "9800000007"],
  },
  {
    id: "RJH-2026-012",
    title: "Electricity supply issue in Hatiara",
    description: "Frequent power cuts have been reported in the Hatiara area over the past two weeks, affecting daily life.",
    category: "Electricity",
    location: "Hatiara",
    boothId: "RJH-DEMO-02",
    agentPhone: "9000001002",
    citizenPhone: "9800000002",
    status: "Assigned",
    priority: "High",
    supporterPhones: ["9800000002", "9800000007", "9800000012", "9800000001"],
  },
  {
    id: "RJH-2026-013",
    title: "Street sanitation issue near Hatiara market",
    description: "Poor sanitation conditions have been reported near the Hatiara local market, with waste accumulating on the roadside.",
    category: "Sanitation",
    location: "Hatiara",
    boothId: "RJH-DEMO-02",
    agentPhone: "9000001002",
    citizenPhone: "9800000007",
    status: "Resolved",
    priority: "Low",
    supporterPhones: ["9800000007", "9800000012"],
  },
  // Chinar Park extras
  {
    id: "RJH-2026-014",
    title: "Damaged footpath near Chinar Park Crossing",
    description: "The footpath near Chinar Park Crossing has broken tiles and uneven surfaces, posing a risk to pedestrians.",
    category: "Footpath",
    location: "Chinar Park",
    boothId: "RJH-DEMO-03",
    agentPhone: "9000001003",
    citizenPhone: "9800000008",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000008", "9800000003", "9800000013"],
  },
  {
    id: "RJH-2026-015",
    title: "Road potholes near Chinar Park residential lane",
    description: "Multiple potholes have formed on a residential lane in Chinar Park, causing inconvenience to commuters.",
    category: "Road Damage",
    location: "Chinar Park",
    boothId: "RJH-DEMO-03",
    agentPhone: "9000001003",
    citizenPhone: "9800000013",
    status: "In Progress",
    priority: "Medium",
    supporterPhones: ["9800000013", "9800000003", "9800000008"],
  },
  {
    id: "RJH-2026-016",
    title: "Garbage accumulation near Chinar Park",
    description: "Garbage has been accumulating at a collection point near Chinar Park for several days without pickup.",
    category: "Sanitation",
    location: "Chinar Park",
    boothId: "RJH-DEMO-03",
    agentPhone: "9000001003",
    citizenPhone: "9800000003",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000003", "9800000008", "9800000013"],
  },
  {
    id: "RJH-2026-017",
    title: "Traffic congestion suggestion near Chinar Park crossing",
    description: "Residents have suggested adding a traffic signal near the Chinar Park crossing to ease regular congestion.",
    category: "Civic Suggestion",
    location: "Chinar Park",
    boothId: "RJH-DEMO-03",
    agentPhone: "9000001003",
    citizenPhone: "9800000008",
    status: "Under Review",
    priority: "Low",
    supporterPhones: ["9800000008", "9800000003"],
  },
  // Jyangra extras
  {
    id: "RJH-2026-018",
    title: "Street light problem near Jyangra Main Road",
    description: "Several stretches along Jyangra Main Road remain unlit at night due to non-functional street lights.",
    category: "Street Light",
    location: "Jyangra",
    boothId: "RJH-DEMO-04",
    agentPhone: "9000001004",
    citizenPhone: "9800000009",
    status: "Assigned",
    priority: "Medium",
    supporterPhones: ["9800000009", "9800000004", "9800000014"],
  },
  {
    id: "RJH-2026-019",
    title: "Road repair request in Jyangra locality",
    description: "Residents have requested repair of a damaged stretch of road in the Jyangra locality.",
    category: "Road Damage",
    location: "Jyangra",
    boothId: "RJH-DEMO-04",
    agentPhone: "9000001004",
    citizenPhone: "9800000014",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000014", "9800000004", "9800000009"],
  },
  // Teghoria extras
  {
    id: "RJH-2026-020",
    title: "Electricity complaint in Teghoria",
    description: "Voltage fluctuations and frequent outages have been reported in the Teghoria area, affecting household appliances.",
    category: "Electricity",
    location: "Teghoria",
    boothId: "RJH-DEMO-05",
    agentPhone: "9000001005",
    citizenPhone: "9800000010",
    status: "In Progress",
    priority: "High",
    supporterPhones: ["9800000010", "9800000005", "9800000015"],
  },
  {
    id: "RJH-2026-021",
    title: "Road damage near Teghoria Main Road",
    description: "A section of Teghoria Main Road has developed cracks and potholes, especially after recent rainfall.",
    category: "Road Damage",
    location: "Teghoria",
    boothId: "RJH-DEMO-05",
    agentPhone: "9000001005",
    citizenPhone: "9800000015",
    status: "Submitted",
    priority: "Medium",
    supporterPhones: ["9800000015", "9800000005", "9800000010"],
  },
  {
    id: "RJH-2026-022",
    title: "Legal assistance request for land documentation in Teghoria",
    description: "A resident has requested guidance on legal assistance available for local land documentation queries.",
    category: "Legal Assistance",
    location: "Teghoria",
    boothId: "RJH-DEMO-05",
    agentPhone: "9000001005",
    citizenPhone: "9800000005",
    status: "Under Review",
    priority: "Low",
    supporterPhones: ["9800000005", "9800000010"],
  },
];

export function seed() {
  // Booths and the admin account are static reference data — safe to upsert
  // (insert if missing, refresh fields if the fixed record already exists).
  const upsertBooth = db.prepare(`
    INSERT INTO booths (id, name, area, address) VALUES (@id, @name, @area, @address)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, area = excluded.area, address = excluded.address
  `);
  for (const b of booths) upsertBooth.run(b);

  const upsertOffice = db.prepare(`
    INSERT INTO mla_offices (id, name, address) VALUES (@id, @name, @address)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, address = excluded.address
  `);
  for (const o of mlaOffices) upsertOffice.run(o);

  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash, role = excluded.role`
  ).run("Pritam", "pritam.aber@gmail.com", adminPasswordHash, "master_admin");

  const agentPasswordHash = bcrypt.hashSync("agent123", 10);
  const upsertAgent = db.prepare(`
    INSERT INTO agents (name, phone, password_hash, booth_id, address)
    VALUES (@name, @phone, @password_hash, @boothId, @address)
    ON CONFLICT(phone) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash,
      booth_id = excluded.booth_id, address = excluded.address
  `);
  for (const a of agents) {
    upsertAgent.run({ ...a, password_hash: agentPasswordHash });
  }

  // Demo citizens and complaints are only inserted if they don't already
  // exist (by phone / id). Real citizens registered through the app, and
  // any status changes agents/admins make to demo complaints, are never
  // touched or reset.
  const insertCitizenIfMissing = db.prepare(
    "INSERT OR IGNORE INTO citizens (name, phone, address, area, booth_id) VALUES (@name, @phone, @address, @area, @boothId)"
  );
  let citizensInserted = 0;
  for (const c of citizens) {
    const boothId = currentBoothId(c.boothId);
    const area = currentArea(c.boothId);
    const result = insertCitizenIfMissing.run({
      name: c.name,
      phone: c.phone,
      area,
      boothId,
      address: `${area}, Rajarhat, New Town`,
    });
    if (result.changes > 0) citizensInserted++;
  }

  const getAgentByBooth = db.prepare("SELECT id FROM agents WHERE booth_id = ?");
  const getCitizenByPhone = db.prepare("SELECT id FROM citizens WHERE phone = ?");

  const insertComplaintIfMissing = db.prepare(`
    INSERT OR IGNORE INTO complaints (id, title, description, category, location, booth_id, citizen_id, agent_id, status, priority)
    VALUES (@id, @title, @description, @category, @location, @boothId, @citizenId, @agentId, @status, @priority)
  `);
  const insertSupporter = db.prepare(
    "INSERT OR IGNORE INTO complaint_supporters (complaint_id, citizen_id) VALUES (?, ?)"
  );
  const insertHistory = db.prepare(
    "INSERT INTO complaint_status_history (complaint_id, status, note, actor) VALUES (?, ?, ?, ?)"
  );

  let complaintsInserted = 0;
  for (const c of complaints) {
    const boothId = currentBoothId(c.boothId);
    const location = currentArea(c.boothId);
    const agent = getAgentByBooth.get(boothId) as { id: number } | undefined;
    const citizen = getCitizenByPhone.get(c.citizenPhone) as { id: number } | undefined;
    if (!citizen) continue;

    const result = insertComplaintIfMissing.run({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      location,
      boothId,
      citizenId: citizen.id,
      agentId: agent ? agent.id : null,
      status: c.status,
      priority: c.priority,
    });
    // Only seed supporters/history for complaints that were actually newly
    // inserted this run — an existing complaint keeps whatever state it's
    // in (e.g. an agent already resolved it).
    if (result.changes === 0) continue;
    complaintsInserted++;

    for (const phone of c.supporterPhones) {
      const supporter = getCitizenByPhone.get(phone) as { id: number } | undefined;
      if (supporter) insertSupporter.run(c.id, supporter.id);
    }

    insertHistory.run(c.id, "Submitted", "Complaint submitted by citizen.", "System");
    if (c.status !== "Submitted") {
      insertHistory.run(c.id, c.status, "Status updated during demo seeding.", "System");
    }
  }

  console.log("Seed complete (non-destructive — existing data was left untouched):");
  console.log(`  Booths upserted: ${booths.length}`);
  console.log(`  MLA offices upserted: ${mlaOffices.length}`);
  console.log(`  Agents upserted: ${agents.length}`);
  console.log(`  New demo citizens inserted: ${citizensInserted} (of ${citizens.length} fixed demo citizens)`);
  console.log(`  New demo complaints inserted: ${complaintsInserted} (of ${complaints.length} fixed demo complaints)`);
}

if (require.main === module) {
  seed();
}
