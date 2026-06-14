"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Megaphone, ClipboardList, TrendingUp, BarChart4, Percent, RefreshCw, Plus, Trash2, CheckSquare, AlertCircle } from "lucide-react";
import { useSevenStore } from "@/store/useSevenStore";

export default function MarketingPage() {
  const { userProfile, simulatedUser } = useSevenStore();
  const [activeTab, setActiveTab] = useState<"campaigns" | "trends" | "surveys">("campaigns");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [surveys, setSurveys] = useState<any[]>([]);

  // Survey Form Builder State
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyProduct, setSurveyProduct] = useState("");
  const [surveyDesc, setSurveyDesc] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionsList, setQuestionsList] = useState<string[]>([]);
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const activeUser = simulatedUser || userProfile;

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
        setSurveys(data);
      }
    } catch (err) {
      console.error("Failed to fetch surveys", err);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [simulatedUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSurveys();
    setIsRefreshing(false);
  };

  const handleAddQuestion = () => {
    if (currentQuestion.trim() !== "") {
      setQuestionsList([...questionsList, currentQuestion.trim()]);
      setCurrentQuestion("");
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestionsList(questionsList.filter((_, i) => i !== index));
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyTitle.trim()) {
      setErrorMsg("Survey title is required.");
      return;
    }
    setErrorMsg("");
    setIsCreatingSurvey(true);

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
          description: surveyDesc,
          target_product: surveyProduct,
          questions: questionsList
        })
      });

      if (res.ok) {
        setSurveyTitle("");
        setSurveyProduct("");
        setSurveyDesc("");
        setQuestionsList([]);
        fetchSurveys();
      } else {
        const data = await res.json();
        setErrorMsg(data.detail || "Failed to publish survey.");
      }
    } catch (err) {
      setErrorMsg("Connection failure to telemetry layer.");
    } finally {
      setIsCreatingSurvey(false);
    }
  };

  const isAuthorized = activeUser?.role_tier === 1 || 
    (activeUser?.department || "").toLowerCase().includes("marketing") || 
    (activeUser?.department || "").toLowerCase().includes("ads_agency") ||
    (activeUser?.department || "").toLowerCase().includes("promo");

  // Mock Promotional Campaigns Data
  const campaigns = [
    { id: "1", name: "Q3 Nex-Core Growth Scraper Promotion", budget: "$4,500", reach: "18,450", conversion: "12.4%", status: "Active" },
    { id: "2", name: "Tier 1 Exec Executive Communication Outreach", budget: "$6,200", reach: "24,110", conversion: "15.8%", status: "Active" },
    { id: "3", name: "B-Core Nexus Landing Page A/B Testing", budget: "$1,800", reach: "9,540", conversion: "8.2%", status: "Completed" },
    { id: "4", name: "Enterprise Security Compliance PR Campaign", budget: "$8,500", reach: "42,300", conversion: "6.7%", status: "Planning" }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-pink-400 tracking-[0.2em] uppercase">MARKETING HUB & PROMOTIONS</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">BUSINESS GROWTH ANALYTICS</h1>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-pink-400" : ""}`} />
          <span>REFRESH SURVEY DATA</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0e0e0e]/95 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-pink-950/20 border border-pink-900/40 text-pink-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-550 uppercase">AVERAGE CONVERSION RATE</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">10.78%</p>
          </div>
        </div>

        <div className="bg-[#0e0e0e]/95 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-cyan-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-550 uppercase">TOTAL REACHED PROSPECTS</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">94,400</p>
          </div>
        </div>

        <div className="bg-[#0e0e0e]/95 border border-zinc-800/80 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-550 uppercase">CAMPAIGN ROI GAINS</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">+24.5%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex border-b border-zinc-900 bg-zinc-950/45 p-1">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === "campaigns"
                ? "bg-[#111111] text-pink-400 border border-pink-900/20 shadow-[0_0_8px_rgba(236,72,153,0.1)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>PROMOTIONAL CAMPAIGNS</span>
          </button>
          
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === "trends"
                ? "bg-[#111111] text-pink-400 border border-pink-900/20 shadow-[0_0_8px_rgba(236,72,153,0.1)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <BarChart4 className="w-3.5 h-3.5" />
            <span>TREND ANALYSIS</span>
          </button>

          <button
            onClick={() => setActiveTab("surveys")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === "surveys"
                ? "bg-[#111111] text-pink-400 border border-pink-900/20 shadow-[0_0_8px_rgba(236,72,153,0.1)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>PRODUCT SURVEYS & FORM BUILDER</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          {activeTab === "campaigns" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase border-b border-zinc-900 pb-2">
                <span>Campaign Name</span>
                <div className="flex space-x-12">
                  <span>Reach</span>
                  <span>Budget</span>
                  <span>Conversion</span>
                  <span>Status</span>
                </div>
              </div>
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div key={c.id} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-white">{c.name}</span>
                    <div className="flex items-center space-x-12 text-zinc-400 text-right min-w-[320px]">
                      <span className="w-16">{c.reach}</span>
                      <span className="w-16 text-zinc-500">{c.budget}</span>
                      <span className="w-16 text-emerald-400 font-bold">{c.conversion}</span>
                      <span className={`w-20 text-center text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                        c.status === 'Active' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' :
                        c.status === 'Completed' ? 'bg-zinc-900 border-zinc-800 text-zinc-500' :
                        'bg-amber-950/20 border-amber-900/30 text-amber-400'
                      }`}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-4">
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">MARKET SATURATION INDEX</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Internal and client products show a **+14.2%** week-over-week lift in search query impressions. 
                  Lead triage efficiency increased conversion velocity by approximately **1.8 days**.
                </p>
                <div className="h-24 flex items-end space-x-1 bg-black/40 border border-zinc-900 rounded p-2 pt-6">
                  <div className="w-full bg-pink-950/20 border border-pink-900/35 h-[30%] rounded-t text-center text-[8px] font-mono text-zinc-550">W22</div>
                  <div className="w-full bg-pink-950/30 border border-pink-900/40 h-[45%] rounded-t text-center text-[8px] font-mono text-zinc-550">W23</div>
                  <div className="w-full bg-pink-950/40 border border-pink-900/50 h-[58%] rounded-t text-center text-[8px] font-mono text-zinc-550">W24</div>
                  <div className="w-full bg-pink-950/60 border border-pink-800/60 h-[72%] rounded-t text-center text-[8px] font-mono text-zinc-500">W25</div>
                  <div className="w-full bg-pink-500/10 border border-pink-500/60 h-[92%] rounded-t text-center text-[8px] font-mono text-pink-400">W26 (PROJ)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "surveys" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Published Surveys (2/3 width) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-450 uppercase">
                  PUBLISHED PRODUCT SURVEYS ({surveys.length})
                </h3>
                {surveys.length === 0 ? (
                  <div className="p-8 bg-zinc-950/40 border border-zinc-900 rounded-xl text-center text-xs font-mono text-zinc-650">
                    No active product surveys registry. Use the builder to publish forms.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {surveys.map((s: any) => (
                      <div key={s.survey_id} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-lg space-y-3 text-xs font-mono">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="font-bold text-white uppercase">{s.title}</span>
                          <span className="text-pink-400 font-bold bg-pink-950/20 px-2 py-0.5 rounded border border-pink-900/35 uppercase text-[9px] tracking-wider">
                            Target: {s.target_product || "General"}
                          </span>
                        </div>
                        {s.description && (
                          <p className="text-zinc-450 text-[11px] leading-relaxed">{s.description}</p>
                        )}
                        {s.questions && s.questions.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[9px] text-zinc-550 uppercase font-bold">Survey Question Prompts:</span>
                            <ul className="space-y-1 pl-4 list-decimal text-[11px] text-zinc-350 font-sans">
                              {s.questions.map((q: string, idx: number) => (
                                <li key={idx} className="leading-relaxed">{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Survey Creator Form (1/3 width) */}
              <div className="lg:col-span-1 bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-4">
                <div className="border-b border-zinc-900 pb-2">
                  <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4 text-pink-400" />
                    <span>SURVEY FORM CREATOR</span>
                  </h3>
                </div>
                
                {!isAuthorized ? (
                  <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg text-center text-xs font-mono text-zinc-650 flex flex-col items-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-zinc-650" />
                    <span>READ-ONLY SURVEY ACCESS</span>
                    <p className="text-[10px] text-zinc-550 leading-relaxed pt-1">
                      Survey creation is restricted to Marketing Department staff and executive administrators.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateSurvey} className="space-y-3 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-550 uppercase">Survey Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nexus API Usability Feedback"
                        value={surveyTitle}
                        onChange={(e) => setSurveyTitle(e.target.value)}
                        className="w-full bg-black border border-zinc-850 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500/40 text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-555 uppercase">Target Product</label>
                      <input
                        type="text"
                        placeholder="e.g. Nexus CRM Console"
                        value={surveyProduct}
                        onChange={(e) => setSurveyProduct(e.target.value)}
                        className="w-full bg-black border border-zinc-850 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500/40 text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-550 uppercase">Description / Scope</label>
                      <textarea
                        placeholder="Scope of this market research survey..."
                        value={surveyDesc}
                        onChange={(e) => setSurveyDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-black border border-zinc-850 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500/40 text-[11px] resize-none"
                      />
                    </div>

                    {/* Question Builder */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] text-zinc-550 uppercase block">Add Question prompts</label>
                      <div className="flex space-x-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Rate UI responsiveness?"
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          className="flex-1 bg-black border border-zinc-850 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500/40 text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded hover:bg-zinc-800 text-pink-400 hover:text-pink-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Question List view */}
                      {questionsList.length > 0 && (
                        <div className="bg-black/50 border border-zinc-900 rounded p-2 max-h-[140px] overflow-y-auto custom-scrollbar space-y-1.5">
                          {questionsList.map((q, idx) => (
                            <div key={idx} className="flex justify-between items-start space-x-2 text-[10px]">
                              <span className="text-zinc-350 break-words flex-1">{idx + 1}. {q}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(idx)}
                                className="text-zinc-650 hover:text-[#ff1744] p-0.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {errorMsg && (
                      <p className="text-[10px] text-[#ff1744] font-bold mt-1.5">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isCreatingSurvey}
                      className="w-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 hover:border-pink-500/50 text-pink-400 font-bold py-2 rounded transition-all mt-2 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>{isCreatingSurvey ? "PUBLISHING..." : "PUBLISH SURVEY FORM"}</span>
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
