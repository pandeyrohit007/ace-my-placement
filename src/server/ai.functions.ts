import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PlacementReport, StudentProfile } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().max(80),
  cgpa: z.number().min(0).max(10),
  tenth: z.number().min(0).max(100),
  twelfth: z.number().min(0).max(100),
  branch: z.string().max(40),
  collegeTier: z.enum(["Tier 1", "Tier 2", "Tier 3"]),
  backlogs: z.number().min(0).max(20),
  languages: z.string().max(300),
  dsa: z.enum(["Beginner", "Intermediate", "Advanced"]),
  webMlCloud: z.string().max(300),
  githubProjects: z.number().min(0).max(200),
  projectQuality: z.enum(["Basic", "Intermediate", "Production-level"]),
  internships: z.number().min(0).max(20),
  internshipTier: z.enum(["None", "Startup", "Mid", "MNC"]),
  certifications: z.number().min(0).max(50),
  hackathons: z.number().min(0).max(50),
  communication: z.number().min(1).max(10),
  english: z.enum(["Basic", "Intermediate", "Fluent"]),
});

const profileExtractTool = {
  type: "function" as const,
  function: {
    name: "extract_student_profile",
    description: "Extract a structured student profile from CV/resume text.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        cgpa: { type: "number", description: "0-10. If only percentage given, convert (%/9.5)." },
        tenth: { type: "number" },
        twelfth: { type: "number" },
        branch: { type: "string", description: "CSE / IT / ECE / EEE / Mechanical / Civil / AI/DS / Other" },
        collegeTier: { type: "string", enum: ["Tier 1", "Tier 2", "Tier 3"], description: "IIT/NIT/BITS/IIIT-H => Tier 1; reputed state/private => Tier 2; lesser-known => Tier 3" },
        backlogs: { type: "number" },
        languages: { type: "string", description: "Comma list with levels" },
        dsa: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
        webMlCloud: { type: "string", description: "Comma list of frameworks/tools" },
        githubProjects: { type: "number" },
        projectQuality: { type: "string", enum: ["Basic", "Intermediate", "Production-level"] },
        internships: { type: "number" },
        internshipTier: { type: "string", enum: ["None", "Startup", "Mid", "MNC"] },
        certifications: { type: "number" },
        hackathons: { type: "number" },
        communication: { type: "number", description: "1-10 estimate from CV polish, achievements, leadership roles" },
        english: { type: "string", enum: ["Basic", "Intermediate", "Fluent"] },
        notes: { type: "string", description: "Brief 1-line note about confidence / what was inferred vs found." },
      },
      required: [
        "name", "cgpa", "tenth", "twelfth", "branch", "collegeTier", "backlogs",
        "languages", "dsa", "webMlCloud", "githubProjects", "projectQuality",
        "internships", "internshipTier", "certifications", "hackathons",
        "communication", "english", "notes",
      ],
      additionalProperties: false,
    },
  },
};

export const extractProfileFromCV = createServerFn({ method: "POST" })
  .inputValidator((input: { cvText: string }) => z.object({
    cvText: z.string().min(50, "CV text too short").max(50000, "CV text too long"),
  }).parse(input))
  .handler(async ({ data }): Promise<StudentProfile & { notes: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You extract a structured student profile from raw CV / resume text for an Indian campus placement predictor. Make best-effort estimates when fields are missing — never leave fields blank. For DSA proficiency, infer from LeetCode/Codeforces ratings, ICPC, projects. For project quality: Basic = small tutorial-style; Intermediate = original full-stack; Production-level = deployed/used by real users or with significant scale. For communication: estimate 1-10 from leadership roles, public speaking, content creation, CV writing quality.`,
          },
          { role: "user", content: `Extract the profile from this CV:\n\n${data.cvText}` },
        ],
        tools: [profileExtractTool],
        tool_choice: { type: "function", function: { name: "extract_student_profile" } },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) {
      const t = await res.text();
      console.error("Extract error", res.status, t);
      throw new Error("AI service error.");
    }

    const json = await res.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("Could not parse the CV.");
    return JSON.parse(toolCall.function.arguments);
  });

const reportTool = {
  type: "function" as const,
  function: {
    name: "emit_placement_report",
    description: "Return a complete placement prediction report.",
    parameters: {
      type: "object",
      properties: {
        probability: { type: "number", description: "0-100 placement probability" },
        classification: { type: "string", enum: ["High Chance", "Moderate Chance", "Needs Improvement"] },
        ctcRange: { type: "string", description: "Expected CTC range, e.g. ₹6–10 LPA" },
        topCompanies: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
        strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
        gaps: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
        percentile: { type: "string", description: "e.g. 'Top 35% among Tier 2 CSE students'" },
        benchmark: {
          type: "array",
          minItems: 5,
          items: {
            type: "object",
            properties: {
              parameter: { type: "string" },
              yours: { type: "string" },
              average: { type: "string" },
              status: { type: "string", enum: ["above", "below", "gap", "ok"] },
            },
            required: ["parameter", "yours", "average", "status"],
            additionalProperties: false,
          },
        },
        whatIf: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              change: { type: "string" },
              newProbability: { type: "number" },
              delta: { type: "number" },
              rationale: { type: "string" },
            },
            required: ["change", "newProbability", "delta", "rationale"],
            additionalProperties: false,
          },
        },
        roadmap: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              month: { type: "number" },
              title: { type: "string" },
              goal: { type: "string" },
              weeks: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  properties: {
                    week: { type: "number" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
                  },
                  required: ["week", "focus", "tasks"],
                  additionalProperties: false,
                },
              },
            },
            required: ["month", "title", "goal", "weeks"],
            additionalProperties: false,
          },
        },
        summary: { type: "string", description: "2-3 sentence personalized summary" },
      },
      required: [
        "probability", "classification", "ctcRange", "topCompanies",
        "strengths", "gaps", "percentile", "benchmark", "whatIf", "roadmap", "summary",
      ],
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `You are an expert AI placement counselor for Indian engineering / CS students preparing for campus placements. You analyze profiles using realistic Indian campus placement benchmarks.

Calibration guidelines:
- Tier 1 + CGPA>8 + Advanced DSA + 1+ MNC internship => 85-95% probability, ₹15-40 LPA, top product companies (Google, Microsoft, Atlassian, Adobe, Uber).
- Tier 2 + CGPA 7-8 + Intermediate DSA + 0-1 internship => 55-75%, ₹5-12 LPA (TCS Digital, Infosys SP, Cognizant GenC Next, Accenture, ZS Associates, Deloitte).
- Tier 3 / CGPA<6.5 / multiple backlogs => 20-50%, ₹3-6 LPA service companies (TCS Ninja, Wipro, Infosys, Capgemini).
- Backlogs heavily reduce probability and exclude many product companies.
- Communication < 5 hurts client-facing roles.

Always populate ALL fields in the tool. Use ₹ symbol for CTC. Make benchmark, whatIf, and roadmap concrete and personalized to the profile. Roadmap must be 3 months × 4 weeks each.`;

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((input: StudentProfile) => profileSchema.parse(input))
  .handler(async ({ data }): Promise<PlacementReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Analyze this student profile and emit a placement report.\n\n${JSON.stringify(data, null, 2)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [reportTool],
        tool_choice: { type: "function", function: { name: "emit_placement_report" } },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error", res.status, t);
      throw new Error("AI service error. Please try again.");
    }

    const json = await res.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return a structured report.");

    const parsed = JSON.parse(toolCall.function.arguments) as PlacementReport;
    return parsed;
  });

const whatIfSchema = z.object({
  profile: profileSchema,
  hypothetical: z.string().min(2).max(300),
});

const whatIfTool = {
  type: "function" as const,
  function: {
    name: "emit_what_if",
    description: "Recalculate placement probability under a hypothetical change.",
    parameters: {
      type: "object",
      properties: {
        oldProbability: { type: "number" },
        newProbability: { type: "number" },
        delta: { type: "number" },
        explanation: { type: "string" },
        topImpacts: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              change: { type: "string" },
              newProbability: { type: "number" },
              delta: { type: "number" },
            },
            required: ["change", "newProbability", "delta"],
            additionalProperties: false,
          },
        },
      },
      required: ["oldProbability", "newProbability", "delta", "explanation", "topImpacts"],
      additionalProperties: false,
    },
  },
};

export const runWhatIf = createServerFn({ method: "POST" })
  .inputValidator((input: { profile: StudentProfile; hypothetical: string }) => whatIfSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Current profile:\n${JSON.stringify(data.profile, null, 2)}\n\nHypothetical change: "${data.hypothetical}"\n\nReturn old vs new placement probability, the delta, an explanation, and the TOP 3 highest-impact improvements this student could make right now.`,
          },
        ],
        tools: [whatIfTool],
        tool_choice: { type: "function", function: { name: "emit_what_if" } },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error("AI service error.");

    const json = await res.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return a structured response.");
    return JSON.parse(toolCall.function.arguments) as {
      oldProbability: number;
      newProbability: number;
      delta: number;
      explanation: string;
      topImpacts: { change: string; newProbability: number; delta: number }[];
    };
  });
