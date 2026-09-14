Update the application demo data to use realistic fictional data based around Rajarhat–New Town, West Bengal.

IMPORTANT:
This is a DEMO environment only.

Use clearly fictional/demo phone numbers where possible. Do not imply that the dummy agents or citizens are real people unless explicitly provided.

==================================================
MASTER ADMIN
============

Create exactly one Master Admin account.

Name:
Pritam

Email:
[pritam.aber@gmail.com](mailto:pritam.aber@gmail.com)

Role:
master_admin

Password for Demo:
admin123

The Master Admin should have access to:

- All complaints
- All citizens
- All booth agents
- All booths
- Complaint assignments
- Complaint status
- Complaint search
- Complaint statistics
- Agent management
- Booth management

Admin login should support:

Email:
[pritam.aber@gmail.com](mailto:pritam.aber@gmail.com)

Password:
admin123

==================================================
DEMO CITIZEN LOGIN
==================

For demo purposes:

Citizen login should use:

Phone Number:
Any valid-looking Indian mobile number

Demo OTP:
123456

Do not send a real OTP.

After entering the dummy OTP, allow the user to login.

For first-time login:

Ask for:

- Full Name
- Phone Number
- Address
- Panchayat / Area
- Booth Office

For the demo, seed a few existing citizens so the complaint system already contains realistic data.

==================================================
RAJARHAT / NEW TOWN DEMO LOCATIONS
==================================

Use realistic Rajarhat-area locations for the demo.

Example areas:

- Rajarhat Gopalpur
- Chinar Park
- Teghoria
- Baguiati
- Hatiara
- Jyangra
- Narayanpur
- Kaikhali
- New Town Action Area I
- New Town Action Area II
- New Town Action Area III

Use a limited number of locations so the demo remains simple and easy to understand.

==================================================
DUMMY BOOTH OFFICES
===================

Create the following fictional demo booth offices.

IMPORTANT:
These are demo booth records inspired by Rajarhat-area locations and should not claim to represent official election booth numbers or official government offices.

1.

Booth ID:
RJH-DEMO-01

Booth Name:
Rajarhat Gopalpur Booth Office

Area:
Rajarhat Gopalpur

Demo Address:
Near Rajarhat Main Road, Rajarhat

2.

Booth ID:
RJH-DEMO-02

Booth Name:
Hatiara Local Booth Office

Area:
Hatiara

Demo Address:
Hatiara Main Road, Rajarhat

3.

Booth ID:
RJH-DEMO-03

Booth Name:
Chinar Park Booth Office

Area:
Chinar Park

Demo Address:
Near Chinar Park Crossing, Rajarhat

4.

Booth ID:
RJH-DEMO-04

Booth Name:
Jyangra Local Booth Office

Area:
Jyangra

Demo Address:
Jyangra Main Road, Rajarhat

5.

Booth ID:
RJH-DEMO-05

Booth Name:
Teghoria Booth Office

Area:
Teghoria

Demo Address:
Teghoria Main Road, Rajarhat

==================================================
DUMMY BOOTH AGENTS
==================

Create the following demo booth agents.

These names should appear throughout the application as the local agents responsible for their assigned booth.

---

AGENT 1

Name:
Rick Sonkar

Demo Phone:
9000001001

Password:
agent123

Assigned Booth:
RJH-DEMO-01

Booth:
Rajarhat Gopalpur Booth Office

Area:
Rajarhat Gopalpur

Demo Address:
Rajarhat Area, Kolkata

Role:
Booth Agent

---

AGENT 2

Name:
Ayan Daniary

Demo Phone:
9000001002

Password:
agent123

Assigned Booth:
RJH-DEMO-02

Booth:
Hatiara Local Booth Office

Area:
Hatiara

Demo Address:
Hatiara Area, Rajarhat

Role:
Booth Agent

---

AGENT 3

Name:
Bandan Majumdar

Demo Phone:
9000001003

Password:
agent123

Assigned Booth:
RJH-DEMO-03

Booth:
Chinar Park Booth Office

Area:
Chinar Park

Demo Address:
Chinar Park Area, Rajarhat

Role:
Booth Agent

---

AGENT 4

Name:
Arindam Das

Demo Phone:
9000001004

Password:
agent123

Assigned Booth:
RJH-DEMO-04

Booth:
Jyangra Local Booth Office

Area:
Jyangra

Role:
Booth Agent

---

AGENT 5

Name:
Suman Dutta

Demo Phone:
9000001005

Password:
agent123

Assigned Booth:
RJH-DEMO-05

Booth:
Teghoria Booth Office

Area:
Teghoria

Role:
Booth Agent

==================================================
AGENT LOGIN FLOW
================

Create a separate agent login.

Agent enters:

Phone Number

Password

Example demo login:

Rick Sonkar

Phone:
9000001001

Password:
agent123

After login:

Rick Sonkar should ONLY see complaints assigned to:

Rajarhat Gopalpur Booth Office.

Similarly:

Ayan Daniary should ONLY see:

Hatiara Local Booth Office complaints.

Bandan Majumdar should ONLY see:

Chinar Park Booth Office complaints.

IMPORTANT:

Agents must not be able to access complaints assigned to another booth.

Attempting to manually access another complaint URL should redirect them or show:

"Access Denied"

==================================================
DUMMY CITIZENS
==============

Create around 10 realistic fictional demo citizens.

Example data:

1.

Name:
Sourav Mondal

Area:
Rajarhat Gopalpur

Assigned Booth:
RJH-DEMO-01

Complaint History:
Street light problem

2.

Name:
Priyanka Das

Area:
Hatiara

Assigned Booth:
RJH-DEMO-02

Complaint History:
Water logging

3.

Name:
Abhishek Roy

Area:
Chinar Park

Assigned Booth:
RJH-DEMO-03

Complaint History:
Road damage

4.

Name:
Moumita Chakraborty

Area:
Jyangra

Assigned Booth:
RJH-DEMO-04

Complaint History:
Drainage issue

5.

Name:
Rohit Sharma

Area:
Teghoria

Assigned Booth:
RJH-DEMO-05

Complaint History:
Drinking water problem

6.

Name:
Ananya Dutta

Area:
Rajarhat

Assigned Booth:
RJH-DEMO-01

Complaint History:
Street light issue

7.

Name:
Sayan Ghosh

Area:
Hatiara

Assigned Booth:
RJH-DEMO-02

Complaint History:
Garbage collection

8.

Name:
Riya Mukherjee

Area:
Chinar Park

Assigned Booth:
RJH-DEMO-03

Complaint History:
Water logging

9.

Name:
Debasish Paul

Area:
Jyangra

Assigned Booth:
RJH-DEMO-04

Complaint History:
Road damage

10.

Name:
Aniket Das

Area:
Teghoria

Assigned Booth:
RJH-DEMO-05

Complaint History:
Electricity problem

Assign realistic dummy Indian mobile numbers to every demo citizen.

Do not use the same number twice.

==================================================
REALISTIC DUMMY COMPLAINTS
==========================

Create approximately 20 realistic complaints.

Distribute them across all five booth areas.

IMPORTANT:

Create multiple complaints that demonstrate the duplicate/support feature.

Example:

==================================================
COMPLAINT GROUP 1
=================

Complaint ID:
RJH-2026-001

Title:
Street lights not working near Rajarhat Main Road

Category:
Street Light

Location:
Rajarhat Gopalpur

Booth:
RJH-DEMO-01

Status:
In Progress

Priority:
High

Assigned Agent:
Rick Sonkar

Description:

Several street lights near Rajarhat Main Road have not been functioning for the last few days. The road becomes very dark during the evening and creates difficulty for pedestrians and local residents.

Supported By:

Sourav Mondal

Ananya Dutta

Additional 8 Demo Citizens

Total Supporters:
10

==================================================
COMPLAINT GROUP 2
=================

Complaint ID:
RJH-2026-002

Title:
Water logging after rainfall in Hatiara

Category:
Water Logging

Location:
Hatiara

Booth:
RJH-DEMO-02

Status:
Under Review

Priority:
High

Assigned Agent:
Ayan Daniary

Description:

Water accumulates on the local road after moderate rainfall, making it difficult for residents and vehicles to move through the area.

Support Count:
7

==================================================
COMPLAINT GROUP 3
=================

Complaint ID:
RJH-2026-003

Title:
Damaged road near Chinar Park residential area

Category:
Road Damage

Location:
Chinar Park

Booth:
RJH-DEMO-03

Status:
Assigned

Priority:
Medium

Assigned Agent:
Bandan Majumdar

Description:

A portion of the local road has developed multiple potholes and damaged surfaces. Residents are facing difficulties, especially during rain.

Support Count:
5

==================================================
COMPLAINT GROUP 4
=================

Complaint ID:
RJH-2026-004

Title:
Drainage overflow in Jyangra locality

Category:
Drainage

Location:
Jyangra

Booth:
RJH-DEMO-04

Status:
In Progress

Priority:
High

Assigned Agent:
Arindam Das

Support Count:
12

==================================================
COMPLAINT GROUP 5
=================

Complaint ID:
RJH-2026-005

Title:
Irregular drinking water supply in Teghoria

Category:
Drinking Water

Location:
Teghoria

Booth:
RJH-DEMO-05

Status:
Under Review

Priority:
High

Assigned Agent:
Suman Dutta

Support Count:
8

==================================================
ADD MORE COMPLAINTS
===================

Create additional realistic complaints including:

Rajarhat Gopalpur:

- Broken street light near local market
- Garbage collection delay
- Water logging near residential lane
- Request for medical assistance

Hatiara:

- Road drainage blockage
- Water logging
- Electricity supply issue
- Street sanitation issue

Chinar Park:

- Damaged footpath
- Road potholes
- Garbage accumulation
- Traffic / civic suggestion

Jyangra:

- Drainage overflow
- Street light problem
- Road repair request

Teghoria:

- Drinking water supply issue
- Electricity complaint
- Road damage
- Legal assistance request

==================================================
AGENT DASHBOARD DATA
====================

Make sure every agent logs into a dashboard with meaningful data.

Example:

---

## RICK SONKAR DASHBOARD

Show:

Welcome, Rick Sonkar

Assigned Area:
Rajarhat Gopalpur

Statistics:

New Complaints:
3

In Progress:
4

Resolved:
2

High Priority:
2

Recent Complaints:

1.

RJH-2026-001

Street lights not working near Rajarhat Main Road

Status:
In Progress

Supporters:
10

2.

Garbage collection delay near Rajarhat market

Status:
Submitted

Supporters:
4

3.

Water logging near residential lane

Status:
Under Review

Supporters:
6

---

## AYAN DANIARY DASHBOARD

Show:

Welcome, Ayan Daniary

Assigned Area:
Hatiara

Show only Hatiara complaints.

Include:

Water logging

Drainage

Electricity

Sanitation issues.

---

## BANDAN MAJUMDAR DASHBOARD

Show:

Welcome, Bandan Majumdar

Assigned Area:
Chinar Park

Show only Chinar Park complaints.

Include:

Road damage

Footpath problems

Garbage collection

Civic suggestions.

==================================================
MASTER ADMIN DASHBOARD DATA
===========================

Master Admin:

Pritam

Email:

[pritam.aber@gmail.com](mailto:pritam.aber@gmail.com)

Show a realistic demo dashboard.

Example statistics:

Total Citizens:
10+

Total Booth Agents:
5

Total Booth Offices:
5

Total Issues:
20

New Issues:
4

In Progress:
7

Resolved:
5

High Priority Issues:
6

Show:

RECENT COMPLAINTS

Complaint Title

Citizen

Area

Assigned Agent

Status

Show:

MOST REPORTED ISSUES

Example:

1.

Street lights not working near Rajarhat Main Road

Supporters:
10

2.

Drainage overflow in Jyangra

Supporters:
12

3.

Irregular drinking water supply in Teghoria

Supporters:
8

==================================================
DEMO PRESENTATION FLOW
======================

The application should be easy to demonstrate live.

Recommended flow:

STEP 1

Login as a citizen.

Phone:
9000000000

OTP:
123456

STEP 2

Show the citizen dashboard.

STEP 3

Click:

Report Problem

STEP 4

Create a new complaint.

Example:

Street light not working

Location:

Rajarhat Gopalpur

STEP 5

The system should detect:

"Similar issue already reported"

Show:

RJH-2026-001

Street lights not working near Rajarhat Main Road

Supported by:
10 Citizens

STEP 6

Click:

Support This Issue

The system should increase supporters from:

10

to:

11

STEP 7

Logout.

Login as:

Rick Sonkar

Phone:
9000001001

Password:
agent123

STEP 8

Show that Rick can only see:

Rajarhat Gopalpur complaints.

STEP 9

Open complaint:

RJH-2026-001

STEP 10

Update status:

Under Review

→

In Progress

Add public update:

"Our local team has reviewed the issue and the concerned department has been informed."

STEP 11

Logout.

Login as Master Admin:

[pritam.aber@gmail.com](mailto:pritam.aber@gmail.com)

Password:
admin123

STEP 12

Show Master Admin dashboard.

Show:

- All complaints
- All booth agents
- All booths
- Complaint statistics
- Most reported issues
- Ability to manage and reassign complaints

==================================================
IMPORTANT UI DETAILS
====================

The demo should prominently display:

Citizen Name

Booth Name

Assigned Agent

Supporter Count

Complaint Status

Priority

Complaint Timeline

Example issue card:

---

Street lights not working

📍 Rajarhat Gopalpur

🏢 Rajarhat Gopalpur Booth

👤 Assigned to Rick Sonkar

👥 Supported by 10 Citizens

🔴 High Priority

🟡 In Progress

---

==================================================
DATABASE SEEDING
================

Create a proper seed script.

The seed script should insert:

1 Master Admin

5 Booth Offices

5 Booth Agents

10+ Citizens

20+ Complaints

Complaint Supporters

Complaint Status History

Agent Assignments

The seed script should be repeatable and suitable for resetting the demo database.

==================================================
IMPORTANT
=========

The demo must be fully functional.

Do not create only static pages.

The following demo flow must actually work:

Citizen Login
→ Dummy OTP
→ Dashboard
→ Submit Complaint
→ Duplicate Detection
→ Support Existing Issue
→ Complaint Support Count Updates
→ Agent Assignment
→ Agent Login
→ Agent Updates Status
→ Citizen Sees Updated Status
→ Master Admin Sees Everything.

Use Rajarhat-area dummy data throughout the demo to make the application presentation realistic and locally relevant.
