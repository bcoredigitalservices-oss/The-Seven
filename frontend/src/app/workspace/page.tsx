"use client";

import { useEffect, useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import Tier1ExecutiveView from "@/components/workspace/Tier1ExecutiveView";
import ClientPortalView from "@/components/workspace/ClientPortalView";
import ITDashboardView from "@/components/workspace/ITDashboardView";
import CreativeDashboardView from "@/components/workspace/CreativeDashboardView";
import CorporateDashboardView from "@/components/workspace/CorporateDashboardView";
import MarketingDashboardView from "@/components/workspace/MarketingDashboardView";
import { ShieldAlert } from "lucide-react";

export default function WorkspacePage() {
  const { userProfile, simulatedUser, error, dashboardData, fetchDashboardOverview } = useSevenStore();
  const [personaMode, setPersonaMode] = useState<string>("executive");

  const activeUser = simulatedUser || userProfile;

  useEffect(() => {
    if (activeUser) {
      fetchDashboardOverview();
    }
  }, [activeUser, fetchDashboardOverview]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ShieldAlert className="w-12 h-12 text-[#ff1744] mb-4" />
        <h2 className="text-xl font-mono text-zinc-200">WORKSPACE LINK FAILED</h2>
        <p className="text-zinc-550 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full font-mono text-zinc-500 animate-pulse">
        AWAITING PROFILE METADATA...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full font-mono text-zinc-500 animate-pulse">
        INITIALIZING REAL-TIME TELEMETRY LAYER...
      </div>
    );
  }

  const { role_tier, user_type, department } = activeUser;

  // 1. Client User Type
  if (user_type === 'Client') {
    return (
      <ClientPortalView 
        activeProjects={dashboardData.active_projects || []}
        projectTasks={dashboardData.assigned_tasks || []}
      />
    );
  }

  // 2. CEO / Exec View (only show simulation controls if they are the actual logged in CEO, not a simulated user)
  if (role_tier === 1) {
    return (
      <div className="flex flex-col h-full min-h-0 space-y-6">
        
        {/* CEO Persona Switcher Auditing Console */}
        <div className="bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <span className="text-[10px] font-mono text-[#ff1744] tracking-[0.2em] uppercase">CEO SECURITY CONSOLE</span>
              <h3 className="text-sm font-bold text-white font-mono mt-0.5">WORKSPACE SIMULATION MATRIX</h3>
            </div>
          </div>
          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="text-zinc-400">AUDIT VIEW:</span>
            <select
              value={personaMode}
              onChange={(e) => setPersonaMode(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded p-1.5 focus:outline-none focus:border-[#ff1744]"
            >
              <option value="executive">Tier 1 Executive (Default)</option>
              <option value="it">IT Employee Dashboard</option>
              <option value="creative">Creative Employee Dashboard</option>
              <option value="corporate">Corporate CRM Dashboard</option>
              <option value="marketing">Marketing Dashboard</option>
              <option value="client">Client Portal Dashboard</option>
            </select>
          </div>
        </div>

        {/* Dynamic Auditing Content */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {personaMode === "executive" && (
            <Tier1ExecutiveView
              projects={dashboardData.active_projects || []}
              data={dashboardData || {}}
            />
          )}
          {personaMode === "it" && (
            <ITDashboardView assignedTasks={dashboardData.assigned_tasks || []} />
          )}
          {personaMode === "creative" && (
            <CreativeDashboardView assignedTasks={dashboardData.assigned_tasks || []} />
          )}
          {personaMode === "corporate" && (
            <CorporateDashboardView assignedTasks={dashboardData.assigned_tasks || []} />
          )}
          {personaMode === "marketing" && (
            <MarketingDashboardView assignedTasks={dashboardData.assigned_tasks || []} />
          )}
          {personaMode === "client" && (
            <ClientPortalView 
              activeProjects={dashboardData.active_projects || []}
              projectTasks={dashboardData.assigned_tasks || []}
            />
          )}
        </div>
      </div>
    );
  }

  // 3. Employee Role Redirection based on department
  const userDept = (department || "").toLowerCase();
  
  if (userDept === "it" || userDept.includes("dev") || userDept.includes("tech") || userDept.includes("saas")) {
    return <ITDashboardView assignedTasks={dashboardData.assigned_tasks || []} />;
  }
  if (userDept === "creative" || userDept.includes("design") || userDept.includes("art")) {
    return <CreativeDashboardView assignedTasks={dashboardData.assigned_tasks || []} />;
  }
  if (userDept === "corporate" || userDept.includes("sales") || userDept.includes("crm") || userDept.includes("finance")) {
    return <CorporateDashboardView assignedTasks={dashboardData.assigned_tasks || []} />;
  }
  if (userDept === "marketing" || userDept.includes("promo") || userDept.includes("agency")) {
    return <MarketingDashboardView assignedTasks={dashboardData.assigned_tasks || []} />;
  }

  // Fallback default view (IT Technical Dashboard)
  return (
    <ITDashboardView assignedTasks={dashboardData.assigned_tasks || []} />
  );
}
