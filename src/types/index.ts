export type Role = "nurse" | "doctor";

export type RiskLevel = "Low" | "Moderate" | "Critical";
export type ClinicalRiskTier = "LOW RISK" | "MODERATE RISK" | "CRITICAL RISK";
export type GcsStatus = "Normal" | "Altered Mental Status";

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  ward?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  bed: string;
  ward: string;
  admittedAt: string;
}

export interface VitalEntry {
  id: string;
  patientId: string;
  timestamp: string;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  systolicBP: number;
  wbc?: number;
  mentalStatus: "Normal" | "Altered";
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  gcsTotal: number;
  gcsStatus: GcsStatus;
  qsofa: number;
  sirs: number;
  risk: RiskLevel;
  clinicalRiskTier: ClinicalRiskTier;
  clinicalGuidance: string;
  enteredBy: string;
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
