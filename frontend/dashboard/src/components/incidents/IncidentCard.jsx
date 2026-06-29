import { MapPinned, Clock, MessageSquare } from 'lucide-react';
import { severityColor, severityDot } from '../../data/incidentData';

const typeDot = {
  'Violence/Assault': 'bg-gray-500',
  'Harassment': 'bg-orange-400',
  'Sexual Harassment': 'bg-red-500',
  'Child Abuse': 'bg-blue-500',
  'Sexual Assault': 'bg-red-600',
  'Domestic Violence': 'bg-red-900',   // ✅ fixed from rose-950 (was bleeding into text)
  'Stalking': 'bg-purple-600',
};

export default function IncidentCard({ incident, isNew, onSelect }) {
  const dotColor = typeDot[incident.type] ?? severityDot[incident.severity];
  const badgeStyle = severityColor[incident.severity];

  return (
    <div
      onClick={() => onSelect && onSelect(incident)}
      className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-500 cursor-pointer ${
        isNew
          ? 'border-emerald-300 ring-2 ring-emerald-100 animate-slideIn'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 mt-0.5`} />
          <h3 className="font-bold text-base text-gray-800"> {/* ✅ fixed — was using typeDot (bg class) as text class */}
            {incident.type}
          </h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">#{incident.id}</span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinned size={13} className="text-emerald-400 shrink-0" />
          <span>{incident.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={13} className="text-emerald-400 shrink-0" />
          <span>{incident.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare size={13} className="text-emerald-400 shrink-0" />
          <span>Report via {incident.channel === 'Mobile App' ? 'app' : (incident.channel ?? 'unknown').toLowerCase()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${badgeStyle}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${severityDot[incident.severity]}`} /> {/* ✅ fixed — badge dot uses severityDot, not typeDot */}
          {incident.severity} risk
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(incident);
          }}
          className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-150 shadow-sm ${
            incident.acknowledged
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-default'
              : 'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white'
          }`}
        >
          {incident.acknowledged ? '✓ Acknowledged' : 'Acknowledge'}
        </button>
      </div>
    </div>
  );
}