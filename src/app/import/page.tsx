"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Code2, GitBranch, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ImportPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState<"git" | "zip">("git");
  const [url,     setUrl]     = useState("");
  const [branch,  setBranch]  = useState("main");
  const [name,    setName]    = useState("");
  const [file,    setFile]    = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const autoName = (u: string) => {
    try { return u.replace(/\.git$/, "").split("/").at(-1) || ""; }
    catch { return ""; }
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "git") {
        if (!url.trim()) throw new Error("Git URL is required");
        await api.repos.importGit({ url: url.trim(), branch: branch || "main", name: name || autoName(url) });
      } else {
        if (!file) throw new Error("Please select a ZIP file");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("name", name || file.name.replace(/\.zip$/, ""));
        await api.repos.importZip(fd);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#080c10]">
      <nav className="nav-bar px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#6b7a8d] hover:text-white transition-colors text-xs">
          <ArrowLeft size={13} /> Back
        </Link>
        <span className="text-[#2a3441]">|</span>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
            <Code2 size={13} className="text-[#00ff9d]" />
          </div>
          <span className="text-[#00ff9d] text-xs font-bold tracking-[.15em] uppercase">CodexAI</span>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-16">
        <h1 className="text-xl font-bold text-white mb-2">Import Repository</h1>
        <p className="text-[#6b7a8d] text-xs mb-8">Analyse any public Git repo or ZIP archive with Google Gemini AI — free.</p>

        {/* Mode tabs */}
        <div className="flex border border-white/8 mb-8 overflow-hidden">
          {(["git", "zip"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold tracking-wide transition-all
                ${mode === m ? "bg-[#00ff9d]/10 text-[#00ff9d] border-b-2 border-[#00ff9d]" : "text-[#4a5568] hover:text-white"}`}>
              {m === "git" ? <><GitBranch size={13} /> Git URL</> : <><Upload size={13} /> ZIP Upload</>}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-5">
          {mode === "git" ? (
            <>
              <div>
                <label className="block text-[10px] text-[#8899aa] mb-2 uppercase tracking-wider">Git URL</label>
                <input type="url" value={url}
                  onChange={e => { setUrl(e.target.value); if (!name) setName(autoName(e.target.value)); }}
                  placeholder="https://github.com/owner/repository"
                  className="input-field" />
                <p className="text-[10px] text-[#3d5166] mt-1.5">Any public GitHub, GitLab, Bitbucket or bare Git URL</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#8899aa] mb-2 uppercase tracking-wider">Branch</label>
                  <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="main" className="input-field" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8899aa] mb-2 uppercase tracking-wider">Name (optional)</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="auto-detected" className="input-field" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[10px] text-[#8899aa] mb-2 uppercase tracking-wider">ZIP Archive</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-white/10 hover:border-[#00ff9d]/35 transition-colors py-14 text-center cursor-pointer bg-[#0a0e13]">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={24} className="text-[#00ff9d]" />
                      <span className="text-white text-xs font-medium">{file.name}</span>
                      <span className="text-[#4a5568] text-[10px]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5 text-[#4a5568]">
                      <Upload size={24} />
                      <span className="text-xs">Click to select ZIP file</span>
                      <span className="text-[10px] text-[#2a3441]">Max 200 MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".zip" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!name) setName(f.name.replace(/\.zip$/, "")); } }} />
              </div>
              <div>
                <label className="block text-[10px] text-[#8899aa] mb-2 uppercase tracking-wider">Repository Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="my-project" className="input-field" />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 border border-red-400/20 bg-red-400/5 rounded-sm">
              <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : <><GitBranch size={14} /> Begin Analysis</>}
          </button>
        </form>

        <div className="mt-10 border border-white/6 bg-[#0a0e13] p-5 rounded-sm">
          <p className="text-[10px] text-[#3d5166] uppercase tracking-widest mb-4 font-medium">What happens next</p>
          <ol className="space-y-2.5">
            {[
              "Repository cloned or extracted securely",
              "Files parsed and chunked by language",
              "Gemini AI generates summaries and architecture analysis",
              "Chunks embedded with Google text-embedding-004",
              "Chat and semantic search become available",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] text-[#6b7a8d]">
                <span className="text-[#00ff9d]/55 font-bold shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
