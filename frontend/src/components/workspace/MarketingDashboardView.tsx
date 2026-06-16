"use client";

import React, { useState, useEffect } from "react";
import { Task, useSevenStore } from "@/store/useSevenStore";
import { Megaphone, TrendingUp, BarChart4, ClipboardList, Clock, Plus, Trash2, AlertCircle } from "lucide-react";
import WorkLogger from "./WorkLogger";
import { EmployeeTasksView, EmployeeNotificationsView, EmployeeCustomLogsView } from "./EmployeeCommonViews";

interface MarketingDashboardViewProps {
  assignedTasks: Task[];
}

export default function MarketingDashboardView({ assignedTasks }: MarketingDashboardViewProps) {
  const { simulatedUser, userProfile } = useSevenStore();
  const activeUser = simulatedUser || userProfile;

  const [activeSubTab, setActiveSubTab] = useState<"hub" | "tasks" | "notifications" | "custom-logs">("hub");
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    assignedTasks.length > 0 ? assignedTasks[0] : null
  );

  const [surveys, setSurveys] = useState<any[]>([]);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyProduct, setSurveyProduct] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isAuthorized = activeUser?.role_tier === 1 || 
    (activeUser?.department || "").toLowerCase().includes("marketing") || 
    (activeUser?.department || "").toLowerCase().includes("ads_agency") ||
    (activeUser?.department || "").toLowerCase().includes("promo");

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser
        ? `/api/v1/marketing/surveys?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/marketing/surveys";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.slice(0, 3)); // show top 3
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [simulatedUser]);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleCreateSurvey = async () => {
    if (!surveyTitle.trim()) return;
    setIsCreating(true);
    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser
        ? `/api/v1/marketing/surveys?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/marketing/surveys";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: surveyTitle,
          target_product: surveyProduct,
          questions: questions
        })
      });
      if (res.ok) {
        setSurveyTitle("");
        setSurveyProduct("");
        setQuestions([]);
        fetchSurveys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Mock Campaigns
  const campaigns = [
    { id: "1", name: "Nex-Core Growth Scraper Promo", reach: "18,450", conversion: "12.4%", status: "Active" },
    { id: "2", name: "Executive Secure DMs Launch", reach: "24,110", conversion: "15.8%", status: "Active" }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Welcome Header */}
      <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">MARKETING STRATEGY & ANALYTICS</h2>
          <p className="text-xs text-zinc-550 font-mono mt-0.5">MANAGE BRAND PROMOTIONS, SURVEYS, TREND ANALYSIS & CAMPAIGNS</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-855">
            <span className="text-zinc-555">CAMPAIGNS:</span>
            <span className="text-[#00E5FF] font-bold ml-1.5">2 ACTIVE</span>
          </div>
          <div className="bg-zinc-950 px-3 py-1.5 rounded border border-zinc-855">
            <span className="text-zinc-555">TASKS:</span>
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
              : "text-zinc-555 hover:text-white"
          }`}
        >
          MARKETING HUB
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
        <button
          onClick={() => setActiveSubTab("custom-logs")}
          className={`pb-1 transition-all ${
            activeSubTab === "custom-logs"
              ? "text-[#00E5FF] border-b border-[#00E5FF] font-bold"
              : "text-zinc-555 hover:text-white"
          }`}
        >
          DAILY CUSTOM LOGS
        </button>
      </div>

      {activeSubTab === "hub" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Campaigns List (1 column) */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-full">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-[#00E5FF]" />
                  <span>PROMOTIONS & CAMPAIGNS</span>
                </h3>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] custom-scrollbar">
                {campaigns.map(c => (
                  <div key={c.id} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg text-xs font-mono space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white truncate">{c.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded border bg-emerald-950/20 border-emerald-900/30 text-emerald-400">{c.status}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-550">
                      <span>Reach: {c.reach}</span>
                      <span>Conv: <strong className="text-emerald-400">{c.conversion}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Surveys & Builder (1 column) */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-full">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-[#00E5FF]" />
                  <span>SURVEY METRICS & CREATOR</span>
                </h3>
              </div>
              
              <div className="space-y-3 overflow-y-auto max-h-[220px] custom-scrollbar flex-1">
                {surveys.length === 0 ? (
                  <div className="text-center text-zinc-650 text-xs py-4">No surveys registered.</div>
                ) : (
                  surveys.map(s => (
                    <div key={s.survey_id} className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg text-xs font-mono space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white uppercase truncate max-w-[120px]">{s.title}</span>
                        <span className="text-pink-400 font-bold bg-pink-950/20 px-1 py-0.5 rounded text-[8px] border border-pink-900/35">
                          {s.target_product || "General"}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Questions: {s.questions?.length || 0} prompts
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mini In-Dashboard Creator */}
              <div className="border-t border-zinc-900 pt-3 space-y-2 font-mono text-[10px]">
                <span className="text-zinc-550 uppercase font-bold block">Quick Survey Creator</span>
                {!isAuthorized ? (
                  <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded text-zinc-655 text-[9px] flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                    <span>Read-only survey view</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Survey Title"
                      value={surveyTitle}
                      onChange={(e) => setSurveyTitle(e.target.value)}
                      className="w-full bg-black border border-zinc-900 rounded px-2 py-1 text-white text-[10px]"
                    />
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder="Product (e.g. CRM)"
                        value={surveyProduct}
                        onChange={(e) => setSurveyProduct(e.target.value)}
                        className="flex-1 bg-black border border-zinc-900 rounded px-2 py-1 text-white text-[10px]"
                      />
                      <button
                        disabled={isCreating || !surveyTitle.trim()}
                        onClick={handleCreateSurvey}
                        className="bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 px-2.5 py-1 rounded text-pink-400 font-bold cursor-pointer"
                      >
                        PUBLISH
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Marketing Task & Logger (1 column) */}
            <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-full">
              <div className="border-b border-zinc-850 pb-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#00E5FF]" />
                  <span>WORKTIME LOG SHEET</span>
                </h3>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-zinc-550 uppercase">Select assigned task:</label>
                  {assignedTasks.length > 0 ? (
                    <select
                      value={selectedTask?.task_id || ""}
                      onChange={(e) => {
                        const t = assignedTasks.find(x => x.task_id === e.target.value);
                        if (t) setSelectedTask(t);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]"
                    >
                      {assignedTasks.map(task => (
                        <option key={task.task_id} value={task.task_id}>{task.title}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg text-center text-xs font-mono text-zinc-650">
                      No marketing tasks assigned.
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

          {/* Trend Analysis Graph Panel */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3">
              <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
              <span>TREND CONVERSION ANALYSIS</span>
            </h3>
            
            <div className="h-32 flex items-end space-x-1.5 bg-black/40 border border-zinc-900 rounded p-3 pt-6">
              <div className="w-full bg-[#00E5FF]/5 border border-[#00E5FF]/20 h-[30%] rounded-t text-center text-[8px] font-mono text-zinc-500">W22</div>
              <div className="w-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 h-[45%] rounded-t text-center text-[8px] font-mono text-zinc-500">W23</div>
              <div className="w-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 h-[58%] rounded-t text-center text-[8px] font-mono text-zinc-500">W24</div>
              <div className="w-full bg-[#00E5FF]/20 border border-[#00E5FF]/50 h-[72%] rounded-t text-center text-[8px] font-mono text-zinc-500">W25</div>
              <div className="w-full bg-[#00E5FF]/30 border border-[#00E5FF]/70 h-[92%] rounded-t text-center text-[8px] font-mono text-pink-400">W26 (ACTIVE)</div>
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
