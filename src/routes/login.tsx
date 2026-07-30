import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity, Mail, Lock, Eye, EyeOff, User, Stethoscope, BedDouble,
  HeartPulse, ShieldCheck, Sparkles, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useVitalyn, roleHomePath } from "@/hooks/useVitalynStore";
import type { Role } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Vitalyn" }] }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-soft">
      {/* Decorative medical backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-[28rem] rounded-full bg-secondary/20 blur-3xl" />
        <HeartPulse className="absolute top-12 right-12 size-40 text-primary/5" strokeWidth={1} />
        <Stethoscope className="absolute bottom-12 left-12 size-40 text-secondary/5" strokeWidth={1} />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden bg-gradient-hero p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-10">
            <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <Link to="/" className="relative flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Activity className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Vitalyn</span>
          </Link>

          <div className="relative space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight leading-[1.1] xl:text-5xl">
                Intelligent sepsis monitoring,<br />
                <span className="text-white/80">built for the bedside.</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-white/85 leading-relaxed">
                Capture vitals in seconds. Get protocol-driven CDSS guidance powered by qSOFA, SIRS and GCS.
              </p>
            </div>

            <div className="grid max-w-md gap-3">
              <Feature icon={<Sparkles className="size-4" />} text="Real-time risk stratification" />
              <Feature icon={<ShieldCheck className="size-4" />} text="HIPAA-aware, role-based access" />
              <Feature icon={<HeartPulse className="size-4 animate-heartbeat" />} text="Continuous patient telemetry" />
            </div>
          </div>

          <p className="relative text-sm text-white/70">Vitalyn © 2026 · A clinical decision support system</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-hero text-white">
                <Activity className="size-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Vitalyn</span>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm sm:p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:shadow-sm">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                  <AuthForm mode="login" />
                </TabsContent>
                <TabsContent value="signup" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                  <AuthForm mode="signup" />
                </TabsContent>
              </Tabs>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Protected health information. Authorized hospital personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/90">
      <span className="grid size-8 place-items-center rounded-lg bg-white/15">{icon}</span>
      {text}
    </div>
  );
}

const HOSPITAL_DOMAINS = ["hospital.org", "hospital.com", "health.org", "med.org", "clinic.org"];

const ALLOW_ANY_EMAIL = true;

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login } = useVitalyn();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role | "">("");
  const [fullName, setFullName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [ward, setWard] = useState("");
  const [remember, setRemember] = useState(true);

  const isSignup = mode === "signup";

  const emailValid = useMemo(() => {
    if (!email) return null;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) return false;
    if (ALLOW_ANY_EMAIL || !isSignup) return true;
    return HOSPITAL_DOMAINS.some((d) => email.toLowerCase().endsWith("@" + d) || email.toLowerCase().endsWith("." + d));
  }, [email, isSignup]);

  const pwStrength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const pwMatch = !isSignup || (!!confirmPassword && password === confirmPassword);

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (isSignup) {
      if (emailValid === false) return false;
      if (pwStrength < 2) return false;
      if (!pwMatch) return false;
      if (!fullName.trim()) return false;
      if (!role) return false;
      if (role === "doctor" && !doctorId.trim()) return false;
      if (role === "nurse" && !ward.trim()) return false;
    } else {
      if (!role) return false;
      if (role === "doctor" && !doctorId.trim()) return false;
      if (role === "nurse" && !ward.trim()) return false;
    }
    return true;
  }, [email, password, isSignup, emailValid, pwStrength, pwMatch, fullName, role, doctorId, ward]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !role) return;
    login({
      id: `u-${Date.now()}`,
      email,
      role: role as Role,
      fullName: role === "doctor" ? (fullName || doctorId) : fullName || undefined,
      ward: role === "nurse" ? ward : undefined,
    });
    toast.success(isSignup ? "Account created — welcome to Vitalyn" : "Welcome back");
    navigate({ to: roleHomePath(role as Role) });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {isSignup ? "Create your account" : "Sign in to Vitalyn"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSignup ? "Use your hospital credentials to get started." : "Enter your hospital credentials below."}
        </p>
      </div>

      {/* Email */}
      <Field label="Hospital Email" error={isSignup && emailValid === false ? "Must be a valid email address." : undefined}>
        <InputIcon icon={<Mail className="size-4" />}>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@hospital.org"
            className="h-11 pl-10"
          />
        </InputIcon>
      </Field>

      {/* Password */}
      <Field label="Password">
        <InputIcon icon={<Lock className="size-4" />}>
          <Input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </InputIcon>
        {isSignup && password && <PasswordStrength score={pwStrength} />}
      </Field>

      {/* Confirm password (signup only) */}
      {isSignup && (
        <Field
          label="Confirm Password"
          error={confirmPassword && !pwMatch ? "Passwords do not match." : undefined}
        >
          <InputIcon icon={<Lock className="size-4" />}>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="h-11 pl-10"
            />
          </InputIcon>
        </Field>
      )}

      {/* Full Name (signup) */}
      {isSignup && (
        <Field label="Full Name">
          <InputIcon icon={<User className="size-4" />}>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="h-11 pl-10"
              required
            />
          </InputIcon>
        </Field>
      )}

      {/* Role */}
      <Field label="Role">
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="doctor">
              <span className="flex items-center gap-2"><Stethoscope className="size-4" /> Doctor</span>
            </SelectItem>
            <SelectItem value="nurse">
              <span className="flex items-center gap-2"><HeartPulse className="size-4" /> Nurse</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* Dynamic role fields */}
      {role === "doctor" && (
        <Field label={isSignup ? "Doctor ID" : "Doctor Name / ID"}>
          <InputIcon icon={<Stethoscope className="size-4" />}>
            <Input
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              placeholder="DR-1042 or Dr. Jane Doe"
              className="h-11 pl-10"
            />
          </InputIcon>
        </Field>
      )}
      {role === "nurse" && (
        <Field label="Ward Number">
          <InputIcon icon={<BedDouble className="size-4" />}>
            <Input
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="ICU-3 or A-12"
              className="h-11 pl-10"
            />
          </InputIcon>
        </Field>
      )}

      {/* Login extras */}
      {!isSignup && (
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => toast.info("Contact your hospital IT administrator to reset your password.")}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Forgot password?
          </button>
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="group h-11 w-full gap-2 bg-gradient-hero text-base font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isSignup ? "Create account" : "Sign in"}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </form>
  );
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      <div className="min-h-[1rem] text-xs text-destructive">{error}</div>
    </div>
  );
}

function InputIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      {children}
    </div>
  );
}

function PasswordStrength({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const tones = [
    "bg-destructive",
    "bg-destructive",
    "bg-[var(--risk-moderate)]",
    "bg-[var(--risk-low)]",
    "bg-[var(--risk-low)]",
  ];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? tones[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Strength: {labels[score]}</p>
    </div>
  );
}
