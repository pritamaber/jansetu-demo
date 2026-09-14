# Jansetu Demo — Rajarhat / New Town Civic Complaint Platform

A **demo-only** civic complaint platform connecting citizens, local booth agents, and a
master admin, seeded with fictional data set around Rajarhat–New Town, West Bengal.

> ⚠️ This is a demonstration environment. All names, phone numbers, booth offices, and
> complaints are fictional and created for demo purposes only.

## Getting Started

```bash
npm install
npm run seed   # creates data/jansetu.db and seeds all demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run seed` is **non-destructive** — it only inserts the fixed demo booths, agents,
admin, and the original demo citizens/complaints if they're missing. It never deletes or
resets anything, so real citizen registrations and any status changes made through the app
are always safe to keep running it.

## Demo Credentials

| Role | Login | Password / OTP |
|---|---|---|
| Citizen | Any 10-digit number (e.g. `9000000000`) | OTP: `123456` |
| Booth Agent (Rick Sonkar — Rajarhat Chowmatha) | `9000000001` | `agent123` |
| Booth Agent (Bandana Majumdar — Rajarhat Complex) | `9000000002` | `agent123` |
| Booth Agent (Ayan Daniyari — Rajarhat Newtown) | `9000000003` | `agent123` |
| Master Admin | `pritam.aber@gmail.com` | `admin123` |

## Demo Flow

1. Login as citizen `9000000000`, OTP `123456`.
2. View citizen dashboard, click **Report Problem**.
3. Submit "Street light not working" in Rajarhat Chowmatha — the app detects the existing
   similar complaint `RJH-2026-001` and lets you **Support This Issue** (supporter count
   increases).
4. Logout, login as agent Rick Sonkar (`9000000001` / `agent123`) — only Rajarhat Chowmatha
   complaints are visible. Attempting to open another booth's complaint shows **Access
   Denied**.
5. Update `RJH-2026-001`'s status and add a public update note — visible to the citizen.
6. Logout, login as Master Admin (`pritam.aber@gmail.com` / `admin123`) — see all
   complaints, agents, booths, citizens, stats, most-reported issues, and reassign
   complaints to a different agent.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via `better-sqlite3` (file at `data/jansetu.db`, gitignored)
- Cookie-based sessions (HMAC-signed, demo-grade — not for production use)
- Server Actions for all mutations (login, complaint submission, support, status updates,
  reassignment)
