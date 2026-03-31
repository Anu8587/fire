import { motion } from "framer-motion";

export default function CallsPanel({
  calls,
  activeCallId,
  setActiveCallId,
}: {
  calls: any[];
  activeCallId: number | null;
  setActiveCallId: (id: number) => void;
}) {
  return (
    <div className="w-[260px] border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs text-blue-400 uppercase tracking-wide">
          Incoming Calls
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {calls.map((call, i) => (
          <motion.div
            key={call.id}
            onClick={() => setActiveCallId(call.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-3 rounded-md cursor-pointer transition ${
              activeCallId === call.id
                ? "bg-blue-900/40 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                : "bg-white/5 hover:bg-white/10 border border-white/10"
            }`}
          >
            <p className="text-sm font-medium text-white">
              {call.location}
            </p>

            <p className="text-xs text-gray-400 truncate mt-1">
              {Array.isArray(call.transcript)
                ? call.transcript[0]?.text
                : call.transcript}
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              {new Date(call.timestamp).toLocaleTimeString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}