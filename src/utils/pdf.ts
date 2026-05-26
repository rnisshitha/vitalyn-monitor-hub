import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  Acknowledgement,
  AuditEntry,
  DoctorNote,
  Patient,
  VitalEntry,
} from "@/types";
import { latestVital } from "./clinical";

export function exportPatientPDF(opts: {
  patient: Patient;
  vitals: VitalEntry[];
  notes: DoctorNote[];
  acks: Acknowledgement[];
  audits: AuditEntry[];
}) {
  const { patient, vitals, notes, acks, audits } = opts;
  const doc = new jsPDF();
  const latest = latestVital(vitals);

  // Header
  doc.setFillColor(28, 165, 175);
  doc.rect(0, 0, 210, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Vitalyn", 14, 15);
  doc.setFontSize(10);
  doc.text("Intelligent Sepsis Monitoring System", 14, 21);
  doc.setTextColor(20, 20, 20);

  // Patient block
  doc.setFontSize(14);
  doc.text("Patient Report", 14, 35);
  doc.setFontSize(10);
  doc.text(`Name: ${patient.name}`, 14, 43);
  doc.text(`Age: ${patient.age}`, 80, 43);
  doc.text(`Bed: ${patient.bed}`, 120, 43);
  doc.text(`Ward: ${patient.ward}`, 150, 43);
  doc.text(`Admitted: ${new Date(patient.admittedAt).toLocaleString()}`, 14, 49);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 55);

  // Latest scores
  doc.setFontSize(12);
  doc.text("Current Assessment", 14, 66);
  doc.setFontSize(10);
  if (latest) {
    doc.text(`qSOFA: ${latest.qsofa}`, 14, 73);
    doc.text(`SIRS: ${latest.sirs}`, 50, 73);
    doc.text(`GCS: ${latest.gcsTotal} (${latest.gcsStatus})`, 85, 73);
    doc.text(`Tier: ${latest.clinicalRiskTier}`, 150, 73);
    const guide = doc.splitTextToSize(`Clinical Guidance: ${latest.clinicalGuidance}`, 180);
    doc.text(guide, 14, 80);
  } else {
    doc.text("No vitals recorded yet.", 14, 73);
  }

  // Vitals table
  autoTable(doc, {
    startY: 105,
    head: [["Time", "Temp °C", "HR", "RR", "SBP", "WBC", "GCS", "qSOFA", "SIRS", "Tier"]],
    body: vitals.map((v) => [
      new Date(v.timestamp).toLocaleString(),
      v.temperature.toFixed(1),
      v.heartRate,
      v.respiratoryRate,
      v.systolicBP,
      v.wbc ?? "—",
      v.gcsTotal,
      v.qsofa,
      v.sirs,
      v.clinicalRiskTier,
    ]),
    headStyles: { fillColor: [28, 165, 175] },
    styles: { fontSize: 8 },
  });

  // Notes
  let y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Doctor Notes", 14, y);
  y += 6;
  doc.setFontSize(9);
  if (!notes.length) {
    doc.text("No notes.", 14, y);
    y += 6;
  } else {
    for (const n of notes) {
      const head = `${new Date(n.timestamp).toLocaleString()} — ${n.doctorName}`;
      doc.setFont("helvetica", "bold");
      doc.text(head, 14, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(n.text, 180);
      doc.text(lines, 14, y + 5);
      y += 5 + lines.length * 5 + 3;
      if (y > 270) { doc.addPage(); y = 20; }
    }
  }

  // Audit summary
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.text("Audit Log Summary", 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [["Time", "User", "Role", "Action"]],
    body: audits.slice(0, 20).map((a) => [
      new Date(a.timestamp).toLocaleString(),
      a.userName,
      a.role,
      a.action,
    ]),
    headStyles: { fillColor: [28, 165, 175] },
    styles: { fontSize: 8 },
  });

  // Acks footnote
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.text(`Acknowledgements: ${acks.length}`, 14, y);

  doc.save(`Vitalyn_${patient.name.replace(/\s+/g, "_")}.pdf`);
}
