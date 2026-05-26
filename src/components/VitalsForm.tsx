import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskBadge } from "@/components/RiskBadge";
import type { VitalEntry } from "@/types";
import {
  calculateGCS,
  calculateQSOFA,
  calculateSIRS,
  evaluateClinicalRisk,
  gcsStatus,
} from "@/utils/clinical";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { toast } from "sonner";
import { Activity, HeartPulse, Sparkles, Stethoscope, Thermometer, Wind } from "lucide-react";

const eyeOptions = [
  { v: 4, l: "4 — Spontaneous" },
  { v: 3, l: "3 — To sound" },
  { v: 2, l: "2 — To pressure" },
  { v: 1, l: "1 — None" },
];
const verbalOptions = [
  { v: 5, l: "5 — Oriented" },
  { v: 4, l: "4 — Confused" },
  { v: 3, l: "3 — Inappropriate words" },
  { v: 2, l: "2 — Incomprehensible sounds" },
  { v: 1, l: "1 — None" },
];
const motorOptions = [
  { v: 6, l: "6 — Obeys commands" },
  { v: 5, l: "5 — Localizes pain" },
  { v: 4, l: "4 — Withdraws from pain" },
  { v: 3, l: "3 — Abnormal flexion" },
  { v: 2, l: "2 — Extension" },
  { v: 1, l: "1 — None" },
];

export function VitalsForm({ patientId }: { patientId: string }) {
  const { addVital, user } = useVitalyn();
  const [temperature, setTemperature] = useState("37.0");
  const [heartRate, setHeartRate] = useState("80");
  const [rr, setRr] = useState("18");
  const [sbp, setSbp] = useState("120");
  const [wbc, setWbc] = useState("");
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);
  const [result, setResult] = useState<VitalEntry | null>(null);

  const gcs = useMemo(() => calculateGCS(eye, verbal, motor), [eye, verbal, motor]);
  const status = gcsStatus(gcs);
  const qsofa = useMemo(
    () =>
      calculateQSOFA({
        respiratoryRate: Number(rr),
        systolicBP: Number(sbp),
        gcsTotal: gcs,
      }),
    [rr, sbp, gcs],
  );
  const sirs = useMemo(
    () =>
      calculateSIRS({
        temperature: Number(temperature),
        heartRate: Number(heartRate),
        respiratoryRate: Number(rr),
        wbc: wbc === "" ? undefined : Number(wbc),
      }),
    [temperature, heartRate, rr, wbc],
  );
  const evalResult = useMemo(
    () => evaluateClinicalRisk({ qsofa, sirs, altered: status === "Altered Mental Status" }),
    [qsofa, sirs, status],
  );

  function analyze() {
    const t = Number(temperature);
    const hr = Number(heartRate);
    const wbcNum = wbc === "" ? undefined : Number(wbc);
    const v: VitalEntry = {
      id: `v-${Date.now()}`,
      patientId,
      timestamp: new Date().toISOString(),
      temperature: t,
      heartRate: hr,
      respiratoryRate: Number(rr),
      systolicBP: Number(sbp),
      wbc: wbcNum,
      mentalStatus: status === "Altered Mental Status" ? "Altered" : "Normal",
      gcsEye: eye,
      gcsVerbal: verbal,
      gcsMotor: motor,
      gcsTotal: gcs,
      gcsStatus: status,
      qsofa,
      sirs,
      risk: evalResult.risk,
      clinicalRiskTier: evalResult.tier,
      clinicalGuidance: evalResult.guidance,
      enteredBy: user?.fullName || user?.ward || "Unknown",
    };
    addVital(v);
    setResult(v);
    toast.success(`CDSS evaluation complete — ${evalResult.tier}`);
  }

  const cdssJson = {
    gcs_total: gcs,
    gcs_status: status,
    qsofa_score: qsofa,
    sirs_score: sirs,
    clinical_risk_tier: evalResult.tier,
    clinical_guidance: evalResult.guidance,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card className="border-border/60">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" />
            Telemetry Input
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter exact bedside readings. CDSS will not infer missing values.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VitalInput icon={<Thermometer className="size-4" />} label="Temperature" unit="°C" value={temperature} setValue={setTemperature} step="0.1" />
            <VitalInput icon={<HeartPulse className="size-4" />} label="Heart Rate" unit="bpm" value={heartRate} setValue={setHeartRate} />
            <VitalInput icon={<Wind className="size-4" />} label="Respiratory Rate" unit="/min" value={rr} setValue={setRr} />
            <VitalInput icon={<Activity className="size-4" />} label="Systolic BP" unit="mmHg" value={sbp} setValue={setSbp} />
            <VitalInput icon={<Activity className="size-4" />} label="WBC (optional)" unit="×10⁹/L" value={wbc} setValue={setWbc} placeholder="—" step="0.1" />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Glasgow Coma Scale</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="rounded-md bg-background px-2 py-0.5 font-mono text-base font-semibold tabular-nums">
                  {gcs}
                </span>
                <span className={`text-xs font-medium ${status === "Altered Mental Status" ? "text-[var(--risk-critical)]" : "text-[var(--risk-low)]"}`}>
                  {status}
                </span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <GcsSelect label="Eye Opening" value={eye} setValue={setEye} options={eyeOptions} />
              <GcsSelect label="Verbal Response" value={verbal} setValue={setVerbal} options={verbalOptions} />
              <GcsSelect label="Motor Response" value={motor} setValue={setMotor} options={motorOptions} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Score label="qSOFA" value={qsofa} max={3} />
            <Score label="SIRS" value={sirs} max={wbc === "" ? 3 : 4} />
            <Score label="GCS" value={gcs} max={15} />
            <div className="flex items-center justify-center rounded-lg border border-border/60 bg-background p-3">
              <RiskBadge risk={evalResult.risk} />
            </div>
          </div>

          <Button onClick={analyze} className="gap-1.5" size="lg">
            <Sparkles className="size-4" /> Run CDSS Evaluation
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-base">CDSS Output</CardTitle>
          <p className="text-xs text-muted-foreground">
            Protocol-driven assessment (qSOFA · SIRS · GCS).
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {!result ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Live preview — click <strong className="text-foreground">Run CDSS Evaluation</strong> to record.
              </p>
              <pre className="overflow-x-auto rounded-md border border-border/60 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
{JSON.stringify(cdssJson, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Clinical Risk Tier
                  </span>
                  <RiskBadge risk={result.risk} />
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">{result.clinicalRiskTier}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ScoreSmall label="qSOFA" value={result.qsofa} />
                <ScoreSmall label="SIRS" value={result.sirs} />
                <ScoreSmall label="GCS" value={result.gcsTotal} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">GCS Status</div>
                <div className="mt-0.5 font-medium">{result.gcsStatus}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Clinical Guidance
                </div>
                <p className="mt-1 rounded-md border border-border/60 bg-background p-2 text-sm">
                  {result.clinicalGuidance}
                </p>
              </div>
              <details className="rounded-md border border-border/60 bg-muted/30 p-2">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                  Raw JSON
                </summary>
                <pre className="mt-2 overflow-x-auto font-mono text-[11px] leading-relaxed">
{JSON.stringify(
  {
    gcs_total: result.gcsTotal,
    gcs_status: result.gcsStatus,
    qsofa_score: result.qsofa,
    sirs_score: result.sirs,
    clinical_risk_tier: result.clinicalRiskTier,
    clinical_guidance: result.clinicalGuidance,
  },
  null,
  2,
)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VitalInput({
  icon, label, unit, value, setValue, step, placeholder,
}: {
  icon: React.ReactNode; label: string; unit: string;
  value: string; setValue: (v: string) => void; step?: string; placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label} <span className="text-muted-foreground/70">({unit})</span>
      </Label>
      <Input
        type="number"
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="font-mono tabular-nums"
      />
    </div>
  );
}

function GcsSelect({
  label, value, setValue, options,
}: {
  label: string; value: number; setValue: (v: number) => void;
  options: { v: number; l: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={String(value)} onValueChange={(v) => setValue(Number(v))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.v} value={String(o.v)}>{o.l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Score({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
        {value}
        <span className="text-xs text-muted-foreground">/{max}</span>
      </div>
    </div>
  );
}

function ScoreSmall({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/50 p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}
