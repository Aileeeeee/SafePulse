import { MapPinIcon } from "../shared/Icons";

const PIN_BG = {
  1: "bg-red-50",
  2: "bg-orange-50",
  3: "bg-green-50",
};

const PIN_COLOR = {
  1: "text-red-500",
  2: "text-orange-400",
  3: "text-green-600",
};

function AreaBar({ rank, name, reports, max, color }) {
  const pct = max > 0 ? Math.round((reports / max) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      {/* Rank number */}
      <span className="text-sm font-bold text-gray-400 w-4 shrink-0 text-center">
        {rank}
      </span>

      {/* Pin icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${PIN_BG[rank] || "bg-gray-50"}`}>
        <span className={PIN_COLOR[rank] || "text-gray-400"}>
          <MapPinIcon size={13} />
        </span>
      </div>

      {/* Area name */}
      <span className="text-sm font-semibold text-gray-700 w-20 shrink-0 truncate">
        {name}
      </span>

      {/* Animated bar */}
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Count */}
      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
        {reports} reports
      </span>
    </div>
  );
}

export default AreaBar;