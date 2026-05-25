import { useState, useEffect, useRef, useCallback } from "react";
import {
  CATEGORY_TYPES,
  LOCATIONS,
  SOURCES,
  SEED_INCIDENTS,
  SEED_AREAS,
} from "../data/incidentData";


let _counter = 2345;

function generateId() {
  _counter++;
  return `#${_counter}`;
}

function timeNow() {
  const n = new Date();
  let h = n.getHours();
  const m = String(n.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildIncident(catOverride) {
  return {
    id:    generateId(),
    cat:   catOverride || randomItem(CATEGORY_TYPES),
    loc:   randomItem(LOCATIONS),
    time:  timeNow(),
    src:   randomItem(SOURCES),
    acked: false,
    isNew: true,
  };
}


function useDashboard({ autoIntervalMs = 7000 } = {}) {
  const [incidents,   setIncidents]   = useState(SEED_INCIDENTS);
  const [newReports,  setNewReports]  = useState(12);
  const [activeCases, setActiveCases] = useState(6);
  const [escalated]                    = useState(3);
  const [resolved,    setResolved]    = useState(20);
  const [bellCount,   setBellCount]   = useState(4);
  const [areas,       setAreas]       = useState(SEED_AREAS);
  const [toast,       setToast]       = useState(null);
  const [flashStat,   setFlashStat]   = useState(false);

  const toastTimer = useRef(null);


  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);


  const addIncident = useCallback((catOverride) => {
    const inc = buildIncident(catOverride);

    setIncidents((prev) => [inc, ...prev].slice(0, 10));

  
    setNewReports((n) => n + 1);
    if (Math.random() > 0.4) setActiveCases((n) => n + 1);
    setBellCount((n) => n + 1);


    setFlashStat(true);
    setTimeout(() => setFlashStat(false), 1200);


    setAreas((prev) => {
      const updated = [...prev];
      const idx = Math.floor(Math.random() * updated.length);
      updated[idx] = { ...updated[idx], reports: updated[idx].reports + 1 };
      return updated
        .sort((a, b) => b.reports - a.reports)
        .map((d, i) => ({ ...d, rank: i + 1 }));
    });

    showToast(`+1 New report — ${inc.cat.label} in ${inc.loc}`);


    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((i) => (i.id === inc.id ? { ...i, isNew: false } : i))
      );
    }, 4000);
  }, [showToast]);


  const acknowledge = useCallback((id) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, acked: true, isNew: false } : i))
    );
    setResolved((n) => n + 1);
    setActiveCases((n) => Math.max(0, n - 1));
    showToast("✓ Incident acknowledged and moved to resolved");
  }, [showToast]);


  useEffect(() => {
    const id = setInterval(() => addIncident(), autoIntervalMs);
    return () => clearInterval(id);
  }, [addIncident, autoIntervalMs]);

  return {

    incidents,
    newReports,
    activeCases,
    escalated,
    resolved,
    bellCount,
    areas,
    toast,
    flashStat,
    addIncident,
    acknowledge,
    showToast,
  };
}

export default useDashboard;