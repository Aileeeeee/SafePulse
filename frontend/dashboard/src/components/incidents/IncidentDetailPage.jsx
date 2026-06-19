import { ArrowLeft, MapPin, Clock, MessageSquare, User } from 'lucide-react';
import { STATUS_STYLES, SEVERITY_STYLES } from '../../data/incidentData';

// Detail row 
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <Icon size={13} className="text-emerald-500 shrink-0" />
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-800 pl-5">{value}</span>
      </div>
    </div>
  );
}

const TIMELINE_DOT_COLORS = {
  'Report received':  'bg-green-500 border-green-500',
  'Triage completed': 'bg-orange-500 border-orange-500',
  'Case assigned':    'bg-blue-500 border-blue-500',
  'Support provided': 'bg-green-300 border-green-300',
  'Case closed':      'bg-green-700 border-green-700',
};

// Timeline
function Timeline({ events }) {
  return (
    <div className="relative pl-4">
      {/* Vertical line */}
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200" />
      <div className="flex flex-col gap-5">
        {events.map((ev, i) => {
          const dotColor = TIMELINE_DOT_COLORS[ev.title] || 'bg-gray-700 border-gray-700';
          return (
            <div key={i} className="flex items-start gap-3 relative">
              <span className={`w-3 h-3 rounded-full border-2 shrink-0 mt-0.5 -ml-4 relative z-10 ${dotColor}`} />
              <div>
                <p className="text-xs text-black font-medium">{ev.time}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{ev.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ev.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// OpenStreetMap iframe
function LocationMap({ lat, lng, label }) {
  // Build an OpenStreetMap embed URL centred on the coordinates
  const zoom = 14;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03},${lat - 0.02},${lng + 0.03},${lat + 0.02}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        title={`Map — ${label}`}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block', minHeight: 220 }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

{/* Trusted contacts table */}
function TrustedContacts({ contacts }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">Trusted contacts notified</h3>
      <div className="overflow-hidden rounded-xl border border-black">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-black uppercase tracking-wider">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Relation</th>
              <th className="text-left px-4 py-3">Phone No</th>
              <th className="text-left px-4 py-3">Notified At</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400 text-xs">
                  No trusted contacts notified
                </td>
              </tr>
            ) : (
              contacts.map((c, i) => (
                <tr key={i} className="border-t border-black">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-black">{c.relation}</td>
                  <td className="px-4 py-3 text-black font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-black">{c.notifiedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

{/* Main detail page */}
export default function IncidentDetailPage({ incident, onBack }) {
  if (!incident) return null;

  const statusStyle   = STATUS_STYLES[incident.status]   || STATUS_STYLES.Active;
  const severityStyle = SEVERITY_STYLES[incident.severity] || '';

  return (
    <div className="px-8 py-7 flex flex-col gap-6 h-full overflow-y-auto">

      {/* Back + heading */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-black hover:text-emerald-600 transition-colors mb-3"
        >
          <ArrowLeft size={16} /> Incident Details
        </button>
        <p className="text-xs text-gray-400">
          {new Date(incident.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Top two-column grid */}
      <div className="grid grid-cols-2 gap-5">

        {/* Left — incident info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          {/* ID + status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-black font-medium mb-0.5">Incident ID</p>
              <p className="text-lg font-bold text-black">#{incident.id}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {incident.status}
            </span>
          </div>

          {/* Type */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Incident Type</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-base font-bold text-gray-900">{incident.category}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="flex flex-col gap-3">
            <DetailRow icon={MapPin}       label="Location"     value={incident.location} />
            <DetailRow icon={Clock}        label="Time"         value={incident.time} />
            <DetailRow icon={MessageSquare} label="Reported Via" value={incident.channel} />
            <DetailRow icon={User}         label="Source"       value="Anonymous" />
          </div>

          {/* Severity badge bottom-right */}
          <div className="flex justify-end">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${severityStyle}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {incident.severity}
            </span>
          </div>
        </div>

        {/* Right — map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <p className="text-base font-bold text-gray-900">Location</p>
          <div className="flex-1 min-h-55">
            <LocationMap lat={incident.lat} lng={incident.lng} label={incident.location} />
          </div>
        </div>
      </div>

      {/* Bottom two-column grid */}
      <div className="grid grid-cols-2 gap-5">

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-5">Report Timeline</h3>
          <Timeline events={incident.timeline} />
        </div>

        {/* Trusted contacts */}
        <TrustedContacts contacts={incident.trustedContacts} />
      </div>
    </div>
  );
}