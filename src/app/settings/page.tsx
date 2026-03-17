"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Eye, EyeOff, Save, CheckCircle, Info, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [saved,   setSaved]   = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [gemini,  setGemini]  = useState("");

  async function save() {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

      <main className="max-w-lg mx-auto px-6 py-14">
        <h1 className="text-xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#6b7a8d] text-xs mb-8">Configure your Google Gemini API key.</p>

        <div className="space-y-5">
          {/* Get key CTA */}
          <div className="border border-[#00ff9d]/15 bg-[#00ff9d]/5 p-5 rounded-sm">
            <div className="flex items-start gap-3">
              <Info size={14} className="text-[#00ff9d] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-white font-bold mb-1">Get your free Gemini API key</p>
                <p className="text-[11px] text-[#8899aa] leading-relaxed mb-3">
                  Google Gemini is completely free — 1,500 requests/day with Gemini 1.5 Flash.
                  No credit card required.
                </p>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-[10px] py-1.5 px-4 inline-flex">
                  <ExternalLink size={11} /> Get API Key at Google AI Studio
                </a>
              </div>
            </div>
          </div>

          {/* API Key field */}
          <div className="border border-white/7 bg-[#0a0e13] p-5 rounded-sm space-y-4">
            <p className="text-[9px] text-[#3d5166] uppercase tracking-widest font-bold">API Key</p>
            <div>
              <label className="block text-[10px] text-[#8899aa] mb-2 uppercase tracking-wider">Gemini API Key</label>
              <div className="relative">
                <input type={showKey ? "text" : "password"} value={gemini}
                  onChange={e => setGemini(e.target.value)}
                  placeholder="AIzaSy…"
                  className="input-field pr-10" />
                <button onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-white transition-colors">
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <p className="text-[10px] text-[#3d5166] mt-1.5">Used for all AI analysis, chat, and embeddings.</p>
            </div>
          </div>

          {/* Local dev note */}
          <div className="border border-white/7 bg-[#0a0e13] p-5 rounded-sm">
            <p className="text-[9px] text-[#3d5166] uppercase tracking-widest font-bold mb-3">Local Development</p>
            <p className="text-[11px] text-[#6b7a8d] leading-relaxed mb-3">
              Add your key to the backend <code className="text-[#00ff9d] bg-[#080c10] px-1.5 py-0.5 rounded text-[10px]">.env</code> file:
            </p>
            <div className="bg-[#080c10] border border-white/8 p-3 rounded-sm font-mono text-[11px] text-[#8899aa]">
              <span className="text-[#3d5166]"># backend/.env</span><br />
              <span className="text-[#00ff9d]">GEMINI_API_KEY</span>=AIzaSy…
            </div>
            <p className="text-[10px] text-[#3d5166] mt-3">
              Restart the backend server after updating the .env file.
            </p>
          </div>

          <button onClick={save} className="btn-primary w-full justify-center py-3">
            {saved ? <><CheckCircle size={14} />Saved!</> : <><Save size={14} />Save Settings</>}
          </button>
        </div>
      </main>
    </div>
  );
}
