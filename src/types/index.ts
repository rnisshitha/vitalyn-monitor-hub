export type Role = "nurse" | "doctor" | "admin";

export type RiskLevel = "Low" | "Moderate" | "Critical";
export type ClinicalRiskTier = "LOW RISK" | "MODERATE RISK" | "CRITICAL RISK";
export type GcsStatus = "Normal" | "Altered Mental Status";

export interface User {
  /** Server-generated id. */
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  ward?: string;
}

export interface Patient {
  /** Server-generated id. */
  id: string;
  name: string;
  age: number;
  bed: string;
  ward: string;
  admittedAt: string;
}

/** Current admission record for a patient (GET /api/patients/{id}/admission). */
export interface Admission {
  id: string;
  patientId: string;
  ward: string;
  bed: string;
  admittedAt: string;
  dischargedAt?: string | null;
  admittedBy?: string;
}

/** Authoritative clinical result calculated by the backend. */
export interface RiskAssessment {
  qsofa: number;
  sirs: number;
  gcsTotal: number;
  gcsStatus: GcsStatus;
  risk: RiskLevel;
  clinicalRiskTier: ClinicalRiskTier;
  clinicalGuidance: string;
}

export interface VitalEntry extends RiskAssessment {
  /** Server-generated id. */
  id: string;
  patientId: string;
  timestamp: string;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  systolicBP: number;
  spo2?: number;
  wbc?: number;
  mentalStatus: "Normal" | "Altered";
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  enteredBy: string;
}

/** Raw bedside inputs sent to the backend; no scores, no client ids. */
export interface VitalInput {
  temperature: number;
  heart_rate: number;
  respiratory_rate: number;
  systolic_bp: number;
  spo2?: number;
  wbc?: number;
  gcs_eye: number;
  gcs_verbal: number;
  gcs_motor: number;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  timestamp: string;
  doctorName: string;
  text: string;
}

export interface Acknowledgement {
  id: string;
  patientId: string;
  vitalId: string;
  timestamp: string;
  doctorName: string;
  status: "Acknowledged";
}

export interface AuditEntry {
  id: string;
  patientId: string;
  timestamp: string;
  userName: string;
  role: Role;
  action: string;
  details: string;
}

/** Alias matching the backend resource name. */
export type AuditLog = AuditEntry;

export type TimelineEventType = "vital" | "alert" | "ack" | "note";

/** Normalized event returned by GET /api/patients/{id}/timeline. */
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  vital?: VitalEntry;
}
