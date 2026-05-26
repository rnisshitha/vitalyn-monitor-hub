import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

const styles: Record<RiskLevel, string> = {
  Low: "bg-[var(--risk-low)]/15 text-[var(--risk-low)] border-[var(--risk-low)]/30",
  Moderate: "bg-[var(--risk-moderate)]/20 text-[oklch(0.45_0.13_85)] border-[var(--risk-moderate)]/40",
  Critical: "bg-[var(--risk-critical)]/15 text-[var(--risk-critical)] border-[var(--risk-critical)]/40",
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[risk],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {risk}
    </span>
  );
}
