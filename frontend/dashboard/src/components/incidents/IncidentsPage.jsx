import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { INCIDENT_ENDPOINTS } from '../../api/endpoints';

// Field helpers

function getStatus(inc) {
  const s = (inc.status || '').toLowerCase();
  if (s === 'resolved' || s === 'closed') return 'Resolved';
  if (s === 'ongoing'  || s === 'active') return 'Active';
  return 'New';
}

function getSeverityLabel(inc) {
  const s = (inc.severity_level || '').toLowerCase();
  if (s === 'critical') return 'Critical';
  if (s === 'high')     return 'High';
  if (s === 'medium')   return 'Medium';
  return 'Low';
}

function formatTime(inc) {
  const raw = inc.reported_at || inc.created_at;
  if (!raw) return inc.time || '—';
  try { return new Date(raw).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

function formatDate(inc) {
  const raw = inc.reported_at || inc.created_at || inc.date;
  if (!raw) return '—';
  try { return new Date(raw).toISOString().split('T')[0]; }
  catch { return '—'; }
}

// Style maps 

const STATUS_STYLES = {
  New:      { dot: 'bg-red-400',  badge: 'bg-red-50 text-red-500 border border-red-200' },
  Active:   { dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600 border border-blue-200' },
  Resolved: { dot: 'bg-teal-400', badge: 'bg-teal-50 text-teal-600 border border-teal-200' },
};

// Sub-components 

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === opt ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
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

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.New;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

//  Main page 

export default function IncidentsPage({ onSelectIncident }) {
  const [incidents,     setIncidents]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [refreshing,    setRefreshing]    = useState(false);
  const [acknowledged,  setAcknowledged]  = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [dateFilter,     setDateFilter]     = useState('All');
  const [categories,    setCategories]    = useState(['All']);
  const [dates,         setDates]         = useState(['All']);

  const fetchIncidents = useCallback(async (silent = false) => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); setError('You must be logged in to view incidents.'); return; }
    if (!silent) setLoading(true); else setRefreshing(true);

    try {
      const res = await fetch(INCIDENT_ENDPOINTS.LIST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.results || []);
    setIncidents(list);
    setError(null);

    const cats = ['All', ...new Set(list.map((i) => i.incident_type).filter(Boolean))].sort();
    const dts  = ['All', ...new Set(list.map((i) => formatDate(i)).filter((d) => d !== '—'))].sort().reverse();
    setCategories(cats);
    setDates(dts.slice(0, 30));
  } catch {
    setError('Failed to load incidents. Please try again.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);  

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const mapped = incidents.map((inc) => ({
    _raw:     inc,
    id:       String(inc.id),
    category: inc.incident_type || 'Unknown',
    area:     inc.location || '—',
    time:     formatTime(inc),
    date:     formatDate(inc),
    status:   getStatus(inc),
    severity: getSeverityLabel(inc),
    channel:  inc.channel || '—',
  }));

  const filtered = mapped.filter((inc) => {
    if (categoryFilter !== 'All' && inc.category !== categoryFilter) return false;
    if (statusFilter   !== 'All' && inc.status   !== statusFilter)   return false;
    if (dateFilter     !== 'All' && inc.date      !== dateFilter)     return false;
    return true;
  });

  const STATUSES = ['All', 'New', 'Active', 'Resolved'];

  const AcknowledgeBtn = ({ inc, fullWidth = false }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setAcknowledged((prev) => new Set([...prev, inc.id]));
      }}
      className={`${fullWidth ? 'flex-1' : 'px-4'} py-1.5 rounded-full border text-xs font-semibold transition-colors ${
        acknowledged.has(inc.id)
          ? 'bg-emerald-900 border-emerald-900 text-white'
          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      {acknowledged.has(inc.id) ? 'Acknowledged' : 'Acknowledge'}
    </button>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-5 sm:gap-6 h-full">

      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} of ${incidents.length} incidents`}
          </p>
        </div>
        <button
          onClick={() => fetchIncidents(true)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
        <div className="flex flex-wrap justify-end gap-2">
          <FilterDropdown label="Type"   options={categories} value={categoryFilter} onChange={setCategoryFilter} />
          <FilterDropdown label="Status" options={STATUSES}   value={statusFilter}   onChange={setStatusFilter} />
          <FilterDropdown label="Date"   options={dates}      value={dateFilter}      onChange={setDateFilter} />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-4 bg-gray-200 rounded-full" />
                <div className="flex-1 h-4 bg-gray-200 rounded-full" />
                <div className="w-20 h-4 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      {!loading && !error && (
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr_120px_100px_180px] gap-x-4 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
            {['ID', 'TYPE', 'LOCATION', 'TIME', 'STATUS', 'ACTION'].map((h) => (
              <span key={h} className="text-xs font-bold text-gray-400 tracking-wider uppercase">{h}</span>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No incidents match the selected filters.</div>
          ) : (
            filtered.map((inc, i) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident({
                  id:              inc._raw.id,
                  category:        inc._raw.incident_type || 'Unknown',
                  status:          inc.status,
                  severity:        inc.severity,
                  location:        inc._raw.location || '—',
                  time:            inc.time,
                  date:            inc.date,
                  channel:         inc._raw.channel || '—',
                  notes:           inc._raw.notes || '',
                  lat:             inc._raw.latitude  || inc._raw.lat  || 6.5244,
                  lng:             inc._raw.longitude || inc._raw.lng  || 3.3792,
                  timeline:        inc._raw.timeline         || [],
                  trustedContacts: inc._raw.trusted_contacts || [],
                })}
                className={`grid grid-cols-[80px_1fr_1fr_120px_100px_180px] gap-x-4 px-6 py-4 items-center cursor-pointer transition-colors hover:bg-gray-50 ${
                  i < filtered.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <span className="text-sm font-semibold text-gray-700">#{inc.id}</span>
                <span className="text-sm text-gray-800 truncate">{inc.category}</span>
                <span className="text-sm text-gray-600 truncate">{inc.area}</span>
                <span className="text-sm text-gray-600">{inc.time}</span>
                <StatusBadge status={inc.status} />
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <AcknowledgeBtn inc={inc} />
                  <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mobile cards */}
      {!loading && !error && (
        <div className="md:hidden flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              No incidents match the selected filters.
            </div>
          ) : (
            filtered.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident({
                  id:              inc._raw.id,
                  category:        inc._raw.incident_type || 'Unknown',
                  status:          inc.status,
                  severity:        inc.severity,
                  location:        inc._raw.location || '—',
                  time:            inc.time,
                  date:            inc.date,
                  channel:         inc._raw.channel || '—',
                  notes:           inc._raw.notes || '',
                  lat:             inc._raw.latitude  || inc._raw.lat  || 6.5244,
                  lng:             inc._raw.longitude || inc._raw.lng  || 3.3792,
                  timeline:        inc._raw.timeline         || [],
                  trustedContacts: inc._raw.trusted_contacts || [],
                })}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 font-mono">#{inc.id}</span>
                  <StatusBadge status={inc.status} />
                </div>
                <p className="text-sm font-bold text-gray-900">{inc.category}</p>
                <p className="text-xs text-gray-500 mt-1">{inc.area} · {inc.time}</p>
                <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <AcknowledgeBtn inc={inc} fullWidth />
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}