"use client";

import { useState, useEffect, useRef } from "react";
import { useWorkspaceStore, Task, Message, User } from "@/store/useWorkspaceStore";
import { 
  ShieldAlert, 
  BarChart3, 
  Activity, 
  Plus, 
  UserPlus, 
  AlertOctagon,
  MessageSquare,
  Send,
  Code,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  CheckSquare
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Collapsible Code Block Helper
function ChatCodeBlock({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = content.split("\n");
  const lineCount = lines.length;
  const isLong = lineCount > 6;

  const codeText = content.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");

  if (isLong && !isExpanded) {
    const previewText = lines.slice(0, 5).join("\n");
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-[11px] overflow-hidden my-2">
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-500">
          <span className="flex items-center text-[10px]"><Code className="w-3.5 h-3.5 mr-1.5 text-[#00e5ff]" /> Code Snippet ({lineCount} lines)</span>
          <button onClick={() => setIsExpanded(true)} className="text-[#00e5ff] hover:underline flex items-center text-[10px] uppercase font-bold">
            Expand <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
        <pre className="p-3 text-zinc-400 overflow-x-auto select-all max-h-36 overflow-y-hidden opacity-75">
          <code>{previewText}</code>
        </pre>
        <div className="bg-gradient-to-t from-zinc-950 to-transparent h-6 -mt-6 relative pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-[11px] overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-500">
        <span className="flex items-center text-[10px]"><Code className="w-3.5 h-3.5 mr-1.5 text-[#00e5ff]" /> Code Snippet ({lineCount} lines)</span>
        {isLong && (
          <button onClick={() => setIsExpanded(false)} className="text-[#00e5ff] hover:underline flex items-center text-[10px] uppercase font-bold">
            Collapse <ChevronUp className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
      <pre className="p-3 text-zinc-350 overflow-x-auto select-all max-h-96 overflow-y-auto">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}

export default function AdminDashboard() {
  const { 
    user, 
    tasks, 
    users, 
    projects, 
    createTask, 
    updateTaskStatus, 
    assignTask,
    fetchChannelMessages,
    currentChannel,
    messages,
    sendMessage
  } = useWorkspaceStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isSnippet, setIsSnippet] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Task Creator Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done" || t.status === "Deployed").length;
  const blockedTasks = tasks.filter(t => t.status === "Blocked").length;
  const velocityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const activeBlockers = tasks.filter(t => t.status === "Blocked");

  const handleSelectTask = async (task: Task) => {
    setActiveTask(task);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${task.task_id}/channel`);
      if (response.ok) {
        const channel = await response.json();
        useWorkspaceStore.setState({ currentChannel: channel });
        await fetchChannelMessages(channel.channel_id);
      }
    } catch (e) {
      console.error("Failed to load task channel:", e);
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || projects.length === 0) return;

    setIsCreating(true);
    try {
      await createTask({
        title: newTitle,
        description: newDesc,
        project_id: projects[0].project_id, // Default to first project
        assigned_user_id: newAssignee || undefined
      });
      setNewTitle("");
      setNewDesc("");
      setNewAssignee("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentChannel) return;

    await sendMessage(currentChannel.channel_id, chatInput, isSnippet);
    setChatInput("");
    setIsSnippet(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-screen bg-[#07070a]">
      {/* Metrics, Blocker List and Backlog Table */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-[65%] space-y-6">
        
        {/* Header Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">IT Engineering Dashboard</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">ADMIN_CONSOLE // SYSTEM_VELOCITY // ACTIVE_BLOCKERS</p>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#0d0d12]/75 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Tasks</span>
            <span className="text-2xl font-bold font-mono mt-2 text-zinc-100">{totalTasks}</span>
          </div>
          
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#0d0d12]/75 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Completed Tasks</span>
            <span className="text-2xl font-bold font-mono mt-2 text-emerald-400">{completedTasks}</span>
          </div>

          <div className="p-4 rounded-xl border border-[#ff1744]/20 bg-[#ff1744]/5 flex flex-col justify-between shadow-[0_0_15px_rgba(255,23,68,0.05)]">
            <span className="text-[10px] font-mono text-[#ff1744] uppercase tracking-wider flex items-center">
              Active Blockers
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff1744] animate-ping ml-1.5" />
            </span>
            <span className="text-2xl font-bold font-mono mt-2 text-[#ff1744]">{blockedTasks}</span>
          </div>

          <div className="p-4 rounded-xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 flex flex-col justify-between shadow-[0_0_15px_rgba(0,229,255,0.05)]">
            <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-wider">Velocity rate</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-bold font-mono text-[#00e5ff]">{velocityRate}%</span>
              <span className="text-[10px] text-zinc-500 font-mono">Done ratio</span>
            </div>
          </div>
        </div>

        {/* Middle split: Blockers List & Create Task Panel */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Active Blockers Beacon List */}
          <div className="rounded-xl border border-[#ff1744]/30 bg-[#120508]/50 p-4 flex flex-col shadow-[0_0_15px_rgba(255,23,68,0.02)]">
            <h3 className="text-xs font-bold font-mono text-[#ff1744] uppercase tracking-wider flex items-center mb-3">
              <AlertOctagon className="w-4 h-4 mr-1.5 animate-pulse" />
              Active Blocker Beacons ({activeBlockers.length})
            </h3>
            
            <div className="space-y-2 flex-1 max-h-48 overflow-y-auto no-scrollbar">
              {activeBlockers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-red-500/10 rounded-lg">
                  <CheckSquare className="w-6 h-6 text-emerald-500 opacity-60 mb-1" />
                  <p className="text-[11px] text-zinc-500 font-mono">No active blockers. Velocity is optimal.</p>
                </div>
              ) : (
                activeBlockers.map((t) => (
                  <div
                    key={t.task_id}
                    onClick={() => handleSelectTask(t)}
                    className="p-3 rounded-lg bg-[#ff1744]/10 border border-[#ff1744]/20 hover:border-[#ff1744]/40 cursor-pointer flex justify-between items-start transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{t.title}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                        Developer: {t.assigned_user?.full_name || "Unassigned"}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-[#ff1744] text-[#09090b] tracking-wider shrink-0 uppercase">
                      STICKY
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Task Creator Card */}
          <div className="rounded-xl border border-zinc-800 bg-[#0d0d12]/80 p-4">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider flex items-center mb-3">
              <Plus className="w-4 h-4 mr-1 text-[#00e5ff]" />
              Provision New Sprint Task
            </h3>
            
            <form onSubmit={handleCreateTaskSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Task title..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00e5ff] transition-all"
              />
              <textarea
                placeholder="Description / acceptance criteria..."
                rows={2}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-350 focus:outline-none focus:border-[#00e5ff] transition-all resize-none"
              />
              <div className="flex space-x-2">
                <select
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-500 focus:outline-none focus:border-[#00e5ff] transition-all"
                >
                  <option value="">Assignee (Optional)</option>
                  {users.filter(u => u.role !== "Admin").map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-1.5 rounded bg-[#00e5ff] hover:bg-[#00c5dd] active:bg-cyan-500 text-zinc-950 font-mono text-xs font-bold transition-all disabled:opacity-40"
                >
                  {isCreating ? "Deploying..." : "DEPLOY"}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Global Sprint Backlog Table */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d12]/70 overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#111118]/80 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
              System-wide Sprint Backlog
            </span>
            <span className="text-[9px] font-mono text-zinc-650 bg-zinc-950 px-2 py-0.5 border border-zinc-850 rounded">
              NODE_COUNT: {tasks.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-[#161622]/20">
                  <th className="p-3 pl-4">TASK DESCRIPTOR</th>
                  <th className="p-3">ASSIGNEE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right pr-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tasks.map((task) => (
                  <tr 
                    key={task.task_id}
                    onClick={() => handleSelectTask(task)}
                    className={`hover:bg-zinc-900/30 cursor-pointer ${
                      task.status === "Blocked" ? "bg-[#ff1744]/5 hover:bg-[#ff1744]/10" : ""
                    }`}
                  >
                    <td className="p-3 pl-4">
                      <div className="font-semibold text-zinc-200">{task.title}</div>
                      <div className="text-[10px] text-zinc-600 truncate max-w-sm">{task.description || "No description provided."}</div>
                    </td>
                    <td className="p-3 text-zinc-400">
                      {task.assigned_user?.full_name || (
                        <span className="text-zinc-650 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase ${
                        task.status === "Done" || task.status === "Deployed" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" :
                        task.status === "Blocked" ? "bg-red-950/40 border-red-500/20 text-[#ff1744] animate-pulse" :
                        task.status === "In Progress" ? "bg-cyan-950/40 border-cyan-500/20 text-[#00e5ff]" :
                        "bg-zinc-900 border-zinc-850 text-zinc-500"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3 text-right pr-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end space-x-1.5">
                        <select
                          value={task.assigned_user_id || ""}
                          onChange={(e) => assignTask(task.task_id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-[10px] text-zinc-500"
                        >
                          <option value="">Unassign</option>
                          {users.filter(u => u.role !== "Admin").map(u => (
                            <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                          ))}
                        </select>
                        
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.task_id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-[10px] text-zinc-500"
                        >
                          {["Backlog", "Assigned", "In Progress", "Review", "QA", "Deployed", "Done"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Troubleshooting Chat Panel */}
      <div className="w-[35%] border-l border-zinc-800 bg-[#0d0d12]/95 flex flex-col justify-between">
        {activeTask ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800/80 bg-[#111118]/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#00e5ff]" />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-200 truncate">Troubleshooting Chat</h4>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">ATTACHED: {activeTask.title}</p>
                </div>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wide border ${
                activeTask.status === "Blocked" 
                  ? "bg-[#ff1744]/15 border-[#ff1744]/35 text-[#ff1744] animate-pulse"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
              }`}>
                {activeTask.status === "Blocked" ? "HIGH PRIORITY" : "STANDARD"}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-45">
                  <Cpu className="w-8 h-8 text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-500 font-mono">No communication logs recorded.</p>
                  <p className="text-[10px] text-zinc-650 font-mono mt-1">Send a message to sync with the developer.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSystemBlocker = msg.content.includes("BLOCKER BEACON TRIGGERED");
                  const isMe = msg.sender_id === user?.user_id;

                  return (
                    <div 
                      key={msg.message_id} 
                      className={`flex flex-col max-w-[85%] ${
                        isSystemBlocker ? "mx-auto w-full max-w-full" : isMe ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      {!isSystemBlocker && (
                        <span className="text-[10px] font-mono text-zinc-500 mb-1 px-1">
                          {msg.sender?.full_name || "Unknown"} // {msg.sender?.role || "Developer"}
                        </span>
                      )}

                      <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                        isSystemBlocker 
                          ? "bg-red-950/20 border border-red-500/30 text-zinc-300 font-mono text-center w-full shadow-[0_0_10px_rgba(255,23,68,0.1)]" 
                          : isMe 
                          ? "bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-zinc-100 rounded-tr-none" 
                          : "bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none"
                      }`}>
                        {msg.is_code_snippet ? (
                          <ChatCodeBlock content={msg.content} />
                        ) : (
                          <div className="prose prose-invert prose-xs max-w-none prose-p:my-0.5 prose-pre:my-1 text-[12px]">
                            <ReactMarkdown>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-zinc-800 bg-[#0c0c10]/95">
              <form onSubmit={handleSendChat} className="space-y-2">
                <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus-within:border-[#00e5ff]/50 transition-all">
                  <textarea
                    rows={2}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isSnippet 
                        ? "Paste logs / config codes..." 
                        : "Enter reply... (Markdown supported, Shift+Enter for new line)"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat(e);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none resize-none no-scrollbar font-sans"
                  />
                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsSnippet(!isSnippet)}
                      className={`px-2 py-1 rounded text-[10px] font-mono flex items-center transition-all ${
                        isSnippet 
                          ? "bg-[#00e5ff]/10 border border-[#00e5ff]/35 text-[#00e5ff]" 
                          : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-350"
                      }`}
                    >
                      <Code className="w-3 h-3 mr-1" />
                      <span>{isSnippet ? "SNIPPET ON" : "CODE MODE"}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-3 py-1 bg-[#00e5ff] hover:bg-[#00c5dd] active:bg-cyan-500 rounded text-zinc-950 font-mono text-[10px] font-bold flex items-center transition-all disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      <span>REPLY</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
            <Cpu className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="text-sm font-semibold text-zinc-400 font-mono uppercase tracking-wide">Select Node</h4>
            <p className="text-xs text-zinc-650 font-mono mt-1 max-w-xs leading-relaxed">
              Select any task or blocker beacon from the sprint board to view or participate in active team troubleshooting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
