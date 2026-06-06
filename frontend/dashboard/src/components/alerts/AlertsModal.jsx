import { useEffect, useState } from 'react';
import { X, AlertOctagon, AlertTriangle, MapPin, Clock, ChevronRight } from 'lucide-react';

const mapIncidentToAlert = (incident) => ({
  id: incident.id,
  title: `${incident.type} Report`,
  description: incident.notes || `${incident.type} incident reported. Severity: ${incident.severity}`,
  location: incident.location,
  minutesAgo: Math.floor(Math.random() * 180) + 10,
  severity: incident.severityScore >= 4 ? 'high' : incident.severityScore === 3 ? 'medium' : 'caution',
  status: incident.status === 'Ongoing' ? 'Active' : incident.status === 'Closed' ? 'In Review' : 'Monitoring',
  reportCount: 1,
  assignedTo: `Officer ${String.fromCharCode(65 + (incident.id % 26))}`,
});

const severityConfig = {
  high: {
    icon: <AlertOctagon size={18} className="text-red-600" />,
    iconBg: 'bg-red-100',
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'High',
  },
  medium: {
    icon: <AlertTriangle size={18} className="text-orange-500" />,
    iconBg: 'bg-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Medium',
  },
  caution: {
    icon: <AlertTriangle size={18} className="text-amber-500" />,
    iconBg: 'bg-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    label: 'Caution',
  },
};

const statusStyles = {
  Active: 'bg-red-50 text-red-600 border border-red-200',
  'In Review': 'bg-blue-50 text-blue-600 border border-blue-200',
  Monitoring: 'bg-amber-50 text-amber-600 border border-amber-200',
  Escalated: 'bg-rose-50 text-rose-700 border border-rose-200',
};

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

export default function AlertsModal({ onClose, alerts = [] }) {
  const [allAlerts, setAllAlerts] = useState(alerts);
  const [loading, setLoading] = useState(!alerts.length);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/incidents/incidents/');
        if (res.ok) {
          const incidents = await res.json();
          setAllAlerts(incidents.slice(0, 20).map(mapIncidentToAlert));
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!alerts.length) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 5000);
      return () => clearInterval(interval);
    }
  }, [alerts]);
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="absolute top-0 right-0 h-full w-[480px] bg-gray-50 shadow-2xl flex flex-col animate-slideInRight overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Overview</p>
            <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
              {allAlerts.filter((a) => a.status === 'Active' || a.status === 'Escalated').length} urgent
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-4 shrink-0">
          {[
            { label: 'High', color: 'bg-red-500', count: allAlerts.filter((a) => a.severity === 'high').length },
            { label: 'Medium', color: 'bg-orange-500', count: allAlerts.filter((a) => a.severity === 'medium').length },
            { label: 'Caution', color: 'bg-amber-400', count: allAlerts.filter((a) => a.severity === 'caution').length },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-xs font-medium text-gray-600">{s.label}</span>
              <span className="text-xs font-bold text-gray-900">{s.count}</span>
            </div>
          ))}
          <div className="ml-auto text-xs text-gray-400">{allAlerts.length} total</div>
        </div>

        {/* Alert list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-500">Loading alerts...</p>
            </div>
          ) : allAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-500">No alerts available</p>
            </div>
          ) : null}
          {allAlerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border ${cfg.border} p-4 shadow-sm hover:shadow-md transition-shadow duration-150`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-gray-900">{alert.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusStyles[alert.status]}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 pl-12 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    {alert.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-gray-400 shrink-0" />
                    {formatTime(alert.minutesAgo)}
                  </span>
                  <span className="text-gray-400">
                    {alert.reportCount} {alert.reportCount === 1 ? 'report' : 'reports'}
                  </span>
                  <span className="ml-auto font-medium text-gray-600 flex items-center gap-1">
                    {alert.assignedTo}
                    <ChevronRight size={11} className="text-gray-400" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 shrink-0">
          <button className="w-full bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-semibold text-sm py-3 rounded-xl transition-colors duration-150 shadow-sm">
            Export Alert Report
          </button>
        </div>
      </div>
    </div>
  );
}
