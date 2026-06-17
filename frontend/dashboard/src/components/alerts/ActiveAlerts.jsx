import { useEffect, useState } from 'react';
import AlertCard from './AlertCard';
import AlertsModal from './AlertsModal';
import { INCIDENT_ENDPOINTS } from '../../api/endpoints';

const mapIncidentToAlert = (incident) => ({
  id: incident.id,
  title: `${incident.incident_type} Report`,
  description: incident.notes || `${incident.incident_type} incident reported`,
  location: incident.location,
  minutesAgo: Math.floor(Math.random() * 180) + 10,
  severity:
    incident.severity_level === 'High' || incident.severity_level === 'Critical'
      ? 'high'
      : incident.severity_level === 'Medium'
      ? 'medium'
      : 'caution',
});

export default function ActiveAlerts() {
  const [showModal, setShowModal] = useState(false);
  const [displayAlerts, setDisplayAlerts] = useState([]);
  const [allModalAlerts, setAllModalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(INCIDENT_ENDPOINTS.LIST, {
           headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          }
        });

        if (res.ok) {
          const data = await res.json();
          const incidents = data.results || data;
          const alerts = incidents.map(mapIncidentToAlert);
          setDisplayAlerts(alerts.slice(0, 5));
          setAllModalAlerts(alerts);
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Active Alerts</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-emerald-700 font-semibold hover:text-emerald-500 transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {error && <p className='text-xs text-red-400'>Error: {error}</p>}
          {loading ? (
            <p className="text-xs text-gray-400">Loading alerts...</p>
          ) : displayAlerts.length === 0 ? (
            <p className="text-xs text-gray-400">No alerts available</p>
          ) : (
            displayAlerts.map((alert) => (
              <AlertCard key={`${alert.id}-${alert.minutesAgo}`} alert={alert} />
            ))
          )}
        </div>
      </div>

      {showModal && <AlertsModal onClose={() => setShowModal(false)} alerts={allModalAlerts} />}
    </>
  );
}
