import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { INCIDENTS, STATUS_STYLES, CATEGORIES, STATUSES, DATES } from '../../data/incidentData';

// Dropdown filter
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors shadow-sm whitespace-nowrap"
      >
        {value === 'All' ? label : value}
        <ChevronDown size={14} className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                ${value === opt
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Status badge
function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

// Main page
export default function IncidentsPage({ onSelectIncident }) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [dateFilter,     setDateFilter]     = useState('All');

  const filtered = INCIDENTS.filter((inc) => {
    if (categoryFilter !== 'All' && inc.category !== categoryFilter) return false;
    if (statusFilter   !== 'All' && inc.status   !== statusFilter)   return false;
    if (dateFilter     !== 'All' && inc.date      !== dateFilter)     return false;
    return true;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5 sm:gap-6 h-full">
      {/* Heading */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Incidents</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage all reported incidents</p>
      </div>

      {/* Filters — wrap on small screens */}
      <div className="flex flex-wrap justify-end gap-2">
        <FilterDropdown label="Category" options={CATEGORIES} value={categoryFilter} onChange={setCategoryFilter} />
        <FilterDropdown label="Status"   options={STATUSES}   value={statusFilter}   onChange={setStatusFilter} />
        <FilterDropdown label="Date"     options={DATES}      value={dateFilter}      onChange={setDateFilter} />
      </div>

      {/* ── Desktop / tablet table (md and up) ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[90px_1fr_1fr_1fr_90px_160px] gap-x-4 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
          {['ID', 'CATEGORY', 'AREA', 'TIME', 'STATUS', 'ACTION'].map((h) => (
            <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No incidents match the selected filters.
          </div>
        ) : (
          filtered.map((inc, i) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`grid grid-cols-[90px_1fr_1fr_1fr_90px_160px] gap-x-4 px-6 py-4 items-center cursor-pointer transition-colors hover:bg-gray-50
                ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span className="text-sm font-semibold text-gray-700">#{inc.id}</span>
              <span className="text-sm text-gray-800 truncate">{inc.category}</span>
              <span className="text-sm text-gray-600 truncate">{inc.area}</span>
              <span className="text-sm text-gray-600">{inc.time}</span>
              <StatusBadge status={inc.status} />
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectIncident(inc); }}
                  className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Acknowledge
                </button>
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Mobile card list (below md) ── */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            No incidents match the selected filters.
          </div>
        ) : (
          filtered.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 font-mono">#{inc.id}</span>
                <StatusBadge status={inc.status} />
              </div>
              <p className="text-sm font-bold text-gray-900">{inc.category}</p>
              <p className="text-xs text-gray-500 mt-1">{inc.area} · {inc.time}</p>
              <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectIncident(inc); }}
                  className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Acknowledge
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}