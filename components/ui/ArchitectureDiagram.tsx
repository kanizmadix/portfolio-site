"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Brain,
  ChevronDown,
  CheckCircle2,
  Cpu,
  Database,
  LayoutDashboard,
  Radio,
  Server,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
// Imported once, statically — this is just CSS (a few KB), so it rides along
// with the already-lazy-loaded chunk this component lives in rather than
// needing its own split.
import "@xyflow/react/dist/style.css";

import type { Project } from "@/data/portfolio";
import {
  deriveArchitecture,
  type ArchEdge,
  type ArchNode,
  type ArchNodeKind,
} from "@/lib/architecture";
import type {
  Edge as RFEdge,
  EdgeProps,
  Node as RFNode,
  getBezierPath as GetBezierPathFn,
} from "@xyflow/react";

// The @xyflow/react *runtime* (ReactFlow, Background, Controls, …) is loaded
// via a plain `import()` inside an effect below — never statically imported
// at the top of this module. That keeps it in its own webpack chunk, fetched
// only when a desktop/tablet visitor actually opens a diagram. Mobile
// visitors get the (tiny) step-list branch and never trigger that import,
// so they never download the diagram library's JS at all.
type XyflowModule = typeof import("@xyflow/react");

type FlowNodeData = { label: ReactNode };
type FlowNode = RFNode<FlowNodeData>;

const KIND_ICON: Record<ArchNodeKind, LucideIcon> = {
  client: User,
  interface: LayoutDashboard,
  api: Server,
  model: Brain,
  storage: Database,
  stream: Radio,
  compute: Cpu,
  response: CheckCircle2,
};

// Brand accent per node kind, drawn from the site's existing palette.
const KIND_COLOR: Record<ArchNodeKind, string> = {
  client: "#ededed",
  interface: "#a78bfa",
  api: "#818cf8",
  model: "#22d3ee",
  storage: "#a78bfa",
  stream: "#22d3ee",
  compute: "#818cf8",
  response: "#22d3ee",
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface ArchitectureDiagramProps {
  project: Project;
  onClose: () => void;
}

export default function ArchitectureDiagram({ project, onClose }: ArchitectureDiagramProps) {
  const prefersReduced = useReducedMotion();
  const architecture = useMemo(() => deriveArchitecture(project), [project]);

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const [xyflow, setXyflow] = useState<XyflowModule | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Track viewport class while the modal is open.
  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Genuine code-split: only executes (and only fetches the chunk) on
  // desktop/tablet, once.
  useEffect(() => {
    if (!isDesktop || xyflow) return;
    let cancelled = false;
    import("@xyflow/react").then((mod) => {
      if (!cancelled) setXyflow(mod);
    });
    return () => {
      cancelled = true;
    };
  }, [isDesktop, xyflow]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const selectedNode = architecture.nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-[rgba(10,10,10,0.92)] backdrop-blur-md"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} architecture diagram`}
        initial={prefersReduced ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative w-full max-w-5xl max-h-[85vh] bg-[rgba(10,10,10,0.92)] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-start justify-between gap-4 px-5 md:px-7 py-5 border-b border-white/[0.07] shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.2em] uppercase text-indigo-400 font-mono mb-1">
              Architecture
            </p>
            <h3 className="text-lg md:text-xl font-semibold gradient-text truncate">
              {project.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close architecture diagram"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        </header>

        {/* React Flow needs a parent with a *definite* pixel height to measure
            against. `flex-1` computes flex-basis:0%, which — since the
            ancestor dialog only has max-h (a cap, not a definite size) and
            so has no free space to distribute — wins over an explicit height
            and resolves this to 0px. A plain fixed height (no flex-grow)
            sidesteps that entirely. */}
        <div className="relative h-[52vh] md:h-[58vh]">
          {isDesktop ? (
            xyflow ? (
              <DesktopDiagram
                mod={xyflow}
                archNodes={architecture.nodes}
                archEdges={architecture.edges}
                prefersReduced={!!prefersReduced}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-white/30 text-sm font-mono">
                Loading diagram…
              </div>
            )
          ) : (
            <MobileStepList nodes={architecture.nodes} />
          )}

          {selectedNode && isDesktop && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-[#111114]/95 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-xs font-mono text-white/85 font-semibold">
                  {selectedNode.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  aria-label="Close note"
                  className="text-white/40 hover:text-white/80 transition-colors duration-200"
                >
                  <X size={13} />
                </button>
              </div>
              <p className="text-xs text-white/55 leading-relaxed">{selectedNode.note}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Desktop / tablet: interactive React Flow diagram
// ─────────────────────────────────────────────────────────────────────────

interface DesktopDiagramProps {
  mod: XyflowModule;
  archNodes: ArchNode[];
  archEdges: ArchEdge[];
  prefersReduced: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

const NODE_SPACING_X = 232;
const NODE_WIDTH = 168;

function DesktopDiagram({
  mod,
  archNodes,
  archEdges,
  prefersReduced,
  selectedNodeId,
  onSelectNode,
}: DesktopDiagramProps) {
  const { ReactFlow, Background, Controls, Position, getBezierPath } = mod;

  const nodes: FlowNode[] = useMemo(
    () =>
      archNodes.map((n, i) => {
        const Icon = KIND_ICON[n.kind];
        const color = KIND_COLOR[n.kind];
        const isSelected = n.id === selectedNodeId;
        return {
          id: n.id,
          type: "default",
          position: { x: i * NODE_SPACING_X, y: 0 },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          draggable: false,
          connectable: false,
          style: {
            background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${isSelected ? color : "rgba(255,255,255,0.09)"}`,
            borderRadius: 14,
            padding: "10px 12px",
            width: NODE_WIDTH,
            boxShadow: isSelected ? `0 0 26px ${color}40` : "none",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
            cursor: "pointer",
          },
          data: {
            label: (
              <div className="flex items-center gap-2 pointer-events-none">
                <Icon size={14} color={color} strokeWidth={2} className="shrink-0" />
                <span className="font-mono text-[11px] leading-tight text-white/85 text-left">
                  {n.label}
                </span>
              </div>
            ),
          },
        } satisfies FlowNode;
      }),
    [archNodes, selectedNodeId, Position]
  );

  const edges: RFEdge[] = useMemo(
    () =>
      archEdges.map((e) => ({
        id: e.id,
        source: e.from,
        target: e.to,
        type: "flow",
        focusable: false,
        selectable: false,
        deletable: false,
      })),
    [archEdges]
  );

  const edgeTypes = useMemo(
    () => ({ flow: makeFlowEdge(getBezierPath, !prefersReduced) }),
    [getBezierPath, prefersReduced]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable
      elementsSelectable
      panOnScroll
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.35}
      maxZoom={1.5}
      onNodeClick={(_, node) => onSelectNode(node.id === selectedNodeId ? null : node.id)}
      onPaneClick={() => onSelectNode(null)}
    >
      <Background color="rgba(255,255,255,0.06)" gap={24} size={1} />
      <Controls
        showInteractive={false}
        className="!bg-[#111114] !border !border-white/10 !shadow-none !fill-white/60 [&_button]:!bg-transparent [&_button]:!border-white/10 [&_button]:!text-white/60 [&_button:hover]:!bg-white/5"
      />
    </ReactFlow>
  );
}

function makeFlowEdge(getBezierPath: typeof GetBezierPathFn, animate: boolean) {
  return function FlowEdge({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    style,
    markerEnd,
  }: EdgeProps) {
    const [path] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.28,
    });
    return (
      <>
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={1.4}
          style={style}
          markerEnd={markerEnd}
        />
        {animate && (
          <circle r={2.6} fill="#22d3ee" opacity={0.9}>
            <animateMotion dur="3.4s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </>
    );
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Mobile: vertical step list (no @xyflow/react import on this path at all)
// ─────────────────────────────────────────────────────────────────────────

function MobileStepList({ nodes }: { nodes: ArchNode[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto px-5 py-6">
      {nodes.map((n, i) => {
        const Icon = KIND_ICON[n.kind];
        const color = KIND_COLOR[n.kind];
        const isOpen = openId === n.id;
        const isLast = i === nodes.length - 1;
        return (
          <div key={n.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : n.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 text-left py-2.5"
            >
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full border shrink-0"
                style={{ borderColor: `${color}55`, background: "rgba(255,255,255,0.03)" }}
              >
                <Icon size={15} color={color} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] text-white/35 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block text-sm font-medium text-white/90 truncate">{n.label}</span>
              </span>
            </button>
            {isOpen && (
              <p className="pl-12 pb-3 pr-2 text-xs text-white/55 leading-relaxed">{n.note}</p>
            )}
            {!isLast && (
              <div className="flex items-center pl-[7px]">
                <ChevronDown size={14} className="text-white/20" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
