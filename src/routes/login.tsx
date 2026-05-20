import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useVitalyn, roleHomePath } from "@/hooks/useVitalynStore";
import type { Role } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Vitalyn" }] }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-hero p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-white/20"><Activity className="size-5" /></div>
          <span className="font-semibold">Vitalyn</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Intelligent sepsis monitoring</h1>
          <p className="mt-3 max-w-md text-white/85">
            A bedside-first platform that helps nurses capture vitals quickly and gives doctors the context they need to act.
          </p>
        </div>
        <p className="text-sm text-white/70">Vitalyn © 2026</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><AuthForm mode="login" /></TabsContent>
            <TabsContent value="signup"><AuthForm mode="signup" /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login } = useVitalyn();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("nurse");
  const [fullName, setFullName] = useState("");
  const [ward, setWard] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    const isDoctor = role === "doctor";
    if (isDoctor && !fullName) { toast.error("Please enter your full name"); return; }
    if (!isDoctor && !ward) { toast.error("Please enter your ward name"); return; }
    login({
      id: `u-${Date.now()}`,
      email,
      role,
      fullName: isDoctor ? fullName : undefined,
      ward: !isDoctor ? ward : undefined,
    });
    toast.success(mode === "login" ? "Welcome back" : "Account created");
    navigate({ to: roleHomePath(role) });
  }

  return (
    <Card className="mt-4 border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>{mode === "login" ? "Sign in to Vitalyn" : "Create your account"}</CardTitle>
        <CardDescription>Use your hospital email to continue.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Hospital Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@hospital.org" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === "doctor" ? (
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. John Doe" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Ward Name</Label>
              <Input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="ICU-3 or A-12" />
            </div>
          )}
          <Button type="submit" className="w-full">
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
