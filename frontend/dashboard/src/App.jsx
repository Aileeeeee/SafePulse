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
import IncidentsPage from './components/incidents/IncidentsPage';
import IncidentDetailPage from './components/incidents/IncidentDetailPage';

const INITIAL_NEW_REPORTS = 12;

// Auth screens: 'splash' | 'welcome' | 'signin' | 'requestaccess'
// Dashboard sections: 'dashboard' | 'incidents' | 'reports' | ...
export default function App() {
  const [screen, setScreen] = useState('splash');

  // Dashboard sidebar page
  const [activePage, setActivePage] = useState('dashboard');

  // Mobile sidebar drawer open/closed
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Incident selected from the Incidents table
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Dashboard state
  const [newReports, setNewReports] = useState(INITIAL_NEW_REPORTS);
  const [activeCases]    = useState(6);
  const [escalatedCases] = useState(3);
  const [resolvedCases]  = useState(20);

  const handleNewReport = useCallback(() => setNewReports((p) => p + 1), []);

  const [dashboardIncident, setDashboardIncident] = useState(null);
  const [searchQuery, setSearchQuery]             = useState('');

  //  Sidebar page change 
  const handlePageChange = (id) => {
    setActivePage(id);
    if (id !== 'incidents') setSelectedIncident(null);
  };

  //  Auth screens 
  if (screen === 'splash')
    return <SplashScreen onComplete={() => setScreen('welcome')} />;

  if (screen === 'welcome')
    return (
      <Welcome
        onSignIn={() => setScreen('signin')}
        onRequestAccess={() => setScreen('requestaccess')}
      />
    );

  if (screen === 'signin')
    return (
      <SignIn
        onSuccess={() => setScreen('dashboard')}
        onRequestAccess={() => setScreen('requestaccess')}
      />
    );

  if (screen === 'requestaccess')
    return (
      <RequestAccess
        onSignIn={() => setScreen('signin')}
        onWelcome={() => setScreen('welcome')}
      />
    );

  //  Dashboard shell 
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          newReportsCount={newReports - INITIAL_NEW_REPORTS + 4}
          onLogout={() => setScreen('signin')}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">

          {/* ── Incidents table page ── */}
          {activePage === 'incidents' && !selectedIncident && (
            <IncidentsPage
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          )}

          {/* ── Incident detail page ── */}
          {activePage === 'incidents' && selectedIncident && (
            <IncidentDetailPage
              incident={selectedIncident}
              onBack={() => setSelectedIncident(null)}
            />
          )}

          {/* ── Dashboard (default) ── */}
          {activePage === 'dashboard' && (
            <div className="px-4 sm:px-6 py-5">
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, David!</h1>
                <p className="text-sm text-gray-500 mt-1">Here's what is happening in your community right now.</p>
              </div>

              {/* Stats — 1 col mobile, 2 col tablet, 4 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  title="New Reports" value={newReports} delta={5}
                  deltaLabel="From yesterday"
                  icon={<FileText size={28} className="text-emerald-700" />}
                  iconBg="bg-emerald-100" trend="up" highlight
                />
                <StatsCard
                  title="Active Cases" value={activeCases} delta={3}
                  deltaLabel="From yesterday"
                  icon={<Users size={28} className="text-blue-600" />}
                  iconBg="bg-blue-100" trend="up"
                />
                <StatsCard
                  title="Escalated Cases" value={escalatedCases} delta={2}
                  icon={<AlertTriangle size={28} className="text-orange-500" />}
                  iconBg="bg-orange-100" trend="down"
                />
                <StatsCard
                  title="Resolved Cases" value={resolvedCases} delta={7}
                  deltaLabel="From yesterday"
                  icon={<ShieldCheck size={28} className="text-sky-600" />}
                  iconBg="bg-sky-100" trend="up"
                />
              </div>

              {/* Feed + sidebar widgets — stacked on mobile/tablet, 5-col split on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3">
                  <LiveIncidentFeed
                    onNewReport={handleNewReport}
                    onSelectIncident={setDashboardIncident}
                    searchQuery={searchQuery}
                  />
                  {dashboardIncident && (
                    <IncidentDetailPanel
                      incident={dashboardIncident}
                      onClose={() => setDashboardIncident(null)}
                      onAcknowledge={() => setDashboardIncident(null)}
                    />
                  )}
                </div>
                <div className="lg:col-span-2 flex flex-col gap-0">
                  <ActiveAlerts />
                  <TopReportedAreas />
                </div>
              </div>
            </div>
          )}

          {/* ── Placeholder pages ── */}
          {!['dashboard', 'incidents'].includes(activePage) && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm px-4 text-center">
              {activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')} — coming soon
            </div>
          )}

        </main>
      </div>
    </div>
  );
}