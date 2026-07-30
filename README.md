# Vitalyn Pulse Monitor

Build a complete frontend-only React.js web application named "Vitalyn" — a modern hospital sepsis monitoring system for nurses and doctors.

IMPORTANT:

- Frontend only.

- Do NOT create any backend, database, or API logic.

- Use mock JSON data and local React state.

- Structure the code so backend integration with Flask APIs will be easy later.

- Use React + TypeScript + Tailwind CSS + shadcn/ui.

- Use Recharts for graphs.

- Use jsPDF for PDF export.

- Use Lucide React icons.

- Use React Router for navigation.

- Use responsive design for desktop and tablet.

- Create clean, modular components.

====================================================

APP OVERVIEW

====================================================

Vitalyn is a role-based clinical monitoring platform that helps nurses enter patient vital signs and helps doctors review trends, acknowledge alerts, and add clinical notes.

Roles:

1. Nurse

2. Doctor

====================================================

BRANDING

====================================================

App Name: Vitalyn

Tagline: Intelligent Sepsis Monitoring System

Browser:

- Change page title to "Vitalyn"

- Replace default favicon with a medical heartbeat icon.

Color Theme:

- Primary: Teal

- Secondary: Blue

- Accent: Red for alerts

- Background: White and subtle gray

- Use soft gradients and glassmorphism effects

====================================================

LANDING PAGE

====================================================

Create an attractive landing page with:

Hero Section:

- Gradient background (teal to blue)

- Animated heartbeat icon

- Heading: "Early Sepsis Detection Saves Lives"

- Subheading: "Monitor vital signs, detect clinical deterioration, and collaborate in real time."

- Buttons:

  - Get Started

  - Learn More

Feature Cards:

- qSOFA Risk Detection

- Glasgow Coma Scale

- Timeline & Replay

- Audit Logs

- PDF Reports

- Doctor Acknowledgement

How It Works Section:

1. Nurse records vitals

2. System analyzes risk

3. Doctor reviews and acknowledges

4. Reports exported to PDF

Footer:

- Vitalyn © 2026

====================================================

AUTHENTICATION PAGE

====================================================

Create a combined Login / Sign Up page with tabs.

Common fields:

- Hospital Email

- Password

- Role dropdown:

  - Nurse

  - Doctor

Sign Up Rules:

- If role = Doctor:

  - Show Full Name

- If role = Nurse:

  - Show Ward Name (accept values like A-12, ICU-3, Ward-5)

Login Rules:

- If role = Doctor:

  - Show Full Name

- If role = Nurse:

  - Show Ward Name

No backend validation required.

Store user info in mock state.

====================================================

ROLE-BASED DASHBOARDS

====================================================

After login:

- Nurse → Nurse Dashboard

- Doctor → Doctor Dashboard

====================================================

NURSE DASHBOARD

====================================================

Top bar:

- App logo

- Current ward

- Notification bell

- User profile menu

Main content:

- Search patients

- Filter by risk level

- Button: "+ Add New Patient"

Patient cards:

- Patient name

- Age

- Bed number

- Latest risk level

- Last updated

- Quick status badge

Add New Patient Modal:

Fields:

- Nurse Name

- Patient Name

- Age

- Bed Number

- Ward Number

====================================================

PATIENT DETAIL PAGE

====================================================

Each patient opens a dedicated page.

Layout:

- Left sidebar

- Main content

- Right panel (optional summary)

Sidebar Navigation:

- Overview

- Enter Vitals

- Timeline & Replay

- Audit Logs

- Doctor Notes

- Export Report (PDF)

====================================================

PATIENT OVERVIEW

====================================================

Show:

- Patient demographics

- Current qSOFA score

- Current GCS score

- Risk level badge

- Latest explanation

- Last updated timestamp

====================================================

ENTER VITALS SECTION

====================================================

Input fields:

- Temperature (°C)

- Respiratory Rate

- Systolic Blood Pressure

- Mental Status (Normal / Altered)

Glasgow Coma Scale inputs:

Eye Opening:

- 4 Spontaneous

- 3 To sound

- 2 To pressure

- 1 None

Verbal Response:

- 5 Oriented

- 4 Confused

- 3 Inappropriate words

- 2 Incomprehensible sounds

- 1 None

Motor Response:

- 6 Obeys commands

- 5 Localizes pain

- 4 Withdraws from pain

- 3 Abnormal flexion

- 2 Extension

- 1 None

Automatically calculate:

GCS Total = Eye + Verbal + Motor

qSOFA criteria:

- Respiratory Rate ≥ 22

- Systolic BP ≤ 100

- Altered Mental Status OR GCS ≤ 14

qSOFA Score = number of criteria met

Risk Levels:

- 0 → Low

- 1 → Moderate

- 2 → High

- 3 → Critical

On clicking "Analyze":

- Save a new vital entry in local state

- Show:

  - qSOFA score

  - GCS score

  - Risk level

  - Confidence level

  - Explanation text

  - Clinical recommendation

====================================================

UNIFIED TREND GRAPH

====================================================

Display a multi-line chart using Recharts for:

- Temperature

- Respiratory Rate

- Systolic Blood Pressure

- qSOFA score

- GCS score

Allow:

- 24 Hours

- 3 Days

- 7 Days

- All Time

====================================================

TIMELINE & REPLAY

====================================================

Inside each patient page.

Chronological timeline of:

- Vital entries

- Risk alerts

- Doctor acknowledgements

- Clinical notes

Features:

- Checkbox filters

- Replay slider

- Compare previous vs current values

- Retrospective analysis

====================================================

AUDIT LOGS

====================================================

Per patient.

Display:

- Timestamp

- User name

- Role

- Action

- Details

Examples:

- Nurse Sarah added vital signs

- Dr. John Doe acknowledged high-risk alert

- Dr. John Doe added clinical note

IMPORTANT:

Use doctor full name, not email.

====================================================

DOCTOR NOTES & ACKNOWLEDGEMENT

====================================================

Doctors can:

- Click "Acknowledge Alert"

- Add structured clinical notes

Fields:

- Notes textarea

- Save button

Acknowledgement status:

- Pending

- Acknowledged

====================================================

DOCTOR DASHBOARD

====================================================

Doctors can view:

- All wards

- All patients

- All vital trends

- Audit logs

- Timeline & Replay

- PDF export

Ward selector:

- Click ward → view all patients in that ward.

====================================================

PDF EXPORT

====================================================

Generate a professional PDF report using jsPDF.

Include:

1. Hospital/App header

2. Patient demographics

3. Latest qSOFA and GCS scores

4. Risk level

5. Vital signs table

6. Timeline summary

7. Doctor notes

8. Audit log summary

PDF should be well formatted and readable.

====================================================

MOCK DATA

====================================================

Create realistic sample data:

- 3 wards

- Multiple patients

- Multiple vital entries over time

- Doctor acknowledgements

- Notes

- Audit logs

====================================================

UI/UX REQUIREMENTS

====================================================

- Elegant healthcare design

- Smooth transitions

- Hover effects

- Loading skeletons

- Empty states

- Toast notifications

- Responsive layout

- Risk badges:

  - Green = Low

  - Yellow = Moderate

  - Orange = High

  - Red = Critical

====================================================

PROJECT STRUCTURE

====================================================

Use this folder structure:

src/

  components/

  pages/

  layouts/

  data/

  hooks/

  utils/

  types/

====================================================

UTILITIES

====================================================

Create utility functions:

- calculateGCS()

- calculateQSOFA()

- getRiskLevel()

- generateExplanation()

- generateConfidence()

- exportPatientPDF()

====================================================

DELIVERABLE

====================================================

Generate the complete frontend application with all pages, components, routing, mock data, and fully functional UI interactions using only local state.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2a023bc5-9af2-4355-acda-3bb21b05c8e9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
