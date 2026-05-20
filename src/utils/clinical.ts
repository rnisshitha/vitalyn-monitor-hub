import type { RiskLevel, VitalEntry } from "@/types";

export function calculateGCS(eye: number, verbal: number, motor: number) {
  return eye + verbal + motor;
}

export function calculateQSOFA(opts: {
  respiratoryRate: number;
  systolicBP: number;
  mentalStatus: "Normal" | "Altered";
  gcsTotal: number;
}) {
  let score = 0;
  if (opts.respiratoryRate >= 22) score++;
  if (opts.systolicBP <= 100) score++;
  if (opts.mentalStatus === "Altered" || opts.gcsTotal <= 14) score++;
  return score;
}

export function getRiskLevel(qsofa: number): RiskLevel {
  if (qsofa <= 0) return "Low";
  if (qsofa === 1) return "Moderate";
  if (qsofa === 2) return "High";
  return "Critical";
}

export function generateConfidence(qsofa: number, gcsTotal: number) {
  const base = 0.7 + qsofa * 0.07;
  const gcsAdj = gcsTotal < 15 ? (15 - gcsTotal) * 0.01 : 0;
  return Math.min(0.98, base + gcsAdj);
}

export function generateExplanation(v: {
  respiratoryRate: number;
  systolicBP: number;
  mentalStatus: string;
  gcsTotal: number;
  temperature: number;
  qsofa: number;
}) {
  const reasons: string[] = [];
  if (v.respiratoryRate >= 22) reasons.push(`elevated respiratory rate (${v.respiratoryRate}/min)`);
  if (v.systolicBP <= 100) reasons.push(`low systolic BP (${v.systolicBP} mmHg)`);
  if (v.mentalStatus === "Altered") reasons.push("altered mental status");
  if (v.gcsTotal <= 14) reasons.push(`reduced GCS (${v.gcsTotal})`);
  if (v.temperature >= 38) reasons.push(`fever (${v.temperature}°C)`);
  if (v.temperature <= 36) reasons.push(`hypothermia (${v.temperature}°C)`);
  if (reasons.length === 0) return "All monitored parameters are within normal ranges.";
  return `Risk indicators detected: ${reasons.join(", ")}.`;
}

export function generateRecommendation(risk: RiskLevel) {
  switch (risk) {
    case "Low":
      return "Continue routine monitoring every 4 hours.";
    case "Moderate":
      return "Increase monitoring frequency to every 2 hours. Notify charge nurse.";
    case "High":
      return "Notify attending physician immediately. Initiate sepsis bundle workup (lactate, cultures).";
    case "Critical":
      return "Rapid response activation. Consider ICU transfer, broad-spectrum antibiotics within 1 hour, fluid resuscitation.";
  }
}

export function riskColor(risk: RiskLevel) {
  switch (risk) {
    case "Low":
      return "risk-low";
    case "Moderate":
      return "risk-moderate";
    case "High":
      return "risk-high";
    case "Critical":
      return "risk-critical";
  }
}

export function latestVital(entries: VitalEntry[]): VitalEntry | undefined {
  if (!entries.length) return undefined;
  return [...entries].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))[0];
}
