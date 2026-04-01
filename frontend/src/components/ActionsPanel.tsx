export default function ActionsPanel({
  actions,
}: {
  actions: { message: string }[];
}) {
  return (
    <div className="w-[260px] border-l border-red-200 bg-white/60 backdrop-blur-xl flex flex-col">
      <div className="px-4 py-3 border-b border-red-200">
        <h2 className="text-xs text-red-600 uppercase tracking-wide font-semibold">
          Recommended Actions
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {actions.length === 0 ? (
          <p className="text-xs text-gray-400">No actions yet</p>
        ) : (
          actions.map((a, i) => (
            <div
              key={i}
              className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-gray-800 shadow-sm"
            >
              {a.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}