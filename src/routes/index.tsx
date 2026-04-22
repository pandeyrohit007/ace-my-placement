import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateReport } from "@/server/ai.functions";
import type { PlacementReport, StudentProfile } from "@/lib/types";
import { ProfileForm } from "@/components/ProfileForm";
import { ReportView } from "@/components/ReportView";
import { GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PlacePredict — AI Placement Counselor for Engineering Students" },
      {
        name: "description",
        content: "Predict your campus placement probability, expected CTC, and get a personalized 3-month prep roadmap with AI.",
      },
      { property: "og:title", content: "PlacePredict — AI Placement Counselor" },
      { property: "og:description", content: "AI-powered placement prediction, peer benchmarking & roadmap for engineering students." },
    ],
  }),
});

function Index() {
  const generate = useServerFn(generateReport);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PlacementReport | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (p: StudentProfile) => {
    setLoading(true);
    setError(null);
    try {
      const r = await generate({ data: p });
      setReport(r);
      setProfile(p);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-Powered Career Prediction Engine
          </div>
          <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight sm:text-5xl">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-gradient">PlacePredict</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Get your placement probability, expected CTC, peer benchmark and a personalized
            3-month prep roadmap — built for Indian campus placements.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {report && profile ? (
          <ReportView report={report} profile={profile} onReset={() => setReport(null)} />
        ) : (
          <ProfileForm onSubmit={onSubmit} loading={loading} />
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Predictions are AI-generated estimates based on Indian campus placement patterns. Use as guidance.
        </footer>
      </div>
    </main>
  );
}
