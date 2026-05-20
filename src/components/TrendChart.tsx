import { useMemo, useState } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { VitalEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RANGES = [
  { key: "24h", label: "24 Hours", hours: 24 },
  { key: "3d", label: "3 Days", hours: 72 },
  { key: "7d", label: "7 Days", hours: 168 },
  { key: "all", label: "All Time", hours: Infinity },
] as const;

export function TrendChart({ vitals }: { vitals: VitalEntry[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("24h");

  const data = useMemo(() => {
    const cutoff = Date.now() - (RANGES.find((r) => r.key === range)!.hours) * 3600_000;
    return vitals
      .filter((v) => +new Date(v.timestamp) >= cutoff)
      .map((v) => ({
        time: new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }),
        Temperature: v.temperature,
        RespRate: v.respiratoryRate,
        SystolicBP: v.systolicBP,
        qSOFA: v.qsofa,
        GCS: v.gcsTotal,
      }));
  }, [vitals, range]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Vital Trends</CardTitle>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={range === r.key ? "default" : "outline"}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="grid h-72 place-items-center text-sm text-muted-foreground">
            No vitals in this range.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 15]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="Temperature" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="RespRate" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="SystolicBP" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="qSOFA" stroke="var(--color-chart-5)" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="GCS" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
