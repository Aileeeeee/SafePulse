import { useEffect, useState } from "react";

import Sidebar from "../components/NGODashboard/SideBar";
import TopBar from "../components/NGODashboard/TopBar";
import StatCard from "../components/NGODashboard/StatCard";
import IncidentCard from "../components/NGODashboard/IncidentCard";
import AlertCard from "../components/NGODashboard/AlertCard";
import AreaProgress from "../components/NGODashboard/AreaProgress";

import { initialReports } from "../data/incidentData";

function Dashboard() {
  const [reports, setReports] = useState(initialReports);

  const [newReports, setNewReports] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomReport = {
        id: Math.random(),
        title: "Suspicious Activity",
        location: "Surulere",
        time: "Just now",
        risk: "High risk",
      };

      setReports((prev) => [randomReport, ...prev]);

      setNewReports((prev) => prev + 1);

    }, 8000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">

      <Sidebar />

      <div className="flex-1 p-6 overflow-y-auto">

        <TopBar />

        <h1 className="text-3xl font-bold text-zinc-800 mt-6">
          Welcome back, Admin!
        </h1>

        <p className="text-gray-500 mb-8">
          Here's what is happening in your community right now.
        </p>

        <div className="grid grid-cols-4 gap-4 mb-8">

          <StatCard
            title="New Reports"
            number={newReports}
          />

          <StatCard
            title="Active Cases"
            number="6"
          />

          <StatCard
            title="Escalated Cases"
            number="3"
          />

          <StatCard
            title="Resolved Cases"
            number="20"
          />

        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>

            <h2 className="font-bold text-2xl mb-4">
              Live Incident Feed
            </h2>

            <div className="space-y-4">

              {reports.map((report) => (
                <IncidentCard
                  key={report.id}
                  title={report.title}
                  location={report.location}
                  time={report.time}
                  risk={report.risk}
                />
              ))}

            </div>

          </div>

          <div>

            <div className="bg-white rounded-2xl p-5 shadow mb-6">

              <div className="flex justify-between mb-5">

                <h2 className="font-bold text-2xl">
                  Active Alerts
                </h2>

                <button className="text-[#184D3B]">
                  View all
                </button>

              </div>

              <AlertCard
                title="High Risk Area"
                description="Multiple harassment reports"
                time="40 mins"
              />

              <AlertCard
                title="Multiple Reports"
                description="Several incidents reported"
                time="30 mins"
              />

              <AlertCard
                title="Area Caution"
                description="Several activity reported"
                time="30 mins"
              />

            </div>

            <div className="bg-white rounded-2xl p-5 shadow">

              <h2 className="font-bold text-2xl mb-6">
                Top Reported Areas
              </h2>

              <AreaProgress
                area="Yaba"
                reports="20"
                width="w-full"
                color="bg-red-500"
              />

              <AreaProgress
                area="Ojo"
                reports="15"
                width="w-3/4"
                color="bg-orange-500"
              />

              <AreaProgress
                area="GRA"
                reports="10"
                width="w-1/2"
                color="bg-[#184D3B]"
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;