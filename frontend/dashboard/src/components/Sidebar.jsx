import { Home, FileText, Bell, Phone, ClipboardList, Settings, MapPin, X } from 'lucide-react';
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


function Sidebar({ activePage, onPageChange, isOpen, onClose }) {
  const handleNavClick = (id) => {
    onPageChange(id);
    onClose?.(); 
  };

  return (
    <>
      {/* Mobile dim overlay — only visible when drawer is open, hidden on desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-full lg:h-auto z-50
          w-64 sm:w-72 lg:w-52 min-h-screen bg-emerald-900 flex flex-col pt-0.5 pb-8 shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Logo + mobile close button */}
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

          {/* Close button — mobile/tablet only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/80 hover:bg-emerald-800 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 py-6 whitespace-nowrap space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25'
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
    </>
  );
}

export default Sidebar;