"use client";

import { useState, useEffect, useRef } from "react";
import { useWorkspaceStore, Task, Message } from "@/store/useWorkspaceStore";
import { 
  Terminal, 
  Play, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Code, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  BookOpen, 
  Info,
  MessageSquare
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Collapsible Code Snippet Component
function ChatCodeBlock({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = content.split("\n");
  const lineCount = lines.length;
  const isLong = lineCount > 6;

  // Clean code blocks formatting if wrapped in backticks
  const codeText = content.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");

  if (isLong && !isExpanded) {
    const previewText = lines.slice(0, 5).join("\n");
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-[11px] overflow-hidden my-2">
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-500">
          <span className="flex items-center text-[10px]"><Code className="w-3.5 h-3.5 mr-1.5 text-[#00e5ff]" /> Code Block ({lineCount} lines)</span>
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-[#00e5ff] hover:underline flex items-center text-[10px] uppercase font-bold"
          >
            Expand <ChevronDown className="w-3 h-3 ml-1" />
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
        <span className="flex items-center text-[10px]"><Code className="w-3.5 h-3.5 mr-1.5 text-[#00e5ff]" /> Code Block ({lineCount} lines)</span>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-[#00e5ff] hover:underline flex items-center text-[10px] uppercase font-bold"
          >
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

export default function DeveloperDashboard() {
  const { 
    user, 
    tasks, 
    updateTaskStatus, 
    isDeepWorkMode, 
    fetchChannelMessages, 
    currentChannel, 
    messages, 
    sendMessage,
    users
  } = useWorkspaceStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isSnippet, setIsSnippet] = useState(false);
  const [timer, setTimer] = useState(1500); // 25 min default pomodoro
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Filter tasks to only show tasks assigned to this developer
  const devTasks = tasks.filter(t => t.assigned_user_id === user?.user_id);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Deep work focus timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && isDeepWorkMode) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isDeepWorkMode]);

  // Open chat channel for a task
  const handleSelectTask = async (task: Task) => {
    setActiveTask(task);
    // Find channel for task
    try {
      const response = await fetch(`/api/tasks/${task.task_id}/channel`);
      if (response.ok) {
        const channel = await response.json();
        useWorkspaceStore.setState({ currentChannel: channel });
        await fetchChannelMessages(channel.channel_id);
      }
    } catch (e) {
      console.error("Failed to load task channel:", e);
    }
  };

  const handleStatusShift = async (task: Task, targetStatus: string) => {
    await updateTaskStatus(task.task_id, targetStatus);
    // Refresh active task object if it's the one currently open
    if (activeTask && activeTask.task_id === task.task_id) {
      setActiveTask((prev) => prev ? { ...prev, status: targetStatus as any } : null);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentChannel) return;

    await sendMessage(currentChannel.channel_id, chatInput, isSnippet);
    setChatInput("");
    setIsSnippet(false);
  };

  // Quick Blocker Beacon Trigger
  const handleTriggerBlocker = async (task: Task) => {
    const explanation = prompt("State your core blocker (this will trigger a Blocker Beacon alert to Admin/Architects):");
    if (explanation === null) return; // cancelled
    
    // 1. Shift status to Blocked
    await updateTaskStatus(task.task_id, "Blocked");
    
    // 2. Automatically post explanation in the attached chat channel
    try {
      const channelResponse = await fetch(`/api/tasks/${task.task_id}/channel`);
      if (channelResponse.ok) {
        const channel = await channelResponse.json();
        await sendMessage(channel.channel_id, `🚨 **BLOCKER BEACON TRIGGERED** 🚨\n\n${explanation || "No details provided."}`, false);
        if (activeTask && activeTask.task_id === task.task_id) {
          await fetchChannelMessages(channel.channel_id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pomodoro timer format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex overflow-hidden h-screen bg-[#07070a]">
      {/* Task Workspace List */}
      <div className={`flex-1 flex flex-col p-6 overflow-y-auto transition-all duration-500 ${
        isDeepWorkMode ? "max-w-[65%]" : "max-w-[60%]"
      }`}>
        {/* Header Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Daily Sprint Backlog</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">DEV_WORKSPACE // ASSIGNED_TASKS</p>
          </div>

          {/* Deep Work Pulse Panel */}
          {isDeepWorkMode && (
            <div className="flex items-center space-x-4 p-2.5 px-4 rounded-xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 shadow-[0_0_15px_rgba(0,229,255,0.05)]">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#00e5ff] animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#00e5ff] uppercase tracking-wider">
                  Deep Flow Time:
                </span>
                <span className="font-mono text-sm font-bold text-white tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {formatTime(timer)}
                </span>
              </div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3 py-0.5 rounded font-mono text-[10px] font-bold border transition-all ${
                  isTimerRunning 
                    ? "bg-[#ff1744]/10 border-[#ff1744]/30 text-[#ff1744] hover:bg-[#ff1744]/20" 
                    : "bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff] hover:bg-[#00e5ff]/20"
                }`}
              >
                {isTimerRunning ? "PAUSE" : "START"}
              </button>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {devTasks.length === 0 ? (
            <div className="p-8 rounded-xl border border-zinc-800 bg-[#0d0d12]/40 text-center">
              <Info className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No active tasks assigned to you for this sprint.</p>
              <p className="text-xs text-zinc-600 font-mono mt-1">Use the sidebar switcher to explore roles or create task nodes.</p>
            </div>
          ) : (
            devTasks.map((task) => {
              const isSelected = activeTask?.task_id === task.task_id;
              const isBlocked = task.status === "Blocked";

              return (
                <div
                  key={task.task_id}
                  onClick={() => handleSelectTask(task)}
                  className={`relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isBlocked 
                      ? "border-[#ff1744]/40 bg-[#ff1744]/5 hover:border-[#ff1744]/60 glow-blocked" 
                      : isSelected 
                      ? "border-[#00e5ff]/40 bg-[#00e5ff]/5 hover:border-[#00e5ff]/50 cyan-neon-border" 
                      : "border-zinc-800 bg-[#0d0d12]/80 hover:bg-[#12121a]/60 hover:border-zinc-700"
                  }`}
                >
                  {/* Task Blocked Warning Banner */}
                  {isBlocked && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff1744] rounded-t-xl animate-pulse" />
                  )}

                  <div className="flex items-start justify-between">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          task.status === "Done" || task.status === "Deployed" ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400" :
                          task.status === "Blocked" ? "bg-red-950/50 border border-red-500/30 text-[#ff1744]" :
                          task.status === "In Progress" ? "bg-cyan-950/50 border border-cyan-500/30 text-[#00e5ff]" :
                          "bg-zinc-800 border border-zinc-700 text-zinc-400"
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {task.task_id.slice(0,8)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-zinc-200 group-hover:text-white mt-1.5">{task.title}</h3>
                      <p className="text-xs text-zinc-450 leading-relaxed max-w-xl">{task.description}</p>
                    </div>

                    {/* Quick Shift Status Actions */}
                    <div className="flex flex-col space-y-2 items-end shrink-0" onClick={e => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusShift(task, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-400 focus:outline-none transition-all"
                      >
                        {["Backlog", "Assigned", "In Progress", "Review", "QA", "Deployed", "Done"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      {/* Trigger Blocker Beacon Button */}
                      {task.status !== "Blocked" && task.status !== "Done" && task.status !== "Deployed" && (
                        <button
                          onClick={() => handleTriggerBlocker(task)}
                          className="px-2.5 py-1 rounded bg-[#ff1744]/10 hover:bg-[#ff1744]/20 border border-[#ff1744]/30 text-[#ff1744] font-mono text-[10px] font-bold flex items-center transition-all"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          BLOCK BEACON
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Context-Attached Chat Panel */}
      <div className={`border-l border-zinc-800 bg-[#0d0d12]/95 flex flex-col justify-between transition-all duration-500 ${
        isDeepWorkMode ? "w-[35%] opacity-50 hover:opacity-100 focus-within:opacity-100" : "w-[40%]"
      }`}>
        {activeTask ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800/80 bg-[#111118]/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#00e5ff]" />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-200 truncate">Discussion Channel</h4>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">TASK: {activeTask.title}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-wide">
                CONTEXT SECURE
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <Terminal className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-500 font-mono">No communication packets stored for this node.</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-1">Send a message below. Markdown & code highlights supported.</p>
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
                      {/* Sender Profile Header */}
                      {!isSystemBlocker && (
                        <span className="text-[10px] font-mono text-zinc-500 mb-1 px-1">
                          {msg.sender?.full_name || "Unknown Dev"} // {msg.sender?.role || "Developer"}
                        </span>
                      )}

                      {/* Message Bubble */}
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
                      
                      {/* Time timestamp */}
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
                        ? "Paste code snippet here..." 
                        : "Write message (supports **markdown**)... Shift+Enter for new line."
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
                    {/* Toggle Code Snippet Mode */}
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
                      className="px-3 py-1 bg-[#00e5ff] hover:bg-[#00c5dd] active:bg-cyan-500 rounded text-zinc-950 font-mono text-[10px] font-bold flex items-center transition-all disabled:opacity-40 disabled:shadow-none"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      <span>TRANSMIT</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
            <BookOpen className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="text-sm font-semibold text-zinc-400 font-mono uppercase tracking-wide">Channel Idle</h4>
            <p className="text-xs text-zinc-650 font-mono mt-1 max-w-xs leading-relaxed">
              Select a task checklist node from the active sprint backlog to load its context-attached communication channel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
