import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useVitalyn } from "@/hooks/useVitalynStore";

export function AddPatientModal({ defaultWard }: { defaultWard?: string }) {
  const { addPatient, user } = useVitalyn();
  const [open, setOpen] = useState(false);
  const [nurseName, setNurseName] = useState(user?.fullName || "");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bed, setBed] = useState("");
  const [ward, setWard] = useState(defaultWard || user?.ward || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !age || !bed || !ward) return;
    addPatient({ name, age: Number(age), bed, ward }, nurseName);
    toast.success(`${name} admitted to ${ward}`);
    setOpen(false);
    setName(""); setAge(""); setBed("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" /> Add New Patient
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admit new patient</DialogTitle>
          <DialogDescription>Add a patient to your ward for monitoring.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Nurse Name" value={nurseName} onChange={setNurseName} />
          <Field label="Patient Name" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" value={age} onChange={setAge} type="number" />
            <Field label="Bed Number" value={bed} onChange={setBed} />
          </div>
          <Field label="Ward Number" value={ward} onChange={setWard} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Admit Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} required />
    </div>
  );
}
