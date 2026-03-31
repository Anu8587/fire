import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type TranscriptLine = {
  speaker: "CALLER" | "AI";
  text: string;
  timestamp: string;
};

type Call = {
  id: number;
  transcript: TranscriptLine[] | string;
};

export default function TranscriptPanel({ call }: { call: Call | null }) {
  const [displayText, setDisplayText] = useState("");
  const [lastText, setLastText] = useState("");

  useEffect(() => {
    if (!call) return;

    const text = Array.isArray(call.transcript)
      ? call.transcript.map((l) => l.text).join(" ")
      : call.transcript;

    if (text === lastText) return;

    setLastText(text);
    setDisplayText("");

    let i = 0;

    const interval = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 12);

    return () => clearInterval(interval);
  }, [call?.id]);

  if (!call) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No call selected
      </div>
    );
  }

  return (
    <div className="flex-1 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs text-blue-400 uppercase tracking-wide">
          Live Transcript
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-200 leading-relaxed"
        >
          {displayText}
        </motion.p>

        <div className="flex items-center gap-2 text-gray-500 text-xs mt-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Listening...
        </div>
      </div>
    </div>
  );
}