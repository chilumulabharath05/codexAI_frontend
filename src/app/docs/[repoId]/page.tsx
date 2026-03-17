"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code2, ChevronLeft, BookOpen, Zap, Copy, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type Tab = "architecture" | "readme" | "apidocs";

export default function DocsPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [tab,      setTab]     = useState<Tab>("architecture");
  const [repoName, setRepoName]= useState("");
  const [content,  setContent] = useState<Record<Tab, string | null>>({ architecture:null, readme:null, apidocs:null });
  const [loading,  setLoading] = useState(false);
  const [copied,   setCopied]  = useState(false);

  useEffect(() => {
    api.repos.get(repoId).then(r => {
      setRepoName(r.name);
      setContent(c => ({ ...c, architecture: r.architecture || null }));
    });
  }, [repoId]);

  async function handleTab(t: Tab) {
    setTab(t);
    if (content[t] !== null) return;
    setLoading(true);
    try {
      if (t === "readme") {
        const d = await api.search.readme(repoId);
        setContent(c => ({ ...c, readme: d.content }));
      } else if (t === "apidocs") {
        const d = await api.search.apidocs(repoId);
        setContent(c => ({ ...c, apidocs: d.content }));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setContent(c => ({ ...c, [t]: `Error: ${msg}` }));
    } finally { setLoading(false); }
  }

  async function copy() {
    await navigator.clipboard.writeText(content[tab] || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const cur = content[tab];

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
          <span className="text-[#4a5568] truncate max-w-[160px]">{repoName}</span>
          <span className="text-[#2a3441]">/</span>
          <span className="text-white font-medium">Docs</span>
        </div>
        {cur && (
          <button onClick={copy} className="btn-ghost text-[10px] py-1.5 px-3">
            {copied ? <><Check size={10} className="text-[#00ff9d]" />Copied!</> : <><Copy size={10} />Copy Markdown</>}
          </button>
        )}
      </header>

      <div className="flex border-b border-white/5 shrink-0 bg-[#080c10]">
        {([
          ["architecture", BookOpen, "Architecture"],
          ["readme",       Code2,    "README.md"   ],
          ["apidocs",      Zap,      "API Docs"    ],
        ] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => handleTab(id)}
            className={`flex items-center gap-1.5 px-5 py-3 text-[11px] font-medium transition-colors border-b-2
              ${tab === id ? "border-[#00ff9d] text-[#00ff9d]" : "border-transparent text-[#4a5568] hover:text-white"}`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-[#4a5568] gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs">Generating with Gemini…</span>
            </div>
          ) : cur ? (
            <div className="ai-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cur}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-[#2a3441]">
              <BookOpen size={36} className="mb-5 opacity-40" />
              <p className="text-xs text-[#4a5568] mb-6 text-center max-w-xs">
                {tab === "architecture"
                  ? "Architecture analysis not yet generated. Import and process a repo first."
                  : "Click below to generate this documentation with Gemini AI."}
              </p>
              {tab !== "architecture" && (
                <button onClick={() => handleTab(tab)} className="btn-primary">
                  <Zap size={13} /> Generate {tab === "readme" ? "README" : "API Docs"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
