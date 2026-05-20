import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Acknowledgement, DoctorNote, VitalEntry } from "@/types";
import { useVitalyn } from "@/hooks/useVitalynStore";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { latestVital } from "@/utils/clinical";

export function DoctorNotes({
  patientId, notes, acks, vitals,
}: {
  patientId: string; notes: DoctorNote[]; acks: Acknowledgement[]; vitals: VitalEntry[];
}) {
  const { user, addNote, acknowledge } = useVitalyn();
  const [text, setText] = useState("");

  const isDoctor = user?.role === "doctor";
  const latest = latestVital(vitals);
  const latestAck = latest && acks.find((a) => a.vitalId === latest.id);

  function saveNote() {
    if (!text.trim() || !user) return;
    addNote({
      id: `n-${Date.now()}`,
      patientId,
      timestamp: new Date().toISOString(),
      doctorName: user.fullName || "Doctor",
      text: text.trim(),
    });
    setText("");
    toast.success("Note saved");
  }

  function ack() {
    if (!latest || !user) return;
    acknowledge(patientId, latest.id, user.fullName || "Doctor");
    toast.success("Alert acknowledged");
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Acknowledgement</CardTitle>
          <Badge variant={latestAck ? "default" : "secondary"}>
            {latestAck ? "Acknowledged" : "Pending"}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {latest
              ? `Latest risk: ${latest.risk} (qSOFA ${latest.qsofa})`
              : "No vitals to acknowledge yet."}
          </div>
          {isDoctor && latest && !latestAck && (
            <Button onClick={ack} className="gap-1.5">
              <ShieldCheck className="size-4" /> Acknowledge Alert
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Doctor Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isDoctor && (
            <div className="space-y-2">
              <Textarea
                placeholder="Add clinical note, plan, or observations..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end">
                <Button onClick={saveNote} disabled={!text.trim()}>Save Note</Button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes recorded.</p>
            )}
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{n.doctorName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm">{n.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
