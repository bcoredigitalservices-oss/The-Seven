"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSevenStore, Task } from "@/store/useSevenStore";
import { CheckSquare, Clock, AlertOctagon, Calendar, Bell, Send, CheckCircle2, AlertTriangle, ExternalLink, MessageSquare, UserPlus, Check, FolderKanban, AlarmClock, Zap } from "lucide-react";
import WorkLogger from "./WorkLogger";

// Deadline urgency helper
function getDeadlineUrgency(due_date?: string | null): { label: string; hoursLeft: number; isCritical: boolean; isPast: boolean } {
  if (!due_date) return { label: "", hoursLeft: Infinity, isCritical: false, isPast: false };
  const now = new Date();
  const due = new Date(due_date);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isPast = hoursLeft < 0;
  const isCritical = hoursLeft >= 0 && hoursLeft <= 7;
  const absh = Math.abs(hoursLeft);
  let label = "";
  if (isPast) {
    label = `OVERDUE by ${absh >= 24 ? `${Math.floor(absh / 24)}d ` : ""}${Math.floor(absh % 24)}h`;
  } else if (isCritical) {
    label = `CRITICAL — ${Math.floor(hoursLeft)}h ${Math.floor((hoursLeft % 1) * 60)}m left`;
  } else if (hoursLeft < 48) {
    label = `Due in ${Math.floor(hoursLeft)}h`;
  } else {
    label = `Due ${due.toLocaleDateString()} ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return { label, hoursLeft, isCritical, isPast };
}

interface EmployeeTasksViewProps {
  assignedTasks: Task[];
}

export function EmployeeTasksView({ assignedTasks }: EmployeeTasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    assignedTasks.length > 0 ? assignedTasks[0] : null
  );

  useEffect(() => {
    if (assignedTasks.length > 0 && (!selectedTask || !assignedTasks.some(t => t.task_id === selectedTask.task_id))) {
      setSelectedTask(assignedTasks[0]);
    }
  }, [assignedTasks, selectedTask]);

  // Track work log counts per task
  const [taskLogCounts, setTaskLogCounts] = useState<Record<string, number>>({});
  const hasFetchedCounts = useRef(false);

  useEffect(() => {
    if (assignedTasks.length === 0 || hasFetchedCounts.current) return;
    hasFetchedCounts.current = true;
    const token = localStorage.getItem("seven_token");
    fetch("/api/v1/worklogs", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((logs: any[]) => {
        const counts: Record<string, number> = {};
        logs.forEach(l => { counts[l.task_id] = (counts[l.task_id] || 0) + 1; });
        setTaskLogCounts(counts);
      })
      .catch(() => {});
  }, [assignedTasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Task List */}
      <div className="lg:col-span-2 bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-[#00E5FF]" />
            <span>MY ASSIGNED TASKS</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-550">SELECT TO LOG WORK SESSION</span>
        </div>

        <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
          {assignedTasks.length === 0 ? (
            <div className="text-center py-16 text-xs font-mono text-zinc-650">
              No tasks currently assigned to your node.
            </div>
          ) : (
            assignedTasks.map((task) => {
              const isSelected = selectedTask?.task_id === task.task_id;
              const urgency = getDeadlineUrgency(task.due_date);
              const logCount = taskLogCounts[task.task_id] || 0;
              return (
                <button
                  key={task.task_id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left p-4 rounded-xl border font-mono transition-all flex items-start justify-between ${
                    isSelected
                      ? "bg-[#141414] border-[#00E5FF]/30 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                      : urgency.isCritical
                      ? "bg-red-950/10 border-red-800/30 text-red-200 hover:bg-red-950/20"
                      : urgency.isPast
                      ? "bg-red-950/20 border-red-700/40 text-red-300"
                      : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:bg-[#111] hover:text-white"
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.status === "Done" || task.status === "Deployed"
                            ? "bg-emerald-400"
                            : task.status === "In Progress"
                            ? "bg-[#00E5FF]"
                            : task.status === "Blocked"
                            ? "bg-red-500 animate-pulse"
                            : "bg-zinc-650"
                        }`}
                      />
                      <span className="text-xs font-bold text-white truncate">{task.title}</span>
                      {(urgency.isCritical || urgency.isPast) && (
                        <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-red-500 rounded text-[8px] font-bold text-white uppercase animate-pulse">
                          <AlarmClock className="w-2.5 h-2.5" />
                          <span>{urgency.isPast ? "OVERDUE" : "CRITICAL"}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed truncate max-w-xl">
                      {task.description || "No specific details logged."}
                    </p>
                    {urgency.label && (
                      <span className={`text-[9px] block mt-1 uppercase font-bold ${
                        urgency.isPast ? "text-red-500" : urgency.isCritical ? "text-red-400 animate-pulse" : "text-zinc-550"
                      }`}>
                        {urgency.label}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1.5 ml-4 shrink-0">
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded border tracking-wider ${
                      task.status === "Done" || task.status === "Deployed" ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-400" :
                      task.status === "In Progress" ? "bg-cyan-950/20 border-cyan-800/40 text-cyan-400" :
                      task.status === "Blocked" ? "bg-red-950/20 border-red-800/40 text-red-400" :
                      "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}>
                      {task.status}
                    </span>
                    {logCount > 0 && (
                      <span className="text-[8px] flex items-center space-x-0.5 text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{logCount} log{logCount !== 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Task Logger Side Control */}
      <div className="lg:col-span-1 bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4 justify-between h-full min-h-[250px]">
        <div>
          <div className="border-b border-zinc-850 pb-3 mb-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#00E5FF]" />
              <span>TIME REGISTRATION</span>
            </h3>
          </div>

          {selectedTask ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-2.5">
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">Active Target:</span>
                <h4 className="text-xs font-bold text-white font-mono leading-snug">{selectedTask.title}</h4>
                <p className="text-[10px] font-mono text-zinc-500 max-h-32 overflow-y-auto leading-relaxed custom-scrollbar">
                  {selectedTask.description || "No specs provided for this deployment node."}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-[9px] font-mono text-zinc-550 uppercase mb-2">Record session progress hours:</p>
                <WorkLogger taskId={selectedTask.task_id} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-center py-16 text-xs font-mono text-zinc-650">
              Select a task from the backlog on the left to register time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmployeeNotificationsView() {
  const {
    beacons,
    meetings,
    reminders,
    fetchBeacons,
    fetchMeetings,
    fetchReminders,
    replyBeacon,
    replyReminder,
    userProfile,
    simulatedUser
  } = useSevenStore();

  const activeUser = simulatedUser || userProfile;

  const [beaconReplies, setBeaconReplies] = useState<Record<string, string>>({});
  const [reminderReplies, setReminderReplies] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBeacons();
    fetchMeetings();
    fetchReminders();
  }, [fetchBeacons, fetchMeetings, fetchReminders, activeUser]);

  // Filters
  const userBeacons = beacons.filter((b) => {
    if (b.target_type === "all") return true;
    if (b.target_type === "user" && b.target_id === activeUser?.user_id) return true;
    return false;
  });

  const userMeetings = meetings.filter((m) => {
    if (m.target_type === "all") return true;
    if (m.target_id === activeUser?.user_id) return true;
    return false;
  });

  const userReminders = reminders.filter((r) => r.target_id === activeUser?.user_id);

  const handleBeaconReply = async (beaconId: string) => {
    const text = beaconReplies[beaconId]?.trim();
    if (!text) return;
    setReplyingId(beaconId);
    const ok = await replyBeacon(beaconId, text);
    setReplyingId(null);
    if (ok) {
      setBeaconReplies(prev => ({ ...prev, [beaconId]: "" }));
    }
  };

  const handleReminderReply = async (reminderId: string) => {
    const text = reminderReplies[reminderId]?.trim();
    if (!text) return;
    setReplyingId(reminderId);
    const ok = await replyReminder(reminderId, text);
    setReplyingId(null);
    if (ok) {
      setReminderReplies(prev => ({ ...prev, [reminderId]: "" }));
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Left Column: Beacons & Reminders */}
      <div className="space-y-6">
        
        {/* Blocker Beacons Section */}
        <div className="bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
              <span>ACTIVE BLOCKER BEACONS (40-MIN RESOLUTION DEADLINE)</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-550">REQUIRES IMMEDIATE REPLY</span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {userBeacons.length === 0 ? (
              <div className="text-center py-10 text-xs font-mono text-zinc-650">
                No active blocker beacons targeting your node.
              </div>
            ) : (
              userBeacons.map((beacon) => (
                <div key={beacon.beacon_id} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-bold text-white">BEACON BY {beacon.sender_name}</span>
                      </div>
                      <p className="text-zinc-350 leading-relaxed">{beacon.message}</p>
                    </div>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold ${
                      beacon.is_resolved 
                        ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                        : "bg-red-950/20 border-red-900/40 text-red-400 animate-pulse"
                    }`}>
                      {beacon.is_resolved ? "RESOLVED" : "ACTIVE"}
                    </span>
                  </div>

                  {/* Deadline Info */}
                  <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>CREATED: {new Date(beacon.created_at).toLocaleTimeString()}</span>
                    {!beacon.is_resolved && (
                      <span className="text-red-400 font-bold">DEADLINE: {new Date(beacon.deadline).toLocaleTimeString()}</span>
                    )}
                  </div>

                  {/* Reply Log */}
                  {beacon.responses && beacon.responses.length > 0 && (
                    <div className="bg-[#0b0b0b] border border-zinc-900 rounded-lg p-2.5 space-y-2 mt-2">
                      <p className="text-[9px] text-zinc-550 uppercase tracking-wider font-bold">Replies history:</p>
                      {beacon.responses.map((resp: any, i: number) => (
                        <div key={i} className="text-[11px] text-zinc-400 leading-snug">
                          <span className="text-[#00E5FF] font-bold">{resp.user_name}:</span> {resp.reply}
                          <span className="text-[9px] text-zinc-600 block mt-0.5">{new Date(resp.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {!beacon.is_resolved && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="ENTER BRIEF RESOLUTION REPLY..."
                        value={beaconReplies[beacon.beacon_id] || ""}
                        onChange={(e) => setBeaconReplies({ ...beaconReplies, [beacon.beacon_id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleBeaconReply(beacon.beacon_id);
                        }}
                        className="flex-1 bg-black border border-zinc-850 rounded px-2.5 py-1 text-white text-[11px] outline-none focus:border-red-500/40"
                      />
                      <button
                        onClick={() => handleBeaconReply(beacon.beacon_id)}
                        disabled={replyingId === beacon.beacon_id || !beaconReplies[beacon.beacon_id]}
                        className="bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded transition-colors text-[10px] font-bold flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>REPLY</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reminders Section */}
        <div className="bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>PERSONAL REMINDER NOTIFICATIONS (6-HR VALIDATION)</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-550">REQUIRES ACKNOWLEDGEMENT</span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {userReminders.length === 0 ? (
              <div className="text-center py-10 text-xs font-mono text-zinc-650">
                No reminders currently logged to your node.
              </div>
            ) : (
              userReminders.map((reminder) => (
                <div key={reminder.reminder_id} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-start">
                    <p className="text-zinc-350 leading-relaxed pr-4">{reminder.message}</p>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold ${
                      reminder.is_replied 
                        ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                        : "bg-amber-950/20 border-amber-900/40 text-amber-400"
                    }`}>
                      {reminder.is_replied ? "ACKNOWLEDGED" : "PENDING"}
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>SENT: {new Date(reminder.created_at).toLocaleString()}</span>
                    {!reminder.is_replied && (
                      <span className="text-amber-400 font-bold">DUE BY: {new Date(reminder.deadline).toLocaleTimeString()}</span>
                    )}
                  </div>

                  {reminder.is_replied && (
                    <div className="bg-[#0b0b0b] border border-zinc-900 rounded-lg p-2 mt-1 flex items-start space-x-1.5 text-[11px] text-zinc-450">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-emerald-400 font-bold uppercase text-[9px] block">ACKNOWLEDGED WITH NOTE:</span>
                        {reminder.reply_content}
                      </div>
                    </div>
                  )}

                  {!reminder.is_replied && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="ENTER CONFIRMATION NOTE..."
                        value={reminderReplies[reminder.reminder_id] || ""}
                        onChange={(e) => setReminderReplies({ ...reminderReplies, [reminder.reminder_id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReminderReply(reminder.reminder_id);
                        }}
                        className="flex-1 bg-black border border-zinc-850 rounded px-2.5 py-1 text-white text-[11px] outline-none focus:border-amber-500/40"
                      />
                      <button
                        onClick={() => handleReminderReply(reminder.reminder_id)}
                        disabled={replyingId === reminder.reminder_id || !reminderReplies[reminder.reminder_id]}
                        className="bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400 px-3 py-1 rounded transition-colors text-[10px] font-bold flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Meetings / Schedules */}
      <div className="bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
            <span>MEETING SCHEDULES & APPOINTMENTS</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-550">UPCOMING SESSIONS</span>
        </div>

        <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1 custom-scrollbar">
          {userMeetings.length === 0 ? (
            <div className="text-center py-16 text-xs font-mono text-zinc-650">
              No meetings scheduled for your node.
            </div>
          ) : (
            userMeetings.map((meeting) => (
              <div key={meeting.meeting_id} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-extrabold text-sm leading-snug">{meeting.title}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase">
                      ORGANIZER: {meeting.creator_name}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-cyan-400 font-bold tracking-wider">
                    CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#0a0a0a] p-2.5 rounded-lg border border-zinc-900 text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-550 block text-[9px] uppercase tracking-wider font-bold">DAY:</span>
                    {meeting.day}
                  </div>
                  <div>
                    <span className="text-zinc-550 block text-[9px] uppercase tracking-wider font-bold">TIME:</span>
                    {meeting.time}
                  </div>
                </div>

                {meeting.link && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={meeting.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#00E5FF]/10 border border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/40 text-[#00E5FF] px-4 py-1.5 rounded-lg transition-colors text-[10px] font-bold flex items-center space-x-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>LAUNCH SECURED CONFERENCE</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}


export function EmployeeCustomLogsView() {
  const { customLogs, fetchCustomLogs, submitCustomLog, userProfile, simulatedUser } = useSevenStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeUser = simulatedUser || userProfile;

  useEffect(() => {
    fetchCustomLogs();
    // Poll every 10s for real-time updates (CEO audit view too)
    const interval = setInterval(fetchCustomLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchCustomLogs, activeUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const ok = await submitCustomLog(content);
    setIsSubmitting(false);

    if (ok) {
      setSuccess(true);
      setContent("");
      fetchCustomLogs();
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Submit Custom Log Form */}
      <div className="lg:col-span-1 bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4 h-fit">
        <div className="border-b border-zinc-850 pb-3">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#00E5FF]" />
            <span>SUBMIT CUSTOM LOG</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-550 uppercase">Log Entry Content</label>
            <textarea
              placeholder="Record a custom activity log or update..."
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg border text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center space-x-2 ${
              success
                ? "bg-emerald-950/20 border-emerald-500 text-emerald-400"
                : "bg-[#00E5FF]/10 border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 text-[#00E5FF] hover:border-[#00E5FF]/40 cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">RECORDING LOG...</span>
            ) : success ? (
              <span>LOG RECORDED</span>
            ) : (
              <span>SUBMIT ENTRY</span>
            )}
          </button>
        </form>
      </div>

      {/* Custom Log List */}
      <div className="lg:col-span-2 bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-855 pb-3">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#00E5FF]" />
            <span>MY CUSTOM LOG ARCHIVES</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-550">
            {simulatedUser ? "SIMULATED USER LOGS" : "PERSONAL UPDATES"}
          </span>
        </div>

        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
          {customLogs.length === 0 ? (
            <div className="text-center py-16 text-xs font-mono text-zinc-650">
              No custom log entries recorded.
            </div>
          ) : (
            customLogs.map((log) => (
              <div
                key={log.log_id}
                className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-2 font-mono text-xs"
              >
                <div className="flex justify-between items-center text-[10px] text-zinc-500 border-b border-zinc-900 pb-1.5">
                  <span>LOG ENTRY: #{log.log_id.substring(0, 8)}</span>
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                  {log.log_content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export function EmployeeClientCorrespondenceView() {
  const { 
    dashboardData, 
    tasks, 
    fetchTasks, 
    allUsers, 
    fetchAllUsers, 
    assignTask, 
    updateTaskStatus, 
    userProfile, 
    simulatedUser 
  } = useSevenStore();

  const currentUser = simulatedUser || userProfile;
  const activeProjects = dashboardData?.active_projects || [];

  const [selectedProject, setSelectedProject] = useState<any>(
    activeProjects.length > 0 ? activeProjects[0] : null
  );

  const [remarks, setRemarks] = useState<any[]>([]);
  const [remarkInput, setRemarkInput] = useState("");
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [loadingRemarks, setLoadingRemarks] = useState(false);

  // Sync selected project if activeProjects loads
  useEffect(() => {
    if (activeProjects.length > 0 && !selectedProject) {
      setSelectedProject(activeProjects[0]);
    }
  }, [activeProjects, selectedProject]);

  // Fetch all tasks and all users on mount
  useEffect(() => {
    fetchTasks();
    if (allUsers.length === 0) {
      fetchAllUsers();
    }
  }, []);

  const fetchRemarks = async () => {
    if (!selectedProject) return;
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

  // Poll remarks for selected project
  useEffect(() => {
    if (selectedProject) {
      setLoadingRemarks(true);
      fetchRemarks().finally(() => setLoadingRemarks(false));
      
      const interval = setInterval(fetchRemarks, 4000);
      return () => clearInterval(interval);
    } else {
      setRemarks([]);
    }
  }, [selectedProject]);

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
      }
    } catch (err) {
      console.error("Failed to post remark", err);
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    if (!currentUser) return;
    await assignTask(taskId, currentUser.user_id);
    await updateTaskStatus(taskId, "In Progress");
    fetchTasks();
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTaskStatus(taskId, newStatus);
    fetchTasks();
  };

  // Filter client enquiries for selected project
  const clientEnquiries = tasks.filter(t => 
    t.project_id === selectedProject?.project_id && 
    (t.title || "").startsWith("[Client Enquiry]")
  );

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Project Selector Header */}
      <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Client Correspondence Center</h2>
          <p className="text-[10px] text-zinc-550 font-mono mt-0.5">READ CLIENT STATUS REMARKS AND MANAGE DIRECT REQUEST TICKETS</p>
        </div>

        {activeProjects.length > 0 ? (
          <div className="flex items-center space-x-3 bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono w-full sm:w-auto">
            <span className="text-zinc-550 uppercase text-[10px]">Active Project:</span>
            <select
              value={selectedProject?.project_id || ""}
              onChange={(e) => {
                const proj = activeProjects.find((p: any) => p.project_id === e.target.value);
                if (proj) setSelectedProject(proj);
              }}
              className="bg-transparent border-none text-white focus:outline-none text-xs ml-2 cursor-pointer font-bold"
            >
              {activeProjects.map((p: any) => (
                <option key={p.project_id} value={p.project_id} className="bg-zinc-950 text-white">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-zinc-650 text-xs font-mono">No active projects assigned to your squad.</div>
        )}
      </div>

      {selectedProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Client Remarks & Chat Reply */}
          <div className="bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col h-[500px]">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3 mb-4 shrink-0">
              <MessageSquare className="w-4 h-4 text-[#00E5FF]" />
              <span>CLIENT STATUS REMARKS & UPDATE STREAM</span>
            </h3>

            {/* Remarks List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar flex flex-col">
              {loadingRemarks ? (
                <div className="h-full flex items-center justify-center text-zinc-650 text-[11px] font-mono animate-pulse">
                  SYNCING WITH CORRESPONDENCE STREAM...
                </div>
              ) : remarks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 p-6 text-xs font-mono">
                  <span>No feedback remarks posted by the client yet. Post a status update below to start correspondence.</span>
                </div>
              ) : (
                remarks.map((r: any) => {
                  const isClient = r.sender?.user_type === "Client";
                  return (
                    <div 
                      key={r.remark_id} 
                      className={`p-3 rounded-lg border flex flex-col space-y-1.5 font-mono text-[11px] max-w-[90%] ${
                        isClient 
                          ? "bg-purple-950/10 border-purple-900/30 text-purple-250 self-start mr-auto" 
                          : "bg-cyan-950/10 border-cyan-900/30 text-cyan-250 self-end ml-auto"
                      }`}
                    >
                      <div className="flex justify-between items-center space-x-4 border-b border-zinc-900/50 pb-1 text-[9px] text-zinc-500">
                        <span className={`font-bold ${isClient ? "text-purple-400" : "text-cyan-400"}`}>
                          {r.sender?.full_name || "Unknown User"} ({isClient ? "Client" : "Team Member"})
                        </span>
                        <span>{new Date(r.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="leading-relaxed text-zinc-300 break-words whitespace-pre-wrap">{r.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handlePostRemark} className="flex items-center space-x-2 border-t border-zinc-850 pt-3 shrink-0">
              <input
                type="text"
                placeholder="Type status remark response..."
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
              />
              <button
                type="submit"
                disabled={isSubmittingRemark || !remarkInput.trim()}
                className="bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded font-mono text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>POST</span>
              </button>
            </form>
          </div>

          {/* Right Column: Client Task Enquiries */}
          <div className="bg-[#0e0e0e]/95 border border-zinc-800 rounded-xl p-5 flex flex-col h-[500px]">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3 mb-4 shrink-0">
              <CheckSquare className="w-4 h-4 text-purple-400" />
              <span>CLIENT REQUESTS & ENQUIRIES QUEUE</span>
            </h3>

            {/* Enquiries List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
              {clientEnquiries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-zinc-655 text-xs font-mono">
                  No direct client task requests logged for this project.
                </div>
              ) : (
                clientEnquiries.map((task: any) => {
                  const assignedUser = allUsers.find(u => u.user_id === task.assigned_user_id);
                  const isClaimedByMe = task.assigned_user_id === currentUser?.user_id;

                  return (
                    <div key={task.task_id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1 min-w-0 mr-4">
                          <h4 className="text-white font-bold truncate">
                            {task.title.replace("[Client Enquiry] ", "")}
                          </h4>
                          <p className="text-[11px] text-zinc-450 leading-relaxed max-h-16 overflow-y-auto custom-scrollbar">
                            {task.description || "No description provided."}
                          </p>
                        </div>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold ${
                          task.status === "Done" || task.status === "Deployed"
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                            : task.status === "In Progress"
                            ? "bg-cyan-950/20 border-cyan-900/40 text-cyan-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      {/* Assignment & Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900/60 pt-2 text-[10px] text-zinc-550">
                        <div>
                          {task.assigned_user_id ? (
                            <span>
                              ASSIGNED: <strong className="text-zinc-350">{assignedUser?.full_name || "Resource"}</strong>
                            </span>
                          ) : (
                            <span className="text-amber-500 font-bold animate-pulse">UNASSIGNED REQUEST</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {!task.assigned_user_id ? (
                            <button
                              onClick={() => handleClaimTask(task.task_id)}
                              className="bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 transition-colors"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>CLAIM TICKET</span>
                            </button>
                          ) : (
                            isClaimedByMe && (
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] text-zinc-550">STATUS:</span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                                  className="bg-zinc-905 border border-zinc-800 text-zinc-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
                                >
                                  <option value="Backlog">Backlog</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="QA">QA</option>
                                  <option value="Review">Review</option>
                                  <option value="Done">Done</option>
                                  <option value="Deployed">Deployed</option>
                                </select>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Work Logger Form for Claimed Task */}
                      {isClaimedByMe && task.status !== "Done" && task.status !== "Deployed" && (
                        <div className="mt-3 pt-3 border-t border-zinc-900/60">
                          <p className="text-[9px] text-zinc-550 uppercase tracking-widest mb-1.5 font-bold">Log work on this ticket:</p>
                          <WorkLogger taskId={task.task_id} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs font-mono text-zinc-650 bg-[#0e0e0e] border border-zinc-850 rounded-xl">
          Select an active project from the squad selector to load correspondence.
        </div>
      )}
    </div>
  );
}
