"use client";
import { useEffect } from "react";
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  type Node, type Edge,
} from "reactflow";

type TN = { name: string; type: string; path?: string; children?: TN[] };

function buildGraph(tree: TN | null, repoName: string) {
  const nodes: Node[] = [], edges: Edge[] = [];
  if (!tree) return { nodes, edges };

  nodes.push({
    id: "root", position: { x: 500, y: 0 }, data: { label: repoName },
    style: { background:"rgba(0,255,157,0.08)", border:"1px solid rgba(0,255,157,0.4)",
              color:"#00ff9d", fontSize:12, fontFamily:"monospace",
              padding:"7px 18px", borderRadius:0, fontWeight:700 },
  });

  const dirs = (tree.children || []).filter(c => c.type === "directory").slice(0, 10);
  dirs.forEach((dir, i) => {
    const id  = `d${i}`;
    const x   = (i - (dirs.length - 1) / 2) * 185 + 500;
    const svc = /service|api|route|handler|controller|endpoint/.test(dir.name.toLowerCase());
    const db  = /db|database|model|schema|store|repository/.test(dir.name.toLowerCase());
    const ui  = /component|view|page|screen|ui/.test(dir.name.toLowerCase());

    const borderColor = svc ? "rgba(43,116,137,0.5)" : db ? "rgba(176,114,25,0.5)" : ui ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)";
    const bgColor     = svc ? "rgba(43,116,137,0.08)" : db ? "rgba(176,114,25,0.08)" : ui ? "rgba(139,92,246,0.08)" : "rgba(13,17,23,0.9)";
    const textColor   = svc ? "#2b7489" : db ? "#b07219" : ui ? "#a78bfa" : "#8899aa";

    nodes.push({
      id, position: { x, y: 150 }, data: { label: dir.name },
      style: { background: bgColor, border: `1px solid ${borderColor}`,
                color: textColor, fontSize: 10, fontFamily: "monospace",
                padding: "5px 14px", borderRadius: 0 },
    });
    edges.push({ id: `r-${id}`, source: "root", target: id,
      style: { stroke: svc ? "#2b7489" : "#2a3441", strokeWidth: svc ? 2 : 1.5 },
      animated: svc });

    (dir.children || []).filter(c => c.type === "directory").slice(0, 4).forEach((sub, j) => {
      const sid = `${id}s${j}`;
      nodes.push({
        id: sid, position: { x: x + (j - 1.5) * 125, y: 290 }, data: { label: sub.name },
        style: { background:"rgba(10,14,19,0.9)", border:"1px solid rgba(255,255,255,0.06)",
                  color:"#6b7a8d", fontSize:10, fontFamily:"monospace", padding:"4px 10px", borderRadius:0 },
      });
      edges.push({ id:`${id}-${sid}`, source:id, target:sid,
        style:{ stroke:"#1a2433", strokeWidth:1 } });
    });
  });
  return { nodes, edges };
}

export default function FlowView({ fileTree, repoName }: { fileTree: unknown; repoName: string }) {
  const [nodes, setNodes, onNC] = useNodesState([]);
  const [edges, setEdges, onEC] = useEdgesState([]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(fileTree as TN | null, repoName);
    setNodes(n); setEdges(e);
  }, [fileTree, repoName]);

  return (
    <div style={{ width:"100%", height:"100%", background:"#080c10" }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNC} onEdgesChange={onEC}
        fitView fitViewOptions={{ padding:0.2 }} style={{ background:"#080c10" }}>
        <Background color="#1a2433" gap={32} size={1} />
        <Controls style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.06)" }} />
        <MiniMap style={{ background:"#0a0e13", border:"1px solid rgba(255,255,255,0.06)" }} nodeColor="#2a3441" />
      </ReactFlow>
    </div>
  );
}
