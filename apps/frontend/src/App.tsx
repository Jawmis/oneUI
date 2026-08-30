import { useEffect, useState } from "react";
import "./index.css";

import { useSocket } from "./hooks/useSocket";

// the import WebSocket from ws is not here because the browser already provides the native WebSocket constructor/
// the ws package is for the backend.
export function App() {
  const { loading, socket } = useSocket();
  
  if (loading) {
    return <div>
      loading...
    </div>
  }

  
  return (
    <div className="flex">

      <div className="flex-1">
        sidebar
      </div>

      <div className="flex-6">
        chat window
      </div>
    </div>
  );
}

export default App;