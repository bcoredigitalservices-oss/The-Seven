"use client";

import React, { useState } from "react";
import { Task } from "@/store/useSevenStore";
import { Terminal, CheckSquare, Clock, ArrowRight, Activity, FolderKanban } from "lucide-react";
import WorkLogger from "./WorkLogger";
import { EmployeeTasksView, EmployeeNotificationsView, EmployeeCustomLogsView } from "./EmployeeCommonViews";

interface ITDashboardViewProps {
  assignedTasks: Task[];
}

export default function ITDashboardView({ assignedTasks }: ITDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"hub" | "tasks" | "notifications" | "custom-logs">("hub");
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    assignedTasks.length > 0 ? assignedTasks[0] : null
  );

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Welcome & Stats */}
      <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">IT OPERATIONS TERMINAL</h2>
          <p className="text-xs text-zinc-550 font-mono mt-0.5">MANAGE TECHNICAL INFRASTRUCTURE, TICKETS & SYSTEM INTEGRATIONS</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-850">
            <span className="text-zinc-550">ASSIGNED:</span>
            <span className="text-[#00E5FF] font-bold ml-1.5">{assignedTasks.length} TASKS</span>
          </div>
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-850">
            <span className="text-zinc-550">PENDING QA:</span>
            <span className="text-amber-400 font-bold ml-1.5">{assignedTasks.filter(t => t.status === "QA" || t.status === "Review").length}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-zinc-850 space-x-6 font-mono text-[11px] pb-2">
        <button
          onClick={() => setActiveSubTab("hub")}
          className={`pb-1 transition-all ${
            activeSubTab === "hub"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-550 hover:text-white"
          }`}
        >
          TERMINAL HUB
        </button>
        <button
          onClick={() => setActiveSubTab("tasks")}
          className={`pb-1 transition-all relative ${
            activeSubTab === "tasks"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-550 hover:text-white"
          }`}
        >
          TASK VIEW
          {assignedTasks.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-zinc-900 text-[#00E5FF] text-[9px] font-bold border border-zinc-800">
              {assignedTasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("notifications")}
          className={`pb-1 transition-all ${
            activeSubTab === "notifications"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-550 hover:text-white"
          }`}
        >
          NOTIFICATIONS & EVENTS
        </button>
        <button
          onClick={() => setActiveSubTab("custom-logs")}
          className={`pb-1 transition-all ${
            activeSubTab === "custom-logs"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-550 hover:text-white"
          }`}
        >
          DAILY CUSTOM LOGS
        </button>
      </div>

      {activeSubTab === "hub" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Task Backlog (2 columns) */}
          <div className="lg:col-span-2 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-[#00E5FF]" />
                <span>MY TECHNICAL TASKS</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-550">SELECT FOR WORK LOGGING</span>
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {assignedTasks.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-zinc-655">No tasks currently assigned to your node.</div>
              ) : (
                assignedTasks.map(task => {
                  const isSelected = selectedTask?.task_id === task.task_id;
                  return (
                    <button
                      key={task.task_id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left p-3.5 rounded-lg border font-mono transition-all flex items-start justify-between ${
                        isSelected 
                          ? "bg-[#151515] border-[#00E5FF]/20 text-[#00E5FF]"
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:bg-[#111] hover:text-white"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            task.status === 'Done' || task.status === 'Deployed' ? 'bg-emerald-400' :
                            task.status === 'In Progress' ? 'bg-[#00E5FF]' :
                            task.status === 'Blocked' ? 'bg-red-500' :
                            'bg-zinc-650'
                          }`} />
                          <span className="text-xs font-bold text-white truncate">{task.title}</span>
                        </div>
                        <p className="text-[11px] text-zinc-450 leading-relaxed truncate max-w-lg">
                          {task.description || "No detail specs added."}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-4 shrink-0">
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400">
                          {task.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Task Detail & Work Logger (1 column) */}
          <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
            <div className="border-b border-zinc-850 pb-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <span>TIME LOG CONTROL</span>
              </h3>
            </div>

            {selectedTask ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-lg space-y-2">
                  <span className="text-[9px] font-mono text-zinc-550 uppercase">Active Selection:</span>
                  <h4 className="text-xs font-bold text-white font-mono">{selectedTask.title}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 max-h-24 overflow-y-auto leading-relaxed">
                    {selectedTask.description || "No technical specs provided."}
                  </p>
                </div>

                {/* Logger Form */}
                <div className="pt-2">
                  <p className="text-[9px] font-mono text-zinc-550 uppercase mb-2">Record session hours:</p>
                  <WorkLogger taskId={selectedTask.task_id} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-12 text-xs font-mono text-zinc-650">
                Select a task from the backlog to log hours.
              </div>
            )}
          </div>

        </div>
      )}

      {activeSubTab === "tasks" && (
        <EmployeeTasksView assignedTasks={assignedTasks} />
      )}

      {activeSubTab === "notifications" && (
        <EmployeeNotificationsView />
      )}

      {activeSubTab === "custom-logs" && (
        <EmployeeCustomLogsView />
      )}

    </div>
  );
}
