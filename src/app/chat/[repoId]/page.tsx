"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, Plus, Code2, ChevronLeft, ChevronDown, Sparkles, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api, BACKEND_URL } from "@/lib/api";

type Session = { id: string; title: string; updated_at: string };
type Source  = { file: string; start_line: number; end_line: number; score: number };
type Msg     = { id: string; role: "user" | "assistant"; content: string; sources: Source[]; created_at: string };

const SUGGESTIONS = [
  "How does authentication work?",
  "Explain the main entry point",
  "Where is the database connection?",
  "What design patterns are used?",
  "How is error handling done?",
  "List all API endpoints",
];

export default function ChatPage() {
  const { repoId }  = useParams<{ repoId: string }>();
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages,  setMessages]  = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [repoName,  setRepoName]  = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.repos.get(repoId).then(r => setRepoName(r.name));
    loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadSessions() {
    try {
      const ss = await api.chat.sessions(repoId);
      setSessions(ss);
      if (ss.length > 0) {
        setSessionId(ss[0].id);
        setMessages(await api.chat.messages(repoId, ss[0].id));
      }
    } catch { /* silent */ }
  }

  async function switchSession(id: string) {
    setSessionId(id);
    setMessages(await api.chat.messages(repoId, id));
  }

  async function newSession() {
    const s = await api.chat.createSession(repoId);
    setSessions((prev: Session[]) => [s as Session, ...prev]);
    setSessionId(s.id);
    setMessages([]);
  }

  async function send(text: string = input.trim()) {
    if (!text || sending) return;
    let sid = sessionId;
    if (!sid) {
      const s = await api.chat.createSession(repoId);
      setSessions((prev: Session[]) => [s as Session, ...prev]);
      sid = s.id; setSessionId(sid);
    }
    setInput(""); setSending(true);
    const uid = `u-${Date.now()}`, aid = `a-${Date.now()}`;
    setMessages((prev: Msg[]) => [
      ...prev,
      { id: uid, role: "user",      content: text, sources: [], created_at: new Date().toISOString() },
      { id: aid, role: "assistant", content: "",   sources: [], created_at: new Date().toISOString() },
    ]);
    try {
      const res = await fetch(
        `${BACKEND_URL}/chat/${repoId}/sessions/${sid}/messages`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, stream: true }) }
      );
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader(), decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const chunk = line.slice(6);
          if (chunk === "[DONE]" || chunk.startsWith("[ERROR]")) break;
          full += chunk.replace(/\\n/g, "\n");
          setMessages((prev: Msg[]) => prev.map(m => m.id === aid ? { ...m, content: full } : m));
        }
      }
      loadSessions();
    } catch {
      setMessages((prev: Msg[]) => prev.map(m => m.id === aid ? { ...m, content: "Sorry, an error occurred." } : m));
    } finally { setSending(false); inputRef.current?.focus(); }
  }

  return (
    <div className="flex h-screen bg-[#080c10]">
      {/* Sidebar */}
      <aside className="w-48 border-r border-white/5 bg-[#080c10] flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
          <Link href={`/explorer/${repoId}`} className="text-[#4a5568] hover:text-white transition-colors"><ChevronLeft size={14} /></Link>
          <span className="text-[9px] text-[#3d5166] uppercase tracking-widest font-medium">Chats</span>
          <button onClick={newSession} className="text-[#4a5568] hover:text-[#00ff9d] transition-colors"><Plus size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {sessions.map(s => (
            <button key={s.id} onClick={() => switchSession(s.id)}
              className={`w-full text-left px-4 py-2.5 text-[10px] leading-relaxed transition-colors
                ${sessionId === s.id ? "text-white bg-white/5 border-l-2 border-[#00ff9d]" : "text-[#4a5568] hover:text-white"}`}>
              <span className="line-clamp-2">{s.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="nav-bar px-5 py-3 flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center">
            <Code2 size={11} className="text-[#00ff9d]" />
          </div>
          <span className="text-[11px] text-[#4a5568]">{repoName}</span>
          <span className="text-[#2a3441]">/</span>
          <span className="text-[11px] text-white font-medium">AI Chat</span>
          <span className="ml-auto text-[9px] text-[#2a3441] hidden sm:block">Powered by Gemini</span>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-7">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 border border-[#00ff9d]/20 bg-[#00ff9d]/5 flex items-center justify-center mx-auto mb-5 animate-float">
                  <Sparkles size={24} className="text-[#00ff9d]" />
                </div>
                <p className="text-white font-bold mb-2">Chat with {repoName}</p>
                <p className="text-[#4a5568] text-xs">Powered by Gemini — ask anything and I&apos;ll cite exact file locations.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="glow-card text-left px-4 py-3.5 text-[11px] text-[#6b7a8d] hover:text-white transition-colors cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map(m => <Bubble key={m.id} msg={m} />)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/5 bg-[#080c10] px-5 py-4 shrink-0">
          <div className="max-w-2xl mx-auto flex gap-3">
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Ask about ${repoName}…`} rows={1}
              className="input-field flex-1 resize-none"
              style={{ minHeight: "42px", maxHeight: "130px" }} />
            <button onClick={() => send()} disabled={!input.trim() || sending} className="btn-primary px-4">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-[9px] text-[#2a3441] text-center mt-2">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const [showSrc, setShowSrc] = useState(false);
  if (msg.role === "user") return (
    <div className="flex justify-end">
      <div className="max-w-lg px-4 py-3 bg-[#0d1117] border border-white/8 text-xs text-white leading-relaxed rounded-sm">{msg.content}</div>
    </div>
  );
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 border border-[#00ff9d]/30 bg-[#00ff9d]/5 flex items-center justify-center shrink-0 mt-0.5 rounded-sm">
        <Bot size={11} className="text-[#00ff9d]" />
      </div>
      <div className="flex-1 min-w-0">
        {msg.content
          ? <div className="ai-prose"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
          : <div className="flex items-center gap-2 text-[#4a5568] text-xs"><Loader2 size={12} className="animate-spin" />Thinking…</div>
        }
        {msg.sources?.length > 0 && (
          <div className="mt-3">
            <button onClick={() => setShowSrc(v => !v)}
              className="flex items-center gap-1.5 text-[10px] text-[#3d5166] hover:text-[#00ff9d] transition-colors">
              <ChevronDown size={10} className={`transition-transform ${showSrc ? "rotate-180" : ""}`} />
              {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
            </button>
            {showSrc && (
              <div className="mt-2 space-y-1.5">
                {msg.sources.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-[#0a0e13] border border-white/5 text-[10px] rounded-sm">
                    <span className="text-[#00ff9d]/60 font-bold shrink-0">#{i + 1}</span>
                    <span className="text-[#8899aa] truncate flex-1">{s.file}</span>
                    <span className="text-[#3d5166] shrink-0">L{s.start_line}–{s.end_line}</span>
                    <span className="text-[#00ff9d]/50 shrink-0">{(s.score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
