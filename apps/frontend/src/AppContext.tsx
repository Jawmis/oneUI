import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSocket } from "./hooks/useSocket";
export type ChatMessage = { id: string; type: string; payload: Record<string, any> };
export type Session = { id: string; title: string; messages: ChatMessage[] };
export type Workspace = { id: string; name: string; path: string; sessions: Session[] };
export type ModelConfig = { provider: "anthropic" | "gemini"; model: string; apiKey: string };
type AppContextValue = ReturnType<typeof useAppState>;
const AppContext = createContext<AppContextValue | null>(null);
function useAppState() {
  const { socket, loading, messages, send } = useSocket();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>();
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => { try { return JSON.parse(sessionStorage.getItem("oneui-model-config") ?? "null") ?? { provider: "anthropic", model: "claude-sonnet-4-5", apiKey: "" }; } catch { return { provider: "anthropic", model: "claude-sonnet-4-5", apiKey: "" }; } });
  const processed = useRef(0);
  useEffect(() => { for (const raw of messages.slice(processed.current)) { const msg = raw as any;
    if (msg.type === "init") { const next = msg.payload.workspaces as Workspace[]; setWorkspaces(next); setActiveWorkspaceId(next[0]?.id); setActiveSessionId(next[0]?.sessions[0]?.id); }
    else if (msg.type === "workspace-created") { setWorkspaces((items) => [...items, msg.payload]); setActiveWorkspaceId(msg.payload.id); }
    else if (msg.type === "session-created") { setWorkspaces((items) => items.map((w) => w.id === activeWorkspaceId ? { ...w, sessions: [...w.sessions, msg.payload] } : w)); setActiveSessionId(msg.payload.id); }
    else if (["thinking", "tool", "result", "error"].includes(msg.type)) { const sid = msg.payload.sessionId; setWorkspaces((items) => items.map((w) => ({ ...w, sessions: w.sessions.map((s) => { if (s.id !== sid) return s; const withoutStatus = s.messages.filter((item) => item.type !== "thinking"); const next = { id: crypto.randomUUID(), type: msg.type, payload: msg.payload }; return { ...s, messages: msg.type === "thinking" ? [...withoutStatus, next] : [...withoutStatus, next] }; }) }))); }
  processed.current = messages.length;
  } }, [messages, activeWorkspaceId]);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeSession = activeWorkspace?.sessions.find((s) => s.id === activeSessionId);
  const addWorkspace = (path: string) => send({ type: "create-workspace", payload: { path } });
  const addSession = (workspaceId: string) => send({ type: "create-session", payload: { workspaceId } });
  const updateModelConfig = (next: ModelConfig) => { setModelConfig(next); sessionStorage.setItem("oneui-model-config", JSON.stringify(next)); };
  const sendMessage = (message: string) => { if (!activeSessionId) return; setWorkspaces((items) => items.map((w) => ({ ...w, sessions: w.sessions.map((s) => s.id === activeSessionId ? { ...s, messages: [...s.messages, { id: crypto.randomUUID(), type: "user", payload: { message } }] } : s) }))); send({ type: "add-message", payload: { sessionId: activeSessionId, message, provider: modelConfig.provider, model: modelConfig.model, ...(modelConfig.apiKey ? { apiKey: modelConfig.apiKey } : {}) } }); };
  return useMemo(() => ({ socket, loading, workspaces, activeWorkspace, activeSession, activeWorkspaceId, activeSessionId, setActiveWorkspaceId, setActiveSessionId, addWorkspace, addSession, sendMessage, modelConfig, updateModelConfig }), [socket, loading, workspaces, activeWorkspace, activeSession, activeWorkspaceId, activeSessionId, modelConfig]);
}
export function AppProvider({ children }: { children: ReactNode }) { return <AppContext.Provider value={useAppState()}>{children}</AppContext.Provider>; }
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("useApp must be used inside AppProvider"); return value; }
