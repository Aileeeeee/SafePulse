import { AlertOctagon, AlertTriangle } from 'lucide-react';

const severityStyles = {
  high: {
    icon: <AlertOctagon size={16} className="text-red-600" />,
    iconBg: 'bg-red-100',
    titleColor: 'text-red-600',
    border: 'border-red-100',
  },
  medium: {
    icon: <AlertTriangle size={16} className="text-orange-500" />,
    iconBg: 'bg-orange-100',
    titleColor: 'text-orange-600',
    border: 'border-orange-100',
  },
  caution: {
    icon: <AlertTriangle size={16} className="text-amber-500" />,
    iconBg: 'bg-amber-100',
    titleColor: 'text-amber-600',
    border: 'border-amber-100',
  },
};

export default function AlertCard({ alert }) {
  const styles = severityStyles[alert.severity];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${styles.border} bg-white hover:shadow-sm transition-shadow duration-150`}>
      <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${styles.titleColor}`}>{alert.title}</p>
          <span className="text-xs text-gray-400 shrink-0">{alert.minutesAgo} mins</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">{alert.location}</p>
      </div>
    </div>
  );
}
