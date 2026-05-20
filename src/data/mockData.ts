import type {
  Acknowledgement,
  AuditEntry,
  DoctorNote,
  Patient,
  VitalEntry,
} from "@/types";
import {
  calculateGCS,
  calculateQSOFA,
  generateConfidence,
  generateExplanation,
  generateRecommendation,
  getRiskLevel,
} from "@/utils/clinical";

export const WARDS = ["ICU-3", "A-12", "Ward-5"];

export const PATIENTS: Patient[] = [
  { id: "p1", name: "Margaret Chen", age: 72, bed: "12", ward: "ICU-3", admittedAt: "2026-05-18T09:00:00Z" },
  { id: "p2", name: "Robert Hayes", age: 64, bed: "07", ward: "ICU-3", admittedAt: "2026-05-19T14:30:00Z" },
  { id: "p3", name: "Aisha Patel", age: 58, bed: "03", ward: "A-12", admittedAt: "2026-05-17T08:15:00Z" },
  { id: "p4", name: "Liam O'Connor", age: 45, bed: "11", ward: "A-12", admittedAt: "2026-05-19T20:00:00Z" },
  { id: "p5", name: "Sofia Rossi", age: 81, bed: "05", ward: "Ward-5", admittedAt: "2026-05-16T11:45:00Z" },
  { id: "p6", name: "James Whitfield", age: 38, bed: "09", ward: "Ward-5", admittedAt: "2026-05-20T03:20:00Z" },
];

function buildVital(
  patientId: string,
  hoursAgo: number,
  values: {
    temperature: number;
    respiratoryRate: number;
    systolicBP: number;
    mentalStatus: "Normal" | "Altered";
    eye: number;
    verbal: number;
    motor: number;
  },
  enteredBy = "Sarah Nguyen",
): VitalEntry {
  const gcsTotal = calculateGCS(values.eye, values.verbal, values.motor);
  const qsofa = calculateQSOFA({
    respiratoryRate: values.respiratoryRate,
    systolicBP: values.systolicBP,
    mentalStatus: values.mentalStatus,
    gcsTotal,
  });
  const risk = getRiskLevel(qsofa);
  return {
    id: `${patientId}-v-${hoursAgo}`,
    patientId,
    timestamp: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
    temperature: values.temperature,
    respiratoryRate: values.respiratoryRate,
    systolicBP: values.systolicBP,
    mentalStatus: values.mentalStatus,
    gcsEye: values.eye,
    gcsVerbal: values.verbal,
    gcsMotor: values.motor,
    gcsTotal,
    qsofa,
    risk,
    confidence: generateConfidence(qsofa, gcsTotal),
    explanation: generateExplanation({ ...values, gcsTotal, qsofa }),
    recommendation: generateRecommendation(risk),
    enteredBy,
  };
}

export const VITALS: VitalEntry[] = [
  // p1 deteriorating -> critical
  buildVital("p1", 72, { temperature: 37.2, respiratoryRate: 18, systolicBP: 122, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p1", 48, { temperature: 37.8, respiratoryRate: 21, systolicBP: 110, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p1", 24, { temperature: 38.4, respiratoryRate: 24, systolicBP: 102, mentalStatus: "Normal", eye: 4, verbal: 4, motor: 6 }),
  buildVital("p1", 6,  { temperature: 39.1, respiratoryRate: 28, systolicBP: 92,  mentalStatus: "Altered", eye: 3, verbal: 3, motor: 5 }),
  buildVital("p1", 1,  { temperature: 39.4, respiratoryRate: 30, systolicBP: 88,  mentalStatus: "Altered", eye: 2, verbal: 3, motor: 5 }),
  // p2 high
  buildVital("p2", 30, { temperature: 37.0, respiratoryRate: 20, systolicBP: 118, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p2", 8,  { temperature: 38.2, respiratoryRate: 23, systolicBP: 96,  mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p2", 2,  { temperature: 38.6, respiratoryRate: 25, systolicBP: 94,  mentalStatus: "Normal", eye: 4, verbal: 4, motor: 6 }),
  // p3 moderate
  buildVital("p3", 24, { temperature: 37.3, respiratoryRate: 19, systolicBP: 124, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p3", 4,  { temperature: 37.9, respiratoryRate: 22, systolicBP: 112, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  // p4 low
  buildVital("p4", 12, { temperature: 36.8, respiratoryRate: 16, systolicBP: 128, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p4", 2,  { temperature: 36.9, respiratoryRate: 17, systolicBP: 126, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  // p5 moderate
  buildVital("p5", 18, { temperature: 37.6, respiratoryRate: 21, systolicBP: 108, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  buildVital("p5", 3,  { temperature: 37.8, respiratoryRate: 23, systolicBP: 104, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
  // p6 low
  buildVital("p6", 6,  { temperature: 36.7, respiratoryRate: 15, systolicBP: 130, mentalStatus: "Normal", eye: 4, verbal: 5, motor: 6 }),
];

export const NOTES: DoctorNote[] = [
  {
    id: "n1",
    patientId: "p1",
    timestamp: new Date(Date.now() - 5 * 3600_000).toISOString(),
    doctorName: "Dr. John Doe",
    text: "Concerned about rapid deterioration. Started broad-spectrum antibiotics, drew lactate and blood cultures. Will reassess in 1 hour.",
  },
  {
    id: "n2",
    patientId: "p2",
    timestamp: new Date(Date.now() - 1 * 3600_000).toISOString(),
    doctorName: "Dr. Amelia Park",
    text: "qSOFA = 2. Initiating sepsis bundle. Monitor urine output hourly.",
  },
];

export const ACKS: Acknowledgement[] = [
  {
    id: "a1",
    patientId: "p1",
    vitalId: "p1-v-6",
    timestamp: new Date(Date.now() - 5.5 * 3600_000).toISOString(),
    doctorName: "Dr. John Doe",
    status: "Acknowledged",
  },
];

export const AUDIT: AuditEntry[] = [
  {
    id: "au1",
    patientId: "p1",
    timestamp: new Date(Date.now() - 24 * 3600_000).toISOString(),
    userName: "Sarah Nguyen",
    role: "nurse",
    action: "Vitals recorded",
    details: "qSOFA=2, GCS=14, Risk=High",
  },
  {
    id: "au2",
    patientId: "p1",
    timestamp: new Date(Date.now() - 6 * 3600_000).toISOString(),
    userName: "Sarah Nguyen",
    role: "nurse",
    action: "Vitals recorded",
    details: "qSOFA=3, GCS=11, Risk=Critical",
  },
  {
    id: "au3",
    patientId: "p1",
    timestamp: new Date(Date.now() - 5.5 * 3600_000).toISOString(),
    userName: "Dr. John Doe",
    role: "doctor",
    action: "Acknowledged high-risk alert",
    details: "Critical alert acknowledged",
  },
  {
    id: "au4",
    patientId: "p1",
    timestamp: new Date(Date.now() - 5 * 3600_000).toISOString(),
    userName: "Dr. John Doe",
    role: "doctor",
    action: "Added clinical note",
    details: "Sepsis bundle initiated",
  },
];
