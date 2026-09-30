// Local, offline, no-network search index over the portfolio's own real
// content. Powers the Cmd+K command palette (components/ui/CommandPalette.tsx).
//
// Nothing here ever calls out to a network or an LLM — it is plain client-side
// full-text search (MiniSearch) over documents built from data/portfolio.ts.

import portfolio from "@/data/portfolio";
import MiniSearch from "minisearch";

/** Real in-page section anchors this index can point results at. */
export type SectionId =
  | "about"
  | "skills"
  | "projects"
  | "publications"
  | "experience"
  | "contact";

export interface SearchDocument {
  id: string;
  section: SectionId;
  /** Short display title for the citation chip / result heading. */
  title: string;
  /** The actual real content text — this is what gets quoted back to the user. */
  text: string;
}

/**
 * Builds the corpus: one or more small documents per real content item.
 * Every word of `text` here traces back to a literal field in portfolio.ts —
 * nothing is invented.
 */
function buildDocuments(): SearchDocument[] {
  const docs: SearchDocument[] = [];

  // --- About: bio paragraph -------------------------------------------------
  docs.push({
    id: "about-bio",
    section: "about",
    title: "About",
    text: portfolio.bio,
  });

  // --- About: certifications (one document per certification string) -------
  portfolio.certifications.forEach((cert, i) => {
    docs.push({
      id: `cert-${i}`,
      section: "about",
      title: "Certification",
      text: cert,
    });
  });

  // --- Projects: name + description + tech ----------------------------------
  portfolio.projects.forEach((project, i) => {
    docs.push({
      id: `project-${i}`,
      section: "projects",
      title: project.name,
      text: `${project.name}. ${project.description} Tech: ${project.tech.join(", ")}.`,
    });
  });

  // --- Experience: title + company + bullets --------------------------------
  portfolio.experience.forEach((exp, i) => {
    docs.push({
      id: `experience-${i}`,
      section: "experience",
      title: `${exp.title} — ${exp.company}`,
      text: `${exp.title} at ${exp.company} (${exp.period}, ${exp.location}). ${exp.bullets.join(
        " "
      )} Skills used: ${exp.skills.join(", ")}.`,
    });
  });

  // --- Publications: one per publication title ------------------------------
  portfolio.publications.forEach((pub, i) => {
    docs.push({
      id: `publication-${i}`,
      section: "publications",
      title: pub.title,
      text: pub.relatedProject
        ? `${pub.title} (related project: ${pub.relatedProject}).`
        : `${pub.title}.`,
    });
  });

  // --- Skills: grouped by category -------------------------------------------
  const categories = Array.from(new Set(portfolio.skills.map((s) => s.category)));
  categories.forEach((category) => {
    const names = portfolio.skills.filter((s) => s.category === category).map((s) => s.name);
    docs.push({
      id: `skills-${category}`,
      section: "skills",
      title: `${category} skills`,
      text: `${category}: ${names.join(", ")}.`,
    });
  });

  // --- Contact: real contact details only ------------------------------------
  const contactParts = [
    `You can reach ${portfolio.name} by email at ${portfolio.email}.`,
    portfolio.github ? `GitHub: ${portfolio.github}.` : "",
    portfolio.linkedin ? `LinkedIn: ${portfolio.linkedin}.` : "",
    portfolio.medium ? `Medium: ${portfolio.medium}.` : "",
  ].filter(Boolean);
  docs.push({
    id: "contact-info",
    section: "contact",
    title: "Contact",
    text: contactParts.join(" "),
  });

  return docs;
}

export const documents: SearchDocument[] = buildDocuments();

const miniSearch = new MiniSearch<SearchDocument>({
  idField: "id",
  fields: ["title", "text"],
  storeFields: ["section", "title", "text"],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    boost: { title: 2 },
  },
});

miniSearch.addAll(documents);

export interface SearchResult {
  id: string;
  section: SectionId;
  title: string;
  text: string;
  score: number;
  /** Which query terms matched which document terms — used to render "rank". */
  match: Record<string, string[]>;
}

/**
 * Runs `query` through the local index and returns the top `limit` matches.
 * Never throws — an empty, whitespace-only, or garbage query just returns [].
 */
export function search(query: string, limit = 5): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const rawResults = miniSearch.search(trimmed);
    return rawResults.slice(0, limit).map((r) => ({
      id: String(r.id),
      section: r.section as SectionId,
      title: r.title as string,
      text: r.text as string,
      score: r.score,
      match: r.match,
    }));
  } catch {
    // MiniSearch can throw on certain malformed queries (e.g. lone punctuation) —
    // fail closed to an empty result set rather than crashing the palette.
    return [];
  }
}

export default miniSearch;
