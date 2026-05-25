import {
  DashboardIcon, IncidentsIcon, ReportsIcon,
  AlertsIcon, SupportIcon, ActivityIcon, SettingsIcon,
} from "../shared/Icons";

const NAV_ITEMS = [
  { label: "Dashboard",         Icon: DashboardIcon  },
  { label: "Incidents",         Icon: IncidentsIcon  },
  { label: "Reports",           Icon: ReportsIcon    },
  { label: "Alerts",            Icon: AlertsIcon     },
  { label: "Support Directory", Icon: SupportIcon    },
  { label: "Activity log",      Icon: ActivityIcon   },
  { label: "Settings",          Icon: SettingsIcon   },
];

function Sidebar({ activeNav, onNav }) {
  return (
    <aside className="w-52 bg-green-900 flex flex-col shrink-0 h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-green-800">
        <p className="text-white font-bold text-base tracking-tight leading-none">SafePulse</p>
        <p className="text-green-400 text-xs mt-1">NGO Dashboard</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ label, Icon }) => {
          const active = activeNav === label;
          return (
            <button
              key={label}
              onClick={() => onNav(label)}
              className={`
                w-[calc(100%-12px)] mx-1.5 flex items-center gap-3
                px-3.5 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 mb-0.5
                ${active
                  ? "bg-green-700 text-white"
                  : "text-green-200 hover:bg-green-800 hover:text-white"
                }
              `}
            >
              <span className="shrink-0 opacity-90">
                <Icon size={18} />
              </span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;