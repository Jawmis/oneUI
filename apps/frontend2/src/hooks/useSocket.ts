import { useEffect, useState } from "react";



export function useSocket() {
    const [ws, setWs] = useState(new WebSocket("ws://localhost:3000"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ws.onopen = () => {
            if (ws) {
                setWs(ws);
                setLoading(false);
            }
        }
    },[ws])

    return {
        socket: ws,
        loading
    }
}