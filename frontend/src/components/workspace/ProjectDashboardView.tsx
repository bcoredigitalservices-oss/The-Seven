"use client";

import React, { useState, useEffect } from "react";
import { Project, useSevenStore } from "@/store/useSevenStore";
import { 
  FolderKanban, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  X,
  Play,
  ArrowRight,
  TrendingUp,
  Layout,
  Briefcase
} from "lucide-react";

interface ProjectDashboardViewProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDashboardView({ project, onClose }: ProjectDashboardViewProps) {
  const { updateProject, userProfile, simulatedUser } = useSevenStore();
  const activeUser = simulatedUser || userProfile;

  // CEO has role_tier === 1. Only CEO can toggle and enter Builder Mode.
  const isCEO = activeUser ? activeUser.role_tier === 1 : false;
  const [isBuilderMode, setIsBuilderMode] = useState(false);

  // Edit permissions are active ONLY when the CEO has explicitly enabled Builder Mode.
  const canEdit = isCEO && isBuilderMode;

  // Default Pipeline Initialization
  const defaultPipeline = [
    {
      id: "stage-1",
      name: "Scoping & Requirements",
      status: "In Progress",
      cards: [
        { id: "c-1", title: "Define Scope", desc: "Detail project deliverables", priority: "High" }
      ]
    },
    {
      id: "stage-2",
      name: "Architecture & Design",
      status: "Pending",
      cards: []
    },
    {
      id: "stage-3",
      name: "Core Development",
      status: "Pending",
      cards: []
    },
    {
      id: "stage-4",
      name: "QA & Testing",
      status: "Pending",
      cards: []
    },
    {
      id: "stage-5",
      name: "Deployment",
      status: "Pending",
      cards: []
    }
  ];

  // Default Timeline Initialization
  const defaultTimeline = [
    { id: "t-1", name: "Inception & Design", start: "2026-06-15", end: "2026-06-20", status: "Completed", progress: 100 },
    { id: "t-2", name: "Backend Core Build", start: "2026-06-21", end: "2026-06-30", status: "In Progress", progress: 50 },
    { id: "t-3", name: "Frontend Components", start: "2026-07-01", end: "2026-07-08", status: "Pending", progress: 0 },
    { id: "t-4", name: "System Integration & QA", start: "2026-07-09", end: "2026-07-15", status: "Pending", progress: 0 }
  ];

  const [pipeline, setPipeline] = useState<any[]>(project.pipeline || defaultPipeline);
  const [timeline, setTimeline] = useState<any[]>(project.timeline || defaultTimeline);

  // Sync state if project changes via websocket
  useEffect(() => {
    if (project.pipeline) setPipeline(project.pipeline);
    if (project.timeline) setTimeline(project.timeline);
  }, [project]);

  // Save changes helper
  const persistChanges = async (newPipeline: any[], newTimeline: any[]) => {
    await updateProject(project.project_id, {
      pipeline: newPipeline,
      timeline: newTimeline
    });
  };

  // Pipeline Builders
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardPriority, setNewCardPriority] = useState("Medium");
  const [selectedStageId, setSelectedStageId] = useState("stage-1");

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const newCard = {
      id: `c-${Date.now()}`,
      title: newCardTitle.trim(),
      desc: newCardDesc.trim(),
      priority: newCardPriority
    };

    const updatedPipeline = pipeline.map(stage => {
      if (stage.id === selectedStageId) {
        return { ...stage, cards: [...stage.cards, newCard] };
      }
      return stage;
    });

    setPipeline(updatedPipeline);
    setNewCardTitle("");
    setNewCardDesc("");
    setNewCardPriority("Medium");
    await persistChanges(updatedPipeline, timeline);
  };

  const handleMoveCard = async (cardId: string, fromStageId: string, direction: "left" | "right") => {
    const fromStageIndex = pipeline.findIndex(s => s.id === fromStageId);
    if (fromStageIndex === -1) return;

    const targetStageIndex = direction === "left" ? fromStageIndex - 1 : fromStageIndex + 1;
    if (targetStageIndex < 0 || targetStageIndex >= pipeline.length) return;

    const cardToMove = pipeline[fromStageIndex].cards.find((c: any) => c.id === cardId);
    if (!cardToMove) return;

    const updatedPipeline = pipeline.map((stage, idx) => {
      if (idx === fromStageIndex) {
        return { ...stage, cards: stage.cards.filter((c: any) => c.id !== cardId) };
      }
      if (idx === targetStageIndex) {
        return { ...stage, cards: [...stage.cards, cardToMove] };
      }
      return stage;
    });

    setPipeline(updatedPipeline);
    await persistChanges(updatedPipeline, timeline);
  };

  const handleDeleteCard = async (cardId: string, stageId: string) => {
    const updatedPipeline = pipeline.map(stage => {
      if (stage.id === stageId) {
        return { ...stage, cards: stage.cards.filter((c: any) => c.id !== cardId) };
      }
      return stage;
    });

    setPipeline(updatedPipeline);
    await persistChanges(updatedPipeline, timeline);
  };

  const handleUpdateStageStatus = async (stageId: string, newStatus: string) => {
    const updatedPipeline = pipeline.map(stage => {
      if (stage.id === stageId) {
        return { ...stage, status: newStatus };
      }
      return stage;
    });

    setPipeline(updatedPipeline);
    await persistChanges(updatedPipeline, timeline);
  };

  // Timeline Builders
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneStart, setNewMilestoneStart] = useState("");
  const [newMilestoneEnd, setNewMilestoneEnd] = useState("");
  const [newMilestoneProgress, setNewMilestoneProgress] = useState(0);
  const [newMilestoneStatus, setNewMilestoneStatus] = useState("Pending");

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;

    const newMilestone = {
      id: `t-${Date.now()}`,
      name: newMilestoneName.trim(),
      start: newMilestoneStart || new Date().toISOString().split('T')[0],
      end: newMilestoneEnd || new Date().toISOString().split('T')[0],
      status: newMilestoneStatus,
      progress: Number(newMilestoneProgress)
    };

    const updatedTimeline = [...timeline, newMilestone];
    setTimeline(updatedTimeline);
    setNewMilestoneName("");
    setNewMilestoneStart("");
    setNewMilestoneEnd("");
    setNewMilestoneProgress(0);
    setNewMilestoneStatus("Pending");
    await persistChanges(pipeline, updatedTimeline);
  };

  const handleUpdateMilestone = async (id: string, fields: any) => {
    const updatedTimeline = timeline.map(item => {
      if (item.id === id) {
        return { ...item, ...fields };
      }
      return item;
    });

    setTimeline(updatedTimeline);
    await persistChanges(pipeline, updatedTimeline);
  };

  const handleDeleteMilestone = async (id: string) => {
    const updatedTimeline = timeline.filter(item => item.id !== id);
    setTimeline(updatedTimeline);
    await persistChanges(pipeline, updatedTimeline);
  };

  // Stats for project overall progress
  const getOverallProgress = () => {
    if (timeline.length === 0) return 0;
    const sum = timeline.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    return Math.round(sum / timeline.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#08080c] border border-zinc-850 rounded-xl w-full max-w-7xl flex flex-col h-[90vh] shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden font-mono">
        
        {/* Header section */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 p-5 bg-[#0a0a10]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-[#00E5FF] animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">PROJECT TELEMETRY DASHBOARD</div>
              <h2 className="text-lg font-bold text-white tracking-wider uppercase mt-0.5">{project.title}</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* CEO Mode Toggle Button */}
            {isCEO && (
              <button
                onClick={() => setIsBuilderMode(!isBuilderMode)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all uppercase flex items-center space-x-1.5 ${
                  isBuilderMode
                    ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                    : "bg-[#00E5FF]/10 border-[#00E5FF]/35 text-[#00E5FF] hover:bg-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                }`}
              >
                {isBuilderMode ? (
                  <>
                    <FolderKanban className="w-3 h-3" />
                    <span>View Dashboard</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>Build Dashboard</span>
                  </>
                )}
              </button>
            )}

            {/* View Mode Tag */}
            <div className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase ${
              canEdit 
                ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.05)]" 
                : "border-cyan-500/20 text-cyan-400 bg-cyan-500/5 shadow-[0_0_10px_rgba(0,229,255,0.05)]"
            }`}>
              {canEdit ? "⚙️ BUILDER MODE" : "👁️ VIEW ONLY MODE"}
            </div>

            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-850 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Layout Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950/40 p-4 rounded-lg border border-zinc-850/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3 border-r border-zinc-850/50 pr-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Overall Progress</div>
                <div className="text-sm font-bold text-zinc-200 mt-0.5">{getOverallProgress()}%</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 border-r border-zinc-850/50 px-4">
              <Briefcase className="w-4 h-4 text-[#00E5FF]" />
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Department</div>
                <div className="text-sm font-bold text-zinc-200 mt-0.5 uppercase">{project.department?.replace("_", " ") || "IT & SAAS"}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 border-r border-zinc-850/50 px-4">
              <Calendar className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Deadline</div>
                <div className="text-sm font-bold text-zinc-200 mt-0.5">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 pl-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Status</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 uppercase">{project.status}</div>
              </div>
            </div>
          </div>

          {/* SECTION 1: Pipeline Builder/Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <h3 className="text-xs font-bold text-[#00E5FF] uppercase tracking-widest flex items-center">
                <Layout className="w-4 h-4 mr-2" /> Project Development Pipeline
              </h3>
              <p className="text-[10px] text-zinc-500">Real-time status tracking & workflow configuration</p>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pipeline.map((stage) => (
                <div key={stage.id} className="bg-[#0b0b10] border border-zinc-850 rounded-lg p-3 flex flex-col min-h-[300px] space-y-3">
                  {/* Column Header */}
                  <div className="border-b border-zinc-900 pb-2 flex flex-col space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-zinc-200 text-xs tracking-wider truncate max-w-[120px]">{stage.name}</span>
                      <span className="text-[9px] bg-zinc-900 text-zinc-550 px-1.5 py-0.5 rounded font-bold">{stage.cards?.length || 0}</span>
                    </div>
                    {canEdit ? (
                      <select
                        value={stage.status}
                        onChange={(e) => handleUpdateStageStatus(stage.id, e.target.value)}
                        className={`bg-[#050505] border text-[9px] px-1.5 py-0.5 rounded font-bold outline-none cursor-pointer mt-1 ${
                          stage.status === 'Completed' ? 'border-emerald-500/30 text-emerald-400' :
                          stage.status === 'In Progress' ? 'border-cyan-500/30 text-cyan-400' :
                          'border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
                        stage.status === 'Completed' ? 'text-emerald-400' :
                        stage.status === 'In Progress' ? 'text-cyan-400' :
                        'text-zinc-600'
                      }`}>
                        ● {stage.status}
                      </span>
                    )}
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {stage.cards?.length === 0 ? (
                      <div className="text-center py-8 text-[9px] text-zinc-700 italic border border-dashed border-zinc-900 rounded">
                        No Tasks
                      </div>
                    ) : (
                      stage.cards.map((card: any) => (
                        <div key={card.id} className="bg-zinc-950 border border-zinc-850 p-2.5 rounded hover:border-zinc-750 transition-all space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-zinc-200 font-bold text-[11px] leading-tight">{card.title}</span>
                            {canEdit && (
                              <button 
                                onClick={() => handleDeleteCard(card.id, stage.id)}
                                className="text-zinc-600 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          
                          {card.desc && <p className="text-[10px] text-zinc-500 leading-normal">{card.desc}</p>}
                          
                          <div className="flex justify-between items-center pt-1 border-t border-zinc-900/60 text-[8px] font-bold">
                            <span className={`px-1 rounded ${
                              card.priority === 'High' ? 'bg-rose-950/20 text-rose-400 border border-rose-500/20' :
                              card.priority === 'Medium' ? 'bg-amber-950/20 text-amber-400 border border-amber-500/20' :
                              'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            }`}>
                              {card.priority}
                            </span>
                            
                            {canEdit && (
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleMoveCard(card.id, stage.id, "left")}
                                  className="text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 p-0.5 rounded"
                                  title="Move Left"
                                >
                                  <ChevronLeft className="w-2.5 h-2.5" />
                                </button>
                                <button 
                                  onClick={() => handleMoveCard(card.id, stage.id, "right")}
                                  className="text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 p-0.5 rounded"
                                  title="Move Right"
                                >
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline Add Card Form (Only Builder) */}
            {canEdit && (
              <form onSubmit={handleAddCard} className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg flex flex-col md:flex-row items-end gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">New Task Title</label>
                  <input
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="e.g. Implement API route"
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Task Description</label>
                  <input
                    type="text"
                    value={newCardDesc}
                    onChange={(e) => setNewCardDesc(e.target.value)}
                    placeholder="e.g. Setup authentication middlewares"
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div className="w-32 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Priority</label>
                  <select
                    value={newCardPriority}
                    onChange={(e) => setNewCardPriority(e.target.value)}
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="w-48 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Target Stage</label>
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  >
                    {pipeline.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/35 text-[#00E5FF] px-4 py-1.5 rounded font-bold uppercase transition-colors flex items-center space-x-1.5 h-[34px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </form>
            )}
          </div>

          {/* SECTION 2: Timeline Builder/Gantt Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <h3 className="text-xs font-bold text-[#00E5FF] uppercase tracking-widest flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Project Development Timeline
              </h3>
              <p className="text-[10px] text-zinc-500">Milestone schedule & deliverables roadmap</p>
            </div>

            {/* Timeline Milestones Table / Gantt View */}
            <div className="bg-[#0b0b10] border border-zinc-850 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-500 border-b border-zinc-850 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Milestone Deliverable</th>
                      <th className="py-3 px-2">Start Date</th>
                      <th className="py-3 px-2">End Date</th>
                      <th className="py-3 px-4">Progress Roadmap</th>
                      <th className="py-3 px-2">Status</th>
                      {canEdit && <th className="py-3 px-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {timeline.length === 0 ? (
                      <tr>
                        <td colSpan={canEdit ? 6 : 5} className="text-center py-8 text-zinc-600 italic">
                          No timeline milestones configured yet.
                        </td>
                      </tr>
                    ) : (
                      timeline.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/10">
                          <td className="py-3 px-4 font-bold text-zinc-200">
                            {item.name}
                          </td>
                          <td className="py-3 px-2 text-zinc-400 font-mono">
                            {item.start}
                          </td>
                          <td className="py-3 px-2 text-zinc-400 font-mono">
                            {item.end}
                          </td>
                          <td className="py-3 px-4 min-w-[200px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] text-zinc-500 font-semibold">
                                <span>Completion</span>
                                <span>{item.progress}%</span>
                              </div>
                              {canEdit ? (
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={item.progress}
                                  onChange={(e) => handleUpdateMilestone(item.id, { progress: Number(e.target.value) })}
                                  className="w-full accent-[#00E5FF] cursor-pointer"
                                />
                              ) : (
                                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-[#00E5FF]"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {canEdit ? (
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateMilestone(item.id, { status: e.target.value })}
                                className={`bg-[#0c0c0c] border text-[10px] px-1.5 py-0.5 rounded font-bold outline-none cursor-pointer ${
                                  item.status === 'Completed' ? 'border-emerald-500/30 text-emerald-400' :
                                  item.status === 'In Progress' ? 'border-amber-500/30 text-amber-400' :
                                  'border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            ) : (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                                item.status === 'Completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                item.status === 'In Progress' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                                'border-zinc-800 text-zinc-500 bg-zinc-900/50'
                              }`}>
                                {item.status}
                              </span>
                            )}
                          </td>
                          {canEdit && (
                            <td className="py-3 px-4 text-right">
                              <button 
                                onClick={() => handleDeleteMilestone(item.id)}
                                className="text-zinc-600 hover:text-rose-400 p-1 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline Add Milestone Form (Only Builder) */}
            {canEdit && (
              <form onSubmit={handleAddMilestone} className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg flex flex-col md:flex-row items-end gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Milestone Title</label>
                  <input
                    type="text"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    placeholder="e.g. Phase 1 Release"
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div className="w-44 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Start Date</label>
                  <input
                    type="date"
                    value={newMilestoneStart}
                    onChange={(e) => setNewMilestoneStart(e.target.value)}
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div className="w-44 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">End Date/Deadline</label>
                  <input
                    type="date"
                    value={newMilestoneEnd}
                    onChange={(e) => setNewMilestoneEnd(e.target.value)}
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Roadmap Status</label>
                  <select
                    value={newMilestoneStatus}
                    onChange={(e) => setNewMilestoneStatus(e.target.value)}
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMilestoneProgress}
                    onChange={(e) => setNewMilestoneProgress(Number(e.target.value))}
                    className="w-full bg-[#08080c] border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/35 text-[#00E5FF] px-4 py-1.5 rounded font-bold uppercase transition-colors flex items-center space-x-1.5 h-[34px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Date</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
