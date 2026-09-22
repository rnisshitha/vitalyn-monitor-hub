/**
 * TanStack Query layer — the single source of truth for clinical server data.
 */
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acksApi,
  auditApi,
  notesApi,
  patientsApi,
  timelineApi,
  vitalsApi,
  type CreatePatientPayload,
} from "@/lib/resources";
import type { VitalInput } from "@/types";

export const queryKeys = {
  patients: ["patients"] as const,
  patient: (id: string) => ["patients", id] as const,
  admission: (id: string) => ["patients", id, "admission"] as const,
  vitals: (id: string) => ["patients", id, "vitals"] as const,
  notes: (id: string) => ["patients", id, "notes"] as const,
  acks: (id: string) => ["patients", id, "acknowledgements"] as const,
  audits: (id: string) => ["patients", id, "audit-logs"] as const,
  timeline: (id: string) => ["patients", id, "timeline"] as const,
};

export const patientsQuery = () =>
  queryOptions({ queryKey: queryKeys.patients, queryFn: patientsApi.list, retry: false });

export const patientQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.patient(id), queryFn: () => patientsApi.get(id), retry: false });

export const admissionQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.admission(id), queryFn: () => patientsApi.admission(id), retry: false });

export const vitalsQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.vitals(id), queryFn: () => vitalsApi.list(id), retry: false });

export const notesQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.notes(id), queryFn: () => notesApi.list(id), retry: false });

export const acksQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.acks(id), queryFn: () => acksApi.list(id), retry: false });

export const auditsQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.audits(id), queryFn: () => auditApi.list(id), retry: false });

export const timelineQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.timeline(id), queryFn: () => timelineApi.list(id), retry: false });

/* --------------------------------- reads -------------------------------- */

export const usePatients = () => useQuery(patientsQuery());
export const usePatient = (id: string) => useQuery(patientQuery(id));
export const useVitals = (id: string) => useQuery(vitalsQuery(id));
export const useNotes = (id: string) => useQuery(notesQuery(id));
export const useAcks = (id: string) => useQuery(acksQuery(id));
export const useAudits = (id: string) => useQuery(auditsQuery(id));
export const useTimeline = (id: string) => useQuery(timelineQuery(id));

/** Vitals for every patient in one place (dashboards show latest risk per card). */
export const usePatientVitals = (id: string, enabled = true) =>
  useQuery({ ...vitalsQuery(id), enabled });

/* ------------------------------- mutations ------------------------------ */

function useInvalidatePatientData() {
  const qc = useQueryClient();
  return (patientId: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.vitals(patientId) });
    qc.invalidateQueries({ queryKey: queryKeys.notes(patientId) });
    qc.invalidateQueries({ queryKey: queryKeys.acks(patientId) });
    qc.invalidateQueries({ queryKey: queryKeys.audits(patientId) });
    qc.invalidateQueries({ queryKey: queryKeys.timeline(patientId) });
  };
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients });
    },
  });
}

export function useCreateVital(patientId: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (input: VitalInput) => vitalsApi.create(patientId, input),
    onSuccess: () => {
      invalidate(patientId);
      qc.invalidateQueries({ queryKey: queryKeys.patients });
    },
  });
}

export function useCreateNote(patientId: string) {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (text: string) => notesApi.create(patientId, text),
    onSuccess: () => invalidate(patientId),
  });
}

export function useUpdateNote(patientId: string) {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: ({ noteId, text }: { noteId: string; text: string }) => notesApi.update(noteId, text),
    onSuccess: () => invalidate(patientId),
  });
}

export function useDeleteNote(patientId: string) {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (noteId: string) => notesApi.remove(noteId),
    onSuccess: () => invalidate(patientId),
  });
}

export function useAcknowledge(patientId: string) {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (vitalId: string) => acksApi.create({ patient_id: patientId, vital_id: vitalId }),
    onSuccess: () => invalidate(patientId),
  });
}
