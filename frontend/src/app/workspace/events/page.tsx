"use client";

import React, { useState, useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { 
  ShieldAlert, 
  Calendar, 
  Clock, 
  Plus, 
  Users, 
  ExternalLink, 
  User, 
  Folder, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Info, 
  RefreshCw, 
  Bell, 
  Video, 
  Send
} from "lucide-react";

interface Beacon {
  beacon_id: string;
  message: string;
  target_type: string;
  target_id: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
  deadline: string;
  is_resolved: boolean;
  resolved_at: string | null;
  responses: Array<{
    user_id: string;
    user_name: string;
    reply: string;
    timestamp: string;
  }>;
}

interface Meeting {
  meeting_id: string;
  title: string;
  day: string;
  time: string;
  link: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  target_type?: string;
  target_id?: string;
}

interface Reminder {
  reminder_id: string;
  message: string;
  target_id: string;
  created_at: string;
  deadline: string;
  is_replied: boolean;
  replied_at: string | null;
  reply_content: string | null;
}

export default function EventsPage() {
  const { userProfile, simulatedUser, allUsers, fetchAllUsers } = useSevenStore();
  
  // Lists
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  // Loading & Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Beacon form state
  const [beaconMsg, setBeaconMsg] = useState("");
  const [beaconTargetType, setBeaconTargetType] = useState("all");
  const [beaconTargetId, setBeaconTargetId] = useState("");
  const [isSubmittingBeacon, setIsSubmittingBeacon] = useState(false);
  
  // Meeting form state
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);
  const [meetingTargetType, setMeetingTargetType] = useState("all");
  const [meetingTargetId, setMeetingTargetId] = useState("");

  const clientUsers = allUsers.filter(u => u.user_type === "Client");
  const individualUsers = allUsers.filter(u => u.user_type !== "Client");
  
  // Reminder form state
  const [reminderMsg, setReminderMsg] = useState("");
  const [reminderTargetId, setReminderTargetId] = useState("");
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);
  
  // Dynamic action inputs
  const [beaconReplies, setBeaconReplies] = useState<Record<string, string>>({});
  const [reminderReplies, setReminderReplies] = useState<Record<string, string>>({});

  // Sync Timer for ticking countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    setIsSyncing(true);
    const token = localStorage.getItem("seven_token");
    const headers = { "Authorization": `Bearer ${token}` };

    const simulateParam = simulatedUser ? `?simulate_user_id=${simulatedUser.user_id}` : "";

    try {
      // Fetch users, beacons, meetings, reminders
      fetchAllUsers();
      
      const beaconsRes = await fetch(`/api/v1/events/beacons${simulateParam}`, { headers });
      if (beaconsRes.ok) {
        const data = await beaconsRes.json();
        setBeacons(data);
      }
      
      const meetingsRes = await fetch(`/api/v1/events/meetings${simulateParam}`, { headers });
      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        setMeetings(data);
      }
      
      const remindersRes = await fetch(`/api/v1/events/reminders${simulateParam}`, { headers });
      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data);
      }

      // Fetch projects
      const projectsRes = await fetch(`/api/projects${simulateParam}`, { headers });
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data);
      }

      // Fetch groups
      const groupsRes = await fetch(`/api/groups${simulateParam}`, { headers });
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Failed to load events telemetry", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [simulatedUser]);

  // Handle Target Type Change
  useEffect(() => {
    if (beaconTargetType === "all") {
      setBeaconTargetId("");
    } else if (beaconTargetType === "user" && allUsers.length > 0) {
      setBeaconTargetId(allUsers[0].user_id);
    } else if (beaconTargetType === "project" && projects.length > 0) {
      setBeaconTargetId(projects[0].project_id);
    } else if (beaconTargetType === "group" && groups.length > 0) {
      setBeaconTargetId(groups[0].group_id);
    }
  }, [beaconTargetType, allUsers, projects, groups]);

  // Handle Meeting Target Type Change
  useEffect(() => {
    if (meetingTargetType === "all") {
      setMeetingTargetId("");
    } else if (meetingTargetType === "user" && individualUsers.length > 0) {
      setMeetingTargetId(individualUsers[0].user_id);
    } else if (meetingTargetType === "project" && projects.length > 0) {
      setMeetingTargetId(projects[0].project_id);
    } else if (meetingTargetType === "group" && groups.length > 0) {
      setMeetingTargetId(groups[0].group_id);
    } else if (meetingTargetType === "client" && clientUsers.length > 0) {
      setMeetingTargetId(clientUsers[0].user_id);
    }
  }, [meetingTargetType, allUsers, projects, groups]);

  const getMeetingTargetLabel = (meeting: Meeting) => {
    if (!meeting.target_type || meeting.target_type === "all") {
      return null;
    }
    
    switch (meeting.target_type) {
      case "user": {
        const u = allUsers.find(user => user.user_id === meeting.target_id);
        return { label: `User: ${u ? u.full_name : "Unknown"}`, type: "user" };
      }
      case "project": {
        const p = projects.find(proj => proj.project_id === meeting.target_id);
        return { label: `Proj: ${p ? p.title : "Unknown"}`, type: "project" };
      }
      case "group": {
        const g = groups.find(grp => grp.group_id === meeting.target_id);
        return { label: `Group: ${g ? g.name : "Unknown"}`, type: "group" };
      }
      case "client": {
        const u = allUsers.find(user => user.user_id === meeting.target_id);
        return { label: `Client: ${u ? u.full_name : "Unknown"}`, type: "client" };
      }
      default:
        return null;
    }
  };

  // Spot Google Meet link generator
  const generateGoogleMeetLink = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const generatedLink = `https://meet.google.com/${part1}-${part2}-${part3}`;
    setMeetingLink(generatedLink);
  };

  // Submit Beacon
  const handleCreateBeacon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beaconMsg.trim()) return;

    setIsSubmittingBeacon(true);
    const token = localStorage.getItem("seven_token");
    const simulateParam = simulatedUser ? `?simulate_user_id=${simulatedUser.user_id}` : "";
    try {
      const res = await fetch(`/api/v1/events/beacons${simulateParam}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: beaconMsg,
          target_type: beaconTargetType,
          target_id: beaconTargetId || null
        })
      });
      if (res.ok) {
        setBeaconMsg("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingBeacon(false);
    }
  };

  // Submit Meeting
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDay || !meetingTime || !meetingLink.trim()) return;

    setIsSubmittingMeeting(true);
    const token = localStorage.getItem("seven_token");
    const simulateParam = simulatedUser ? `?simulate_user_id=${simulatedUser.user_id}` : "";
    try {
      const res = await fetch(`/api/v1/events/meetings${simulateParam}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: meetingTitle,
          day: meetingDay,
          time: meetingTime,
          link: meetingLink,
          target_type: meetingTargetType,
          target_id: meetingTargetId || null
        })
      });
      if (res.ok) {
        setMeetingTitle("");
        setMeetingDay("");
        setMeetingTime("");
        setMeetingLink("");
        setMeetingTargetType("all");
        setMeetingTargetId("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMeeting(false);
    }
  };

  // Submit Reminder
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderMsg.trim() || !reminderTargetId) return;

    setIsSubmittingReminder(true);
    const token = localStorage.getItem("seven_token");
    const simulateParam = simulatedUser ? `?simulate_user_id=${simulatedUser.user_id}` : "";
    try {
      const res = await fetch(`/api/v1/events/reminders${simulateParam}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: reminderMsg,
          target_id: reminderTargetId
        })
      });
      if (res.ok) {
        setReminderMsg("");
        setReminderTargetId("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  // Reply to Beacon
  const handleReplyBeacon = async (beaconId: string) => {
    const reply = beaconReplies[beaconId];
    if (!reply || !reply.trim()) return;

    const token = localStorage.getItem("seven_token");
    const simulateParam = simulatedUser ? `?simulate_user_id=${simulatedUser.user_id}` : "";
    try {
      const res = await fetch(`/api/v1/events/beacons/${beaconId}/reply${simulateParam}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reply })
      });
      if (res.ok) {
        setBeaconReplies(prev => ({ ...prev, [beaconId]: "" }));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reply to Reminder
  const handleReplyReminder = async (reminderId: string) => {
    const reply = reminderReplies[reminderId];
    if (!reply || !reply.trim()) return;

    const token = localStorage.getItem("seven_token");
    const simulateParam = simulatedUser ? `?simulate_user_id=${simulatedUser.user_id}` : "";
    try {
      const res = await fetch(`/api/v1/events/reminders/${reminderId}/reply${simulateParam}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reply })
      });
      if (res.ok) {
        setReminderReplies(prev => ({ ...prev, [reminderId]: "" }));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Countdown Helper
  const getCountdownString = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const diff = deadline.getTime() - currentTime.getTime();
    if (diff <= 0) return { text: "BREACHED", status: "breached" };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return { text: `${hours}h ${mins}m ${secs}s`, status: "active" };
    }
    return { text: `${mins}m ${secs}s`, status: "urgent" };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">SYSTEM EVENT OPERATIONS</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">BEACON ALERTS & SCHEDULER</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData} 
            disabled={isSyncing}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#00E5FF]" : ""}`} />
            <span>SYNC NODES</span>
          </button>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="flex-1 flex flex-col min-h-0 space-y-8 overflow-y-auto pr-1">
        
        {/* Row 1: Form Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Provision Beacon Alert */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <div className="flex items-center space-x-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-sm font-bold tracking-[0.1em] text-white font-mono uppercase">PROVISION BEACON ALERT</h2>
            </div>
            
            <form onSubmit={handleCreateBeacon} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Message Content</label>
                  <textarea
                    value={beaconMsg}
                    onChange={(e) => setBeaconMsg(e.target.value)}
                    placeholder="Specify important & urgent event (requires 40-minute reply)..."
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500/50 min-h-[70px] resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Targeting Type</label>
                    <select
                      value={beaconTargetType}
                      onChange={(e) => setBeaconTargetType(e.target.value)}
                      className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-red-500/50"
                    >
                      <option value="all">All Channels</option>
                      <option value="user">Specific User</option>
                      <option value="project">Project Members</option>
                      <option value="group">Squad Group</option>
                    </select>
                  </div>

                  {beaconTargetType !== "all" && (
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Target Node</label>
                      <select
                        value={beaconTargetId}
                        onChange={(e) => setBeaconTargetId(e.target.value)}
                        className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-red-500/50"
                        required
                      >
                        {beaconTargetType === "user" && allUsers.map(u => (
                          <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                        ))}
                        {beaconTargetType === "project" && projects.map(p => (
                          <option key={p.project_id} value={p.project_id}>{p.title}</option>
                        ))}
                        {beaconTargetType === "group" && groups.map(g => (
                          <option key={g.group_id} value={g.group_id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-550 bg-red-950/20 border border-red-900/30 rounded p-2">
                  <Info className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Validator locks deadline to 40 minutes. Recipients must acknowledge or log compliance immediately.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingBeacon}
                className="w-full py-2 rounded-lg font-mono text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isSubmittingBeacon ? "BROADCASTING..." : "DISPATCH BEACON"}</span>
              </button>
            </form>
          </div>

          {/* Card 2: Schedule Call / Meeting */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-sm font-bold tracking-[0.1em] text-white font-mono uppercase">SCHEDULE CALL / MEETING</h2>
            </div>
            
            <form onSubmit={handleCreateMeeting} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Meeting Title</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g. Scraper Architecture Review"
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Day / Date</label>
                    <input
                      type="date"
                      value={meetingDay}
                      onChange={(e) => setMeetingDay(e.target.value)}
                      className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#00E5FF]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Time</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#00E5FF]/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Target Type</label>
                    <select
                      value={meetingTargetType}
                      onChange={(e) => setMeetingTargetType(e.target.value)}
                      className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#00E5FF]/50"
                    >
                      <option value="all">All Members</option>
                      <option value="user">Individual User</option>
                      <option value="project">Project Members</option>
                      <option value="group">Squad Group</option>
                      <option value="client">Client Group</option>
                    </select>
                  </div>

                  {meetingTargetType !== "all" && (
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Target Name</label>
                      <select
                        value={meetingTargetId}
                        onChange={(e) => setMeetingTargetId(e.target.value)}
                        className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#00E5FF]/50"
                        required
                      >
                        {meetingTargetType === "user" && individualUsers.map(u => (
                          <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                        ))}
                        {meetingTargetType === "project" && projects.map(p => (
                          <option key={p.project_id} value={p.project_id}>{p.title}</option>
                        ))}
                        {meetingTargetType === "group" && groups.map(g => (
                          <option key={g.group_id} value={g.group_id}>{g.name}</option>
                        ))}
                        {meetingTargetType === "client" && clientUsers.map(u => (
                          <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1 flex items-center justify-between">
                    <span>Meeting Link</span>
                    <button
                      type="button"
                      onClick={generateGoogleMeetLink}
                      className="text-[#00E5FF] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>GENERATE GOOGLE MEET</span>
                    </button>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="flex-1 bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingMeeting}
                className="w-full py-2 rounded-lg font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingMeeting ? "SAVING CALL..." : "SCHEDULE CALL"}</span>
              </button>
            </form>
          </div>

          {/* Card 3: Create Targeted Reminder */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold tracking-[0.1em] text-white font-mono uppercase">CREATE TARGETED REMINDER</h2>
            </div>

            <form onSubmit={handleCreateReminder} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Reminder Alert Message</label>
                  <textarea
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    placeholder="Task, checkup, or updates required..."
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50 min-h-[60px] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-550 uppercase mb-1">Target Individual</label>
                  <select
                    value={reminderTargetId}
                    onChange={(e) => setReminderTargetId(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-500/50"
                    required
                  >
                    <option value="">-- Choose User --</option>
                    {allUsers.map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.department || "General"})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-550 bg-amber-950/20 border border-amber-900/30 rounded p-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Reminders require response inside a strict 6-hour window before marked overdue.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReminder}
                className="w-full py-2 rounded-lg font-mono text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{isSubmittingReminder ? "DISPATCHING..." : "SEND REMINDER"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Row 2: Registry / List Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* List 1: Active Beacon Registry */}
          <div className="flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold tracking-[0.1em] text-zinc-400 font-mono uppercase mb-3 px-1 flex items-center justify-between">
              <span>ACTIVE BEACON REGISTRY</span>
              <span className="text-[10px] text-zinc-550 font-normal">({beacons.length} items)</span>
            </h3>
            
            <div className="space-y-3">
              {beacons.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-600">
                  No Beacon broadcasts registered.
                </div>
              ) : (
                beacons.map((beacon) => {
                  const countdown = getCountdownString(beacon.deadline);
                  const isBreached = countdown.status === "breached";
                  return (
                    <div 
                      key={beacon.beacon_id} 
                      className={`bg-[#0d0d0d] border rounded-lg p-4 font-mono transition-all relative ${
                        beacon.is_resolved 
                          ? "border-emerald-900/50 bg-emerald-950/5" 
                          : isBreached 
                            ? "border-red-900 shadow-[0_0_10px_rgba(239,68,68,0.05)] bg-red-950/5" 
                            : "border-zinc-800"
                      }`}
                    >
                      {/* Top status & target */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                            beacon.is_resolved
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                              : isBreached
                                ? "bg-red-950/40 text-red-500 border-red-900/50 animate-pulse"
                                : "bg-red-950/20 text-red-400 border-red-800/40"
                          }`}>
                            {beacon.is_resolved ? "RESOLVED" : isBreached ? "BREACHED" : "ACTIVE BEACON"}
                          </span>
                          <span className="text-[9px] text-zinc-500">Target: {beacon.target_type} ({beacon.target_id})</span>
                        </div>
                        
                        {/* Timer */}
                        {!beacon.is_resolved && (
                          <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                            <Clock className={`w-3.5 h-3.5 ${countdown.status === "urgent" || isBreached ? "text-red-500 animate-pulse" : "text-[#00E5FF]"}`} />
                            <span className={countdown.status === "urgent" || isBreached ? "text-red-400" : "text-[#00E5FF]"}>
                              {countdown.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Msg */}
                      <p className="text-xs text-zinc-200 mb-3 whitespace-pre-wrap leading-relaxed">{beacon.message}</p>
                      
                      <div className="text-[9px] text-zinc-500 mb-3 flex justify-between">
                        <span>Sender: {beacon.sender_name}</span>
                        <span>Created: {new Date(beacon.created_at).toLocaleTimeString()}</span>
                      </div>

                      {/* User responses/replies log */}
                      {beacon.responses.length > 0 && (
                        <div className="bg-[#050505] border border-zinc-800/60 rounded p-2 mb-3 space-y-1.5 max-h-[100px] overflow-y-auto">
                          {beacon.responses.map((resp, idx) => (
                            <div key={idx} className="text-[10px] text-zinc-450 border-b border-zinc-900 pb-1 last:border-b-0 last:pb-0">
                              <span className="font-bold text-white">{resp.user_name}:</span> {resp.reply}
                              <span className="float-right text-[8px] text-zinc-650">{new Date(resp.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {!beacon.is_resolved && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Acknowledge beacon with response..."
                            value={beaconReplies[beacon.beacon_id] || ""}
                            onChange={(e) => setBeaconReplies(prev => ({ ...prev, [beacon.beacon_id]: e.target.value }))}
                            className="flex-1 bg-[#050505] border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-red-500/40"
                          />
                          <button
                            onClick={() => handleReplyBeacon(beacon.beacon_id)}
                            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 rounded text-[10px] font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>SUBMIT</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* List 2: Scheduled Telemetry Calls */}
          <div className="flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold tracking-[0.1em] text-zinc-400 font-mono uppercase mb-3 px-1 flex items-center justify-between">
              <span>SCHEDULED TELEMETRY CALLS</span>
              <span className="text-[10px] text-zinc-550 font-normal">({meetings.length} calls)</span>
            </h3>

            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-600">
                  No upcoming calls scheduled.
                </div>
              ) : (
                meetings.map((meeting) => (
                  <div key={meeting.meeting_id} className="bg-[#0d0d0d] border border-zinc-800 rounded-lg p-4 font-mono transition-all hover:border-cyan-950">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">{meeting.title}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-zinc-450">
                          <span>Date: {meeting.day}</span>
                          <span>•</span>
                          <span>Time: {meeting.time}</span>
                        </div>
                        {(() => {
                          const target = getMeetingTargetLabel(meeting);
                          if (!target) return null;
                          let badgeColor = "bg-zinc-800 text-zinc-300";
                          if (target.type === "project") badgeColor = "bg-purple-950/40 text-purple-400 border border-purple-900/30";
                          if (target.type === "group") badgeColor = "bg-blue-950/40 text-blue-400 border border-blue-900/30";
                          if (target.type === "client") badgeColor = "bg-amber-950/40 text-amber-400 border border-amber-900/30";
                          if (target.type === "user") badgeColor = "bg-green-950/40 text-green-400 border border-green-900/30";
                          
                          return (
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase mt-1.5 ${badgeColor}`}>
                              {target.label}
                            </span>
                          );
                        })()}
                      </div>
                      <a
                        href={meeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-cyan-950/40 border border-cyan-800/40 text-[#00E5FF] hover:bg-cyan-900/60 rounded transition-all"
                        title="Join Meeting"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-550">
                      <span>Organized: {meeting.creator_name}</span>
                      <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 flex items-center space-x-1 hover:underline">
                        <span>meetLink</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* List 3: Targeted Reminders */}
          <div className="flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold tracking-[0.1em] text-zinc-400 font-mono uppercase mb-3 px-1 flex items-center justify-between">
              <span>MY TARGETED REMINDERS</span>
              <span className="text-[10px] text-zinc-550 font-normal">({reminders.length} pending)</span>
            </h3>

            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-650">
                  No reminders targeted to simulated account.
                </div>
              ) : (
                reminders.map((reminder) => {
                  const countdown = getCountdownString(reminder.deadline);
                  const isExpired = countdown.status === "breached";
                  return (
                    <div 
                      key={reminder.reminder_id} 
                      className={`bg-[#0d0d0d] border rounded-lg p-4 font-mono transition-all ${
                        reminder.is_replied 
                          ? "border-emerald-900/40 bg-emerald-950/5" 
                          : isExpired 
                            ? "border-red-950/80 bg-red-950/5" 
                            : "border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                          reminder.is_replied
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                            : isExpired
                              ? "bg-red-950/40 text-red-500 border-red-900/50"
                              : "bg-amber-950/20 text-amber-400 border-amber-800/40"
                        }`}>
                          {reminder.is_replied ? "COMPLIED" : isExpired ? "OVERDUE" : "PENDING (6H LIMIT)"}
                        </span>
                        
                        {!reminder.is_replied && (
                          <div className="flex items-center space-x-1 text-[10px] text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isExpired ? "Expired" : countdown.text}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-zinc-200 mb-2 leading-relaxed">{reminder.message}</p>
                      
                      <div className="text-[8px] text-zinc-650 mb-3">
                        <span>Created: {new Date(reminder.created_at).toLocaleString()}</span>
                      </div>

                      {reminder.is_replied && (
                        <div className="bg-[#050505] border border-emerald-950/60 rounded p-2 text-[10px] text-emerald-400">
                          <span className="font-bold">Compliance Response:</span> {reminder.reply_content}
                          {reminder.replied_at && (
                            <span className="block text-[8px] text-zinc-650 mt-1">
                              Replied: {new Date(reminder.replied_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      )}

                      {!reminder.is_replied && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Enter reply message..."
                            value={reminderReplies[reminder.reminder_id] || ""}
                            onChange={(e) => setReminderReplies(prev => ({ ...prev, [reminder.reminder_id]: e.target.value }))}
                            className="flex-1 bg-[#050505] border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500/40"
                          />
                          <button
                            onClick={() => handleReplyReminder(reminder.reminder_id)}
                            className="px-2.5 py-1 bg-[#2b1f13] hover:bg-amber-950 border border-amber-800/40 text-amber-300 rounded text-[10px] font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>REPLY</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
