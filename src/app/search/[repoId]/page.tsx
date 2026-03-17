"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Code2, ChevronLeft, Loader2, Filter, ChevronDown } from "lucide-react";
import { api, type SearchHit } from "@/lib/api";

const EXAMPLES = [
  "JWT token validation",     "database connection pool",
  "authentication middleware","error handling",
  "file upload handler",      "rate limiting",
  "password hashing",         "async task processing",
];
const LANG_DOT: Record<string, string> = {
  python:"#3572A5", javascript:"#f1e05a", typescript:"#2b7489",
  go:"#00ADD8", rust:"#dea584", java:"#b07219",
};

export default function SearchPage() {
  const { repoId }  = useParams<{ repoId: string }>();
  const [q,        setQ]        = useState("");
  const [lang,     setLang]     = useState("");
  const [results,  setResults]  = useState<SearchHit[]>([]);
  const [langs,    setLangs]    = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [repoName, setRepoName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.repos.get(repoId).then(r => { setRepoName(r.name); setLangs(Object.keys(r.languages || {})); });
    inputRef.current?.focus();
  }, [repoId]);

  async function search(query = q) {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res = await api.search.query(repoId, query.trim(), 15, lang || undefined);
      setResults(res.results);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      <header className="nav-bar px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px]">
          <Link href={`/explorer/${repoId}`} className="text-[#4a5568] hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </Link>
          <div className="w-6 h-6 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
            <Code2 size={11} className="text-[#00ff9d]" />
          </div>
          <span className="text-[#4a5568] truncate max-w-[160px]">{repoName}</span>
          <span className="text-[#2a3441]">/</span>
          <span className="text-white font-medium">Semantic Search</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-white mb-1.5">Semantic Code Search</h1>
          <p className="text-[11px] text-[#4a5568]">
            Search in natural language — powered by Google text-embedding-004.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2.5 mb-6">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a5568]" />
            <input ref={inputRef} value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Search code with natural language…"
              className="input-field pl-10" />
          </div>
          {langs.length > 0 && (
            <div className="relative">
              <Filter size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]" />
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="input-field pl-8 pr-4 appearance-none w-36">
                <option value="">All langs</option>
                {langs.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
          <button onClick={() => search()} disabled={!q.trim() || loading} className="btn-primary">
            {loading ? <Loader2 size={13} className="animate-spin" /> : "Search"}
          </button>
        </div>

        {!searched && (
          <div className="mb-8">
            <p className="text-[10px] text-[#3d5166] mb-3 font-medium">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => { setQ(ex); search(ex); }}
                  className="px-3 py-1.5 border border-white/8 text-[11px] text-[#4a5568] hover:text-white hover:border-white/20 transition-all rounded-sm">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-[#4a5568] gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs">Searching {repoName}…</span>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20 text-[#3d5166]">
            <Search size={28} className="mx-auto mb-3 opacity-25" />
            <p className="text-xs">No results found for &ldquo;{q}&rdquo;</p>
            <p className="text-[10px] mt-1.5 text-[#2a3441]">Try different keywords or check the embeddings are indexed.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[#3d5166] mb-3 font-medium">{results.length} results for &ldquo;{q}&rdquo;</p>
            {results.map((hit, i) => <HitCard key={i} hit={hit} repoId={repoId} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function HitCard({ hit, repoId }: { hit: SearchHit; repoId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glow-card overflow-hidden rounded-sm">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANG_DOT[hit.language] || "#555" }} />
          <Link href={`/explorer/${repoId}`} onClick={e => e.stopPropagation()}
            className="text-[11px] text-white font-medium hover:text-[#00ff9d] transition-colors truncate">
            {hit.file_path}
          </Link>
          <span className="text-[10px] text-[#3d5166] shrink-0">L{hit.start_line}–{hit.end_line}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-[10px] text-[#00ff9d]/65 font-bold">{(hit.score * 100).toFixed(0)}%</span>
          <ChevronDown size={11} className={`text-[#4a5568] transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </div>
      {open && (
        <div className="border-t border-white/5 px-4 py-3.5 bg-[#0a0e13]">
          <pre className="text-[10px] text-[#8899aa] overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
            {hit.snippet}
          </pre>
        </div>
      )}
    </div>
  );
}
