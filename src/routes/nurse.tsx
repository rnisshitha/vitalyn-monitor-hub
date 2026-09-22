import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { PatientCard } from "@/components/PatientCard";
import { AddPatientModal } from "@/components/AddPatientModal";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { usePatients, useVitalsByPatient } from "@/hooks/useClinicalQueries";
import { errorMessage } from "@/lib/api";
import { latestVital } from "@/utils/clinical";
import { Loader2, Search } from "lucide-react";
import type { RiskLevel } from "@/types";

export const Route = createFileRoute("/nurse")({
  head: () => ({
    meta: [
      { title: "Nurse Dashboard — Vitalyn" },
      { name: "description", content: "Record bedside vitals and monitor sepsis risk across your ward." },
      { property: "og:title", content: "Nurse Dashboard — Vitalyn" },
      { property: "og:description", content: "Record bedside vitals and monitor sepsis risk across your ward." },
    ],
  }),
  component: NurseDashboard,
});

function NurseDashboard() {
  const { user, hydrated } = useVitalyn();
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
  }, [user, hydrated, navigate]);

  const patientsQ = usePatients();
  const patients = patientsQ.data ?? [];
  const { byPatient } = useVitalsByPatient(patients.map((p) => p.id));

  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<"all" | RiskLevel>("all");

  const ward = user?.ward;
  const wardPatients = useMemo(
    () => (ward ? patients.filter((p) => p.ward === ward) : patients),
    [patients, ward],
  );
  const filtered = wardPatients.filter((p) => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.bed.includes(q);
    const lv = latestVital(byPatient[p.id] ?? []);
    const matchRisk = risk === "all" || lv?.risk === risk;
    return matchQ && matchRisk;
  });

  return (
    <div className="min-h-screen bg-background">
      <TopBar subtitle={ward ? `Ward ${ward}` : undefined} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
            <p className="text-sm text-muted-foreground">
              {patientsQ.isLoading
                ? "Loading patients…"
                : `${filtered.length} ${filtered.length === 1 ? "patient" : "patients"} in your ward`}
            </p>
          </div>
          <AddPatientModal defaultWard={ward} />
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients or bed numbers" className="pl-9" />
          </div>
          <Select value={risk} onValueChange={(v) => setRisk(v as "all" | RiskLevel)}>
            <SelectTrigger><SelectValue placeholder="Filter risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {patientsQ.isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading patients…
          </div>
        ) : patientsQ.isError ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
            <p className="font-medium">Couldn't load patients</p>
            <p className="text-sm text-muted-foreground">{errorMessage(patientsQ.error)}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
            <p className="font-medium">No patients to show</p>
            <p className="text-sm text-muted-foreground">Try adjusting filters or admit a new patient.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PatientCard key={p.id} patient={p} vitals={byPatient[p.id] ?? []} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
