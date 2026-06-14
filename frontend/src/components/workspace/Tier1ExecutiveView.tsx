"use client";

import { useEffect, useState } from "react";
import { useSevenStore, Project } from "@/store/useSevenStore";
import { 
  FolderOpen, Users, DollarSign, Building, UsersRound, 
  Layers, BarChart, Target, Zap, Activity, Clock, ShieldAlert, GitCommit
} from "lucide-react";
import { motion } from "framer-motion";

interface Tier1ExecutiveViewProps {
  projects: Project[];
  data: any;
}

const ProgressBar = ({ label, value, max, colorClass }: { label: string, value: number | string, max: number, colorClass: string }) => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const percentage = max > 0 ? Math.min((numericValue / max) * 100, 100) : 0;
  
  return (
    <div className="w-full mt-3">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[11px] font-mono text-zinc-400 uppercase">{label}</span>
        <span className="text-sm font-mono font-bold text-zinc-100">{value}</span>
      </div>
      <div className="w-full bg-zinc-900/80 h-3 rounded overflow-hidden flex border border-zinc-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${colorClass}`} 
        />
      </div>
    </div>
  );
};

export default function Tier1ExecutiveView({ projects, data }: Tier1ExecutiveViewProps) {
  const { userProfile, leads, fetchLeads } = useSevenStore();
  
  const [greeting, setGreeting] = useState("Welcome");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetchLeads();
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      }));
      
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sys = data?.system_metrics || {};
  const sales = data?.sales_metrics || {};
  const hr = data?.hr_metrics || {};
  const fin = data?.financial_metrics || {};
  const proj = data?.project_metrics || {};
  const client = data?.client_metrics || {};

  const metrics = {
    total_projects: proj.total_projects || 0,
    active_projects: projects.length || proj.active_projects || 0,
    department_projects: proj.department_projects || {},
    total_users: hr.total_users || 0,
    employees: hr.employees || 0,
    department_leads: hr.department_leads || 0,
    total_groups: hr.total_groups || 0,
    active_personnel: sys.active_personnel || hr.active_personnel || 0,
    total_leads: sales.total_leads || 0,
    cracked_leads: sales.cracked_leads || 0,
    user_created_leads: sales.user_created_leads || 0,
    lead_engine_status: sales.lead_engine_status || "Online",
    profit_generated: fin.profit_generated || 0,
    quotes_generated: fin.quotes_generated || 0,
    accepted_quotes: fin.accepted_quotes || 0,
    pending_quotes_value: sys.total_quotes_value || fin.pending_quotes_value || 0,
    total_clients: client.total_clients || 0,
    active_clients: client.active_clients || 0
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* LOGICAL WISH ENGINE & MACRO METRICS */}
      <div className="bg-[#050505] p-6 rounded-xl border border-zinc-800 shadow-xl space-y-6">
        
        <header className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase flex items-center shadow-black drop-shadow-md">
              <Activity className="w-8 h-8 mr-3 animate-pulse text-[#00E5FF]" />
              {greeting}, {userProfile?.full_name?.split(" ")[0] || "Executive"}
            </h2>
            <p className="text-sm md:text-base text-zinc-400 font-mono mt-2 flex items-center bg-zinc-900/50 inline-flex px-3 py-1 rounded border border-zinc-800">
              <Clock className="w-4 h-4 mr-2 text-emerald-400" />
              {currentTime || "INITIALIZING TIME PROTOCOL..."}
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded text-[#00e5ff] text-xs font-mono uppercase font-bold tracking-widest shadow-[0_0_10px_rgba(0,229,255,0.1)]">
              System Telemetry Online
            </span>
          </div>
        </header>

        {/* Top Row: Executive Macros (Enhanced Visibility) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FolderOpen className="w-24 h-24 text-white" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold">Total Projects</span>
              <FolderOpen className="w-5 h-5 text-[#00e5ff]" />
            </div>
            <div className="mt-4 text-4xl font-bold text-white font-mono relative z-10">{metrics.total_projects}</div>
          </div>

          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-24 h-24 text-white" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold">Active Personnel</span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-4 text-4xl font-bold text-white font-mono relative z-10">{metrics.active_personnel}</div>
          </div>

          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-24 h-24 text-amber-400" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold">Profit Generated</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-4 text-3xl xl:text-4xl font-bold text-amber-400 font-mono relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
              ${metrics.profit_generated.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building className="w-24 h-24 text-white" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold">Active Clients</span>
              <Building className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-4 text-4xl font-bold text-white font-mono relative z-10">{metrics.active_clients}</div>
          </div>
        </div>

        {/* Analytics Grid: HR, Projects, Financials, Sales (With Graphs) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 pt-2">
          
          {/* HR & Organization */}
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col">
            <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center border-b border-zinc-800 pb-3 mb-4 font-bold">
              <UsersRound className="w-4 h-4 mr-2 text-[#00e5ff]" />
              HR & Organization
            </h3>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-zinc-400 font-mono uppercase">Total Network Users</span>
                  <span className="text-2xl font-bold text-white font-mono">{metrics.total_users}</span>
                </div>
                
                <ProgressBar 
                  label="Employees" 
                  value={metrics.employees} 
                  max={metrics.total_users} 
                  colorClass="bg-[#00e5ff]" 
                />
                <ProgressBar 
                  label="Department Leads" 
                  value={metrics.department_leads} 
                  max={metrics.total_users} 
                  colorClass="bg-purple-500" 
                />
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-mono uppercase font-semibold">Total Organizational Groups</span>
                <span className="text-xl font-bold text-white font-mono bg-zinc-900 px-3 py-1 rounded border border-zinc-800">{metrics.total_groups}</span>
              </div>
            </div>
          </div>

          {/* Sales Analytics Overview */}
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center font-bold">
                <Target className="w-4 h-4 mr-2 text-rose-400" />
                Sales Pipeline
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center ${
                metrics.lead_engine_status === 'Online' 
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
              }`}>
                {metrics.lead_engine_status === 'Online' && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1.5" />
                )}
                {metrics.lead_engine_status}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">Total Intake Leads</span>
                  <span className="text-2xl font-bold text-white font-mono">{metrics.total_leads}</span>
                </div>
                
                <ProgressBar 
                  label="Cracked / Converted Leads" 
                  value={metrics.cracked_leads} 
                  max={metrics.total_leads} 
                  colorClass="bg-rose-500" 
                />
                
                <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-amber-400 mr-2" />
                    <span className="text-xs font-mono text-zinc-300 uppercase">User Manual Leads</span>
                  </div>
                  <span className="text-lg font-bold text-white font-mono">{metrics.user_created_leads}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financials & Quotes */}
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col">
            <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center border-b border-zinc-800 pb-3 mb-4 font-bold">
              <BarChart className="w-4 h-4 mr-2 text-emerald-400" />
              Financial Matrix
            </h3>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <ProgressBar 
                  label="Quotes Generated" 
                  value={metrics.quotes_generated} 
                  max={Math.max(metrics.quotes_generated, 10)} 
                  colorClass="bg-zinc-400" 
                />
                <ProgressBar 
                  label="Quotes Accepted (Win Rate)" 
                  value={metrics.accepted_quotes} 
                  max={metrics.quotes_generated} 
                  colorClass="bg-emerald-500" 
                />
              </div>

              <div className="mt-5 bg-[#111118] border border-emerald-900/30 p-4 rounded-lg flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent" />
                <span className="text-xs font-mono text-zinc-400 uppercase mb-1 relative z-10 font-semibold">Total Pending Quote Value</span>
                <span className="text-2xl font-bold text-amber-400 font-mono relative z-10 drop-shadow-md">
                  ${metrics.pending_quotes_value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Projects & Clients */}
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col">
            <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center border-b border-zinc-800 pb-3 mb-4 font-bold">
              <Layers className="w-4 h-4 mr-2 text-purple-400" />
              Clients & Topology
            </h3>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded text-center">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Total Clients</div>
                    <div className="text-xl font-bold text-white font-mono">{metrics.total_clients}</div>
                  </div>
                  <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded text-center">
                    <div className="text-[10px] text-purple-400 font-mono uppercase mb-1">Active Projects</div>
                    <div className="text-xl font-bold text-purple-400 font-mono">{metrics.active_projects}</div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-zinc-400 font-mono uppercase mb-2 font-semibold">Dept-Wise Distribution</div>
                  <div className="space-y-2 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(metrics.department_projects).length === 0 ? (
                      <div className="text-xs text-zinc-600 font-mono italic">No department data isolated.</div>
                    ) : (
                      Object.entries(metrics.department_projects).map(([dept, count]) => {
                        const total = metrics.active_projects || 1;
                        const pct = Math.round(((count as number) / total) * 100);
                        return (
                          <div key={dept} className="flex flex-col">
                            <div className="flex justify-between items-center text-xs font-mono mb-1">
                              <span className="text-zinc-300">{dept}</span>
                              <span className="text-zinc-400">{count as number} <span className="text-[9px] text-zinc-600 ml-1">({pct}%)</span></span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden flex">
                              <div className="bg-zinc-500 h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Live Data Streams (Migrated from Telemetry) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Global Blocker Beacons */}
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff1744]" />
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="w-32 h-32 text-[#ff1744]" />
            </div>
            <div className="flex justify-between items-center mb-4 relative z-10 border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-mono text-[#ff1744] uppercase tracking-wider flex items-center font-bold">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Global Blocker Beacons
              </h3>
              <span className="bg-[#ff1744]/10 border border-[#ff1744]/30 text-[#ff1744] px-2 py-0.5 rounded text-[10px] font-mono font-bold animate-pulse">
                {data?.department_blockers?.length || 0} ACTIVE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar space-y-2 relative z-10">
              {data?.department_blockers && data.department_blockers.length > 0 ? (
                data.department_blockers.map((blocker: any) => (
                  <div key={blocker.task_id} className="bg-black border border-red-900/30 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-zinc-200">{blocker.title}</span>
                      <span className="text-[9px] text-[#ff1744] border border-[#ff1744]/20 px-1 rounded uppercase bg-[#ff1744]/5">Priority: {blocker.priority || 'HIGH'}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">{blocker.description || "System blocked. Require immediate unblocking."}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-600 font-mono italic flex items-center h-full justify-center">
                  No active blocker beacons detected. System nominal.
                </div>
              )}
            </div>
          </div>

          {/* Live Lead Ingestion Feed */}
          <div className="bg-[#0f0f13] border border-zinc-800 rounded-lg p-5 flex flex-col relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <GitCommit className="w-32 h-32 text-emerald-400" />
            </div>
            <div className="flex justify-between items-center mb-4 relative z-10 border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center font-bold">
                <GitCommit className="w-4 h-4 mr-2 text-emerald-400" />
                Live Lead Ingestion
              </h3>
              <span className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1.5" />
                STREAM ONLINE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar space-y-2 relative z-10">
              {leads.length === 0 ? (
                <div className="text-xs text-zinc-600 font-mono text-center py-4 italic flex items-center h-full justify-center">No leads detected in current cycle.</div>
              ) : (
                leads.slice(0, 10).map((lead, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded bg-black border border-zinc-800/50">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        lead.source.includes('Upwork') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {lead.source}
                      </div>
                      <span className="text-xs text-zinc-300 font-mono truncate max-w-[150px]">{lead.lead_id}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
