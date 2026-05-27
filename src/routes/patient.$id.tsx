import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { VitalsForm } from "@/components/VitalsForm";
import { TrendChart } from "@/components/TrendChart";
import { Timeline } from "@/components/Timeline";
import { AuditLogs } from "@/components/AuditLogs";
import { DoctorNotes } from "@/components/DoctorNotes";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { latestVital } from "@/utils/clinical";
import { exportPatientPDF } from "@/utils/pdf";
import {
  Activity, ArrowLeft, ClipboardList, FileDown, FileText,
  LayoutDashboard, MessageSquare, Plus, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/$id")({
  head: () => ({ meta: [{ title: "Patient — Vitalyn" }] }),
  component: PatientPage,
});

type Section = "overview" | "vitals" | "timeline" | "audit" | "notes";

function PatientPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    user, hydrated, patients, patientVitals, patientNotes, patientAcks, patientAudits,
  } = useVitalyn();

  useEffect(() => { if (hydrated && !user) navigate({ to: "/login" }); }, [user, hydrated, navigate]);

  const patient = patients.find((p) => p.id === id);
  const [section, setSection] = useState<Section>("overview");

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-xl font-semibold">Patient not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary underline">Go home</Link>
        </div>
      </div>
    );
  }

  const vitals = patientVitals(id);
  const notes = patientNotes(id);
  const acks = patientAcks(id);
  const audits = patientAudits(id);
  const latest = latestVital(vitals);

  const items: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { id: "vitals", label: "Enter Vitals", icon: <Plus className="size-4" /> },
    { id: "timeline", label: "Timeline & Replay", icon: <Timer className="size-4" /> },
    { id: "audit", label: "Audit Logs", icon: <ClipboardList className="size-4" /> },
    { id: "notes", label: "Doctor Notes", icon: <MessageSquare className="size-4" /> },
  ];

  function exportPDF() {
    exportPatientPDF({ patient: patient!, vitals, notes, acks, audits });
    toast.success("PDF exported");
  }

  const back = user?.role === "doctor" ? "/doctor" : "/nurse";

  return (
    <div className="min-h-screen bg-background">
      <TopBar subtitle={`${patient.name} · Bed ${patient.bed} · ${patient.ward}`} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Link to={back} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-1">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setSection(it.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition",
                  section === it.id ? "bg-accent font-medium text-accent-foreground" : "hover:bg-muted",
                )}
              >
                {it.icon}{it.label}
              </button>
            ))}
            <button
              onClick={exportPDF}
              className="mt-2 flex w-full items-center gap-2 rounded-md border bg-card px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <FileDown className="size-4" /> Export Report (PDF)
            </button>
          </aside>

          <div className="space-y-6">
            {section === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-[1fr_280px]">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle>{patient.name}</CardTitle>
                      {latest && <RiskBadge risk={latest.risk} />}
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <Info label="Age" value={patient.age} />
                      <Info label="Bed" value={patient.bed} />
                      <Info label="Ward" value={patient.ward} />
                      <Info label="Admitted" value={new Date(patient.admittedAt).toLocaleDateString()} />
                      {latest && (
                        <>
                          <Info label="qSOFA" value={latest.qsofa} />
                          <Info label="GCS" value={latest.gcsTotal} />
                          <Info label="Temp" value={`${latest.temperature.toFixed(1)}°C`} />
                          <Info label="Updated" value={new Date(latest.timestamp).toLocaleTimeString()} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">CDSS Assessment</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {latest ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase text-muted-foreground">Tier</span>
                            <span className="font-mono text-xs font-semibold">{latest.clinicalRiskTier}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <Info label="qSOFA" value={latest.qsofa} />
                            <Info label="SIRS" value={latest.sirs} />
                            <Info label="GCS" value={latest.gcsTotal} />
                          </div>
                          <div className="rounded-md bg-muted/60 p-2">
                            <div className="text-xs uppercase text-muted-foreground">Guidance</div>
                            <div>{latest.clinicalGuidance}</div>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No vitals recorded.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <TrendChart vitals={vitals} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Recent activity</CardTitle>
                      <Activity className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {audits.slice(0, 5).map((a) => (
                        <div key={a.id} className="flex justify-between gap-3 border-b border-dashed pb-1.5 last:border-0">
                          <div>
                            <div className="font-medium">{a.action}</div>
                            <div className="text-xs text-muted-foreground">{a.userName} · {a.role}</div>
                          </div>
                          <div className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(a.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {audits.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Latest doctor notes</CardTitle>
                      <FileText className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {notes.slice(0, 2).map((n) => (
                        <div key={n.id} className="rounded-md border bg-muted/30 p-2">
                          <div className="text-xs text-muted-foreground">{n.doctorName} · {new Date(n.timestamp).toLocaleString()}</div>
                          <p>{n.text}</p>
                        </div>
                      ))}
                      {notes.length === 0 && <p className="text-muted-foreground">No notes yet.</p>}
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end">
                  <Button onClick={exportPDF} variant="outline" className="gap-1.5">
                    <FileDown className="size-4" /> Export PDF
                  </Button>
                </div>
              </>
            )}

            {section === "vitals" && <VitalsForm patientId={id} />}
            {section === "timeline" && <Timeline vitals={vitals} notes={notes} acks={acks} audits={audits} />}
            {section === "audit" && <AuditLogs audits={audits} />}
            {section === "notes" && (
              <DoctorNotes patientId={id} notes={notes} acks={acks} vitals={vitals} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
