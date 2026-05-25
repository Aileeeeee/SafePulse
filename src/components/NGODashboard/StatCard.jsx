import { TrendUpIcon, TrendDownIcon, MinusIcon } from "../shared/Icons";

function StatCard({
  icon,
  iconBg    = "bg-gray-50",
  iconColor = "text-gray-500",
  label,
  value,
  delta,
  deltaLabel,
  trend = "flat",
  flash = false,
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-5 flex-1 min-w-0
        border border-gray-100 shadow-sm
        transition-all duration-500
        ${flash ? "ring-2 ring-green-400 ring-offset-1 scale-[1.02]" : ""}
      `}
    >
      {/* Top row — icon + label + value */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium mb-1 leading-none">{label}</p>
          <p
            className={`
              text-4xl font-bold leading-none transition-all duration-700
              ${flash ? "text-green-600 scale-110" : "text-gray-800"}
            `}
          >
            {value}
          </p>
        </div>
      </div>

      {/* Bottom row — delta + trend icon */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {delta && (
            <span className="text-xs font-semibold text-gray-500">{delta}</span>
          )}
          {deltaLabel && (
            <span className="text-xs text-gray-400">{deltaLabel}</span>
          )}
        </div>
        <span
          className={
            trend === "up"   ? "text-green-500" :
            trend === "down" ? "text-red-400"   :
                               "text-gray-400"
          }
        >
          {trend === "up"   ? <TrendUpIcon   size={15} /> :
           trend === "down" ? <TrendDownIcon size={15} /> :
                              <MinusIcon     size={15} />}
        </span>
      </div>
    </div>
  );
}

export default StatCard;