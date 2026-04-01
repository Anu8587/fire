import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import CallsPanel from "./components/CallsPanel";
import TranscriptPanel from "./components/TranscriptPanel";
import IncidentPanel from "./components/IncidentPanel";
import AIInsightsPanel from "./components/AIInsightsPanel";
import ActionsPanel from "./components/ActionsPanel"; // ✅ NEW

function App() {
  const [data, setData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activeCallId, setActiveCallId] = useState<number | null>(null);
  const [actions, setActions] = useState<any[]>([]); // ✅ NEW

  const activeCall =
    data?.calls?.find((c: any) => c.id === activeCallId) ||
    data?.calls?.[0] ||
    null;

  const activeIncident =
    data?.incidents?.find((i: any) => i.id === activeCall?.incidentId) ||
    data?.incidents?.[0] ||
    null;

  const insights = data?.insights || [];

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("update", (incomingData: any) => {
      setData(incomingData);
      setActions(incomingData.actions || []); // ✅ NEW
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    await fetch("http://localhost:5000/process-audio", {
      method: "POST",
      body: formData,
    });

    setFile(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0a0a0a] via-[#0f172a] to-black text-white">
      {/* Header */}
      <div className="px-6 py-3 border-b border-white/10 flex justify-between items-center backdrop-blur-xl bg-white/5">
        <div>
          <h1 className="text-lg font-semibold">Delhi Fire Control</h1>
          <p className="text-xs text-gray-400">Real-time Emergency System</p>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs text-gray-400"
          />

          <button
            onClick={handleUpload}
            className="px-3 py-1.5 bg-red-600 rounded hover:bg-red-700 text-sm"
          >
            Upload
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        <CallsPanel
          calls={data?.calls || []}
          activeCallId={activeCallId}
          setActiveCallId={setActiveCallId}
        />

        <TranscriptPanel call={activeCall} />

        <IncidentPanel incident={activeIncident} />

        <ActionsPanel actions={actions} /> {/* ✅ NEW */}

        <AIInsightsPanel insights={insights} />
      </div>
    </div>
  );
}

export default App;