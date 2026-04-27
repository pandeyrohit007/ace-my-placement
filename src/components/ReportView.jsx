import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerFn } from "@tanstack/react-start";
import { runWhatIf } from "@/server/ai.functions";
import {
  TrendingUp, Trophy, AlertTriangle, CheckCircle2, Building2,
  Target, Map, Sparkles, Loader2, ArrowRight,
} from "lucide-react";

export function ReportView({ report, profile, onReset }) {
  const ringColor =
    report.probability >= 75 ? "text-success"
    : report.probability >= 50 ? "text-primary"
    : "text-warning";

  const classBadge =
    report.classification === "High Chance" ? "bg-gradient-success text-success-foreground"
    : report.classification === "Moderate Chance" ? "bg-gradient-hero text-primary-foreground"
    : "bg-gradient-warm text-warning-foreground";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HERO */}
      <div className="rounded-3xl border bg-gradient-card p-8 shadow-elegant">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-between">
          <div className="flex items-center gap-6">
            <ProbabilityRing value={report.probability} colorClass={ringColor} />
            <div>
              <p className="text-sm uppercase tracking-wider text-muted-foreground">Placement Probability</p>
              <h2 className="mt-1 text-4xl font-bold">{report.probability}%</h2>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${classBadge}`}>
                {report.classification}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 md:items-end">
            <div className="text-center md:text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Expected CTC</p>
              <p className="text-2xl font-bold text-gradient">{report.ctcRange}</p>
            </div>
            <p className="text-sm text-muted-foreground md:max-w-xs md:text-right">{report.percentile}</p>
          </div>
        </div>
        <p className="mt-6 border-t pt-4 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
      </div>

      {/* TOP COMPANIES */}
      <Card icon={<Building2 className="h-5 w-5" />} title="Top 5 Companies You Could Land">
        <div className="flex flex-wrap gap-2">
          {report.topCompanies.map((c) => (
            <span key={c} className="rounded-full border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft">
              {c}
            </span>
          ))}
        </div>
      </Card>

      {/* STRENGTHS / GAPS */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card icon={<Trophy className="h-5 w-5 text-success" />} title="Your Strengths">
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card icon={<AlertTriangle className="h-5 w-5 text-warning" />} title="Gaps to Close">
          <ul className="space-y-2">
            {report.gaps.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> {g}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* BENCHMARK */}
      <Card icon={<TrendingUp className="h-5 w-5" />} title="Peer Benchmarking">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2">Parameter</th>
                <th className="pb-2">You</th>
                <th className="pb-2">Avg Placed</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.benchmark.map((row, i) => {
                const badge =
                  row.status === "above" ? "bg-success/15 text-success"
                  : row.status === "below" ? "bg-warning/15 text-warning-foreground"
                  : row.status === "gap" ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground";
                const label =
                  row.status === "above" ? "✅ Above"
                  : row.status === "below" ? "⚠️ Below"
                  : row.status === "gap" ? "❌ Gap"
                  : "● On par";
                return (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-medium">{row.parameter}</td>
                    <td className="py-3">{row.yours}</td>
                    <td className="py-3 text-muted-foreground">{row.average}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WHAT-IF */}
      <Card icon={<Sparkles className="h-5 w-5" />} title="High-Impact Improvements">
        <div className="grid gap-3 sm:grid-cols-3">
          {report.whatIf.map((w, i) => (
            <div key={i} className="rounded-xl border bg-background p-4 shadow-soft transition-smooth hover:shadow-elegant">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">If you</p>
              <p className="mt-1 text-sm font-medium">{w.change}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gradient">{w.newProbability}%</span>
                <span className="text-sm font-semibold text-success">+{w.delta}%</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{w.rationale}</p>
            </div>
          ))}
        </div>
        <WhatIfChat profile={profile} currentProb={report.probability} />
      </Card>

      {/* ROADMAP */}
      <Card icon={<Map className="h-5 w-5" />} title="Your 3-Month Placement Prep Roadmap">
        <div className="space-y-6">
          {report.roadmap.map((m) => (
            <div key={m.month} className="rounded-2xl border bg-gradient-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-sm font-bold text-primary-foreground shadow-elegant">
                  M{m.month}
                </div>
                <div>
                  <h4 className="font-semibold">{m.title}</h4>
                  <p className="text-xs text-muted-foreground">{m.goal}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {m.weeks.map((w) => (
                  <div key={w.week} className="rounded-lg border bg-background p-3">
                    <p className="text-xs font-bold text-primary">Week {w.week}</p>
                    <p className="mb-2 text-sm font-medium">{w.focus}</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {w.tasks.map((t, i) => (
                        <li key={i} className="flex gap-1.5"><ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset}>← Edit profile & re-analyze</Button>
      </div>
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ProbabilityRing({ value, colorClass }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative">
      <svg width={110} height={110} className="-rotate-90">
        <circle cx={55} cy={55} r={radius} stroke="currentColor" strokeWidth={9}
          className="text-muted" fill="transparent" />
        <circle cx={55} cy={55} r={radius} stroke="currentColor" strokeWidth={9}
          className={colorClass} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${colorClass}`}>
        {value}%
      </span>
    </div>
  );
}

function WhatIfChat({ profile, currentProb }) {
  const whatIfFn = useServerFn(runWhatIf);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await whatIfFn({ data: { profile, hypothetical: q } });
      setResult(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border bg-gradient-card p-4">
      <p className="mb-2 text-sm font-semibold">🔄 What-If Simulator</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Try: "What if I learn React?", "What if I improve my CGPA by 0.5?", "What if I do an MNC internship?"
      </p>
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), ask())}
          placeholder="What if I…" />
        <Button onClick={ask} disabled={loading || !q.trim()} className="bg-gradient-hero border-0 text-primary-foreground">
          {loading ? <Loader2 className="animate-spin" /> : "Simulate"}
        </Button>
      </div>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      {result && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 rounded-lg bg-background p-3">
            <span className="text-sm text-muted-foreground">{currentProb}%</span>
            <ArrowRight className="h-4 w-4" />
            <span className="text-2xl font-bold text-gradient">{result.newProbability}%</span>
            <span className={`text-sm font-semibold ${result.delta >= 0 ? "text-success" : "text-destructive"}`}>
              ({result.delta >= 0 ? "+" : ""}{result.delta}%)
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
