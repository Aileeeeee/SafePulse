import { Home, FileText, Bell, Phone, ClipboardList, Settings, MapPin } from 'lucide-react';
import spLogo from '../assets/safepulse-icon.png';

const navItems = [
  { id: 'dashboard',         icon: Home,          label: 'Dashboard' },
  { id: 'incidents',         icon: MapPin,         label: 'Incidents' },
  { id: 'reports',           icon: FileText,       label: 'Reports' },
  { id: 'alerts',            icon: Bell,           label: 'Alerts' },
  { id: 'support-directory', icon: Phone,          label: 'Support Directory' },
  { id: 'activity-log',      icon: ClipboardList,  label: 'Activity log' },
  { id: 'settings',          icon: Settings,       label: 'Settings' },
];

// Sidebar now receives activePage + onPageChange from App so navigation is
// controlled by the parent (needed for incidents sub-pages to work correctly).
function Sidebar({ activePage, onPageChange }) {
  return (
    <aside className="w-52 min-h-screen bg-emerald-900 flex flex-col pt-0.5 pb-8 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
              <img src={spLogo} alt="icon" className="w-12 h-12 rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold bg-linear-to-r from-white to-emerald-700 bg-clip-text text-transparent">
              SafePulse
            </h1>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 py-6 whitespace-nowrap space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-linearcd-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-white hover:bg-emerald-700'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;