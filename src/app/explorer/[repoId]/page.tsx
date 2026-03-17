"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronDown, ChevronRight, File, Folder, FolderOpen,
  Code2, Loader2, MessageSquare, BarChart2, Search, Sparkles, BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api, type TreeNode, type RepoFileData } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANG_MAP: Record<string, string> = {
  python:"python", javascript:"javascript", typescript:"typescript",
  java:"java", go:"go", rust:"rust", cpp:"cpp", c:"c",
  csharp:"csharp", ruby:"ruby", yaml:"yaml", json:"json",
  markdown:"markdown", html:"html", css:"css", scss:"scss",
  sql:"sql", bash:"shell", toml:"ini",
};

export default function ExplorerPage() {
  const { repoId }  = useParams<{ repoId: string }>();
  const [tree,      setTree]      = useState<TreeNode | null>(null);
  const [repoName,  setRepoName]  = useState("");
  const [selected,  setSelected]  = useState<RepoFileData | null>(null);
  const [loadingF,  setLoadingF]  = useState(false);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    api.repos.get(repoId).then(r => setRepoName(r.name));
    api.repos.fileTree(repoId).then(d => setTree(d.file_tree));
  }, [repoId]);

  const openFile = useCallback(async (path: string) => {
    setLoadingF(true);
    try { setSelected(await api.repos.file(repoId, path)); }
    finally { setLoadingF(false); }
  }, [repoId]);

  async function analyzeFile() {
    if (!selected) return;
    setAnalyzing(true);
    try {
      const r = await api.analysis.file(repoId, selected.path);
      setSelected(prev => prev ? { ...prev, summary: r.content } : prev);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      alert("Analysis failed: " + msg);
    } finally { setAnalyzing(false); }
  }

  return (
    <div className="flex flex-col h-screen bg-[#080c10]">
      {/* Top nav */}
      <header className="nav-bar px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 text-[11px]">
          <Link href="/dashboard">
            <div className="w-6 h-6 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
              <Code2 size={11} className="text-[#00ff9d]" />
            </div>
          </Link>
          <span className="text-[#4a5568]">/</span>
          <span className="text-white font-medium truncate max-w-[200px]">{repoName}</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { href: `/search/${repoId}`,      Icon: Search,        label: "Search" },
            { href: `/chat/${repoId}`,         Icon: MessageSquare, label: "Chat"   },
            { href: `/architecture/${repoId}`, Icon: BarChart2,     label: "Arch"   },
            { href: `/docs/${repoId}`,         Icon: BookOpen,      label: "Docs"   },
          ].map(({ href, Icon, label }) => (
            <Link key={href} href={href} className="btn-ghost py-1.5 px-2.5 text-[10px]">
              <Icon size={10} />{label}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* File tree */}
        <aside className="w-56 border-r border-white/5 overflow-y-auto bg-[#080c10] shrink-0">
          <div className="px-3 py-2.5 text-[9px] text-[#3d5166] uppercase tracking-widest border-b border-white/5 font-bold">
            Explorer
          </div>
          {tree
            ? <TreeView node={tree} depth={0} expanded={expanded} setExpanded={setExpanded}
                selectedPath={selected?.path} onOpen={openFile} />
            : <div className="flex justify-center py-12"><Loader2 size={16} className="animate-spin text-[#2a3441]" /></div>
          }
        </aside>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 bg-[#0a0e13] text-[10px] shrink-0">
                <File size={11} className="text-[#3d5166] shrink-0" />
                <span className="text-[#8899aa] font-medium truncate flex-1">{selected.path}</span>
                <span className="text-[#3d5166] shrink-0">{selected.line_count} lines</span>
                {selected.language && (
                  <span className="px-2 py-0.5 bg-white/5 border border-white/8 text-[9px] text-[#6b7a8d] shrink-0 rounded-sm">
                    {selected.language}
                  </span>
                )}
              </div>
              {loadingF
                ? <div className="flex-1 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-[#4a5568]" /></div>
                : <MonacoEditor height="100%"
                    language={LANG_MAP[selected.language || ""] || "plaintext"}
                    value={selected.content || "// Content unavailable"}
                    theme="vs-dark"
                    options={{ readOnly: true, fontSize: 12,
                      fontFamily: "'JetBrains Mono', Consolas, monospace",
                      minimap: { enabled: true }, scrollBeyondLastLine: false,
                      padding: { top: 12 }, wordWrap: "off" }} />
              }
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#2a3441] gap-4">
              <div className="w-20 h-20 border border-white/5 flex items-center justify-center animate-float">
                <Code2 size={32} className="text-[#2a3441]" />
              </div>
              <p className="text-xs text-[#3d5166]">Select a file from the tree to view its code</p>
            </div>
          )}
        </div>

        {/* AI sidebar */}
        {selected && (
          <aside className="w-64 border-l border-white/5 bg-[#080c10] flex flex-col shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#00ff9d]" />
                <span className="text-[9px] text-[#4a5568] uppercase tracking-widest font-medium">AI Analysis</span>
              </div>
              {!selected.summary && !analyzing && (
                <button onClick={analyzeFile}
                  className="text-[10px] text-[#00ff9d] hover:underline font-bold transition-colors">
                  Analyse →
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {analyzing && (
                <div className="flex items-center gap-2 text-[#4a5568] text-xs">
                  <Loader2 size={12} className="animate-spin" />Analysing with Gemini…
                </div>
              )}
              {selected.summary && !analyzing && (
                <div className="ai-prose"><ReactMarkdown>{selected.summary}</ReactMarkdown></div>
              )}
              {!selected.summary && !analyzing && (
                <p className="text-[10px] text-[#3d5166]">
                  Click &ldquo;Analyse →&rdquo; to get an AI explanation of this file.
                </p>
              )}
              {selected.functions?.length > 0 && (
                <div>
                  <p className="text-[9px] text-[#3d5166] uppercase tracking-widest mb-2 font-bold">
                    Functions ({selected.functions.length})
                  </p>
                  <ul className="space-y-1">
                    {selected.functions.slice(0, 20).map((fn, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] text-[#6b7a8d]">
                        <span className="text-[#00ff9d]/50 font-bold shrink-0">ƒ</span>
                        <span className="truncate">{typeof fn === "string" ? fn : fn.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.classes?.length > 0 && (
                <div>
                  <p className="text-[9px] text-[#3d5166] uppercase tracking-widest mb-2 font-bold">
                    Classes ({selected.classes.length})
                  </p>
                  <ul className="space-y-1">
                    {selected.classes.slice(0, 10).map((cls, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] text-[#6b7a8d]">
                        <span className="text-blue-400/50 shrink-0">◆</span>
                        <span className="truncate">{typeof cls === "string" ? cls : cls.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function TreeView({ node, depth, expanded, setExpanded, selectedPath, onOpen }: {
  node: TreeNode; depth: number; expanded: Set<string>;
  setExpanded: (fn: (p: Set<string>) => Set<string>) => void;
  selectedPath?: string; onOpen: (p: string) => void;
}) {
  const key   = node.path || node.name;
  const isExp = expanded.has(key);

  if (node.type === "file") return (
    <div onClick={() => onOpen(node.path!)}
      className={`flex items-center gap-1.5 py-[3px] cursor-pointer text-[11px] transition-colors
        ${selectedPath === node.path
          ? "bg-[#00ff9d]/10 text-[#00ff9d] border-l-2 border-[#00ff9d]"
          : "text-[#6b7a8d] hover:text-white hover:bg-white/3"}`}
      style={{ paddingLeft: `${14 + depth * 12}px` }}>
      <File size={9} className="shrink-0 opacity-60" />
      <span className="truncate">{node.name}</span>
    </div>
  );

  return (
    <div>
      <div onClick={() => setExpanded(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; })}
        className="flex items-center gap-1 py-[3px] cursor-pointer text-[11px] text-[#4a5568] hover:text-white transition-colors"
        style={{ paddingLeft: `${8 + depth * 12}px` }}>
        {isExp ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
        {isExp
          ? <FolderOpen size={11} className="text-yellow-400/65 shrink-0" />
          : <Folder    size={11} className="text-yellow-400/35 shrink-0" />}
        <span className="truncate">{node.name}</span>
      </div>
      {isExp && node.children?.map(c => (
        <TreeView key={c.name} node={c} depth={depth + 1}
          expanded={expanded} setExpanded={setExpanded}
          selectedPath={selectedPath} onOpen={onOpen} />
      ))}
    </div>
  );
}
