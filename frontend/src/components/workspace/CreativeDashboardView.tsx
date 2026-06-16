"use client";

import React, { useState } from "react";
import { Task } from "@/store/useSevenStore";
import { Paintbrush, Image, Palette, CheckSquare, Clock, Copy, ExternalLink } from "lucide-react";
import WorkLogger from "./WorkLogger";
import { EmployeeTasksView, EmployeeNotificationsView, EmployeeCustomLogsView } from "./EmployeeCommonViews";

interface CreativeDashboardViewProps {
  assignedTasks: Task[];
}

export default function CreativeDashboardView({ assignedTasks }: CreativeDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"hub" | "tasks" | "notifications" | "custom-logs">("hub");
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    assignedTasks.length > 0 ? assignedTasks[0] : null
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Creative design tokens HSL
  const designTokens = [
    { name: "Cyan Core Neon", value: "hsl(185, 100%, 50%)", varName: "--color-cyan-core" },
    { name: "Executive Dark background", value: "hsl(0, 0%, 5%)", varName: "--color-background" },
    { name: "Amber Blocker Alert", value: "hsl(35, 100%, 50%)", varName: "--color-amber-alert" },
    { name: "Red Root Critical", value: "hsl(348, 100%, 54%)", varName: "--color-red-critical" }
  ];

  // Mock creative assets uploaded
  const mockAssets = [
    { id: "1", title: "B-Core Nexus UI Layout V2.png", size: "3.4 MB", type: "PNG Preview" },
    { id: "2", title: "Seven Workspace Design Tokens Spec.pdf", size: "1.8 MB", type: "Design Specs" },
    { id: "3", title: "Corporate Branding Guidelines.zip", size: "28.5 MB", type: "Branding Kit" }
  ];

  const handleCopyToken = (varName: string) => {
    navigator.clipboard.writeText(varName);
    setCopiedToken(varName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Welcome & Stats */}
      <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">CREATIVE DESIGN STUDIO</h2>
          <p className="text-xs text-zinc-550 font-mono mt-0.5">MANAGE BRAND GUIDELINES, INTERFACES, STYLESETS & CONTENT ASSETS</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-850">
            <span className="text-zinc-550">ASSET BLOCKS:</span>
            <span className="text-[#00E5FF] font-bold ml-1.5">{mockAssets.length} BUILT</span>
          </div>
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-850">
            <span className="text-zinc-550">DESIGN TASKS:</span>
            <span className="text-pink-400 font-bold ml-1.5">{assignedTasks.length} PENDING</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-zinc-855 space-x-6 font-mono text-[11px] pb-2">
        <button
          onClick={() => setActiveSubTab("hub")}
          className={`pb-1 transition-all ${
            activeSubTab === "hub"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-550 hover:text-white"
          }`}
        >
          STUDIO HUB
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Creative Tasks */}
            <div className="lg:col-span-2 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-855 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-[#00E5FF]" />
                  <span>DESIGN & ARTWORK TASKS</span>
                </h3>
                <span className="text-[10px] font-mono text-zinc-550">WORK MANAGEMENT</span>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {assignedTasks.length === 0 ? (
                  <div className="text-center py-12 text-xs font-mono text-zinc-650">No creative tasks currently assigned to your node.</div>
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
                            <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
                            <span className="text-xs font-bold text-white truncate">{task.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-450 leading-relaxed truncate max-w-lg">
                            {task.description || "No specific brief added."}
                          </p>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 ml-4 shrink-0">
                          {task.status}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Time Logging Control */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4 font-mono">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#00E5FF]" />
                  <span>TIME LOG CONTROL</span>
                </h3>
              </div>

              {selectedTask ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-lg space-y-2">
                    <span className="text-[9px] font-mono text-zinc-550 uppercase">Active Task selection:</span>
                    <h4 className="text-xs font-bold text-white font-mono">{selectedTask.title}</h4>
                    <p className="text-[10px] font-mono text-zinc-550 max-h-24 overflow-y-auto leading-relaxed">
                      {selectedTask.description || "No brief provided."}
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
                  Select a design task to log work hours.
                </div>
              )}
            </div>

          </div>

          {/* Brand style Swatches & Mockups Catalog Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Style Guide Swatches */}
            <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3">
                <Palette className="w-4 h-4 text-[#00E5FF]" />
                <span>BRAND STYLE SWATCHES</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {designTokens.map(token => (
                  <div key={token.name} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg flex items-center space-x-3 text-xs font-mono">
                    <div 
                      className="w-8 h-8 rounded border border-zinc-800 shrink-0" 
                      style={{ backgroundColor: token.value }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate text-[11px]">{token.name}</p>
                      <p className="text-[9px] text-zinc-550 uppercase font-mono mt-0.5 truncate">{token.value}</p>
                    </div>
                    <button
                      onClick={() => handleCopyToken(token.varName)}
                      className="p-1 hover:bg-zinc-900 rounded transition-colors text-zinc-550 hover:text-white"
                      title="Copy CSS Variable"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {copiedToken && (
                <p className="text-[9px] font-mono text-emerald-400 text-center uppercase tracking-wider">
                  Token &ldquo;{copiedToken}&rdquo; copied to clipboard!
                </p>
              )}
            </div>

            {/* Media Asset Preview Catalog */}
            <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3">
                <Image className="w-4 h-4 text-[#00E5FF]" />
                <span>CREATIVE DESIGN ASSETS</span>
              </h3>
              <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                {mockAssets.map(asset => (
                  <div key={asset.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg flex justify-between items-center text-xs font-mono">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white truncate text-[11px]">{asset.title}</span>
                      <span className="text-[9px] text-zinc-550 mt-0.5 uppercase">{asset.type} • {asset.size}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-555 hover:text-[#00E5FF] cursor-pointer shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
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
