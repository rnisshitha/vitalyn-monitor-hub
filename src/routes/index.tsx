import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, FileText, Heart, ShieldCheck, Stethoscope, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vitalyn — Early Sepsis Detection Saves Lives" },
      { name: "description", content: "Monitor vital signs, detect deterioration, and collaborate in real time." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="grid size-9 place-items-center rounded-lg bg-white/20 backdrop-blur">
              <Activity className="size-5" />
            </div>
            <span className="font-semibold tracking-tight">Vitalyn</span>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="bg-white/95 text-foreground hover:bg-white">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-32 text-white">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 40px 40px",
        }} />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-white/15 backdrop-blur">
            <Heart className="size-10 animate-heartbeat fill-white text-white" />
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Early Sepsis Detection Saves Lives
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-white/90">
            Monitor vital signs, detect clinical deterioration, and collaborate in real time — built for nurses and doctors at the bedside.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">Get Started</Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Built for clinical accuracy</h2>
          <p className="mt-2 text-muted-foreground">Everything your team needs to monitor, communicate, and document.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Activity />} title="qSOFA Risk Detection" desc="Automatic scoring of respiratory rate, blood pressure, and mental status." />
          <Feature icon={<Stethoscope />} title="Glasgow Coma Scale" desc="Structured GCS entry with auto-calculated totals for fast triage." />
          <Feature icon={<BarChart3 />} title="Timeline & Replay" desc="Scroll through every vital change with side-by-side comparisons." />
          <Feature icon={<ShieldCheck />} title="Audit Logs" desc="Every action is traceable by user, role, and time." />
          <Feature icon={<FileText />} title="PDF Reports" desc="Generate clean, printable reports for handoffs and records." />
          <Feature icon={<Workflow />} title="Doctor Acknowledgement" desc="Close the loop on alerts with notes and acknowledgements." />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-4">
            {[
              "Nurse records vitals",
              "System analyzes risk",
              "Doctor reviews and acknowledges",
              "Reports exported to PDF",
            ].map((step, i) => (
              <li key={step} className="glass rounded-2xl p-6 shadow-sm">
                <div className="mb-3 grid size-10 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Vitalyn © 2026
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-3 grid size-11 place-items-center rounded-lg bg-accent text-primary">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
