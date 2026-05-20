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
  generateConfidence,
  generateExplanation,
  generateRecommendation,
  getRiskLevel,
} from "@/utils/clinical";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const eyeOptions = [
  { v: 4, l: "4 - Spontaneous" },
  { v: 3, l: "3 - To sound" },
  { v: 2, l: "2 - To pressure" },
  { v: 1, l: "1 - None" },
];
const verbalOptions = [
  { v: 5, l: "5 - Oriented" },
  { v: 4, l: "4 - Confused" },
  { v: 3, l: "3 - Inappropriate words" },
  { v: 2, l: "2 - Incomprehensible sounds" },
  { v: 1, l: "1 - None" },
];
const motorOptions = [
  { v: 6, l: "6 - Obeys commands" },
  { v: 5, l: "5 - Localizes pain" },
  { v: 4, l: "4 - Withdraws from pain" },
  { v: 3, l: "3 - Abnormal flexion" },
  { v: 2, l: "2 - Extension" },
  { v: 1, l: "1 - None" },
];

export function VitalsForm({ patientId }: { patientId: string }) {
  const { addVital, user } = useVitalyn();
  const [temperature, setTemperature] = useState("37.0");
  const [rr, setRr] = useState("18");
  const [sbp, setSbp] = useState("120");
  const [mental, setMental] = useState<"Normal" | "Altered">("Normal");
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);
  const [result, setResult] = useState<VitalEntry | null>(null);

  const gcs = useMemo(() => calculateGCS(eye, verbal, motor), [eye, verbal, motor]);
  const qsofa = useMemo(
    () =>
      calculateQSOFA({
        respiratoryRate: Number(rr),
        systolicBP: Number(sbp),
        mentalStatus: mental,
        gcsTotal: gcs,
      }),
    [rr, sbp, mental, gcs],
  );
  const risk = getRiskLevel(qsofa);

  function analyze() {
    const t = Number(temperature);
    const v: VitalEntry = {
      id: `v-${Date.now()}`,
      patientId,
      timestamp: new Date().toISOString(),
      temperature: t,
      respiratoryRate: Number(rr),
      systolicBP: Number(sbp),
      mentalStatus: mental,
      gcsEye: eye,
      gcsVerbal: verbal,
      gcsMotor: motor,
      gcsTotal: gcs,
      qsofa,
      risk,
      confidence: generateConfidence(qsofa, gcs),
      explanation: generateExplanation({
        temperature: t,
        respiratoryRate: Number(rr),
        systolicBP: Number(sbp),
        mentalStatus: mental,
        gcsTotal: gcs,
        qsofa,
      }),
      recommendation: generateRecommendation(risk),
      enteredBy: user?.fullName || user?.ward || "Sarah Nguyen",
    };
    addVital(v);
    setResult(v);
    toast.success(`Vitals analyzed — Risk: ${risk}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Enter Vital Signs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Num label="Temperature (°C)" value={temperature} setValue={setTemperature} step="0.1" />
            <Num label="Respiratory Rate" value={rr} setValue={setRr} />
            <Num label="Systolic BP (mmHg)" value={sbp} setValue={setSbp} />
            <div className="grid gap-1.5">
              <Label>Mental Status</Label>
              <Select value={mental} onValueChange={(v) => setMental(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Altered">Altered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Glasgow Coma Scale</h3>
              <span className="text-sm">
                Total: <span className="font-semibold tabular-nums">{gcs}</span>
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <GcsSelect label="Eye Opening" value={eye} setValue={setEye} options={eyeOptions} />
              <GcsSelect label="Verbal Response" value={verbal} setValue={setVerbal} options={verbalOptions} />
              <GcsSelect label="Motor Response" value={motor} setValue={setMotor} options={motorOptions} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3">
            <div className="text-sm">
              Live qSOFA: <span className="font-semibold tabular-nums">{qsofa}</span> · GCS:{" "}
              <span className="font-semibold tabular-nums">{gcs}</span>
            </div>
            <RiskBadge risk={risk} />
          </div>

          <Button onClick={analyze} className="gap-1.5">
            <Sparkles className="size-4" /> Analyze
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent>
          {!result ? (
            <p className="text-sm text-muted-foreground">
              Enter vitals and click <strong>Analyze</strong> to see risk assessment.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Risk</span>
                <RiskBadge risk={result.risk} />
              </div>
              <Row k="qSOFA" v={result.qsofa} />
              <Row k="GCS" v={result.gcsTotal} />
              <Row k="Confidence" v={`${(result.confidence * 100).toFixed(0)}%`} />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Explanation</div>
                <p className="mt-0.5">{result.explanation}</p>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Recommendation</div>
                <p className="mt-0.5">{result.recommendation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Num({
  label, value, setValue, step,
}: { label: string; value: string; setValue: (v: string) => void; step?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input type="number" step={step} value={value} onChange={(e) => setValue(e.target.value)} />
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
      <Label>{label}</Label>
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

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed pb-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium tabular-nums">{v}</span>
    </div>
  );
}
