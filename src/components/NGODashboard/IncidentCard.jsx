import { PersonIcon, ClockIcon, ChatIcon } from "../shared/Icons";
import { RISK_LABEL, RISK_COLOR } from "../../data/incidentData";

function IncidentCard({ incident, onAcknowledge }) {
  const { id, cat, loc, time, src, acked, isNew } = incident;
  const risk = RISK_COLOR[cat.risk];

  return (
    <div
      className={`
        bg-white rounded-2xl p-5 border shadow-sm
        transition-all duration-400
        ${isNew
          ? "border-green-300 shadow-green-100 animate-slide-in"
          : "border-gray-100"
        }
        ${acked ? "opacity-55" : ""}
      `}
    >
      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          
          {/* Risk dot */}
          <span
            className={`
              w-2.5 h-2.5 rounded-full shrink-0
              ${risk.dot}
              ${isNew && !acked ? "animate-pulse" : ""}
            `}
          />
          <span className="font-bold text-gray-800 text-sm leading-tight">
            {cat.label}
          </span>
          {isNew && !acked && (
            <span className="text-[9px] font-bold text-green-600 bg-green-100 rounded-full px-2 py-0.5 leading-none">
              NEW
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 font-medium">{id}</span>
      </div>

      {/* ── Meta rows ── */}
      <div className="flex flex-col gap-1.5 mb-4">
        <MetaRow icon={<PersonIcon />}>{loc}</MetaRow>
        <MetaRow icon={<ClockIcon />}>{time}</MetaRow>
        <MetaRow icon={<ChatIcon />}>{src}</MetaRow>
      </div>

      {/* ── Footer — risk pill + action ── */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${risk.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${risk.dot}`} />
          {RISK_LABEL[cat.risk]}
        </span>

        {!acked ? (
          <button
            onClick={() => onAcknowledge(id)}
            className="
              bg-green-800 hover:bg-green-900 active:scale-95
              text-white text-sm font-semibold
              px-5 py-2 rounded-full
              transition-all duration-150
            "
          >
            Acknowledge
          </button>
        ) : (
          <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
            ✓ Acknowledged
          </span>
        )}
      </div>
    </div>
  );
}

function MetaRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="text-gray-400 shrink-0">{icon}</span>
      {children}
    </div>
  );
}

export default IncidentCard;