
const LEVEL_STYLES = {
  high: {
    wrap:  "bg-red-50",
    icon:  "#ef4444",
    title: "text-red-600",
  },
  med: {
    wrap:  "bg-orange-50",
    icon:  "#f97316",
    title: "text-orange-500",
  },
  low: {
    wrap:  "bg-yellow-50",
    icon:  "#eab308",
    title: "text-yellow-600",
  },
};

function WarnTriangle({ color }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function AlertItem({ title, desc, location, time, level = "med" }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES.med;

  return (
    <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Icon bubble */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.wrap}`}>
        <WarnTriangle color={s.icon} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-snug ${s.title}`}>{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        <p className="text-xs text-gray-400 mt-0.5">{location}</p>
      </div>

      {/* Time */}
      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-0.5">{time}</span>
    </div>
  );
}

export default AlertItem;