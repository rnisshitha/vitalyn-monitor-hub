import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RiskBadge } from "@/components/RiskBadge";
import type { Acknowledgement, AuditEntry, DoctorNote, VitalEntry } from "@/types";
import { Activity, FileText, MessageSquare, ShieldCheck } from "lucide-react";

type EventType = "vital" | "alert" | "ack" | "note";

interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: string;
  title: string;
  description: string;
  vital?: VitalEntry;
}

export function Timeline({
  vitals, notes, acks, audits,
}: {
  vitals: VitalEntry[]; notes: DoctorNote[]; acks: Acknowledgement[]; audits: AuditEntry[];
}) {
  void audits;
  const events = useMemo<TimelineEvent[]>(() => {
    const ev: TimelineEvent[] = [];
    for (const v of vitals) {
      ev.push({
        id: `v-${v.id}`, type: "vital", timestamp: v.timestamp,
        title: `Vitals recorded by ${v.enteredBy}`,
        description: `Temp ${v.temperature}°C · RR ${v.respiratoryRate} · SBP ${v.systolicBP} · GCS ${v.gcsTotal} · qSOFA ${v.qsofa}`,
        vital: v,
      });
      if (v.risk === "Critical") {
        ev.push({
          id: `al-${v.id}`, type: "alert", timestamp: v.timestamp,
          title: `${v.clinicalRiskTier} alert`,
          description: v.clinicalGuidance,
          vital: v,
        });
      }
    }
    for (const a of acks) {
      ev.push({
        id: `ak-${a.id}`, type: "ack", timestamp: a.timestamp,
        title: `${a.doctorName} acknowledged alert`,
        description: `Alert status: ${a.status}`,
      });
    }
    for (const n of notes) {
      ev.push({
        id: `n-${n.id}`, type: "note", timestamp: n.timestamp,
        title: `Clinical note by ${n.doctorName}`,
        description: n.text,
      });
    }
    return ev.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  }, [vitals, notes, acks]);

  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    vital: true, alert: true, ack: true, note: true,
  });
  const [slider, setSlider] = useState<number[]>([events.length]);

  const visible = events
    .filter((e) => filters[e.type])
    .slice(0, slider[0] ?? events.length);

  const current = visible[visible.length - 1];
  const previous = visible[visible.length - 2];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline &amp; Replay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          {(["vital", "alert", "ack", "note"] as EventType[]).map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm capitalize">
              <Checkbox
                checked={filters[t]}
                onCheckedChange={(c) => setFilters((f) => ({ ...f, [t]: !!c }))}
              />
              {labelFor(t)}
            </label>
          ))}
        </div>

        {events.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Replay</span>
              <span>{Math.min(slider[0] ?? events.length, events.length)} / {events.length} events</span>
            </div>
            <Slider
              min={1}
              max={events.length}
              step={1}
              value={[Math.min(slider[0] ?? events.length, events.length)]}
              onValueChange={setSlider}
            />
          </div>
        )}

        {current && current.vital && previous?.vital && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="mb-2 font-medium">Compare previous vs current</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 tabular-nums sm:grid-cols-4">
              <Diff label="Temp" a={previous.vital.temperature} b={current.vital.temperature} unit="°C" />
              <Diff label="RR" a={previous.vital.respiratoryRate} b={current.vital.respiratoryRate} />
              <Diff label="SBP" a={previous.vital.systolicBP} b={current.vital.systolicBP} />
              <Diff label="qSOFA" a={previous.vital.qsofa} b={current.vital.qsofa} />
            </div>
          </div>
        )}

        <ol className="relative space-y-4 border-l pl-6">
          {visible.length === 0 && (
            <li className="text-sm text-muted-foreground">No events match the selected filters.</li>
          )}
          {visible.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[31px] grid size-6 place-items-center rounded-full bg-background ring-1 ring-border">
                {iconFor(e.type)}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{e.title}</span>
                {e.vital && <RiskBadge risk={e.vital.risk} />}
                <span className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{e.description}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function Diff({ label, a, b, unit = "" }: { label: string; a: number; b: number; unit?: string }) {
  const delta = b - a;
  const sign = delta > 0 ? "+" : "";
  const color = delta === 0 ? "text-muted-foreground" : delta > 0 ? "text-[var(--risk-high)]" : "text-[var(--risk-low)]";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{a}{unit} → <strong>{b}{unit}</strong> <span className={color}>({sign}{delta.toFixed(1)})</span></div>
    </div>
  );
}

function iconFor(t: EventType) {
  const cls = "size-3.5";
  if (t === "vital") return <Activity className={cls} />;
  if (t === "alert") return <Activity className={cls + " text-[var(--risk-critical)]"} />;
  if (t === "ack") return <ShieldCheck className={cls + " text-[var(--risk-low)]"} />;
  return <MessageSquare className={cls} />;
}
function labelFor(t: EventType) {
  return { vital: "Vital entries", alert: "Risk alerts", ack: "Acknowledgements", note: "Clinical notes" }[t];
}
