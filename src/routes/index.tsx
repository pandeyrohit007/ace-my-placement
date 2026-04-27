import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateReport } from "@/server/ai.functions";
import { ProfileForm } from "@/components/ProfileForm";
import { ReportView } from "@/components/ReportView";
import { CVUploader } from "@/components/CVUploader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Sparkles, FileText, ClipboardList, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PlacePredict — AI Placement Counselor for Engineering Students" },
      {
        name: "description",
        content: "Upload your CV or fill a quick form to predict campus placement probability, expected CTC and get a personalized 3-month prep roadmap.",
      },
      { property: "og:title", content: "PlacePredict — AI Placement Counselor" },
      { property: "og:description", content: "AI-powered placement prediction, CV analyzer, peer benchmarking & roadmap for engineering students." },
    ],
  }),
});

function Index() {
  const generate = useServerFn(generateReport);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(/** @type {any} */ (null));
  const [profile, setProfile] = useState(/** @type {any} */ (null));
  const [error, setError] = useState(/** @type {any} */ (null));
  const [mode, setMode] = useState("form");
  const [extractedProfile, setExtractedProfile] = useState(/** @type {any} */ (null));
  const [extractNotes, setExtractNotes] = useState(/** @type {any} */ (null));

  const onSubmit = async (p) => {
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

  const onCVExtracted = (p, notes) => {
    setExtractedProfile(p);
    setExtractNotes(notes);
    setMode("form");
    setTimeout(() => window.scrollTo({ top: 200, behavior: "smooth" }), 50);
  };

  const onReset = () => {
    setReport(null);
    setExtractedProfile(null);
    setExtractNotes(null);
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
            Upload your CV or fill a quick form. Get your placement probability, expected CTC,
            peer benchmark and a personalized 3-month prep roadmap.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {report && profile ? (
          <ReportView report={report} profile={profile} onReset={onReset} />
        ) : (
          <div className="space-y-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v)} className="w-full">
              <TabsList className="mx-auto grid w-full max-w-md grid-cols-2 bg-muted/60 p-1 h-11">
                <TabsTrigger value="cv" className="gap-2 data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" /> CV Analyzer
                </TabsTrigger>
                <TabsTrigger value="form" className="gap-2 data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground">
                  <ClipboardList className="h-4 w-4" /> Manual Form
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cv" className="mt-6">
                <CVUploader onExtracted={onCVExtracted} />
              </TabsContent>

              <TabsContent value="form" className="mt-6">
                <ProfileForm
                  onSubmit={onSubmit}
                  loading={loading}
                  initial={extractedProfile ?? undefined}
                  banner={
                    extractNotes ? (
                      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        <div>
                          <p className="font-semibold text-foreground">CV parsed successfully</p>
                          <p className="text-muted-foreground">{extractNotes}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Review the auto-filled fields below, edit anything inaccurate, then predict.
                          </p>
                        </div>
                      </div>
                    ) : null
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Predictions are AI-generated estimates based on Indian campus placement patterns. Use as guidance.
        </footer>
      </div>
    </main>
  );
}
