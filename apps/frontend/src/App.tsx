import { useEffect, useState } from "react";
import "./index.css";

// the import WebSocket from ws is not here because the browser already provides the native WebSocket constructor/
// the ws package is for the backend.
export function App() {

  const [ws, setWs] = useState(new WebSocket("ws://localhost:3000"));
  useEffect(() => {
    ws.onopen = () => {
      if (ws) {
        ws.send("hi there");
      }
    }
  }, [ws]);


  return (
    <div >
      hi there

    </div>
  );
}

export default App;
