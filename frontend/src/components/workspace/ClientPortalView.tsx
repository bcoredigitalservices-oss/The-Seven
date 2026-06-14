"use client";

import React, { useState, useEffect, useRef } from "react";
import { Project, Task } from "@/store/useSevenStore";
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
  Users
} from "lucide-react";
import { encryptMessage, decryptMessage } from "@/utils/crypto";

interface ClientPortalViewProps {
  activeProjects: Project[];
  projectTasks: Task[];
}

export default function ClientPortalView({ activeProjects, projectTasks }: ClientPortalViewProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    activeProjects.length > 0 ? activeProjects[0] : null
  );
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Initial load
  useEffect(() => {
    if (selectedProject) {
      setLoadingChat(true);
      fetchGroupMessages().finally(() => setLoadingChat(false));
    }
  }, [selectedProject]);

  // Polling for chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGroupMessages();
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
                <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                  <h3 className="font-bold text-white font-mono text-xs uppercase tracking-wider">{selectedProject.title} Progress</h3>
                  <span className="text-xs font-bold text-[#00E5FF] font-mono">
                    {activeProjTasks.length > 0 
                      ? Math.round((activeProjTasks.filter(t => t.status === "Done" || t.status === "Deployed").length / activeProjTasks.length) * 100) 
                      : 0}% Complete
                  </span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-850">
                  <div 
                    className="bg-[#00E5FF] h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,229,255,0.4)]" 
                    style={{ 
                      width: `${activeProjTasks.length > 0 
                        ? Math.round((activeProjTasks.filter(t => t.status === "Done" || t.status === "Deployed").length / activeProjTasks.length) * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
              </section>

              {/* Milestone Tracker */}
              <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col">
                <div className="bg-zinc-950/60 px-4 py-2 border-b border-zinc-800 rounded-t-lg">
                  <h2 className="text-xs font-bold font-mono text-white tracking-widest uppercase">Project Milestone Tracker</h2>
                </div>
                <ul className="divide-y divide-zinc-900 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {activeProjTasks.length > 0 ? (
                    activeProjTasks.map(task => (
                      <li key={task.task_id} className="p-4 hover:bg-zinc-950/20 transition-colors flex items-start space-x-4">
                        <div className="mt-0.5">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white font-mono truncate">{task.title}</h4>
                          {task.description && (
                            <p className="text-zinc-500 text-[11px] font-mono mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
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
                      No active milestones tracked for this project.
                    </div>
                  )}
                </ul>
              </section>
            </>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-zinc-600 bg-[#0e0e0e] border border-zinc-850 rounded-xl">
              No active project assigned to your client user.
            </div>
          )}

          {/* Deliverables */}
          <section className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold font-mono text-white tracking-widest uppercase border-b border-zinc-800 pb-2">PROJECT DELIVERABLES</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border border-zinc-850 rounded-lg hover:border-[#00E5FF]/20 transition-all flex items-center justify-between bg-zinc-950/40">
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-[11px] font-mono truncate">Q3 Strategy Presentation</span>
                  <span className="text-[9px] text-zinc-500 mt-1 font-mono">PDF • 4.2 MB • Ready</span>
                </div>
                <Download className="w-4 h-4 text-zinc-550 hover:text-[#00E5FF] cursor-pointer ml-2" />
              </div>

              <div className="p-3 border border-zinc-850 rounded-lg hover:border-[#00E5FF]/20 transition-all flex items-center justify-between bg-zinc-950/40">
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-[11px] font-mono truncate">Brand Assets V2</span>
                  <span className="text-[9px] text-zinc-500 mt-1 font-mono">ZIP • 128 MB • Last Week</span>
                </div>
                <Download className="w-4 h-4 text-zinc-550 hover:text-[#00E5FF] cursor-pointer ml-2" />
              </div>
            </div>
          </section>

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
    </div>
  );
}
