const BASE = typeof window !== "undefined"
  ? "/api"
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  repos: {
    list:      ()                       => req<Repo[]>("/repos/"),
    get:       (id: string)             => req<Repo>(`/repos/${id}`),
    status:    (id: string)             => req<RepoStatus>(`/repos/${id}/status`),
    fileTree:  (id: string)             => req<{ file_tree: TreeNode; total_files: number }>(`/repos/${id}/files`),
    file:      (id: string, p: string)  => req<RepoFileData>(`/repos/${id}/files/${encodeURIComponent(p)}`),
    delete:    (id: string)             => fetch(`${BASE}/repos/${id}`, { method: "DELETE" }),
    importGit: (b: GitImport)           => req<ImportRes>("/repos/import/git", { method: "POST", body: JSON.stringify(b) }),
    importZip: (form: FormData)         => fetch(`${BASE}/repos/import/zip`, { method: "POST", body: form }).then(r => r.json()),
  },
  analysis: {
    list:     (rid: string)             => req<Analysis[]>(`/analysis/${rid}`),
    file:     (rid: string, p: string)  => req<{ content: string; cached: boolean }>(`/analysis/${rid}/file`, { method: "POST", body: JSON.stringify({ path: p }) }),
    security: (rid: string, p: string)  => req<{ content: string }>(`/analysis/${rid}/security`, { method: "POST", body: JSON.stringify({ path: p }) }),
  },
  chat: {
    sessions:      (rid: string)               => req<Session[]>(`/chat/${rid}/sessions`),
    createSession: (rid: string)               => req<{ id: string; title: string }>(`/chat/${rid}/sessions`, { method: "POST" }),
    deleteSession: (rid: string, sid: string)  => fetch(`${BASE}/chat/${rid}/sessions/${sid}`, { method: "DELETE" }),
    messages:      (rid: string, sid: string)  => req<Message[]>(`/chat/${rid}/sessions/${sid}/messages`),
    send:          (rid: string, sid: string, b: ChatPayload) =>
      req<Message>(`/chat/${rid}/sessions/${sid}/messages`, { method: "POST", body: JSON.stringify(b) }),
  },
  search: {
    query:   (rid: string, q: string, topK = 10, lang?: string) => {
      const p = new URLSearchParams({ q, top_k: String(topK) });
      if (lang) p.set("language", lang);
      return req<SearchRes>(`/search/${rid}?${p}`);
    },
    readme:  (rid: string) => req<{ content: string }>(`/search/${rid}/readme`),
    apidocs: (rid: string) => req<{ content: string }>(`/search/${rid}/apidocs`),
  },
};

// ── Types ──────────────────────────────────────────────────────────────────
export type Repo = {
  id: string; name: string; source: string; url?: string; branch: string;
  status: "pending" | "cloning" | "parsing" | "embedding" | "ready" | "failed";
  error?: string; language?: string; languages: Record<string, number>;
  tech_stack: string[]; total_files: number; total_lines: number;
  architecture?: string; created_at: string; analyzed_at?: string; updated_at?: string;
};
export type RepoStatus  = { status: string; error?: string; updated_at: string };
export type ImportRes   = { repo_id: string; status: string };
export type GitImport   = { url: string; branch?: string; name?: string };
export type TreeNode    = { name: string; type: "file" | "directory"; path?: string; children?: TreeNode[] };
export type RepoFileData = {
  path: string; name: string; language?: string; line_count: number;
  content?: string; summary?: string;
  functions: ({ name: string; line?: number } | string)[];
  classes:   ({ name: string; line?: number } | string)[];
  imports:   string[];
};
export type Analysis    = { id: string; type: string; title?: string; content: string; target_path?: string; created_at: string };
export type Session     = { id: string; title: string; updated_at: string };
export type Message     = { id: string; role: "user" | "assistant"; content: string; sources: Source[]; created_at: string };
export type Source      = { file: string; start_line: number; end_line: number; score: number };
export type ChatPayload = { message: string; stream?: boolean };
export type SearchRes   = { query: string; results: SearchHit[] };
export type SearchHit   = { file_path: string; start_line: number; end_line: number; language: string; snippet: string; score: number };
