"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, GitBranch, Loader2, Trash2, Code2, MessageSquare, BarChart2, Search, RefreshCw, Sparkles } from "lucide-react";
import { api, type Repo } from "@/lib/api";

const S: Record<string, { label: string; cls: string; spin: boolean }> = {
  pending:   { label: "Queued",   cls: "badge-pending",   spin: false },
  cloning:   { label: "Cloning",  cls: "badge-cloning",   spin: true  },
  parsing:   { label: "Parsing",  cls: "badge-parsing",   spin: true  },
  embedding: { label: "Indexing", cls: "badge-embedding", spin: true  },
  ready:     { label: "Ready",    cls: "badge-ready",     spin: false },
  failed:    { label: "Failed",   cls: "badge-failed",    spin: false },
};
const LANG_DOT: Record<string, string> = {
  python:"#3572A5", javascript:"#f1e05a", typescript:"#2b7489",
  go:"#00ADD8", rust:"#dea584", java:"#b07219", cpp:"#f34b7d",
  ruby:"#cc342d", php:"#4f5d95",
};

export default function Dashboard() {
  const [repos,   setRepos]   = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setRepos(await api.repos.list()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  async function del(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this repository and all its data?")) return;
    await api.repos.delete(id);
    setRepos(r => r.filter(x => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      <nav className="nav-bar px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
            <Code2 size={13} className="text-[#00ff9d]" />
          </div>
          <span className="text-[#00ff9d] text-xs font-bold tracking-[.15em] uppercase">CodexAI</span>
        </Link>
        <div className="flex items-center gap-5 text-xs">
          <span className="text-white font-medium">Dashboard</span>
          <Link href="/settings" className="text-[#6b7a8d] hover:text-white transition-colors">Settings</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Repositories</h1>
            <p className="text-[11px] text-[#3d5166]">{repos.length} total · powered by Google Gemini</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="btn-ghost p-2.5" title="Refresh">
              <RefreshCw size={13} />
            </button>
            <Link href="/import" className="btn-primary">
              <Plus size={13} /> Import Repository
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 w-full" />)}
          </div>
        ) : repos.length === 0 ? (
          <div className="border border-dashed border-white/8 py-24 text-center">
            <div className="w-16 h-16 border border-white/8 bg-white/2 flex items-center justify-center mx-auto mb-5 animate-float">
              <Sparkles size={26} className="text-[#2a3441]" />
            </div>
            <p className="text-white text-sm font-bold mb-2">No repositories yet</p>
            <p className="text-[#4a5568] text-xs mb-7 max-w-xs mx-auto">
              Import a public Git repo or ZIP to start exploring with Gemini AI.
            </p>
            <Link href="/import" className="btn-primary">
              <Plus size={13} /> Import your first repository
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {repos.map(r => {
              const cfg   = S[r.status] ?? S.pending;
              const ready = r.status === "ready";
              const lang  = r.language || Object.keys(r.languages)[0];
              return (
                <div key={r.id} className={`glow-card p-5 ${!ready ? "opacity-70" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5">
                        <GitBranch size={13} className="text-[#3d5166] shrink-0" />
                        {ready
                          ? <Link href={`/explorer/${r.id}`} className="text-white font-bold hover:text-[#00ff9d] transition-colors truncate">{r.name}</Link>
                          : <span className="text-white font-bold truncate">{r.name}</span>
                        }
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-sm ${cfg.cls}`}>
                          {cfg.spin && <Loader2 size={9} className="animate-spin" />}
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#4a5568]">
                        {lang && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANG_DOT[lang] || "#555" }} />
                            {lang}
                          </span>
                        )}
                        {ready && (
                          <><span>{r.total_files.toLocaleString()} files</span><span>{(r.total_lines / 1000).toFixed(1)}k lines</span></>
                        )}
                        {r.url && <span className="truncate max-w-xs hidden md:block text-[10px] text-[#2a3441]">{r.url}</span>}
                        {r.error && <span className="text-red-400 text-[10px] truncate max-w-sm">{r.error}</span>}
                      </div>
                      {ready && Object.keys(r.languages).length > 0 && (
                        <div className="flex rounded-full overflow-hidden h-[3px] w-48 mt-3 gap-px">
                          {Object.entries(r.languages).slice(0, 6).map(([l, p]) => (
                            <div key={l} style={{ width: `${p}%`, background: LANG_DOT[l] || "#333" }} />
                          ))}
                        </div>
                      )}
                      {ready && r.tech_stack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {r.tech_stack.slice(0, 6).map(t => (
                            <span key={t} className="px-2 py-0.5 bg-white/4 border border-white/8 text-[9px] text-[#6b7a8d] rounded-sm">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ready && (
                        <div className="hidden sm:flex items-center gap-1.5">
                          <Link href={`/search/${r.id}`}      className="btn-ghost py-1.5 px-2.5 text-[10px]"><Search size={10} />Search</Link>
                          <Link href={`/chat/${r.id}`}         className="btn-ghost py-1.5 px-2.5 text-[10px]"><MessageSquare size={10} />Chat</Link>
                          <Link href={`/architecture/${r.id}`} className="btn-ghost py-1.5 px-2.5 text-[10px]"><BarChart2 size={10} />Arch</Link>
                        </div>
                      )}
                      <button onClick={e => del(r.id, e)} className="p-2 text-[#3d5166] hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
