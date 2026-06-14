import { useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { BarChart3, Clock, Calendar, FileText, User } from "lucide-react";

export default function HRAnalyticsBoard() {
  const { workLogs, fetchWorkLogs } = useSevenStore();

  useEffect(() => {
    fetchWorkLogs();
  }, [fetchWorkLogs]);

  // Aggregate stats
  const totalHours = workLogs.reduce((acc, log) => acc + log.hours_spent, 0);
  const averageHours = workLogs.length > 0 ? (totalHours / workLogs.length).toFixed(1) : "0";

  return (
    <div className="flex flex-col bg-[#050505] p-6 rounded-lg border border-zinc-800 space-y-6">
      <header className="border-b border-zinc-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase flex items-center">
            <BarChart3 className="w-5 h-5 mr-3 text-[#00E5FF] animate-pulse" />
            Timesheet & Analytics Engine
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            RESOURCE UTILITY TELEMETRY & PRODUCTIVITY AUDIT
          </p>
        </div>
      </header>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-zinc-800 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Total Hours Tracked</span>
            <span className="text-2xl font-bold text-[#00E5FF] font-mono">{totalHours.toFixed(1)} hrs</span>
          </div>
          <Clock className="w-8 h-8 text-[#00E5FF]/20" />
        </div>
        <div className="bg-[#111] border border-zinc-800 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Average Log Length</span>
            <span className="text-2xl font-bold text-[#00E5FF] font-mono">{averageHours} hrs</span>
          </div>
          <FileText className="w-8 h-8 text-[#00E5FF]/20" />
        </div>
        <div className="bg-[#111] border border-zinc-800 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Total Log Entries</span>
            <span className="text-2xl font-bold text-[#00E5FF] font-mono">{workLogs.length} entries</span>
          </div>
          <Calendar className="w-8 h-8 text-[#00E5FF]/20" />
        </div>
      </div>

      {/* Recent Timesheet Logs */}
      <div className="bg-[#0b0b0e] border border-zinc-900 rounded p-4 flex flex-col">
        <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-4 border-b border-zinc-900 pb-2">
          REAL-TIME TELEMETRY LOG STREAM
        </h3>
        <div className="overflow-x-auto">
          {workLogs.length > 0 ? (
            <table className="w-full text-[11px] font-mono text-zinc-400 text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Resource ID</th>
                  <th className="py-2.5 px-3">Hours</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {workLogs.map((log) => (
                  <tr key={log.log_id} className="border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-all">
                    <td className="py-3 px-3 text-zinc-500">
                      {new Date(log.date_logged).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-300 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="truncate max-w-[120px]" title={log.user_id}>
                        {log.user_id}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#00E5FF] font-semibold">{log.hours_spent} hrs</td>
                    <td className="py-3 px-3 text-zinc-400 max-w-xs truncate" title={log.description || "N/A"}>
                      {log.description || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-zinc-600 font-mono uppercase tracking-widest text-[10px]">
              NO TELEMETRY DATA INGESTED FOR THIS INTERVAL
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
