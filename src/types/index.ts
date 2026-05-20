export type Role = "nurse" | "doctor";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

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
  respiratoryRate: number;
  systolicBP: number;
  mentalStatus: "Normal" | "Altered";
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  gcsTotal: number;
  qsofa: number;
  risk: RiskLevel;
  confidence: number;
  explanation: string;
  recommendation: string;
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
