const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function DashboardIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function IncidentsIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function ReportsIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function AlertsIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function SupportIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
}

function ActivityIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  );
}

function SettingsIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

function SearchIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function BellIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function TrendUpIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.5}>
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
      <polyline points="17,6 23,6 23,12"/>
    </svg>
  );
}

function TrendDownIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.5}>
      <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
      <polyline points="17,18 23,18 23,12"/>
    </svg>
  );
}

function MinusIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.5}>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function PersonIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function ClockIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  );
}

function ChatIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function MapPinIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function NewReportIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.5}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  );
}

function ActiveCaseIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.5}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function WarningIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.5}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function ShieldIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.5}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9,12 11,14 15,10"/>
    </svg>
  );
}

export {
  DashboardIcon,
  IncidentsIcon,
  SearchIcon,
  BellIcon,
  TrendUpIcon,
  TrendDownIcon,
  MinusIcon,
  PersonIcon,
  ClockIcon,
  ChatIcon,
  MapPinIcon,
  NewReportIcon,
  ActiveCaseIcon,
  WarningIcon,
  ShieldIcon,
  ReportsIcon,
  AlertsIcon,
  SupportIcon,
  ActivityIcon,
  SettingsIcon,
};