import { useCallback, useEffect, useRef, useState } from "react";

export function useSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<unknown[]>([]);
  useEffect(() => {
    let stopped = false; let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = () => {
      const ws = new WebSocket(import.meta.env.VITE_BACKEND_URL ?? "ws://localhost:3000");
      socketRef.current = ws;
      ws.onopen = () => { if (!stopped) { setSocket(ws); setLoading(false); } };
      ws.onmessage = (event) => { try { setMessages((current) => [...current, JSON.parse(event.data)]); } catch { /* ignore malformed frames */ } };
      ws.onclose = () => { if (!stopped) { setSocket(null); setLoading(true); retry = setTimeout(connect, 1500); } };
    };
    connect();
    return () => { stopped = true; if (retry) clearTimeout(retry); socketRef.current?.close(); };
  }, []);
  const send = useCallback((message: unknown) => { const ws = socketRef.current; if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message)); }, []);
  return { socket, loading, messages, send };
}
