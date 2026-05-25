/**
 * src/data/incidentData.js
 *
 * All static data, seed incidents, categories, locations.
 * Used by IncidentContext (HS-07, HS-08, HS-09) and NGODashboard.
 */

const CATEGORY_TYPES = [
  { label: "Violence/Assault",    risk: "high" },
  { label: "Harassment",          risk: "high" },
  { label: "Domestic Conflict",   risk: "high" },
  { label: "Suspicious Activity", risk: "med"  },
  { label: "Stalking/Following",  risk: "med"  },
  { label: "Child Endangerment",  risk: "high" },
  { label: "Forced Control",      risk: "med"  },
  { label: "Threat/Danger",       risk: "high" },
  { label: "Public Disturbance",  risk: "low"  },
  { label: "Other",               risk: "low"  },
];

const LOCATIONS = [
  "Yaba", "Surulere", "Ojo", "GRA", "Ikeja", "Lekki", "Ajah", "Ikorodu",
];

const SOURCES = [
  "Report via app",
  "SMS — PULSE",
  "Direct report",
];

const RISK_LABEL = {
  high: "High risk",
  med:  "Medium risk",
  low:  "Low risk",
};

const RISK_COLOR = {
  high: { dot: "bg-red-500",    pill: "bg-red-50 text-red-600",    bar: "#ef4444" },
  med:  { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-600", bar: "#f97316" },
  low:  { dot: "bg-green-500",  pill: "bg-green-50 text-green-700", bar: "#16a34a" },
};

const SEED_INCIDENTS = [
  {
    id:    "#2345",
    cat:   CATEGORY_TYPES[0],
    loc:   "Yaba",
    time:  "10:45 AM",
    src:   "Report via app",
    acked: false,
    isNew: false,
  },
  {
    id:    "#2344",
    cat:   CATEGORY_TYPES[1],
    loc:   "Yaba",
    time:  "10:30 AM",
    src:   "Report via app",
    acked: false,
    isNew: false,
  },
];

const SEED_AREAS = [
  { rank: 1, name: "Surulere", reports: 20, color: "#ef4444" },
  { rank: 2, name: "Ojo",      reports: 15, color: "#f97316" },
  { rank: 3, name: "GRA",      reports: 10, color: "#16a34a" },
];

const SEED_ALERTS = [
  {
    id:       1,
    title:    "High Risk Area",
    desc:     "Multiple harassment reports",
    location: "Yaba, Lagos",
    time:     "40 mins",
    level:    "high",
  },
  {
    id:       2,
    title:    "Multiple Reports",
    desc:     "Several incidents reported",
    location: "Surulere, Lagos",
    time:     "30 mins",
    level:    "med",
  },
  {
    id:       3,
    title:    "Area caution",
    desc:     "Several activity reported",
    location: "Surulere, Lagos",
    time:     "30 mins",
    level:    "med",
  },
];

export {
  CATEGORY_TYPES,
  LOCATIONS,
  SOURCES,
  RISK_LABEL,
  RISK_COLOR,
  SEED_INCIDENTS,
  SEED_AREAS,
  SEED_ALERTS
};