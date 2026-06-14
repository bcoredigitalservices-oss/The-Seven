"use client";

import React, { useEffect, useState } from "react";
import { useSevenStore, UserProfile } from "@/store/useSevenStore";
import { 
  Users, Activity, User, Briefcase, Star, Clock, 
  Target, TrendingUp, TrendingDown, ExternalLink, ShieldAlert,
  Search, X, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function GlobalUsersDashboard() {
  const { allUsers, fetchAllUsers, setSimulatedUser } = useSevenStore();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleOpenPersonnelDashboard = (user: UserProfile) => {
    setSimulatedUser(user);
    router.push("/workspace");
  };

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = allUsers.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayRole = (user: UserProfile) => {
    if (user.role_tier === 1) return "CEO / SYSTEM ADMIN";
    if (user.role_tier === 2) return "DEPARTMENT LEAD";
    return user.functional_role || user.user_type || "EMPLOYEE";
  };

  const getDisplayDept = (user: UserProfile) => {
    if (user.role_tier === 1 && !user.department) return "GLOBAL EXECUTIVE";
    return user.department || "UNASSIGNED";
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 rounded-xl border border-zinc-800 shadow-xl space-y-6">
      
      <header className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase flex items-center shadow-black drop-shadow-md">
            <Users className="w-7 h-7 mr-3 text-[#00E5FF]" />
            Global Users Dashboard
          </h2>
          <p className="text-sm text-zinc-400 font-mono mt-2">
            ORGANIZATIONAL IDENTITY & PERFORMANCE TRACKING
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-[#111] border border-zinc-800 px-3 py-2 rounded-lg w-full md:w-64 focus-within:border-[#00e5ff] transition-colors">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-zinc-200 outline-none font-mono text-xs w-full placeholder:text-zinc-600"
          />
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-[500px]">
        
        {/* User List Panel */}
        <div className={`flex flex-col bg-[#0b0b0e] border border-zinc-900 rounded-lg overflow-hidden transition-all duration-300 ${selectedUser ? "w-full lg:w-1/3 hidden lg:flex" : "w-full lg:w-1/3"}`}>
          <div className="bg-[#111] px-4 py-3 border-b border-zinc-900 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Operator Directory</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono">{filteredUsers.length} ONLINE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-zinc-500 font-mono text-xs text-center py-10">No operators found.</div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.user_id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    selectedUser?.user_id === user.user_id 
                      ? "bg-[#00e5ff]/10 border-[#00e5ff]/30 border-l-4 border-l-[#00e5ff]" 
                      : "bg-[#111] border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center relative">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#09090b] ${
                          user.current_status === 'Active' ? 'bg-emerald-400' :
                          user.current_status === 'Deep Work' ? 'bg-[#00e5ff]' :
                          user.current_status === 'Blocked' ? 'bg-[#ff1744]' : 'bg-zinc-500'
                        }`} />
                      </div>
                      <div>
                        <div className={`font-bold font-mono text-sm ${selectedUser?.user_id === user.user_id ? "text-white" : "text-zinc-200"}`}>
                          {user.full_name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">{getDisplayDept(user)}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Details Panel */}
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div 
              key={selectedUser.user_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 bg-[#0a0a0c] border border-zinc-800 rounded-lg overflow-hidden flex flex-col relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 bg-gradient-to-b from-[#111118] to-transparent relative overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                  <button onClick={() => setSelectedUser(null)} className="lg:hidden bg-zinc-800 p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-5 relative z-10">
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 border-2 border-[#00e5ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                    <User className="w-10 h-10 text-[#00e5ff]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white font-mono">{selectedUser.full_name}</h2>
                    <div className="flex items-center space-x-3 mt-2 font-mono text-xs">
                      <span className="text-zinc-400">{selectedUser.email}</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-[#00e5ff] uppercase tracking-widest bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/20">
                        {getDisplayRole(selectedUser)}
                      </span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {getDisplayDept(selectedUser)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenPersonnelDashboard(selectedUser)}
                    className="hidden lg:flex items-center space-x-2 bg-zinc-900 hover:bg-[#00e5ff]/10 border border-zinc-700 hover:border-[#00e5ff]/40 px-4 py-2 rounded text-xs font-mono text-white hover:text-[#00e5ff] transition-all group"
                  >
                    <span>Personnel Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#00e5ff] transition-colors" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {(() => {
                  // If actual data isn't supplied by backend, default to undefined rather than mock.
                  const stats: any = {
                    attendance: (selectedUser as any).attendance,
                    tasksCompleted: (selectedUser as any).tasks_completed,
                    missedTasks: (selectedUser as any).missed_tasks,
                    projectsInitiated: (selectedUser as any).projects_initiated,
                    initialPerformance: (selectedUser as any).initial_performance,
                    expectedPerformance: (selectedUser as any).expected_performance,
                    clientRating: (selectedUser as any).client_rating,
                    completionRatio: (selectedUser as any).completion_ratio,
                  };

                  const hasNoData = Object.values(stats).every(val => val === undefined || val === null);

                  if (hasNoData) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono py-20">
                        <Activity className="w-12 h-12 mb-4 text-zinc-700" />
                        <p className="text-sm tracking-widest">DATA NOT YET INITIATED</p>
                        <p className="text-[10px] mt-2">Awaiting telemetry sync for this operator.</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Macro Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase flex items-center"><CheckCircle className="w-3 h-3 mr-1 text-emerald-400"/> Task Completion</span>
                          <span className="text-2xl font-bold text-white font-mono mt-2">{stats.tasksCompleted ?? "-"}</span>
                        </div>
                        <div className="bg-[#0f0f13] border border-red-900/30 p-4 rounded-lg flex flex-col justify-between">
                          <span className="text-[10px] text-red-500 font-mono uppercase flex items-center"><ShieldAlert className="w-3 h-3 mr-1"/> Missed Tasks</span>
                          <span className="text-2xl font-bold text-red-500 font-mono mt-2">{stats.missedTasks ?? "-"}</span>
                        </div>
                        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase flex items-center"><Briefcase className="w-3 h-3 mr-1 text-purple-400"/> Projects Initiated</span>
                          <span className="text-2xl font-bold text-white font-mono mt-2">{stats.projectsInitiated ?? "-"}</span>
                        </div>
                        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase flex items-center"><Star className="w-3 h-3 mr-1 text-amber-400"/> Client Rating</span>
                          <div className="flex items-baseline mt-2">
                            <span className="text-2xl font-bold text-amber-400 font-mono">{stats.clientRating ?? "-"}</span>
                            <span className="text-xs text-zinc-600 font-mono ml-1">/ 5.0</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Trackers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0f0f13] border border-zinc-800 p-5 rounded-lg space-y-5">
                          <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-[#00e5ff]" />
                            Performance Diagnostics
                          </h3>
                          
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-mono text-zinc-400 uppercase">Initial Performance vs Expected</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold font-mono text-white">{stats.initialPerformance ?? "-"}%</span>
                                <span className="text-[10px] font-mono text-zinc-600">/ {stats.expectedPerformance ?? "-"}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden flex relative">
                              <div className="absolute top-0 bottom-0 border-l border-red-500 z-10" style={{ left: `${stats.expectedPerformance || 0}%` }} />
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${stats.initialPerformance || 0}%` }} transition={{ duration: 1 }}
                                className={`h-full ${stats.initialPerformance >= (stats.expectedPerformance || 0) ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-mono text-zinc-400 uppercase">Project Completion Ratio</span>
                              <span className="text-xs font-bold font-mono text-white">{stats.completionRatio ?? "-"}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden flex">
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${stats.completionRatio || 0}%` }} transition={{ duration: 1 }}
                                className="h-full bg-purple-500" 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-mono text-zinc-400 uppercase flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Attendance & Uptime
                              </span>
                              <span className="text-xs font-bold font-mono text-white">{stats.attendance ?? "-"}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden flex">
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${stats.attendance || 0}%` }} transition={{ duration: 1 }}
                                className="h-full bg-[#00e5ff]" 
                              />
                            </div>
                          </div>

                        </div>

                        {/* Recent Activity / Status (Placeholder) */}
                        <div className="bg-[#0f0f13] border border-zinc-800 p-5 rounded-lg flex flex-col">
                          <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-rose-400" />
                            Active Workflow Target
                          </h3>
                          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-4">
                            <div className={`p-4 rounded-full border-2 ${
                              selectedUser.current_status === 'Active' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' :
                              selectedUser.current_status === 'Deep Work' ? 'bg-[#00e5ff]/10 border-[#00e5ff]/50 text-[#00e5ff]' :
                              selectedUser.current_status === 'Blocked' ? 'bg-[#ff1744]/10 border-[#ff1744]/50 text-[#ff1744]' : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                            }`}>
                              {selectedUser.current_status === 'Blocked' ? <ShieldAlert className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-200 font-mono">Current Status: {selectedUser.current_status}</div>
                              <p className="text-xs text-zinc-500 font-mono mt-1">
                                {selectedUser.current_status === 'Blocked' 
                                  ? "Operator is currently halted. Intervention recommended."
                                  : "Operator is active and processing tasks optimally."}
                              </p>
                            </div>
                            <button className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-mono text-zinc-300 transition-colors">
                              View Full Telemetry Trace
                            </button>
                          </div>
                        </div>

                      </div>
                    </>
                  );
                })()}
                
              </div>
            </motion.div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center border border-zinc-800 border-dashed rounded-lg bg-[#0a0a0c]/50">
              <div className="text-center font-mono space-y-3">
                <Users className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-500 text-sm tracking-widest uppercase">Select the user<br/>to get the details</p>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
