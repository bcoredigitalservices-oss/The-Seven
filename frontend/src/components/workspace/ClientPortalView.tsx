"use client";

import React, { useState, useEffect, useRef } from "react";
import { Project, Task, useSevenStore } from "@/store/useSevenStore";
import { 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Circle, 
  LayoutDashboard, 
  Send, 
  ShieldCheck, 
  MessageSquare,
  Users,
  MessageSquarePlus,
  AlertCircle,
  Check,
  FileText,
  CheckCircle2
} from "lucide-react";
import { encryptMessage, decryptMessage } from "@/utils/crypto";
import ProjectDashboardView from "./ProjectDashboardView";

interface ClientPortalViewProps {
  activeProjects: Project[];
  projectTasks: Task[];
}

export default function ClientPortalView({ activeProjects, projectTasks }: ClientPortalViewProps) {
  const { fetchDashboardOverview, fetchTasks, fetchAllUsers, allUsers } = useSevenStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(
    activeProjects.length > 0 ? activeProjects[0] : null
  );

  // Fallback defaults for pipeline & timeline
  const defaultPipeline = [
    {
      id: "stage-1",
      name: "Scoping & Requirements",
      status: "In Progress",
      cards: [
        { id: "c-1", title: "Define Scope", desc: "Detail project deliverables", priority: "High", progress: 50 }
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

  const defaultTimeline = [
    { id: "t-1", name: "Inception & Design", start: "2026-06-15", end: "2026-06-20", status: "Completed", progress: 100 },
    { id: "t-2", name: "Backend Core Build", start: "2026-06-21", end: "2026-06-30", status: "In Progress", progress: 50 },
    { id: "t-3", name: "Frontend Components", start: "2026-07-01", end: "2026-07-08", status: "Pending", progress: 0 },
    { id: "t-4", name: "System Integration & QA", start: "2026-07-09", end: "2026-07-15", status: "Pending", progress: 0 }
  ];

  const getProjectPipeline = (proj: Project) => {
    if (proj.pipeline && proj.pipeline.length > 0) {
      return proj.pipeline;
    }
    return defaultPipeline;
  };

  const getProjectTimeline = (proj: Project) => {
    if (proj.timeline && proj.timeline.length > 0) {
      return proj.timeline;
    }
    return defaultTimeline;
  };

  // Sync selectedProject with props updating in real time
  useEffect(() => {
    if (activeProjects.length > 0) {
      const currentId = selectedProject?.project_id;
      const updated = activeProjects.find(p => p.project_id === currentId) || activeProjects[0];
      setSelectedProject(updated);
    } else {
      setSelectedProject(null);
    }
  }, [activeProjects]);

  // Fetch all users on mount
  useEffect(() => {
    if (allUsers.length === 0) {
      fetchAllUsers();
    }
  }, []);

  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [loadingWorkLogs, setLoadingWorkLogs] = useState(false);

  const fetchWorkLogs = async () => {
    if (!selectedProject) return;
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch("/api/v1/worklogs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch work logs", err);
    }
  };

  // Poll work logs when project is selected
  useEffect(() => {
    if (selectedProject) {
      setLoadingWorkLogs(true);
      fetchWorkLogs().finally(() => setLoadingWorkLogs(false));
      const interval = setInterval(fetchWorkLogs, 6000);
      return () => clearInterval(interval);
    } else {
      setWorkLogs([]);
    }
  }, [selectedProject]);
  
  const [showTelemetryReport, setShowTelemetryReport] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Remarks & Status Comments State
  const [remarks, setRemarks] = useState<any[]>([]);
  const [remarkInput, setRemarkInput] = useState("");
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [loadingRemarks, setLoadingRemarks] = useState(false);

  // Enquiry Form State
  const [enquiryTitle, setEnquiryTitle] = useState("");
  const [enquiryDesc, setEnquiryDesc] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const clientTasks = projectTasks.filter(t => t.status !== "Blocked");
  const activeProjTasks = selectedProject 
    ? clientTasks.filter(t => t.project_id === selectedProject.project_id)
    : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
      case "Deployed":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "In Progress":
      case "Review":
      case "QA":
        return <Clock className="w-5 h-5 text-cyan-400" />;
      case "Backlog":
      case "Assigned":
      default:
        return <Circle className="w-5 h-5 text-zinc-650" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Done":
      case "Deployed":
        return "Completed";
      case "In Progress":
      case "QA":
        return "In Progress";
      case "Review":
        return "In Review";
      case "Backlog":
      case "Assigned":
      default:
        return "In Queue";
    }
  };

  const getOverallProgress = () => {
    if (!selectedProject) return 0;
    let totalElements = 0;
    let progressSum = 0;

    const pipeline = getProjectPipeline(selectedProject);
    const timeline = getProjectTimeline(selectedProject);

    // Add pipeline cards progress
    pipeline.forEach((stage: any) => {
      if (stage.cards) {
        stage.cards.forEach((card: any) => {
          progressSum += (card.progress !== undefined ? card.progress : (card.status === 'Completed' ? 100 : card.status === 'In Progress' ? 50 : 0));
          totalElements++;
        });
      }
    });

    // Add timeline milestones progress
    timeline.forEach((item: any) => {
      progressSum += (item.progress || 0);
      totalElements++;
    });

    if (totalElements === 0) return 0;
    return Math.round(progressSum / totalElements);
  };

  // Group Secret Key for E2E
  const getGroupSecretKey = (groupId: string) => {
    return `group-secret-${groupId}`;
  };

  // Fetch group messages for the selected project
  const fetchGroupMessages = async () => {
    if (!selectedProject || !selectedProject.assigned_group_id) {
      setChatMessages([]);
      return;
    }
    const token = localStorage.getItem("seven_token");
    const groupId = selectedProject.assigned_group_id;
    try {
      const res = await fetch(`/api/v1/communication/groups/${groupId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error("Failed to load project group chat", err);
    }
  };

  const fetchRemarks = async () => {
    if (!selectedProject) {
      setRemarks([]);
      return;
    }
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch(`/api/v1/projects/${selectedProject.project_id}/remarks`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRemarks(data);
      }
    } catch (err) {
      console.error("Failed to fetch project remarks", err);
    }
  };

  const handlePostRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkInput.trim() || !selectedProject || isSubmittingRemark) return;

    setIsSubmittingRemark(true);
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch(`/api/v1/projects/${selectedProject.project_id}/remarks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: remarkInput
        })
      });

      if (res.ok) {
        const newRemark = await res.json();
        setRemarks(prev => [...prev, newRemark]);
        setRemarkInput("");
        fetchDashboardOverview();
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to post remark", err);
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handlePostEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryTitle.trim() || !selectedProject || isSubmittingEnquiry) return;

    setIsSubmittingEnquiry(true);
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `[Client Enquiry] ${enquiryTitle}`,
          description: enquiryDesc,
          status: "Backlog",
          project_id: selectedProject.project_id
        })
      });

      if (res.ok) {
        setEnquiryTitle("");
        setEnquiryDesc("");
        setEnquirySuccess(true);
        setTimeout(() => setEnquirySuccess(false), 4000);
        fetchDashboardOverview();
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to post enquiry", err);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (selectedProject) {
      setLoadingChat(true);
      setLoadingRemarks(true);
      fetchGroupMessages().finally(() => setLoadingChat(false));
      fetchRemarks().finally(() => setLoadingRemarks(false));
    }
  }, [selectedProject]);

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGroupMessages();
      fetchRemarks();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedProject || !selectedProject.assigned_group_id || isSending) return;

    setIsSending(true);
    const token = localStorage.getItem("seven_token");
    const groupId = selectedProject.assigned_group_id;
    const secretKey = getGroupSecretKey(groupId);
    const encrypted = encryptMessage(chatInput, secretKey);

    try {
      const res = await fetch(`/api/v1/communication/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          group_id: groupId,
          content: encrypted,
          is_code_snippet: false
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages(prev => [...prev, newMsg]);
        setChatInput("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">CLIENT PORTAL</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1 flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2.5 text-[#00E5FF]" />
            B-CORE DIGITAL // EXECUTION PORTAL
          </h1>
        </div>
        <div className="bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono">
          <span className="text-zinc-550 block">OWNED PROJECTS:</span>
          <span className="text-emerald-400 font-bold text-xs">{activeProjects.length} ACTIVE</span>
        </div>
      </header>

      {/* Projects Dropdown / Selector */}
      {activeProjects.length > 1 && (
        <div className="flex items-center space-x-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60 max-w-md font-mono text-xs">
          <span className="text-zinc-400 uppercase">Select Project:</span>
          <select
            value={selectedProject?.project_id || ""}
            onChange={(e) => {
              const proj = activeProjects.find(p => p.project_id === e.target.value);
              if (proj) setSelectedProject(proj);
            }}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1 text-white focus:outline-none focus:border-[#00E5FF]"
          >
            {activeProjects.map(p => (
              <option key={p.project_id} value={p.project_id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Grid: Info Cards + Secure Communication */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Columns: Projects, Milestones & Deliverables */}
        <div className="lg:col-span-2 flex flex-col space-y-6 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          
          {selectedProject ? (
            <>
              {/* Project Progress */}
              <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-3 gap-3">
                  <div>
                    <h3 className="font-bold text-white font-mono text-xs uppercase tracking-wider">{selectedProject.title} Progress</h3>
                    <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Dual-source real-time execution statistics</p>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTelemetryReport(true)}
                      className="px-2.5 py-1 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 hover:border-[#00E5FF]/50 text-[#00E5FF] rounded text-[10px] font-bold uppercase transition-all duration-150 tracking-wider flex items-center space-x-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>View Live Telemetry Report</span>
                    </button>
                    <span className="text-xs font-bold text-[#00E5FF] font-mono">
                      {getOverallProgress()}% Complete
                    </span>
                  </div>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-850">
                  <div 
                    className="bg-[#00E5FF] h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,229,255,0.4)]" 
                    style={{ 
                      width: `${getOverallProgress()}%` 
                    }}
                  />
                </div>
              </section>

              {/* Project Development Timeline & Milestones */}
              <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-6 flex flex-col">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-white tracking-widest uppercase">Project Development Timeline & Milestones</h3>
                    <p className="text-[10px] text-zinc-555 font-mono mt-0.5">High-level phase tracking and milestone checklist</p>
                  </div>
                </div>

                {/* Horizontal / Visual Phase Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
                  {getProjectTimeline(selectedProject).map((milestone: any, idx: number) => {
                    const isCompleted = milestone.progress === 100 || milestone.status === "Completed";
                    const isInProgress = milestone.status === "In Progress" || (milestone.progress > 0 && milestone.progress < 100);
                    return (
                      <div key={milestone.id || idx} className="relative flex flex-col space-y-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-900 font-mono text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] text-zinc-550 uppercase">Phase {idx + 1}</span>
                          <span className={`text-[8px] uppercase font-bold ${
                            isCompleted ? "text-emerald-400" : isInProgress ? "text-cyan-400" : "text-zinc-600"
                          }`}>
                            {milestone.status || (isCompleted ? "Completed" : isInProgress ? "In Progress" : "Pending")}
                          </span>
                        </div>
                        <h4 className="font-bold text-white truncate text-[11px]">{milestone.name}</h4>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850 mt-1">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? "bg-emerald-400" : isInProgress ? "bg-cyan-400" : "bg-zinc-800"}`}
                            style={{ width: `${milestone.progress || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-zinc-500 pt-0.5">
                          <span>{milestone.start || "TBD"}</span>
                          <span>{milestone.progress || 0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-section: Granular Execution Deliverables */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-405 uppercase tracking-wider">Granular Execution Deliverables</h4>
                  <ul className="divide-y divide-zinc-900 bg-zinc-950/20 border border-zinc-900 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                    {activeProjTasks.length > 0 ? (
                      activeProjTasks.map(task => (
                        <li key={task.task_id} className="p-3.5 hover:bg-zinc-950/20 transition-colors flex items-start space-x-4">
                          <div className="mt-0.5">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold text-white font-mono truncate">{task.title}</h4>
                            {task.description && (
                              <p className="text-zinc-500 text-[10px] font-mono mt-0.5 leading-relaxed line-clamp-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end justify-center ml-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase border ${
                              getStatusLabel(task.status) === 'Completed' ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400' :
                              getStatusLabel(task.status) === 'In Progress' ? 'bg-cyan-950/20 border-cyan-900/35 text-cyan-400' :
                              'bg-zinc-900 border-zinc-800 text-zinc-500'
                            }`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs font-mono text-zinc-650">
                        No granular deliverables logged.
                      </div>
                    )}
                  </ul>
                </div>
              </section>
            </>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-zinc-600 bg-[#0e0e0e] border border-zinc-850 rounded-xl">
              No active project assigned to your client user.
            </div>
          )}

          {/* Project Remarks & Feedback */}
          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Remarks */}
              <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-[320px]">
                <h2 className="text-xs font-bold font-mono text-white tracking-widest uppercase border-b border-zinc-800 pb-2 flex items-center space-x-1.5">
                  <MessageSquarePlus className="w-4 h-4 text-[#00E5FF]" />
                  <span>PROJECT STATUS REMARKS</span>
                </h2>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {loadingRemarks ? (
                    <div className="h-full flex items-center justify-center text-zinc-650 text-[10px] font-mono animate-pulse">
                      Retrieving status updates...
                    </div>
                  ) : remarks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-605 p-4 text-[10px] font-mono">
                      <span>No remarks or status comments recorded. Leave a feedback comment below.</span>
                    </div>
                  ) : (
                    remarks.map((r, i) => (
                      <div key={r.remark_id || i} className="p-2.5 rounded bg-zinc-950/60 border border-zinc-900 flex flex-col space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-zinc-550 border-b border-zinc-900 pb-1">
                          <span className="font-bold text-[#00E5FF]">{r.user_name || "Operator"}</span>
                          <span>{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed break-words">{r.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostRemark} className="flex items-center space-x-2 border-t border-zinc-855 pt-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Comment on project status..."
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingRemark || !remarkInput.trim()}
                    className="p-1.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 hover:border-[#00E5FF]/50 rounded text-[#00E5FF] transition-all disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </section>

              {/* Task Enquiry */}
              <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col h-[320px]">
                <h2 className="text-xs font-bold font-mono text-white tracking-widest uppercase border-b border-zinc-800 pb-2 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>TASK ENQUIRY / REQUEST</span>
                </h2>

                <form onSubmit={handlePostEnquiry} className="flex-1 flex flex-col space-y-3 justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-550 font-mono uppercase tracking-widest">Enquiry Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Requesting logo assets revision"
                        value={enquiryTitle}
                        onChange={(e) => setEnquiryTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-purple-500/40"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-550 font-mono uppercase tracking-widest">Details / Description</label>
                      <textarea
                        placeholder="Detail your request or question here..."
                        value={enquiryDesc}
                        onChange={(e) => setEnquiryDesc(e.target.value)}
                        className="w-full h-[80px] bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-purple-500/40 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-850 pt-2 shrink-0">
                    {enquirySuccess ? (
                      <span className="flex items-center text-emerald-400 text-[10px] font-mono">
                        <Check className="w-3.5 h-3.5 mr-1" /> Request Posted!
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-555 font-mono flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-zinc-600" /> Adds task to queue
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry || !enquiryTitle.trim()}
                      className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded text-purple-400 font-bold uppercase tracking-widest text-[9px] font-mono transition-all disabled:opacity-40"
                    >
                      {isSubmittingEnquiry ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* Real-time Team Activity Log */}
          {selectedProject && (
            <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 mt-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-xs font-bold font-mono text-white tracking-widest uppercase flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>REAL-TIME TEAM ACTIVITY FEED</span>
                </h3>
                <p className="text-[10px] text-zinc-555 font-mono mt-0.5">Live work sessions and updates logged by your project team</p>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {loadingWorkLogs ? (
                  <div className="py-8 text-center text-zinc-650 text-[10px] font-mono animate-pulse">
                    SYNCING WITH TEAM LOGS...
                  </div>
                ) : workLogs.length === 0 ? (
                  <div className="py-8 text-center text-zinc-605 text-[10px] font-mono">
                    No recent work sessions recorded by the team.
                  </div>
                ) : (
                  workLogs.map((log) => {
                    const user = allUsers.find(u => u.user_id === log.user_id);
                    const task = projectTasks.find(t => t.task_id === log.task_id);
                    return (
                      <div key={log.log_id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{user?.full_name || "Team Member"}</span>
                            <span className="text-[8px] px-1 py-0.2 bg-zinc-900 text-zinc-400 border border-zinc-850 uppercase rounded font-bold">
                              {user?.department || "Execution"}
                            </span>
                          </div>
                          <p className="text-zinc-350 leading-relaxed max-w-xl break-words">
                            Logged <strong className="text-emerald-400">{log.hours_logged} hours</strong> on &ldquo;{task?.title || "Project Tasks"}&rdquo;
                          </p>
                          {log.log_content && (
                            <p className="text-[10px] text-zinc-500 italic mt-0.5">&ldquo;{log.log_content}&rdquo;</p>
                          )}
                        </div>
                        <div className="text-right text-[9px] text-zinc-550 shrink-0 self-end sm:self-center">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Secure Team Communication */}
        <div className="lg:col-span-1 bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-4 flex flex-col min-h-0 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>TEAM CHAT CHANNEL</span>
            </h3>
            <div className="flex items-center space-x-1 text-[8px] font-mono text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              <span>E2E SECURED</span>
            </div>
          </div>

          {selectedProject?.assigned_group_id ? (
            <>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 bg-black/40 p-2.5 rounded border border-zinc-900 custom-scrollbar text-[11px] font-mono">
                {loadingChat ? (
                  <div className="h-full flex items-center justify-center text-zinc-600 animate-pulse">
                    Decrypting stream...
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 p-4">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <span>No messages exchanged yet. Send a message to start communicating with the team.</span>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isSelf = msg.sender_id === localStorage.getItem("seven_user_id");
                    const secretKey = getGroupSecretKey(selectedProject.assigned_group_id!);
                    const decrypted = decryptMessage(msg.content, secretKey);
                    return (
                      <div key={msg.gm_id || i} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                        {!isSelf && <span className="text-[8px] text-[#00E5FF] mb-0.5">{msg.sender_name}</span>}
                        <div className={`p-2 rounded max-w-[85%] border leading-relaxed break-words ${
                          isSelf 
                            ? "bg-[#151515] border-[#00E5FF]/20 text-white rounded-tr-none" 
                            : "bg-[#090909] border-zinc-850 text-zinc-350 rounded-tl-none"
                        }`}>
                          {decrypted}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="flex items-center space-x-1.5">
                <input
                  type="text"
                  placeholder="Type secure message to team..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
                  required
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-white transition-all disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-650 font-mono text-xs">
              <MessageSquare className="w-8 h-8 text-zinc-800 mb-2" />
              <span>No team assignment has been linked to this project yet.</span>
            </div>
          )}

        </div>

      </div>
      {showTelemetryReport && selectedProject && (
        <ProjectDashboardView 
          project={selectedProject} 
          onClose={() => setShowTelemetryReport(false)} 
        />
      )}
    </div>
  );
}
