"use client";

import React, { useState, useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { Clock, Check, Calendar, Activity, ClipboardList, User } from "lucide-react";

export default function DailyLoggingPage() {
  const {
    userProfile,
    simulatedUser,
    dashboardData,
    fetchDashboardOverview,
    submitWorkLog,
    allUsers,
    fetchAllUsers,
    customLogs,
    fetchCustomLogs,
    submitCustomLog
  } = useSevenStore();

  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [hours, setHours] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState("all");

  const [activeArchiveTab, setActiveArchiveTab] = useState<"time" | "custom">("time");

  // Custom Log States
  const [customLogContent, setCustomLogContent] = useState("");
  const [isSubmittingCustomLog, setIsSubmittingCustomLog] = useState(false);
  const [customLogSuccess, setCustomLogSuccess] = useState(false);

  const activeUser = simulatedUser || userProfile;
  const tasks = dashboardData?.assigned_tasks || [];

  const fetchLogs = async () => {
    const token = localStorage.getItem("seven_token");
    try {
      const simulatedUser = useSevenStore.getState().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/worklogs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/worklogs";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkLogs(data);
      }
    } catch (err) {
      console.error("Failed to load worklogs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchDashboardOverview();
    fetchLogs();
    fetchCustomLogs();
    fetchAllUsers();
  }, [simulatedUser, fetchCustomLogs]);

  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].task_id);
    }
  }, [tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || hours <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    const ok = await submitWorkLog(selectedTaskId, hours, description);
    setIsSubmitting(false);

    if (ok) {
      setLogSuccess(true);
      setDescription("");
      setHours(1);
      fetchLogs(); // Reload logs list
      setTimeout(() => setLogSuccess(false), 2000);
    }
  };

  const handleCustomLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLogContent.trim() || isSubmittingCustomLog) return;

    setIsSubmittingCustomLog(true);
    const ok = await submitCustomLog(customLogContent);
    setIsSubmittingCustomLog(false);

    if (ok) {
      setCustomLogSuccess(true);
      setCustomLogContent("");
      fetchCustomLogs(); // Reload custom logs
      setTimeout(() => setCustomLogSuccess(false), 2000);
    }
  };

  const isCEO = activeUser?.role_tier === 1;

  // Filter logs with case-insensitive robust string checks
  const filteredLogs = workLogs.filter((log) => {
    if (isCEO) {
      if (selectedUserFilter === "all") return true;
      return String(log.user_id).trim().toLowerCase() === String(selectedUserFilter).trim().toLowerCase();
    }
    return String(log.user_id).trim().toLowerCase() === String(activeUser?.user_id).trim().toLowerCase();
  });

  const filteredCustomLogs = customLogs.filter((log) => {
    if (isCEO) {
      if (selectedUserFilter === "all") return true;
      return String(log.user_id).trim().toLowerCase() === String(selectedUserFilter).trim().toLowerCase();
    }
    return String(log.user_id).trim().toLowerCase() === String(activeUser?.user_id).trim().toLowerCase();
  });

  const getUserName = (userId: string) => {
    const u = allUsers.find(x => x.user_id === userId);
    return u ? u.full_name : `User #${userId.substring(0, 5)}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">WORK HOURS TRACKER</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">
            {isCEO ? "EMPLOYEE DAILY CHECKUP OPTIONS" : "DAILY LOGGING SHEET"}
          </h1>
        </div>
        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-[10px] font-mono flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="text-zinc-400">TOTAL LOGS:</span>
          <span className="text-emerald-400 font-bold">
            {activeArchiveTab === "time" ? filteredLogs.length : filteredCustomLogs.length} ENTRIES
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1 flex-1">
        
        {/* Left Column: Logging Form (Hidden for CEO since they only audit) */}
        {!isCEO ? (
          <div className="lg:col-span-1 space-y-6 flex flex-col h-fit">
            
            {/* Time Log Form */}
            <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 space-y-4 flex flex-col">
              <h2 className="text-xs font-bold font-mono tracking-[0.15em] text-white uppercase border-b border-zinc-800 pb-3 flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-[#00E5FF]" />
                <span>SUBMIT TIME LOG</span>
              </h2>

              {tasks.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-zinc-550 bg-zinc-950/60 rounded border border-zinc-900">
                  No tasks currently assigned to your node. You must have an active task assignment to log hours.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-555 uppercase">Select Assigned Task</label>
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
                      required
                    >
                      {tasks.map((task) => (
                        <option key={task.task_id} value={task.task_id}>
                          {task.title} ({task.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-555 uppercase">Hours Spent</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      required
                      value={hours}
                      onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-555 uppercase">Log Entry Description</label>
                    <textarea
                      placeholder="Summarize the work executed in this session..."
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 rounded-lg border text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center space-x-2 ${
                      logSuccess
                        ? "bg-emerald-950/20 border-emerald-500 text-emerald-400"
                        : "bg-[#00E5FF]/10 border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 text-[#00E5FF] hover:border-[#00E5FF]/40 cursor-pointer"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">RECORDING ENTRY...</span>
                    ) : logSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>LOG SUCCESSFUL</span>
                      </>
                    ) : (
                      <span>SUBMIT LOG ENTRY</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Custom Log Form */}
            <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 space-y-4 flex flex-col">
              <h2 className="text-xs font-bold font-mono tracking-[0.15em] text-white uppercase border-b border-zinc-800 pb-3 flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-[#00E5FF]" />
                <span>SUBMIT CUSTOM LOG</span>
              </h2>

              <form onSubmit={handleCustomLogSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-555 uppercase">Log Entry Text / Note</label>
                  <textarea
                    placeholder="Enter your custom log entry details..."
                    required
                    value={customLogContent}
                    onChange={(e) => setCustomLogContent(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCustomLog}
                  className={`w-full py-2.5 rounded-lg border text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center space-x-2 ${
                    customLogSuccess
                      ? "bg-emerald-950/20 border-emerald-500 text-emerald-400"
                      : "bg-[#00E5FF]/10 border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 text-[#00E5FF] hover:border-[#00E5FF]/40 cursor-pointer"
                  }`}
                >
                  {isSubmittingCustomLog ? (
                    <span className="animate-pulse">RECORDING LOG...</span>
                  ) : customLogSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>LOG RECORDED</span>
                    </>
                  ) : (
                    <span>SUBMIT CUSTOM LOG</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* CEO Audit Filter Panel */
          <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 space-y-4 flex flex-col h-fit">
            <h2 className="text-xs font-bold font-mono tracking-[0.15em] text-white uppercase border-b border-zinc-800 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-[#00E5FF]" />
              <span>ROSTER FILTER</span>
            </h2>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-555 uppercase">Filter by Employee</label>
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
              >
                <option value="all">Show All Employees</option>
                {allUsers.map((u: any) => (
                  <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.department || "No Dept"})</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] font-mono text-zinc-550 leading-relaxed pt-2">
              Auditing all user timeline logs and time logs submitted against workspace tasks.
            </p>
          </div>
        )}

        {/* Right Column: Historical Logs Sheet */}
        <div className="lg:col-span-2 bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex space-x-6 font-mono text-[11px]">
              <button
                onClick={() => setActiveArchiveTab("time")}
                className={`pb-1 transition-all ${
                  activeArchiveTab === "time"
                    ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                TIME LOG ARCHIVES
              </button>
              <button
                onClick={() => setActiveArchiveTab("custom")}
                className={`pb-1 transition-all ${
                  activeArchiveTab === "custom"
                    ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                CUSTOM LOG ARCHIVES
              </button>
            </div>
            <span className="text-[10px] font-mono text-zinc-555">{isCEO ? "ALL EMPLOYEES" : "LOGGED BY SIMULATED USER"}</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loadingLogs ? (
              <div className="py-12 text-center text-xs font-mono text-zinc-650 animate-pulse">
                Accessing logging logs registry...
              </div>
            ) : activeArchiveTab === "time" ? (
              filteredLogs.length === 0 ? (
                <div className="py-20 text-center text-xs font-mono text-zinc-650">
                  No hours logged matching selected filters.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase">
                      {isCEO && <th className="pb-2.5 font-normal">Employee Name</th>}
                      <th className="pb-2.5 font-normal">Task Reference</th>
                      <th className="pb-2.5 font-normal">Description</th>
                      <th className="pb-2.5 font-normal text-right">Hours</th>
                      <th className="pb-2.5 font-normal text-right">Logged Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-350">
                    {filteredLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-zinc-950/40 transition-colors">
                        {isCEO && (
                          <td className="py-3 font-bold text-white truncate max-w-[120px]">
                            {getUserName(log.user_id)}
                          </td>
                        )}
                        <td className="py-3 font-semibold text-zinc-300 max-w-[150px] truncate">
                          {log.task_title || `Task #${log.task_id?.substring(0, 5)}`}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 break-words max-w-[200px]">
                          {log.description}
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-bold">
                          {log.hours_spent} hrs
                        </td>
                        <td className="py-3 text-right text-zinc-550 text-[10px] whitespace-nowrap">
                          {new Date(log.date_logged || Date.now()).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              filteredCustomLogs.length === 0 ? (
                <div className="py-20 text-center text-xs font-mono text-zinc-650">
                  No custom log entries recorded matching filters.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase">
                      {isCEO && <th className="pb-2.5 font-normal">Employee Name</th>}
                      <th className="pb-2.5 font-normal">Log Message</th>
                      <th className="pb-2.5 font-normal text-right">Logged Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-350">
                    {filteredCustomLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-zinc-950/40 transition-colors">
                        {isCEO && (
                          <td className="py-3 font-bold text-white truncate max-w-[120px]">
                            {getUserName(log.user_id)}
                          </td>
                        )}
                        <td className="py-3 pr-4 text-zinc-300 break-words whitespace-pre-wrap max-w-[350px]">
                          {log.log_content}
                        </td>
                        <td className="py-3 text-right text-zinc-550 text-[10px] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
