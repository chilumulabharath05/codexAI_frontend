"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Code2, ChevronLeft, BookOpen, GitBranch, Shield, Loader2, Layers, MessageSquare } from "lucide-react";
import { api, type Repo, type Analysis } from "@/lib/api";

const FlowView = dynamic(() => import("./FlowView"), { ssr: false });
type Tab = "architecture" | "graph" | "dependencies" | "security";

export default function ArchPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [repo,     setRepo]     = useState<Repo | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [tab,      setTab]      = useState<Tab>("architecture");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([api.repos.get(repoId), api.analysis.list(repoId)])
      .then(([r, a]) => { setRepo(r); setAnalyses(a); setLoading(false); });
  }, [repoId]);

  const archA = analyses.find(a => a.type === "architecture");
  const depA  = analyses.find(a => a.type === "dependency");
  const secAs = analyses.filter(a => a.type === "security");

  const TABS = [
    { id:"architecture" as Tab, Icon:BookOpen,  label:"Architecture" },
    { id:"graph"        as Tab, Icon:Layers,    label:"Module Graph"  },
    { id:"dependencies" as Tab, Icon:GitBranch, label:"Dependencies"  },
    { id:"security"     as Tab, Icon:Shield,    label:"Security"      },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#080c10]">
      <header className="nav-bar px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-[11px]">
          <Link href={`/explorer/${repoId}`} className="text-[#4a5568] hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </Link>
          <div className="w-6 h-6 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
            <Code2 size={11} className="text-[#00ff9d]" />
          </div>
          <span className="text-[#4a5568] truncate max-w-[160px]">{repo?.name}</span>
          <span className="text-[#2a3441]">/</span>
          <span className="text-white font-medium">Architecture</span>
        </div>
        <Link href={`/chat/${repoId}`} className="btn-ghost text-[10px] py-1.5 px-3">
          <MessageSquare size={10} /> Ask AI
        </Link>
      </header>

      {/* Stats bar */}
      {repo && (
        <div className="flex items-center gap-5 px-5 py-2.5 border-b border-white/5 text-[10px] text-[#4a5568] overflow-x-auto shrink-0 bg-[#080c10]">
          <span className="shrink-0"><span className="text-[#2a3441]">lang: </span>{repo.language || "—"}</span>
          <span className="shrink-0"><span className="text-[#2a3441]">files: </span>{repo.total_files.toLocaleString()}</span>
          <span className="shrink-0"><span className="text-[#2a3441]">lines: </span>{(repo.total_lines / 1000).toFixed(1)}k</span>
          {repo.tech_stack?.slice(0, 5).map(t => (
            <span key={t} className="shrink-0 px-2 py-0.5 bg-white/4 border border-white/8 text-[9px] text-[#6b7a8d] rounded-sm">{t}</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/5 shrink-0 bg-[#080c10]">
        {TABS.map(({ id, Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-5 py-3 text-[11px] font-medium transition-colors border-b-2
              ${tab === id ? "border-[#00ff9d] text-[#00ff9d]" : "border-transparent text-[#4a5568] hover:text-white"}`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#4a5568] gap-2">
          <Loader2 size={18} className="animate-spin" />Loading analysis…
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {tab === "graph" && (
            <FlowView
              fileTree={(repo as Repo & { file_tree: unknown })?.file_tree ?? null}
              repoName={repo?.name ?? ""}
            />
          )}
          {tab === "architecture" && (
            <div className="h-full overflow-y-auto p-7">
              <div className="max-w-3xl mx-auto">
                {archA?.content || repo?.architecture
                  ? <div className="ai-prose"><ReactMarkdown>{archA?.content || repo?.architecture || ""}</ReactMarkdown></div>
                  : <EmptyState text="Architecture analysis not available yet." />
                }
              </div>
            </div>
          )}
          {tab === "dependencies" && (
            <div className="h-full overflow-y-auto p-7">
              <div className="max-w-3xl mx-auto">
                {depA
                  ? <div className="ai-prose"><ReactMarkdown>{depA.content}</ReactMarkdown></div>
                  : <EmptyState text="No dependency analysis. Ensure your repo has a package file (requirements.txt, package.json, go.mod)." />
                }
              </div>
            </div>
          )}
          {tab === "security" && (
            <div className="h-full overflow-y-auto p-7">
              <div className="max-w-3xl mx-auto space-y-4">
                {secAs.length > 0
                  ? secAs.map((s, i) => (
                    <div key={i} className="border border-red-400/15 bg-red-400/5 p-5 rounded-sm">
                      <p className="text-xs text-red-300 font-bold mb-3">{s.title || s.target_path}</p>
                      <div className="ai-prose"><ReactMarkdown>{s.content.slice(0, 900)}</ReactMarkdown></div>
                    </div>
                  ))
                  : (
                    <div className="flex items-center gap-3 px-5 py-4 border border-[#00ff9d]/15 bg-[#00ff9d]/5 rounded-sm">
                      <Shield size={15} className="text-[#00ff9d] shrink-0" />
                      <p className="text-xs text-[#8899aa]">No critical security issues detected in sampled files.</p>
                    </div>
                  )
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-[#4a5568] text-xs">{text}</p>;
}
