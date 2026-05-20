import { Link } from "@tanstack/react-router";
import { Bed, Clock } from "lucide-react";
import type { Patient, VitalEntry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { latestVital } from "@/utils/clinical";
import { formatDistanceToNow } from "date-fns";

export function PatientCard({
  patient,
  vitals,
}: {
  patient: Patient;
  vitals: VitalEntry[];
}) {
  const latest = latestVital(vitals);
  return (
    <Link to="/patient/$id" params={{ id: patient.id }} className="group block">
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold tracking-tight">{patient.name}</div>
              <div className="text-xs text-muted-foreground">
                Age {patient.age} · {patient.ward}
              </div>
            </div>
            {latest ? <RiskBadge risk={latest.risk} /> : <span className="text-xs text-muted-foreground">No data</span>}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Bed className="size-3.5" /> Bed {patient.bed}
            </span>
            {latest && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatDistanceToNow(new Date(latest.timestamp), { addSuffix: true })}
              </span>
            )}
          </div>
          {latest && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label="qSOFA" value={latest.qsofa} />
              <Stat label="GCS" value={latest.gcsTotal} />
              <Stat label="Temp" value={`${latest.temperature.toFixed(1)}°`} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/60 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
