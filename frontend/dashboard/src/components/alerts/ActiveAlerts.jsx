import AlertCard from './AlertCard';

const initialAlerts = [
  { id: 1, title: 'High Risk Area', description: 'Multiple harassment reports', location: 'Yaba, Lagos', minutesAgo: 40, severity: 'high' },
  { id: 2, title: 'Multiple Reports', description: 'Several incidents reported', location: 'Surulere, Lagos', minutesAgo: 30, severity: 'medium' },
  { id: 3, title: 'Area caution', description: 'Several activity reported', location: 'Surulere, Lagos', minutesAgo: 30, severity: 'caution' },
];

export default function ActiveAlerts({ extraAlerts = [] }) {
  const allAlerts = [...extraAlerts, ...initialAlerts].slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">Active Alerts</h2>
        <button className="text-xs text-emerald-700 font-semibold hover:text-emerald-600 transition-colors">
          View all
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {allAlerts.map((alert) => (
          <AlertCard key={`${alert.id}-${alert.minutesAgo}`} alert={alert} />
        ))}
      </div>
    </div>
  );
}
