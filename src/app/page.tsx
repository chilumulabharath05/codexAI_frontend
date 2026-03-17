import Link from "next/link";
import { ArrowRight, Code2, GitBranch, Search, Zap, Shield, Layers, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080c10] text-white grid-bg overflow-x-hidden">

      {/* NAV */}
      <nav className="nav-bar px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
            <Code2 size={15} className="text-[#00ff9d]" />
          </div>
          <span className="text-[#00ff9d] text-sm font-bold tracking-[.15em] uppercase">CodexAI</span>
          <span className="hidden sm:block text-[9px] px-2 py-0.5 border border-[#00ff9d]/25 text-[#00ff9d]/70 tracking-widest uppercase">
            Powered by Gemini
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-[#6b7a8d]">
          <a href="#features" className="hidden sm:block hover:text-white transition-colors">Features</a>
          <a href="#how" className="hidden sm:block hover:text-white transition-colors">How it works</a>
          <Link href="/dashboard" className="btn-primary text-xs px-5 py-2">
            Open App →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 animate-fadeIn">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-[#00ff9d]/20 bg-[#00ff9d]/5 text-[11px] text-[#00ff9d] tracking-[.2em] uppercase mb-10 rounded-sm">
          <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse2" />
          Free · Google Gemini AI · No credit card
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.07] tracking-tight mb-7">
          Understand any codebase<br />
          <span className="text-[#00ff9d]">instantly with AI.</span>
        </h1>
        <p className="text-[#8899aa] text-lg leading-relaxed max-w-2xl mb-10">
          Import any GitHub repo, ZIP, or Git URL. CodexAI indexes every file, maps the
          architecture using Google Gemini, and lets you <strong className="text-white">chat with your codebase</strong> using RAG.
          Completely free.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <Link href="/dashboard" className="btn-primary text-sm px-7 py-3">
            Start for free <ArrowRight size={15} />
          </Link>
          <Link href="/import" className="btn-ghost text-sm px-7 py-3">
            <GitBranch size={14} /> Import a repo
          </Link>
        </div>

        {/* Terminal */}
        <div className="border border-[#00ff9d]/12 bg-[#0a0f14] overflow-hidden shadow-2xl rounded-sm">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-[#080c10]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-2 text-[10px] text-[#3d5166] tracking-[.15em] uppercase">
              CodexAI — Gemini 1.5 Flash
            </span>
          </div>
          <div className="p-6 text-[12px] leading-[1.9] text-[#8899aa]">
            <p><span className="text-[#00ff9d]">$</span> codex analyze https://github.com/tiangolo/fastapi</p>
            <p className="text-[#2d4a5e]">✓ Cloned repository (depth 1) — 847 files</p>
            <p className="text-[#2d4a5e]">✓ Detected: Python 78% · TypeScript 14% · Markdown 8%</p>
            <p className="text-[#2d4a5e]">✓ Generated 4,820 semantic chunks (Google embeddings)</p>
            <p className="text-[#2d4a5e]">✓ Architecture analysis via Gemini 1.5 Flash</p>
            <div className="mt-2.5 pl-4 border-l-2 border-[#00ff9d]/30 space-y-0.5">
              <p className="text-[#00ff9d]">→ Pattern: Layered ASGI framework + Pydantic v2</p>
              <p className="text-[#00ff9d]">→ Entry: <span className="text-white">fastapi/applications.py:FastAPI.__init__</span></p>
              <p className="text-[#00ff9d]">→ 14 modules documented · 2 security findings</p>
            </div>
            <p className="mt-3 text-white font-medium">✦ Ready — ask anything about this codebase</p>
            <p className="mt-1 flex items-center gap-1">
              <span className="text-[#00ff9d]">›</span>
              <span className="text-white">How does FastAPI handle dependency injection?</span>
            </p>
            <p className="text-[#6b7a8d] mt-1 pl-3 border-l border-[#00ff9d]/20">
              FastAPI uses <span className="text-[#00ff9d]">Depends()</span> in <span className="text-white">fastapi/dependencies/utils.py</span> to resolve...
            </p>
            <p><span className="text-[#00ff9d]">›</span> <span className="animate-blink text-white">█</span></p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-[10px] text-[#00ff9d] tracking-[.3em] uppercase mb-3">Capabilities</p>
        <h2 className="text-2xl font-bold text-white mb-10">Everything to grok a codebase</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: GitBranch, t: "Universal Import",     d: "GitHub, GitLab, Bitbucket, any Git URL, or ZIP upload. Works with any public repo." },
            { icon: Layers,    t: "Architecture Analysis", d: "Detect MVC, microservices, hexagonal. Auto-generate architecture docs with Gemini." },
            { icon: Search,    t: "Semantic Code Search",  d: "Natural language search across every file using Google text-embedding-004." },
            { icon: Zap,       t: "AI Chat + RAG",         d: "Chat with your codebase. Get answers with exact file and line citations." },
            { icon: Shield,    t: "Security Scanning",     d: "Detect hardcoded secrets, injection risks, and insecure patterns." },
            { icon: Sparkles,  t: "100% Free",             d: "Powered by Google Gemini 1.5 Flash — 1,500 free requests per day. No billing." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="glow-card p-5 group cursor-default">
              <div className="w-9 h-9 border border-[#00ff9d]/20 bg-[#00ff9d]/5 flex items-center justify-center mb-4 group-hover:border-[#00ff9d]/55 group-hover:bg-[#00ff9d]/8 transition-all">
                <Icon size={15} className="text-[#00ff9d]" />
              </div>
              <p className="text-white text-xs font-bold mb-1.5">{t}</p>
              <p className="text-[#6b7a8d] text-[11px] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-5xl mx-auto px-6 pb-20 border-t border-white/5 pt-16">
        <p className="text-[10px] text-[#00ff9d] tracking-[.3em] uppercase mb-3">Pipeline</p>
        <h2 className="text-2xl font-bold text-white mb-10">How CodexAI works</h2>
        <div className="flex flex-col">
          {[
            { n:"01", t:"Import",  d:"Clone a Git repo or extract a ZIP. Files walked recursively with smart language detection and filtering." },
            { n:"02", t:"Parse",   d:"Language-aware code splitters create semantic chunks at function and class boundaries." },
            { n:"03", t:"Embed",   d:"Google text-embedding-004 converts chunks to vectors stored in ChromaDB. Completely free." },
            { n:"04", t:"Analyse", d:"Gemini 1.5 Flash generates architecture overview, file summaries, and dependency analysis." },
            { n:"05", t:"Explore", d:"Browse files with Monaco editor, view AI explanations, semantic search, and full RAG chat." },
          ].map(({ n, t, d }, i, arr) => (
            <div key={t} className="flex gap-6 pb-8">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 border border-[#00ff9d]/40 bg-[#00ff9d]/5 text-[#00ff9d] text-[11px] font-bold flex items-center justify-center shrink-0">
                  {n}
                </div>
                {i < arr.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-[#00ff9d]/20 to-transparent mt-2" />}
              </div>
              <div className="pt-2">
                <p className="text-white text-sm font-bold mb-1">{t}</p>
                <p className="text-[#6b7a8d] text-[11px] leading-relaxed max-w-lg">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20 text-center">
        <div className="w-16 h-16 border border-[#00ff9d]/20 bg-[#00ff9d]/5 flex items-center justify-center mx-auto mb-6 animate-float">
          <Sparkles size={24} className="text-[#00ff9d]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Ready to understand your codebase?</h2>
        <p className="text-[#6b7a8d] text-sm mb-8">
          Get a free Gemini API key at <span className="text-white">aistudio.google.com</span> and start in 2 minutes.
        </p>
        <Link href="/dashboard" className="btn-primary inline-flex text-sm px-8 py-3">
          Open Dashboard <ArrowRight size={15} />
        </Link>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-[#3d5166] text-[11px]">
        CodexAI v2 — FastAPI + Next.js 14 + Google Gemini (Free)
      </footer>
    </div>
  );
}
