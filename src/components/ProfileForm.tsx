import { useState } from "react";
import type { StudentProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

const DEFAULT: StudentProfile = {
  name: "",
  cgpa: 7.5,
  tenth: 85,
  twelfth: 80,
  branch: "CSE",
  collegeTier: "Tier 2",
  backlogs: 0,
  languages: "Python (Intermediate), Java (Beginner)",
  dsa: "Intermediate",
  webMlCloud: "React, Node.js basics",
  githubProjects: 3,
  projectQuality: "Intermediate",
  internships: 0,
  internshipTier: "None",
  certifications: 2,
  hackathons: 1,
  communication: 7,
  english: "Intermediate",
};

interface Props {
  onSubmit: (p: StudentProfile) => void;
  loading: boolean;
  initial?: StudentProfile;
  banner?: React.ReactNode;
}

export function ProfileForm({ onSubmit, loading, initial, banner }: Props) {
  const [p, setP] = useState<StudentProfile>(initial ?? DEFAULT);
  const set = <K extends keyof StudentProfile>(k: K, v: StudentProfile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(p);
      }}
      className="space-y-6"
    >
      {banner}
      }}
      className="space-y-8"
    >
      <Section title="🎓 Academic">
        <Field label="Full name">
          <Input value={p.name} onChange={(e) => set("name", e.target.value.slice(0, 80))} placeholder="Aarav Sharma" required />
        </Field>
        <Field label="CGPA (0-10)">
          <Input type="number" step="0.1" min={0} max={10} value={p.cgpa}
            onChange={(e) => set("cgpa", +e.target.value)} required />
        </Field>
        <Field label="10th %">
          <Input type="number" min={0} max={100} value={p.tenth} onChange={(e) => set("tenth", +e.target.value)} />
        </Field>
        <Field label="12th %">
          <Input type="number" min={0} max={100} value={p.twelfth} onChange={(e) => set("twelfth", +e.target.value)} />
        </Field>
        <Field label="Branch">
          <Select value={p.branch} onValueChange={(v) => set("branch", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "AI/DS", "Other"].map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="College tier">
          <Select value={p.collegeTier} onValueChange={(v) => set("collegeTier", v as StudentProfile["collegeTier"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Tier 1">Tier 1 (IIT/NIT/BITS)</SelectItem>
              <SelectItem value="Tier 2">Tier 2</SelectItem>
              <SelectItem value="Tier 3">Tier 3</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Active backlogs">
          <Input type="number" min={0} value={p.backlogs} onChange={(e) => set("backlogs", +e.target.value)} />
        </Field>
      </Section>

      <Section title="💻 Technical Skills">
        <Field label="Programming languages (with level)" full>
          <Input value={p.languages} onChange={(e) => set("languages", e.target.value)}
            placeholder="Python (Advanced), Java (Intermediate), C++ (Beginner)" />
        </Field>
        <Field label="DSA proficiency">
          <Select value={p.dsa} onValueChange={(v) => set("dsa", v as StudentProfile["dsa"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Beginner", "Intermediate", "Advanced"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Web / App / ML / Cloud skills" full>
          <Input value={p.webMlCloud} onChange={(e) => set("webMlCloud", e.target.value)}
            placeholder="React, Node.js, AWS, TensorFlow…" />
        </Field>
        <Field label="GitHub projects (count)">
          <Input type="number" min={0} value={p.githubProjects} onChange={(e) => set("githubProjects", +e.target.value)} />
        </Field>
        <Field label="Project quality">
          <Select value={p.projectQuality} onValueChange={(v) => set("projectQuality", v as StudentProfile["projectQuality"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Basic", "Intermediate", "Production-level"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="💼 Experience">
        <Field label="Internships (count)">
          <Input type="number" min={0} value={p.internships} onChange={(e) => set("internships", +e.target.value)} />
        </Field>
        <Field label="Top internship tier">
          <Select value={p.internshipTier} onValueChange={(v) => set("internshipTier", v as StudentProfile["internshipTier"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["None", "Startup", "Mid", "MNC"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Certifications (count)">
          <Input type="number" min={0} value={p.certifications} onChange={(e) => set("certifications", +e.target.value)} />
        </Field>
        <Field label="Hackathons participated">
          <Input type="number" min={0} value={p.hackathons} onChange={(e) => set("hackathons", +e.target.value)} />
        </Field>
      </Section>

      <Section title="🗣️ Soft Skills">
        <Field label={`Communication (${p.communication}/10)`} full>
          <input type="range" min={1} max={10} value={p.communication}
            onChange={(e) => set("communication", +e.target.value)}
            className="w-full accent-[var(--primary)]" />
        </Field>
        <Field label="English proficiency">
          <Select value={p.english} onValueChange={(v) => set("english", v as StudentProfile["english"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Basic", "Intermediate", "Fluent"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Button type="submit" disabled={loading} size="lg"
        className="w-full bg-gradient-hero text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth border-0 h-12 text-base">
        {loading ? <><Loader2 className="animate-spin" /> Analyzing your profile…</> : <><Sparkles /> Predict my placement</>}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
      <h3 className="mb-5 text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
