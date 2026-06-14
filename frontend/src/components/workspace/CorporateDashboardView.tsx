"use client";

import React, { useState } from "react";
import { Task } from "@/store/useSevenStore";
import { Briefcase, Landmark, ClipboardCheck, PhoneCall, Users, Plus, Check } from "lucide-react";
import LeadTriageBoard from "./LeadTriageBoard";
import QuotationTrigger from "./QuotationTrigger";
import WorkLogger from "./WorkLogger";
import { EmployeeTasksView, EmployeeNotificationsView } from "./EmployeeCommonViews";

interface CorporateDashboardViewProps {
  assignedTasks: Task[];
}

export default function CorporateDashboardView({ assignedTasks }: CorporateDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"hub" | "tasks" | "notifications">("hub");
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    assignedTasks.length > 0 ? assignedTasks[0] : null
  );

  // Dynamic Proposal State
  const [proposalClient, setProposalClient] = useState("Acme Corp");
  const [proposalIndustry, setProposalIndustry] = useState("Tech/SaaS");
  const [proposalBudget, setProposalBudget] = useState("$25,000");
  const [proposalService, setProposalService] = useState("API Integration");

  // Mock Call Logs
  const callLogs = [
    { id: "1", client: "Acme Corp Ltd", caller: "John Doe", duration: "12m 45s", outcome: "Interested", date: "Today" },
    { id: "2", client: "Omega Solutions Inc", caller: "Alice Smith", duration: "5m 20s", outcome: "Rescheduled", date: "Yesterday" },
    { id: "3", client: "Delta Capital Group", caller: "Bob Johnson", duration: "18m 10s", outcome: "Closed Deal", date: "2 days ago" }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header Panel */}
      <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">CORPORATE OPERATIONS & CRM</h2>
          <p className="text-xs text-zinc-550 font-mono mt-0.5">SALES CONVERSIONS, CLIENT PROPOSALS, CRM LEAD MANAGEMENT & CALL LOGS</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-850">
            <span className="text-zinc-550">Active Leads:</span>
            <span className="text-[#00E5FF] font-bold ml-1.5">TRIAGE ACTIVE</span>
          </div>
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-850">
            <span className="text-zinc-550">Active Deals:</span>
            <span className="text-emerald-400 font-bold ml-1.5">3 SECURED</span>
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
              : "text-zinc-555 hover:text-white"
          }`}
        >
          CRM & SALES HUB
        </button>
        <button
          onClick={() => setActiveSubTab("tasks")}
          className={`pb-1 transition-all relative ${
            activeSubTab === "tasks"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-555 hover:text-white"
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
              : "text-zinc-555 hover:text-white"
          }`}
        >
          NOTIFICATIONS & EVENTS
        </button>
      </div>

      {activeSubTab === "hub" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Proposal / Quotation Trigger Tools (1 column) */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-full justify-between">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-[#00E5FF]" />
                  <span>PROPOSALS & QUOTATIONS</span>
                </h3>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-[11px] font-mono text-zinc-450 leading-relaxed">
                  Create and export professional corporate proposals and quotation PDFs dynamically.
                </p>
                <div className="space-y-2.5 font-mono text-[10px] bg-zinc-950/60 p-3.5 border border-zinc-900 rounded-lg">
                  <div className="flex flex-col space-y-1">
                    <span className="text-zinc-550 uppercase">Client Name:</span>
                    <input
                      type="text"
                      value={proposalClient}
                      onChange={(e) => setProposalClient(e.target.value)}
                      className="bg-black border border-zinc-850 rounded px-2 py-1 text-white text-[11px] outline-none focus:border-[#00E5FF]/40"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-zinc-550 uppercase">Service Type:</span>
                    <input
                      type="text"
                      value={proposalService}
                      onChange={(e) => setProposalService(e.target.value)}
                      className="bg-black border border-zinc-850 rounded px-2 py-1 text-white text-[11px] outline-none focus:border-[#00E5FF]/40"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-zinc-550 uppercase">Proposed Budget:</span>
                    <input
                      type="text"
                      value={proposalBudget}
                      onChange={(e) => setProposalBudget(e.target.value)}
                      className="bg-black border border-zinc-850 rounded px-2 py-1 text-white text-[11px] outline-none focus:border-[#00E5FF]/40"
                    />
                  </div>
                  <div className="pt-2 border-t border-zinc-900 flex justify-center">
                    <QuotationTrigger
                      clientName={proposalClient}
                      industry={proposalIndustry}
                      proposedBudget={proposalBudget}
                      serviceType={proposalService}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Call Log Registry (1 column) */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-full">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4 text-[#00E5FF]" />
                  <span>CALL LOG SHEET</span>
                </h3>
              </div>
              <div className="space-y-2.5 overflow-y-auto max-h-[220px] custom-scrollbar flex-1">
                {callLogs.map(log => (
                  <div key={log.id} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg text-xs font-mono space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white truncate max-w-[120px]">{log.client}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                        log.outcome === 'Closed Deal' ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400' :
                        log.outcome === 'Interested' ? 'bg-cyan-950/20 border-cyan-900/35 text-cyan-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-550'
                      }`}>{log.outcome}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-550">
                      <span>Rep: {log.caller} • {log.duration}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Tasks & Logging (1 column) */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-full">
              <div className="border-b border-zinc-850 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <ClipboardCheck className="w-4 h-4 text-[#00E5FF]" />
                  <span>SALES TASK LOGS</span>
                </h3>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-zinc-555 uppercase">Active Task Selection:</label>
                  {assignedTasks.length > 0 ? (
                    <select
                      value={selectedTask?.task_id || ""}
                      onChange={(e) => {
                        const t = assignedTasks.find(x => x.task_id === e.target.value);
                        if (t) setSelectedTask(t);
                      }}
                      className="w-full bg-zinc-955 border border-zinc-900 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]"
                    >
                      {assignedTasks.map(task => (
                        <option key={task.task_id} value={task.task_id}>{task.title}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg text-center text-xs font-mono text-zinc-650">
                      No tasks currently assigned to your node.
                    </div>
                  )}
                </div>

                {selectedTask && (
                  <div className="pt-2 border-t border-zinc-900">
                    <WorkLogger taskId={selectedTask.task_id} />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* CRM Lead Triage Pipeline Grid - Full Width */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col min-h-0 flex-1">
            <div className="border-b border-zinc-850 pb-3 mb-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#00E5FF]" />
                <span>CRM LEAD TRIAGE PIPELINE</span>
              </h3>
            </div>
            <div className="flex-1 min-h-[400px] overflow-y-auto pr-1">
              <LeadTriageBoard />
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

    </div>
  );
}
