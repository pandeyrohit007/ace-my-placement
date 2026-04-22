import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { extractProfileFromCV } from "@/server/ai.functions";
import type { StudentProfile } from "@/lib/types";

interface Props {
  onExtracted: (p: StudentProfile, notes: string) => void;
}

export function CVUploader({ onExtracted }: Props) {
  const extractFn = useServerFn(extractProfileFromCV);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"idle" | "reading" | "analyzing">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async (f: File) => {
    setError(null);
    setFile(f);
    setStage("reading");
    try {
      const text = await extractText(f);
      if (text.trim().length < 50) throw new Error("Could not read enough text from this file.");
      setStage("analyzing");
      const profile = await extractFn({ data: { cvText: text.slice(0, 40000) } });
      const { notes, ...rest } = profile;
      onExtracted(rest, notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process CV");
      setStage("idle");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handle(f);
  };

  const busy = stage !== "idle";

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-smooth cursor-pointer
          ${busy ? "border-primary bg-accent/40" : "border-border bg-gradient-card hover:border-primary hover:shadow-soft"}`}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
        {busy ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="font-semibold">
                {stage === "reading" ? "Reading your CV…" : "Analyzing with AI…"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{file?.name}</p>
            </div>
          </>
        ) : file ? (
          <>
            <FileText className="h-10 w-10 text-primary" />
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-xs text-muted-foreground">Click or drop to replace</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elegant">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold">Drop your CV here, or click to upload</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, DOCX or TXT · up to 20 MB · processed in your browser
              </p>
            </div>
          </>
        )}
      </label>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={() => { setError(null); setFile(null); }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        We extract academics, skills, projects & internships, then predict your placement.
        You can edit any field before generating the report.
      </p>
    </div>
  );
}

async function extractText(file: File): Promise<string> {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "txt") return await file.text();
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }
  if (ext === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    // @ts-expect-error - worker URL
    const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    return text;
  }
  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT.");
}
