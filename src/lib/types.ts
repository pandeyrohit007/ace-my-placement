export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface StudentProfile {
  name: string;
  cgpa: number;
  tenth: number;
  twelfth: number;
  branch: string;
  collegeTier: "Tier 1" | "Tier 2" | "Tier 3";
  backlogs: number;
  languages: string; // comma list
  dsa: Level;
  webMlCloud: string;
  githubProjects: number;
  projectQuality: "Basic" | "Intermediate" | "Production-level";
  internships: number;
  internshipTier: "None" | "Startup" | "Mid" | "MNC";
  certifications: number;
  hackathons: number;
  communication: number; // 1-10
  english: "Basic" | "Intermediate" | "Fluent";
}

export interface BenchmarkRow {
  parameter: string;
  yours: string;
  average: string;
  status: "above" | "below" | "gap" | "ok";
}

export interface WhatIfItem {
  change: string;
  newProbability: number;
  delta: number;
  rationale: string;
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  tasks: string[];
}

export interface RoadmapMonth {
  month: number;
  title: string;
  goal: string;
  weeks: RoadmapWeek[];
}

export interface PlacementReport {
  probability: number;
  classification: "High Chance" | "Moderate Chance" | "Needs Improvement";
  ctcRange: string;
  topCompanies: string[];
  strengths: string[];
  gaps: string[];
  benchmark: BenchmarkRow[];
  percentile: string;
  whatIf: WhatIfItem[];
  roadmap: RoadmapMonth[];
  summary: string;
}
