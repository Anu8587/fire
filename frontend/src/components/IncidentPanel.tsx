import { motion } from "framer-motion";

type Incident = {
  id: number;
  location: string;
  incident_type: string;
  people: number;
  severity: string;
  hazards: string[];
  calls: number;
  confidence: number;
};

export default function IncidentPanel({
  incident,
}: {
  incident: Incident | null;
}) {
  if (!incident) {
    return (
      <div className="w-[300px] flex items-center justify-center text-gray-500">
        No active incident
      </div>
    );
  }

  const severityColor =
    incident.severity === "High"
      ? "text-red-400"
      : incident.severity === "Medium"
      ? "text-yellow-400"
      : "text-green-400";

  const confidenceColor =
    incident.confidence >= 70
      ? "bg-green-500"
      : incident.confidence >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <motion.div
      key={incident.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[300px] border-l border-white/10 flex flex-col bg-white/5 backdrop-blur-xl"
    >
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs text-red-400 uppercase tracking-wide">
          Active Incident
        </h2>
      </div>

      <div className="p-4 space-y-5 text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-1">Location</p>
          <p className="font-medium">{incident.location}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">Type</p>
          <p className="font-medium">{incident.incident_type}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">Severity</p>
          <p className={`font-semibold ${severityColor}`}>
            {incident.severity}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-2 rounded border border-white/10">
            <p className="text-gray-400 text-xs">People</p>
            <p className="font-semibold">{incident.people}</p>
          </div>

          <div className="bg-white/5 p-2 rounded border border-white/10">
            <p className="text-gray-400 text-xs">Calls</p>
            <p className="font-semibold">{incident.calls}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>AI Confidence</span>
            <span>{incident.confidence}%</span>
          </div>

          <div className="h-2 bg-gray-800 rounded">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${incident.confidence}%` }}
              className={`h-2 rounded ${confidenceColor}`}
            />
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-2">Hazards</p>

          <div className="flex flex-wrap gap-2">
            {(incident.hazards || []).map((h, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded bg-red-900/40 text-red-300 border border-red-800"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}