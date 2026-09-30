import type { Project } from "@/data/portfolio";

export type ArchNodeKind =
  | "client"
  | "interface"
  | "api"
  | "model"
  | "storage"
  | "stream"
  | "compute"
  | "response";

export interface ArchNode {
  id: string;
  label: string;
  kind: ArchNodeKind;
  /**
   * Factual, generic one-liner about what this kind of component does.
   * TODO(kanishk): these are auto-derived from the public tech name, not your
   * personal design rationale. Swap in real "why I chose this" notes per
   * project if you want that flavor — see PROJECT_ARCH_NOTES below.
   */
  note: string;
}

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface ProjectArchitecture {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

const KIND_RULES: Array<{ test: RegExp; kind: ArchNodeKind }> = [
  { test: /claude|anthropic|gpt|\bllm\b|whisper|indictrans|indicconformer|parler|linear regression|collaborative filtering/i, kind: "model" },
  { test: /fastapi|express|flask|\bapi\b|pydantic/i, kind: "api" },
  { test: /\bsse\b|websocket|streaming/i, kind: "stream" },
  { test: /faiss|sqlite|dynamodb|vector|\bs3\b|database|reportlab|openpyxl/i, kind: "storage" },
  { test: /streamlit|tableau|leaflet|dashboard/i, kind: "interface" },
];

function kindFor(tech: string): ArchNodeKind {
  const hit = KIND_RULES.find((r) => r.test.test(tech));
  return hit ? hit.kind : "compute";
}

const KIND_NOTE: Record<ArchNodeKind, string> = {
  client: "Where the visitor's request enters the system.",
  interface: "Renders the result as an interactive view for the end user.",
  api: "Serves the HTTP interface that the rest of the pipeline sits behind.",
  model: "Does the generation or inference step for this workflow.",
  storage: "Stores or indexes data so it can be retrieved later.",
  stream: "Streams incremental results back to the client in real time.",
  compute: "Handles domain-specific processing for this project.",
  response: "The final result handed back to the visitor.",
};

/**
 * Turns a project's already-stated `tech` list into a linear request-flow
 * diagram. This is mechanically derived from public knowledge of what each
 * named technology generally does — it does not claim to represent
 * Kanishk's actual personal design rationale for any project.
 * TODO(kanishk): if you want per-node "why I picked this" commentary, add
 * entries to PROJECT_ARCH_NOTES below keyed by project name + tech name.
 */
export function deriveArchitecture(project: Project): ProjectArchitecture {
  const nodes: ArchNode[] = [
    { id: "client", label: "Visitor", kind: "client", note: KIND_NOTE.client },
  ];
  const edges: ArchEdge[] = [];

  let prevId = "client";
  project.tech.forEach((tech, i) => {
    const id = `t${i}`;
    const kind = kindFor(tech);
    const override = PROJECT_ARCH_NOTES[project.name]?.[tech];
    nodes.push({ id, label: tech, kind, note: override ?? KIND_NOTE[kind] });
    edges.push({ id: `${prevId}-${id}`, from: prevId, to: id });
    prevId = id;
  });

  nodes.push({ id: "response", label: "Response", kind: "response", note: KIND_NOTE.response });
  edges.push({ id: `${prevId}-response`, from: prevId, to: "response" });

  return { nodes, edges };
}

/**
 * TODO(kanishk): optional per-project, per-tech overrides for the generic
 * notes above — fill in real "why I chose this" commentary here, e.g.:
 *   "RAG Document Q&A": { "FAISS": "Picked over pgvector because ..." }
 */
export const PROJECT_ARCH_NOTES: Record<string, Record<string, string>> = {};
