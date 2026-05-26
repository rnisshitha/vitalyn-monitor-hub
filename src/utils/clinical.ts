import type { ClinicalRiskTier, GcsStatus, RiskLevel, VitalEntry } from "@/types";

export function calculateGCS(eye: number, verbal: number, motor: number) {
  return eye + verbal + motor;
}

export function gcsStatus(gcsTotal: number): GcsStatus {
  return gcsTotal < 15 ? "Altered Mental Status" : "Normal";
}

export function calculateQSOFA(opts: {
  respiratoryRate: number;
  systolicBP: number;
  gcsTotal: number;
}) {
  let score = 0;
  if (opts.respiratoryRate >= 22) score++;
  if (opts.systolicBP <= 100) score++;
  if (opts.gcsTotal < 15) score++;
  return score;
}

export function calculateSIRS(opts: {
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  wbc?: number;
}) {
  let score = 0;
  if (opts.temperature < 36.0 || opts.temperature > 38.0) score++;
  if (opts.heartRate > 90) score++;
  if (opts.respiratoryRate > 20) score++;
  if (opts.wbc !== undefined && !isNaN(opts.wbc)) {
    if (opts.wbc < 4.0 || opts.wbc > 12.0) score++;
  }
  return score;
}

export function evaluateClinicalRisk(opts: {
  qsofa: number;
  sirs: number;
  altered: boolean;
}): { tier: ClinicalRiskTier; risk: RiskLevel; guidance: string } {
  const { qsofa, sirs, altered } = opts;
  if (qsofa >= 2 || (sirs >= 2 && altered)) {
    return {
      tier: "CRITICAL RISK",
      risk: "Critical",
      guidance:
        "Initiate Sepsis Hour-1 Bundle immediately: obtain lactate, blood cultures before antibiotics, administer broad-spectrum antibiotics, begin 30 mL/kg crystalloid fluid resuscitation, apply vasopressors if MAP < 65 after fluids. Escalate to ICU.",
    };
  }
  if (qsofa === 1 || sirs >= 2) {
    return {
      tier: "MODERATE RISK",
      risk: "Moderate",
      guidance:
        "Re-evaluate full vitals in 1 hour. Draw lactate and CBC. Maintain continuous monitoring and prepare sepsis workup if scores trend upward.",
    };
  }
  return {
    tier: "LOW RISK",
    risk: "Low",
    guidance: "Continue standard monitoring. Re-evaluate vitals in 4 hours.",
  };
}

export function riskColor(risk: RiskLevel) {
  switch (risk) {
    case "Low":
      return "risk-low";
    case "Moderate":
      return "risk-moderate";
    case "Critical":
      return "risk-critical";
  }
}

export function latestVital(entries: VitalEntry[]): VitalEntry | undefined {
  if (!entries.length) return undefined;
  return [...entries].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))[0];
}
