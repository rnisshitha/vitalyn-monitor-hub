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
import type { GcsStatus, RiskLevel, VitalEntry } from "@/types";
import {
  calculateGCS,
  calculateQSOFA,
  calculateSIRS,
  evaluateClinicalRisk,
  gcsStatus,
} from "@/utils/clinical";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { toast } from "sonner";
import { Activity, AlertTriangle, Brain, CheckCircle2, HeartPulse, ShieldAlert, Sparkles, Stethoscope, Thermometer, Wind } from "lucide-react";

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
          <CardTitle className="text-base">CDSS Assessment</CardTitle>
          <p className="text-xs text-muted-foreground">
            Protocol-driven evaluation using qSOFA · SIRS · GCS.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <CdssReport
            recorded={!!result}
            gcs={result?.gcsTotal ?? gcs}
            gcsStatus={result?.gcsStatus ?? status}
            qsofa={result?.qsofa ?? qsofa}
            sirs={result?.sirs ?? sirs}
            tier={result?.clinicalRiskTier ?? evalResult.tier}
            risk={result?.risk ?? evalResult.risk}
            guidance={result?.clinicalGuidance ?? evalResult.guidance}
            hasWbc={wbc !== ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function CdssReport({
  recorded, gcs, gcsStatus, qsofa, sirs, tier, risk, guidance, hasWbc,
}: {
  recorded: boolean;
  gcs: number;
  gcsStatus: GcsStatus;
  qsofa: number;
  sirs: number;
  tier: string;
  risk: RiskLevel;
  guidance: string;
  hasWbc: boolean;
}) {
  const tierIcon =
    risk === "Critical" ? <ShieldAlert className="size-5" /> :
    risk === "Moderate" ? <AlertTriangle className="size-5" /> :
    <CheckCircle2 className="size-5" />;

  const tierTone =
    risk === "Critical" ? "border-[var(--risk-critical)]/40 bg-[var(--risk-critical)]/10 text-[var(--risk-critical)]" :
    risk === "Moderate" ? "border-[var(--risk-moderate)]/50 bg-[var(--risk-moderate)]/15 text-[oklch(0.45_0.13_85)]" :
    "border-[var(--risk-low)]/40 bg-[var(--risk-low)]/10 text-[var(--risk-low)]";

  const qsofaDetail =
    qsofa >= 2 ? "≥2 criteria met — high suspicion of sepsis." :
    qsofa === 1 ? "1 criterion met — monitor closely." :
    "No qSOFA criteria met.";
  const sirsDetail =
    sirs >= 2 ? "≥2 SIRS criteria — systemic inflammatory response present." :
    sirs === 1 ? "1 SIRS criterion met." :
    "No SIRS criteria met.";
  const gcsDetail =
    gcsStatus === "Altered Mental Status"
      ? `GCS ${gcs}/15 — altered mental status.`
      : `GCS ${gcs}/15 — neurologically intact.`;

  return (
    <div className="space-y-4">
      {!recorded && (
        <p className="text-xs text-muted-foreground">
          Live preview based on current inputs. Click <strong className="text-foreground">Run CDSS Evaluation</strong> to record into the patient timeline.
        </p>
      )}

      <div className={`flex items-start gap-3 rounded-xl border p-4 ${tierTone}`}>
        <div className="mt-0.5">{tierIcon}</div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest opacity-80">Clinical Risk Tier</div>
          <div className="mt-0.5 text-lg font-bold leading-tight">{tier}</div>
          <p className="mt-1 text-xs text-foreground/80">{guidance}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ScoreTile label="qSOFA" value={qsofa} max={3} />
        <ScoreTile label="SIRS" value={sirs} max={hasWbc ? 4 : 3} />
        <ScoreTile label="GCS" value={gcs} max={15} />
      </div>

      <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Explanation
        </div>
        <ExplainRow icon={<Activity className="size-3.5" />} text={qsofaDetail} />
        <ExplainRow icon={<HeartPulse className="size-3.5" />} text={sirsDetail} />
        <ExplainRow icon={<Brain className="size-3.5" />} text={gcsDetail} />
      </div>
    </div>
  );
}

function ExplainRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-foreground/85">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ScoreTile({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-base font-bold tabular-nums">
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">/{max}</span>
      </div>
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
