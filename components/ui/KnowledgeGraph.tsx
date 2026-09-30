"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type MutableRefObject, type ReactElement } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import portfolio from "@/data/portfolio";
import type { NodeObject, LinkObject, ForceGraphProps, ForceGraphMethods } from "react-force-graph-2d";

// react-force-graph-2d touches the DOM/canvas at import time (it pulls in
// `force-graph`, which references `window`), so it must never be imported
// directly at module top-level in a way that could run during prerender —
// load it lazily, client-side only. The library's actual default export
// supports a ref (for d3Force tuning below), which plain ComponentType<T>
// doesn't type — reconstruct that shape here instead.
type ForceGraph2DComponent = (
  props: ForceGraphProps<GraphNode, GraphLink> & {
    ref?: MutableRefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  }
) => ReactElement;

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
}) as unknown as ForceGraph2DComponent;

type NodeType = "skill" | "project" | "certification" | "publication" | "experience";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

// Per-type palette (brand accents + a couple of muted tones for the less
// central node types) — distinct per TYPE, not per individual skill color.
const TYPE_COLOR: Record<NodeType, string> = {
  skill: "#6366f1", // indigo
  project: "#22d3ee", // cyan
  certification: "#a78bfa", // purple (muted)
  publication: "#f472b6", // muted pink
  experience: "#facc15", // muted amber
};

const TYPE_LABEL: Record<NodeType, string> = {
  skill: "Skill",
  project: "Project",
  certification: "Certification",
  publication: "Publication",
  experience: "Experience",
};

function norm(s: string): string {
  return s.toLowerCase().trim();
}

// Below this length, plain substring matching produces absurd false
// positives — the skill "R" is a substring of almost every string in the
// dataset ("Egger Pumps", "Server", "Architect", ...), so hovering it used
// to highlight nearly the whole graph. Real skill/tech names here are all
// 3+ characters except "R" itself, which (honestly) isn't named in any
// project/cert/experience text, so it correctly ends up with no edges.
const MIN_MATCH_LEN = 3;

/** Case-insensitive substring match, either direction, guarded against
 *  short strings matching everything. */
function fuzzyIncludes(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (na.length < MIN_MATCH_LEN || nb.length < MIN_MATCH_LEN) return na === nb;
  return na.includes(nb) || nb.includes(na);
}

// force-graph mutates link.source/link.target from the original string id
// into a reference to the resolved node object once the simulation starts —
// this resolves either shape back to a plain string id.
type LinkEndpoint = string | number | NodeObject<GraphNode> | undefined;
function endpointId(end: LinkEndpoint): string {
  if (end && typeof end === "object") return String(end.id);
  return String(end);
}

function buildGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const skillId = (name: string) => `skill:${name}`;

  for (const skill of portfolio.skills) {
    nodes.push({ id: skillId(skill.name), label: skill.name, type: "skill", val: 3 });
  }

  const projectIdByName = new Map<string, string>();
  for (const project of portfolio.projects) {
    const id = `project:${project.name}`;
    projectIdByName.set(project.name, id);
    nodes.push({ id, label: project.name, type: "project", val: 6 });

    for (const skill of portfolio.skills) {
      const matched = project.tech.some((t) => fuzzyIncludes(t, skill.name));
      if (matched) links.push({ source: id, target: skillId(skill.name) });
    }
  }

  portfolio.certifications.forEach((cert, i) => {
    const id = `cert:${i}`;
    nodes.push({ id, label: cert, type: "certification", val: 4 });

    for (const skill of portfolio.skills) {
      // Certification edge direction per spec: skill name is a substring of
      // the certification string (not the reverse-fuzzy match used above).
      // Same short-string guard as fuzzyIncludes — see MIN_MATCH_LEN.
      const ns = norm(skill.name);
      if (ns.length >= MIN_MATCH_LEN && norm(cert).includes(ns)) {
        links.push({ source: id, target: skillId(skill.name) });
      }
    }
  });

  portfolio.publications.forEach((pub, i) => {
    const id = `pub:${i}`;
    nodes.push({ id, label: pub.title, type: "publication", val: 4 });

    if (pub.relatedProject) {
      const projectId = projectIdByName.get(pub.relatedProject);
      if (projectId) links.push({ source: id, target: projectId });
    }
  });

  portfolio.experience.forEach((exp, i) => {
    const id = `exp:${i}`;
    nodes.push({ id, label: `${exp.title} · ${exp.company}`, type: "experience", val: 5 });

    for (const skill of portfolio.skills) {
      const matched = exp.skills.some((s) => fuzzyIncludes(s, skill.name));
      if (matched) links.push({ source: id, target: skillId(skill.name) });
    }
  });

  return { nodes, links };
}

export default function KnowledgeGraph() {
  const prefersReduced = !!useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined);
  const [width, setWidth] = useState(0);
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [hoverId, setHoverId] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => buildGraph(), []);

  // Adjacency map for neighbor highlighting on hover/click.
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const node of nodes) map.set(node.id, new Set());
    for (const link of links) {
      const s = link.source;
      const t = link.target;
      map.get(s)?.add(t);
      map.get(t)?.add(s);
    }
    return map;
  }, [nodes, links]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setWidth(el.clientWidth);
    update();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const setActive = useCallback(
    (id: string | null) => {
      setHoverId(id);
      if (!id) {
        setHighlight(new Set());
        return;
      }
      const next = new Set<string>([id]);
      neighbors.get(id)?.forEach((n) => next.add(n));
      setHighlight(next);
    },
    [neighbors]
  );

  // Spread nodes out — the library's defaults (charge ~-30, link distance
  // ~30) pack ~45 nodes into an unreadable clump. Stronger repulsion +
  // longer links give the graph room to breathe. distanceMax caps how far
  // that repulsion reaches: without it, skills with zero edges (nothing
  // pulls them back in) get flung arbitrarily far away with nothing to stop
  // them, and the *next* fix (fitting the view to the connected cluster)
  // would otherwise still have to zoom out to include wherever they landed.
  useEffect(() => {
    if (width === 0 || !fgRef.current) return;
    const charge = fgRef.current.d3Force("charge");
    charge?.strength(-220).distanceMax(260);
    const link = fgRef.current.d3Force("link");
    link?.distance(90);
    fgRef.current.d3ReheatSimulation();
  }, [width]);

  // Fit the view to the *connected* cluster, not the full bounding box.
  // Zero-edge skill nodes (nothing else in the content mentions them) sit
  // outside any project/cert/experience group by definition, so including
  // them in zoomToFit's bounds zooms the whole graph out to fit a mostly
  // empty rectangle, shrinking the actually-interesting cluster to a speck
  // in the middle. Framing just the connected nodes keeps the default view
  // spacious *and* legible; the isolated ones are still visible nearby
  // (distanceMax above keeps them from drifting off-canvas entirely).
  const handleEngineStop = useCallback(() => {
    const isConnected = (node: NodeObject<GraphNode>) =>
      (neighbors.get(node.id as string)?.size ?? 0) > 0;
    fgRef.current?.zoomToFit(400, 64, isConnected);
  }, [neighbors]);

  const handleNodeClick = useCallback(
    (node: NodeObject<GraphNode>) => {
      setActive((node.id as string) ?? null);
      if (node.type === "project") {
        document.getElementById("projects")?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
        });
      }
    },
    [prefersReduced, setActive]
  );

  const nodeColor = useCallback(
    (node: NodeObject<GraphNode>) => {
      const base = TYPE_COLOR[node.type];
      if (highlight.size === 0) return base;
      return highlight.has(node.id as string) ? base : `${base}22`;
    },
    [highlight]
  );

  const linkColor = useCallback(
    (link: LinkObject<GraphNode, GraphLink>) => {
      if (highlight.size === 0) return "rgba(255,255,255,0.15)";
      const s = endpointId(link.source as LinkEndpoint);
      const t = endpointId(link.target as LinkEndpoint);
      const active = highlight.has(s) && highlight.has(t);
      return active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.04)";
    },
    [highlight]
  );

  const linkWidth = useCallback(
    (link: LinkObject<GraphNode, GraphLink>) => {
      if (highlight.size === 0) return 1;
      const s = endpointId(link.source as LinkEndpoint);
      const t = endpointId(link.target as LinkEndpoint);
      return highlight.has(s) && highlight.has(t) ? 2 : 0.5;
    },
    [highlight]
  );

  const nodeCanvasObject = useCallback(
    (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const radius = 3 + node.val * 1.3;
      const dimmed = highlight.size > 0 && !highlight.has(node.id as string);
      const color = TYPE_COLOR[node.type];

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = dimmed ? `${color}22` : color;
      ctx.fill();

      // Only the hovered/selected node (and its direct neighbors, via
      // `highlight`) ever get a label — not "anything above a zoom
      // threshold", which is what made every node's label appear at once
      // and turned the graph into unreadable text soup.
      if (!dimmed && highlight.has(node.id as string)) {
        const fontSize = Math.max(10, 11 / globalScale);
        ctx.font = `${fontSize}px var(--font-geist-sans, sans-serif)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(237,237,237,0.85)";
        ctx.fillText(node.label, x, y + radius + 2);
      }
    },
    [highlight]
  );

  // More vertical room on desktop where there's width to spare; still
  // generous (not cramped) on mobile.
  const graphHeight = width > 0 && width < 640 ? 520 : 680;

  return (
    <div>
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: graphHeight,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={{ nodes, links }}
            width={width}
            height={graphHeight}
            backgroundColor="rgba(0,0,0,0)"
            nodeRelSize={1}
            nodeLabel={(node) => `${TYPE_LABEL[(node as GraphNode).type]}: ${(node as GraphNode).label}`}
            nodeColor={nodeColor}
            nodeCanvasObject={nodeCanvasObject}
            linkColor={linkColor}
            linkWidth={linkWidth}
            onNodeHover={(node) => setActive(node ? ((node.id as string) ?? null) : null)}
            onNodeClick={handleNodeClick}
            onBackgroundClick={() => setActive(null)}
            onEngineStop={handleEngineStop}
            cooldownTicks={150}
            linkDirectionalParticles={0}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {(Object.keys(TYPE_LABEL) as NodeType[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: TYPE_COLOR[type] }}
            />
            <span className="text-[11px] text-white/45 font-medium">{TYPE_LABEL[type]}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-white/30 mt-3 font-mono">
        {hoverId
          ? "Click a project node to jump to Projects."
          : "Hover or click a node to trace its connections — drag to rearrange, scroll to zoom."}
      </p>
    </div>
  );
}
