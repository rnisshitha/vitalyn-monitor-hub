import type {
  Acknowledgement,
  AuditEntry,
  DoctorNote,
  Patient,
  VitalEntry,
} from "@/types";

// Mock data intentionally left empty — the app starts with a clean slate
// so you can test the full workflow (admit patient -> record vitals ->
// acknowledge -> add notes -> export PDF) end-to-end.
// When wiring the Flask backend, replace these with API calls.

export const WARDS: string[] = [];
export const PATIENTS: Patient[] = [];
export const VITALS: VitalEntry[] = [];
export const NOTES: DoctorNote[] = [];
export const ACKS: Acknowledgement[] = [];
export const AUDIT: AuditEntry[] = [];
