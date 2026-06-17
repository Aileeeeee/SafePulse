import { useState, useCallback } from 'react';
import { FileText, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import SplashScreen from './components/auth/SplashScreen';
import Welcome from './components/auth/Welcome';
import SignIn from './components/auth/SignIn';
import RequestAccess from './components/auth/RequestAccess';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import LiveIncidentFeed from './components/incidents/LiveIncidentFeed';
import IncidentDetailPanel from './components/incidents/IncidentDetailPanel';
import ActiveAlerts from './components/alerts/ActiveAlerts';
import TopReportedAreas from './components/TopReportedAreas';

const INITIAL_NEW_REPORTS = 12;

// Screens: 'splash' | 'welcome' | 'signin' | 'requestaccess' | 'dashboard'
export default function App() {
  const [screen, setScreen] = useState('splash');


  const [newReports, setNewReports] = useState(INITIAL_NEW_REPORTS);
  const [activeCases] = useState(6);
  const [escalatedCases] = useState(3);
  const [resolvedCases] = useState(20);

  const handleNewReport = useCallback(() => {
    setNewReports((prev) => prev + 1);
  }, []);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleAcknowledgeFromPanel = () => {
    // Close the panel after acknowledging. Feed handles its own acknowledge state.
    setSelectedIncident(null);
  };

if (screen === 'splash') {
    return <SplashScreen onComplete={() => setScreen('welcome')} />;
  }

  if (screen === 'welcome') {
    return (
      <Welcome
        onSignIn={() => setScreen('signin')}
        onRequestAccess={() => setScreen('requestaccess')}
      />
    );
  }

  if (screen === 'signin') {
    return (
      <SignIn
        onSuccess={() => setScreen('dashboard')}
        onRequestAccess={() => setScreen('requestaccess')}
      />
    );
  }

  if (screen === 'requestaccess') {
    return (
      <RequestAccess
        onSignIn={() => setScreen('signin')}
        onSubmitted={() => setScreen('signin')}
      />
    );
  }


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          newReportsCount={newReports - INITIAL_NEW_REPORTS + 4}
          onLogout={() => setScreen('signin')}
        />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, David!</h1>
            <p className="text-sm text-gray-500 mt-1">Here's what is happening in your community right now.</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="New Reports"
              value={newReports}
              delta={5}
              deltaLabel="From yesterday"
              icon={<FileText size={28} className="text-emerald-700" />}
              iconBg="bg-emerald-100"
              trend="up"
              highlight
            />
            <StatsCard
              title="Active Cases"
              value={activeCases}
              delta={3}
              deltaLabel="From yesterday"
              icon={<Users size={28} className="text-blue-600" />}
              iconBg="bg-blue-100"
              trend="up"
            />
            <StatsCard
              title="Escalated Cases"
              value={escalatedCases}
              delta={2}
              icon={<AlertTriangle size={28} className="text-orange-500" />}
              iconBg="bg-orange-100"
              trend="down"
            />
            <StatsCard
              title="Resolved Cases"
              value={resolvedCases}
              delta={7}
              deltaLabel="From yesterday"
              icon={<ShieldCheck size={28} className="text-sky-600" />}
              iconBg="bg-sky-100"
              trend="up"
            />
          </div>

          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3">
              <LiveIncidentFeed
                onNewReport={handleNewReport}
                onSelectIncident={handleSelectIncident}
                searchQuery={searchQuery}
              />
              {selectedIncident && (
                <IncidentDetailPanel
                  incident={selectedIncident}
                  onClose={() => setSelectedIncident(null)}
                  onAcknowledge={handleAcknowledgeFromPanel}
                />
              )}
            </div>

            <div className="col-span-2 flex flex-col gap-0">
              <ActiveAlerts />
              <TopReportedAreas />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
