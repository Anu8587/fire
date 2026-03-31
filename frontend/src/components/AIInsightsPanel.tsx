import { motion } from "framer-motion";

type Insight = {
  id: number;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
};

export default function AIInsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="w-[260px] flex flex-col bg-white/5 backdrop-blur-xl border-l border-white/10">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs text-purple-400 uppercase tracking-wide">
          AI Insights
        </h2>
      </div>

      <div className="p-3 space-y-2 overflow-y-auto">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-lg border ${
              insight.severity === "high"
                ? "bg-red-500/10 border-red-500/30"
                : insight.severity === "medium"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-green-500/10 border-green-500/30"
            }`}
          >
            <p className="text-xs text-gray-200">{insight.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}