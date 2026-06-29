import { useState } from 'react';
import { X, MapPinned, MapPin, Clock, MessageSquare, User, Phone } from 'lucide-react';
import { severityDot } from '../../data/incidentData';

const nearbySupportIcons = {
  'Community Center': <MapPin size={15} className="text-emerald-600" />,
  "Women's Shelter": <MapPin size={15} className="text-emerald-600" />,
  'Crisis Line (24/7)': <Phone size={15} className="text-emerald-600" />,
};

const nearbySupport = [
  { label: 'Community Center', distance: '0.8km' },
  { label: "Women's Shelter", distance: '1.5km' },
  { label: 'Crisis Line (24/7)', distance: null },
];

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({ label, time, active }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`w-3 h-3 rounded-full border-2 shrink-0 mt-0.5 -ml-4 relative z-10 ${
          active ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-300'
        }`}
      />
      <div>
        <p className={`text-sm font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
          {label}
        </p>
        {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
      </div>
    </div>
  );
}

export default function IncidentDetailPanel({ incident, onClose, onAcknowledge }) {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  if (!incident) return null;

  const dotColor = severityDot[incident.severity];
  const isHighRisk = incident.severity === 'Critical' || incident.severity === 'High';

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute top-0 right-0 h-full w-90 bg-white shadow-2xl flex flex-col animate-slideInRight overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Incident
            </p>
            <p className="text-xl font-bold text-gray-900">#{incident.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isHighRisk ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {incident.severity === 'Critical'
                  ? 'Critical Risk'
                  : incident.severity === 'High'
                  ? 'High Risk'
                  : `${incident.severity} Risk`}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{incident.type}</h2>
          </div>

          <div className="flex flex-col gap-4">
            <DetailRow icon={<MapPinned size={16} className="text-emerald-600" />} label="Location" value={incident.location} />
            <DetailRow icon={<Clock size={16} className="text-emerald-600" />} label="Time Reported" value={incident.time} />
            <DetailRow icon={<MessageSquare size={16} className="text-emerald-600" />} label="Reported Via" value={incident.channel === 'Mobile App' ? 'App' : incident.channel} />
            <DetailRow icon={<User size={16} className="text-emerald-600" />} label="Source" value="Anonymous" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Nearby Support</p>
            <div className="flex flex-col gap-2">
              {nearbySupport.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
                >
                  {nearbySupportIcons[item.label] || <MapPin size={15} className="text-emerald-600" />}
                  <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                  {item.distance && (
                    <span className="text-xs text-gray-400 font-medium">– {item.distance}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Timeline</p>
            <div className="flex flex-col gap-3 relative pl-4">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200" />
              <TimelineItem label="Report received via SMS" time={incident.time} active={true} />
              <TimelineItem label="Awaiting Acknowledge" time={null} active={false} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => {
              if (isAcknowledged) return;
              setIsAcknowledged(true);
              onAcknowledge(incident.id);
              setTimeout(() => onClose(), 800);
            }}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-xl transition-all duration-300 shadow-sm ${
              isAcknowledged
                ? 'bg-gray-200 text-gray-500 cursor-default'
                : 'bg-emerald-800 hover:bg-emerald-700 text-white'
            }`}
          >
            {isAcknowledged ? '✓ Acknowledged' : 'Acknowledge'}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold text-sm py-3 rounded-xl transition-colors duration-150 shadow-sm">
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
