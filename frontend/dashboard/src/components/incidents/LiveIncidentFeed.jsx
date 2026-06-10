import { useEffect, useState, useRef } from 'react';
import IncidentCard from './IncidentCard';
import { INCIDENT_ENDPOINTS } from '../../api/endpoints';
import { incidents } from '../../data/incidentData';

const FEED_INTERVAL_MS = 4000;

export default function LiveIncidentFeed({ onNewReport, onSelectIncident, searchQuery }) {
  const [allIncidents, setAllIncidents] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const indexRef = useRef(2);
  const feedKeyRef = useRef(100);
  const toastTimer = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIncidents() {
      try {
        const response = await fetch('/api/incidents/incidents/');
        const data = await response.json();

        const list = (Array.isArray(data) ? data : data.results ?? []).map(inc => ({
  ...inc,
  type: inc.incident_type,
  severity: inc.severity_level,
  channel: inc.reporting_channel,
  time: inc.incident_time,
}));


        setAllIncidents(list);
        setFeedItems(list.slice(0, 2).map((inc, i) => ({ ...inc, feedKey: i })));
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
        setFeedItems(incidents.slice(0, 2).map((inc, i) => ({ ...inc, feedKey: i })));
      } finally {
        setLoading(false);
      }
    }

    loadIncidents();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!allIncidents.length) return;

    const timer = setInterval(() => {
      const nextIndex = indexRef.current % allIncidents.length;
      const incoming = allIncidents[nextIndex];
      indexRef.current = (indexRef.current + 1) % allIncidents.length;
      feedKeyRef.current += 1;

      const newItem = { ...incoming, isNew: true, feedKey: feedKeyRef.current };

      setFeedItems((prev) => [newItem, ...prev].slice(0, 5));
      onNewReport();

      setToast(`+1 New report — ${incoming.type} in ${incoming.location}`);

      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3000);

      setTimeout(() => {
        setFeedItems((prev) =>
          prev.map((item) =>
            item.feedKey === newItem.feedKey ? { ...item, isNew: false } : item
          )
        );
      }, 2000);
    }, FEED_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [allIncidents, onNewReport]);

  const handleAcknowledge = async (id) => {
    try {
      await fetch(INCIDENT_ENDPOINTS.ACKNOWLEDGE(id), { method: 'POST' });
    } catch (error) {
      console.error('Acknowledge failed:', error);
    }

    setAcknowledged((prev) => new Set([...prev, id]));
    setFeedItems((prev) => prev.filter((item) => item.id !== id));
    setAllIncidents((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-800">Live Incident Feed</h2>
        <span className="relative flex items-center justify-center w-3 h-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>

      <div className="relative flex flex-col gap-3">
        {loading ? (
          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm text-gray-500">
            Loading incidents...
          </div>
        ) : (() => {
          const query = searchQuery?.trim().toLowerCase();
          const source = query ? allIncidents : feedItems;
          const results = query
            ? source
                .filter((item) => {
                  const searchable = [
                    item.type,
                    item.location,
                    item.channel,
                    item.status,
                    item.notes,
                    String(item.id),
                  ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                  return searchable.includes(query);
                })
                .slice(0, 10)
                .map((item) => ({ ...item, feedKey: `search-${item.id}` }))
            : source;

          return results
            .filter((item) => !acknowledged.has(item.id))
            .map((item) => (
              <div key={item.feedKey} className="transition-all duration-500">
                <IncidentCard
                  incident={item}
                  isNew={item.isNew}
                  onAcknowledge={handleAcknowledge}
                  onSelect={onSelectIncident}
                />
              </div>
            ));
        })()}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
          <div className="bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
