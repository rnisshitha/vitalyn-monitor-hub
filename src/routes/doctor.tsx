import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { PatientCard } from "@/components/PatientCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { latestVital } from "@/utils/clinical";
import { RiskBadge } from "@/components/RiskBadge";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — Vitalyn" }] }),
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const { user, wards, patients, vitals } = useVitalyn();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  const [selectedWard, setSelectedWard] = useState<string | "all">("all");

  const wardStats = useMemo(
    () =>
      wards.map((w) => {
        const ws = patients.filter((p) => p.ward === w);
        const risks = ws.map((p) => latestVital(vitals.filter((v) => v.patientId === p.id))?.risk);
        const critical = risks.filter((r) => r === "Critical").length;
        const high = risks.filter((r) => r === "High").length;
        return { ward: w, count: ws.length, critical, high };
      }),
    [wards, patients, vitals],
  );

  const visiblePatients =
    selectedWard === "all" ? patients : patients.filter((p) => p.ward === selectedWard);

  const sorted = [...visiblePatients].sort((a, b) => {
    const order = { Critical: 0, High: 1, Moderate: 2, Low: 3 } as const;
    const ra = latestVital(vitals.filter((v) => v.patientId === a.id))?.risk ?? "Low";
    const rb = latestVital(vitals.filter((v) => v.patientId === b.id))?.risk ?? "Low";
    return order[ra] - order[rb];
  });

  return (
    <div className="min-h-screen bg-background">
      <TopBar subtitle="All wards" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Wards Overview</h1>
        <p className="text-sm text-muted-foreground">Click a ward to view its patients.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <WardTile
            label="All wards"
            count={patients.length}
            critical={patients.filter((p) => latestVital(vitals.filter((v) => v.patientId === p.id))?.risk === "Critical").length}
            active={selectedWard === "all"}
            onClick={() => setSelectedWard("all")}
          />
          {wardStats.map((s) => (
            <WardTile
              key={s.ward}
              label={s.ward}
              count={s.count}
              critical={s.critical}
              high={s.high}
              active={selectedWard === s.ward}
              onClick={() => setSelectedWard(s.ward)}
            />
          ))}
        </div>

        <div className="mt-8 mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedWard === "all" ? "All patients" : `${selectedWard} patients`}
          </h2>
          <span className="text-sm text-muted-foreground">{sorted.length} patients</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <PatientCard key={p.id} patient={p} vitals={vitals.filter((v) => v.patientId === p.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}

function WardTile({
  label, count, critical = 0, high = 0, active, onClick,
}: {
  label: string; count: number; critical?: number; high?: number; active: boolean; onClick: () => void;
}) {
  return (
    <Card className={`cursor-pointer transition ${active ? "ring-2 ring-primary" : "hover:shadow-md"}`} onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Building2 className="size-4 text-primary" />
            {label}
          </div>
          <span className="text-2xl font-bold tabular-nums">{count}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {critical > 0 && <RiskBadge risk="Critical" />}
          {high > 0 && <RiskBadge risk="High" />}
          {critical === 0 && high === 0 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
              Stable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
