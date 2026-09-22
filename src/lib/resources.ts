/**
 * REST resource functions + wire<->domain mappers.
 * The backend speaks snake_case; the UI keeps its existing camelCase models.
 */
import { apiClient } from "@/lib/api";
import type {
  Acknowledgement,
  Admission,
  AuditEntry,
  DoctorNote,
  GcsStatus,
  Patient,
  Role,
  TimelineEvent,
  TimelineEventType,
  User,
  VitalEntry,
  VitalInput,
} from "@/types";

/* ----------------------------- wire shapes ----------------------------- */

interface UserWire {
  id: string;
  email: string;
  role: Role;
  full_name?: string | null;
  ward?: string | null;
}

interface PatientWire {
  id: string;
  name: string;
  age: number;
  bed: string;
  ward: string;
  admitted_at: string;
}

interface AdmissionWire {
  id: string;
  patient_id: string;
  ward: string;
  bed: string;
  admitted_at: string;
  discharged_at?: string | null;
  admitted_by?: string | null;
}

interface VitalWire {
  id: string;
  patient_id: string;
  recorded_at: string;
  temperature: number;
  heart_rate: number;
  respiratory_rate: number;
  systolic_bp: number;
  spo2?: number | null;
  wbc?: number | null;
  gcs_eye: number;
  gcs_verbal: number;
  gcs_motor: number;
  gcs_total: number;
  gcs_status: GcsStatus;
  mental_status?: "Normal" | "Altered" | null;
  qsofa_score: number;
  sirs_score: number;
  risk_level: VitalEntry["risk"];
  clinical_risk_tier: VitalEntry["clinicalRiskTier"];
  clinical_guidance: string;
  entered_by: string;
}

interface NoteWire {
  id: string;
  patient_id: string;
  created_at: string;
  doctor_name: string;
  text: string;
}

interface AckWire {
  id: string;
  patient_id: string;
  vital_id: string;
  created_at: string;
  user_name: string;
  status?: "Acknowledged";
}

interface AuditWire {
  id: string;
  patient_id: string;
  created_at: string;
  user_name: string;
  role: Role;
  action: string;
  details: string;
}

interface TimelineWire {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  vital?: VitalWire | null;
}

/* ------------------------------- mappers ------------------------------- */

const toUser = (w: UserWire): User => ({
  id: w.id,
  email: w.email,
  role: w.role,
  fullName: w.full_name ?? undefined,
  ward: w.ward ?? undefined,
});

const toPatient = (w: PatientWire): Patient => ({
  id: w.id,
  name: w.name,
  age: w.age,
  bed: w.bed,
  ward: w.ward,
  admittedAt: w.admitted_at,
});

const toAdmission = (w: AdmissionWire): Admission => ({
  id: w.id,
  patientId: w.patient_id,
  ward: w.ward,
  bed: w.bed,
  admittedAt: w.admitted_at,
  dischargedAt: w.discharged_at ?? null,
  admittedBy: w.admitted_by ?? undefined,
});

const toVital = (w: VitalWire): VitalEntry => ({
  id: w.id,
  patientId: w.patient_id,
  timestamp: w.recorded_at,
  temperature: w.temperature,
  heartRate: w.heart_rate,
  respiratoryRate: w.respiratory_rate,
  systolicBP: w.systolic_bp,
  spo2: w.spo2 ?? undefined,
  wbc: w.wbc ?? undefined,
  gcsEye: w.gcs_eye,
  gcsVerbal: w.gcs_verbal,
  gcsMotor: w.gcs_motor,
  gcsTotal: w.gcs_total,
  gcsStatus: w.gcs_status,
  mentalStatus: w.mental_status ?? (w.gcs_status === "Altered Mental Status" ? "Altered" : "Normal"),
  qsofa: w.qsofa_score,
  sirs: w.sirs_score,
  risk: w.risk_level,
  clinicalRiskTier: w.clinical_risk_tier,
  clinicalGuidance: w.clinical_guidance,
  enteredBy: w.entered_by,
});

const toNote = (w: NoteWire): DoctorNote => ({
  id: w.id,
  patientId: w.patient_id,
  timestamp: w.created_at,
  doctorName: w.doctor_name,
  text: w.text,
});

const toAck = (w: AckWire): Acknowledgement => ({
  id: w.id,
  patientId: w.patient_id,
  vitalId: w.vital_id,
  timestamp: w.created_at,
  doctorName: w.user_name,
  status: "Acknowledged",
});

const toAudit = (w: AuditWire): AuditEntry => ({
  id: w.id,
  patientId: w.patient_id,
  timestamp: w.created_at,
  userName: w.user_name,
  role: w.role,
  action: w.action,
  details: w.details,
});

const toTimelineEvent = (w: TimelineWire): TimelineEvent => ({
  id: w.id,
  type: w.type,
  timestamp: w.timestamp,
  title: w.title,
  description: w.description,
  vital: w.vital ? toVital(w.vital) : undefined,
});

/* ------------------------------ endpoints ------------------------------ */

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
  full_name?: string;
  ward?: string;
}

export interface SignupPayload extends LoginPayload {
  full_name: string;
}

export const authApi = {
  me: async () => toUser(await apiClient.get<UserWire>("/api/auth/me")),
  login: async (payload: LoginPayload) => toUser(await apiClient.post<UserWire>("/api/auth/login", payload)),
  signup: async (payload: SignupPayload) => toUser(await apiClient.post<UserWire>("/api/auth/signup", payload)),
  logout: () => apiClient.post<void>("/api/auth/logout"),
};

export interface CreatePatientPayload {
  name: string;
  age: number;
  bed: string;
  ward: string;
}

export const patientsApi = {
  list: async () => (await apiClient.get<PatientWire[]>("/api/patients")).map(toPatient),
  get: async (id: string) => toPatient(await apiClient.get<PatientWire>(`/api/patients/${id}`)),
  create: async (payload: CreatePatientPayload) =>
    toPatient(await apiClient.post<PatientWire>("/api/patients", payload)),
  admission: async (id: string) =>
    toAdmission(await apiClient.get<AdmissionWire>(`/api/patients/${id}/admission`)),
};

export const vitalsApi = {
  list: async (patientId: string) =>
    (await apiClient.get<VitalWire[]>(`/api/patients/${patientId}/vitals`)).map(toVital),
  create: async (patientId: string, input: VitalInput) =>
    toVital(await apiClient.post<VitalWire>(`/api/patients/${patientId}/vitals`, input)),
};

export const notesApi = {
  list: async (patientId: string) =>
    (await apiClient.get<NoteWire[]>(`/api/patients/${patientId}/notes`)).map(toNote),
  create: async (patientId: string, text: string) =>
    toNote(await apiClient.post<NoteWire>(`/api/patients/${patientId}/notes`, { text })),
  update: async (noteId: string, text: string) =>
    toNote(await apiClient.put<NoteWire>(`/api/notes/${noteId}`, { text })),
  remove: (noteId: string) => apiClient.del<void>(`/api/notes/${noteId}`),
};

export const acksApi = {
  list: async (patientId: string) =>
    (await apiClient.get<AckWire[]>(`/api/patients/${patientId}/acknowledgements`)).map(toAck),
  create: async (payload: { patient_id: string; vital_id: string }) =>
    toAck(await apiClient.post<AckWire>("/api/acknowledgements", payload)),
};

export const auditApi = {
  list: async (patientId: string) =>
    (await apiClient.get<AuditWire[]>(`/api/patients/${patientId}/audit-logs`)).map(toAudit),
};

export const timelineApi = {
  list: async (patientId: string) =>
    (await apiClient.get<TimelineWire[]>(`/api/patients/${patientId}/timeline`)).map(toTimelineEvent),
};
