import { useEffect, useState } from "react";
import "./index.css";
import "./App.css";
import { useSocket } from "./hook/useSocket";

// the import WebSocket from ws is not here because the browser already provides the native WebSocket constructor/
// the ws package is for the backend.
function App() {
  const { loading, socket } = useSocket();
  
  if (loading) {
    return <div>
      loading...
    </div>
  }

  
  return (
    <div >
      <div className=""></div>
    </div>
  );
}

export default App;