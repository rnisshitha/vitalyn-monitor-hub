import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Acknowledgement,
  AuditEntry,
  DoctorNote,
  Patient,
  Role,
  User,
  VitalEntry,
} from "@/types";
import { ACKS, AUDIT, NOTES, PATIENTS, VITALS, WARDS } from "@/data/mockData";

interface VitalynContextValue {
  user: User | null;
  hydrated: boolean;
  login: (u: User) => void;
  logout: () => void;
  wards: string[];
  patients: Patient[];
  vitals: VitalEntry[];
  notes: DoctorNote[];
  acks: Acknowledgement[];
  audits: AuditEntry[];
  addPatient: (p: Omit<Patient, "id" | "admittedAt">, nurseName: string) => Patient;
  addVital: (v: VitalEntry) => void;
  addNote: (n: DoctorNote) => void;
  acknowledge: (patientId: string, vitalId: string, doctorName: string) => void;
  addAudit: (a: Omit<AuditEntry, "id">) => void;
  patientVitals: (id: string) => VitalEntry[];
  patientNotes: (id: string) => DoctorNote[];
  patientAcks: (id: string) => Acknowledgement[];
  patientAudits: (id: string) => AuditEntry[];
}

const Ctx = createContext<VitalynContextValue | null>(null);

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const USER_KEY = "vitalyn.user";

export function VitalynProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);
  const [vitals, setVitals] = useState<VitalEntry[]>(VITALS);
  const [notes, setNotes] = useState<DoctorNote[]>(NOTES);
  const [acks, setAcks] = useState<Acknowledgement[]>(ACKS);
  const [audits, setAudits] = useState<AuditEntry[]>(AUDIT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {}
  }, [user, hydrated]);

  const value = useMemo<VitalynContextValue>(
    () => ({
      user,
      hydrated,
      login: (u) => setUser(u),
      logout: () => setUser(null),
      wards: WARDS,
      patients,
      vitals,
      notes,
      acks,
      audits,
      addPatient: (p, nurseName) => {
        const np: Patient = { ...p, id: uid("p"), admittedAt: new Date().toISOString() };
        setPatients((prev) => [np, ...prev]);
        setAudits((prev) => [
          {
            id: uid("au"),
            patientId: np.id,
            timestamp: new Date().toISOString(),
            userName: nurseName,
            role: "nurse",
            action: "Patient admitted",
            details: `${np.name} assigned to bed ${np.bed}, ward ${np.ward}`,
          },
          ...prev,
        ]);
        return np;
      },
      addVital: (v) => {
        setVitals((prev) => [v, ...prev]);
        setAudits((prev) => [
          {
            id: uid("au"),
            patientId: v.patientId,
            timestamp: v.timestamp,
            userName: v.enteredBy,
            role: "nurse",
            action: "Vitals recorded",
            details: `qSOFA=${v.qsofa}, GCS=${v.gcsTotal}, Risk=${v.risk}`,
          },
          ...prev,
        ]);
      },
      addNote: (n) => {
        setNotes((prev) => [n, ...prev]);
        setAudits((prev) => [
          {
            id: uid("au"),
            patientId: n.patientId,
            timestamp: n.timestamp,
            userName: n.doctorName,
            role: "doctor",
            action: "Added clinical note",
            details: n.text.slice(0, 60) + (n.text.length > 60 ? "…" : ""),
          },
          ...prev,
        ]);
      },
      acknowledge: (patientId, vitalId, doctorName) => {
        const ack: Acknowledgement = {
          id: uid("a"),
          patientId,
          vitalId,
          timestamp: new Date().toISOString(),
          doctorName,
          status: "Acknowledged",
        };
        setAcks((prev) => [ack, ...prev]);
        setAudits((prev) => [
          {
            id: uid("au"),
            patientId,
            timestamp: ack.timestamp,
            userName: doctorName,
            role: "doctor",
            action: "Acknowledged high-risk alert",
            details: `Vital ${vitalId} acknowledged`,
          },
          ...prev,
        ]);
      },
      addAudit: (a) => setAudits((prev) => [{ ...a, id: uid("au") }, ...prev]),
      patientVitals: (id) =>
        vitals
          .filter((v) => v.patientId === id)
          .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)),
      patientNotes: (id) =>
        notes
          .filter((n) => n.patientId === id)
          .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
      patientAcks: (id) => acks.filter((a) => a.patientId === id),
      patientAudits: (id) =>
        audits
          .filter((a) => a.patientId === id)
          .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    }),
    [user, hydrated, patients, vitals, notes, acks, audits],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVitalyn() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVitalyn must be used inside VitalynProvider");
  return v;
}

export function roleHomePath(role: Role) {
  return role === "nurse" ? "/nurse" : "/doctor";
}
