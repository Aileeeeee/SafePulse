import { MapPin } from 'lucide-react';

const areas = [
  { rank: 1, name: 'Surulere', reports: 20, max: 20 },
  { rank: 2, name: 'Ojo', reports: 15, max: 20 },
  { rank: 3, name: 'GRA', reports: 10, max: 20 },
];

const barColors = ['bg-red-500', 'bg-orange-400', 'bg-emerald-500'];

export default function TopReportedAreas() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4">
      <h2 className="text-base font-bold text-gray-800 mb-4">Top Reported Areas</h2>
      <div className="flex flex-col gap-4">
        {areas.map((area, i) => (
          <div key={area.name} className="flex items-center gap-3">
            <span className="w-5 text-xs font-bold text-gray-400 text-center shrink-0">{area.rank}</span>
            <MapPin size={14} className="text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">{area.name}</span>
                <span className="text-xs text-gray-400">{area.reports} reports</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColors[i]} transition-all duration-700`}
                  style={{ width: `${(area.reports / area.max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
