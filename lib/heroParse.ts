import portfolio from "@/data/portfolio";

/**
 * "Parse Me" hero — data for the raw-dump → NER → JSON → clean-hero scroll
 * story. Everything below is assembled from real `data/portfolio.ts` fields;
 * nothing here is a fabricated fact, only the ordering/line-break "OCR
 * garble" around them is invented for texture.
 */

export type EntityType = "PERSON" | "ROLE" | "SKILL" | "CERT" | "ORG";

export interface RawToken {
  text: string;
  entity?: EntityType;
}

export interface EntityStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
}

// One distinct accent per entity kind, drawn from the site's brand palette
// (indigo x2 shades, purple x2 shades, cyan) — five hues for five kinds.
export const ENTITY_STYLES: Record<EntityType, EntityStyle> = {
  PERSON: {
    label: "PERSON",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.14)",
    border: "rgba(129,140,248,0.4)",
  },
  ROLE: {
    label: "ROLE",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.14)",
    border: "rgba(34,211,238,0.4)",
  },
  SKILL: {
    label: "SKILL",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.14)",
    border: "rgba(167,139,250,0.4)",
  },
  CERT: {
    label: "CERT",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.18)",
    border: "rgba(124,58,237,0.45)",
  },
  ORG: {
    label: "ORG",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.16)",
    border: "rgba(99,102,241,0.45)",
  },
};

const skillAt = (i: number) => portfolio.skills[i].name;
const certAt = (i: number) => portfolio.certifications[i];

// Real entries, picked by index from data/portfolio.ts.
export const heroSkills = [skillAt(10), skillAt(12), skillAt(11)]; // Generative AI, RAG, Prompt Engineering
export const heroCerts = [certAt(0), certAt(2)]; // AWS Solutions Architect Associate (2025–2028), Claude Certified Architect – Professional
export const heroOrg = portfolio.experience[0].company; // AIVAR Innovations

/**
 * The "raw OCR dump" the hero opens on. Built entirely from real fields
 * above plus `portfolio.name` / `portfolio.role`, stitched with uneven line
 * breaks and scanner artefacts so it reads as freshly-extracted unstructured
 * text. Tokens flagged with `entity` are the ones stage 2 highlights as
 * named entities — order here must match the reveal-timing order in
 * Hero.tsx (PERSON, ROLE, SKILL x3, CERT x2, ORG).
 */
export const rawTokens: RawToken[] = [
  {
    text:
      "▓▓ doc/intake :: unstructured.raw   conf=94.2%   pass=2/2\n\n" +
      "   ...giving shape to raw signal. subject profile —\n" +
      "   name:   ",
  },
  { text: portfolio.name, entity: "PERSON" },
  { text: "\n   role:   " },
  { text: portfolio.role, entity: "ROLE" },
  {
    text:
      "\n\n   hands-on experience designing & deploying LLM-powered\n" +
      "   systems. specialise in   ",
  },
  { text: heroSkills[0], entity: "SKILL" },
  { text: ",\n   " },
  { text: heroSkills[1], entity: "SKILL" },
  { text: "-based chatbots, and   " },
  { text: heroSkills[2], entity: "SKILL" },
  {
    text:
      "  —\n   delivering production-ready genAI workflows on aws.\n\n" +
      "   credentials:\n     ",
  },
  { text: heroCerts[0], entity: "CERT" },
  { text: "\n     " },
  { text: heroCerts[1], entity: "CERT" },
  { text: "\n\n   currently  @   " },
  { text: heroOrg, entity: "ORG" },
  {
    text:
      "   · gen ai engineer\n" +
      "   ...unstructured data  ->  structured intelligence...   ▓▓",
  },
];

/** Raw string form, for the stage-1 plain-text render. */
export const rawDumpText = rawTokens.map((t) => t.text).join("");

/**
 * For each entry in `rawTokens`, the index of its entity-reveal timing (in
 * PERSON/ROLE/SKILL.../ORG order) or `null` for plain text. Computed once
 * here at module load — not inside a component's render — so Hero.tsx can
 * look up a token's reveal purely by array index, with no counter mutated
 * during render.
 */
let entityCounter = 0;
export const entityOrder: Array<number | null> = rawTokens.map((t) =>
  t.entity ? entityCounter++ : null
);

/** Same real data, reshaped as the stage-3 structured JSON. */
export const heroJson = {
  name: portfolio.name,
  role: portfolio.role,
  skills: heroSkills,
  certifications: heroCerts,
};
