import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  delta,
  deltaLabel,
  icon,
  iconBg,
  trend = 'up',
  highlight,
}) {
  return (
    <div className={`bg-white rounded-xl p-5 flex flex-col gap-3 shadow-sm border ${highlight ? 'border-emerald-100' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-l text-black-500 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
        </div>
      </div>

      {delta !== undefined && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <div className="flex items-center gap-3">
            {trend === 'up' && delta !== 0 && (
              <span className="text-xs font-semibold text-emerald-600">+{delta}</span>
            )}
            {trend === 'down' && delta !== 0 && (
              <span className="text-xs font-semibold text-red-500">-{Math.abs(delta)}</span>
            )}
            {(trend === 'flat' || delta === 0) && (
              <span className="text-xs font-semibold text-gray-500">No change</span>
            )}
            {deltaLabel && (
              <span className="text-sm text-nowrap text-black-500">{deltaLabel}</span>
            )}
          </div>

          <div className="flex items-center">
            {trend === 'up' && <TrendingUp size={20} className="text-emerald-500" />}
            {trend === 'down' && <TrendingDown size={20} className="text-red-400" />}
          </div>
        </div>
      )}
    </div>
  );
}
