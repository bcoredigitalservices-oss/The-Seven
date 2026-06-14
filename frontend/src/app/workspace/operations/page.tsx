'use client';

import React, { useEffect, useState } from "react";
import { 
  useSevenStore, 
  Project, 
  Group, 
  GroupMember, 
  UserProfile,
  Task
} from "@/store/useSevenStore";
import { 
  Plus, 
  Trash2, 
  Users, 
  Folder, 
  Play, 
  Pause, 
  Clock, 
  UserPlus, 
  UserMinus, 
  Check, 
  X, 
  Shield, 
  Search,
  Settings,
  Briefcase,
  Layers,
  Activity,
  Terminal,
  FileCode,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Edit3,
  FolderKanban
} from "lucide-react";
import ProjectDashboardView from "@/components/workspace/ProjectDashboardView";

interface ExpiryInfo {
  createdStr: string;
  expiryStr: string;
  daysTotal: number;
  daysLeft: number;
  weeksTotal: number;
  weeksLeft: number;
  hoursTotal: number;
  hoursLeft: number;
  isExpired: boolean;
  progressPercent: number;
}

export default function OperationsPage() {
  const { 
    projects, 
    fetchProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    groups,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchGroupMembers,
    addUserToGroup,
    removeUserFromGroup,
    adminUsers,
    fetchAdminUsers,
    tasks,
    fetchTasks,
    createTask,
    updateTaskStatus,
    assignTask,
    activityLogs,
    connectWebSocket,
    disconnectWebSocket
  } = useSevenStore();

  const [activeTab, setActiveTab] = useState<"projects" | "groups" | "tasks">("projects");
  const [searchTerm, setSearchTerm] = useState("");

  // Selected Project & Dashboard State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dashboardProject, setDashboardProject] = useState<Project | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDepartment, setEditProjectDepartment] = useState("");
  const [editProjectClientId, setEditProjectClientId] = useState("");
  const [editProjectWorkerType, setEditProjectWorkerType] = useState<"Individual" | "Group">("Individual");
  const [editProjectWorkerId, setEditProjectWorkerId] = useState("");
  const [editProjectDeadline, setEditProjectDeadline] = useState("");

  useEffect(() => {
    if (selectedProject) {
      setEditProjectTitle(selectedProject.title);
      setEditProjectDepartment(selectedProject.department || "IT_SAAS");
      setEditProjectClientId(selectedProject.client_id || "");
      setEditProjectWorkerType((selectedProject.worker_type as any) || "Individual");
      setEditProjectWorkerId(
        selectedProject.worker_type === "Individual" 
          ? selectedProject.assigned_user_id || "" 
          : selectedProject.assigned_group_id || ""
      );
      setEditProjectDeadline(
        selectedProject.deadline 
          ? new Date(selectedProject.deadline).toISOString().substring(0, 16) 
          : ""
      );
      setProjectError("");
      setProjectSuccess("");
    }
  }, [selectedProject]);

  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setProjectError("");
    setProjectSuccess("");
    
    const updateData: any = {
      title: editProjectTitle,
      department: editProjectDepartment,
      client_id: editProjectClientId || "",
      worker_type: editProjectWorkerType,
      deadline: editProjectDeadline ? new Date(editProjectDeadline).toISOString() : null,
      assigned_user_id: editProjectWorkerType === "Individual" ? editProjectWorkerId || "" : "",
      assigned_group_id: editProjectWorkerType === "Group" ? editProjectWorkerId || "" : ""
    };
    
    const ok = await updateProject(selectedProject.project_id, updateData);
    if (ok) {
      setProjectSuccess("Project configuration synchronized successfully.");
      // Find latest project from projects to make sure it includes the websocket update
      const updated = { ...selectedProject, ...updateData };
      setSelectedProject(updated);
    } else {
      setProjectError("Failed to update project configurations.");
    }
  };
  
  // Project Form State
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectClientId, setNewProjectClientId] = useState("");
  const [newProjectWorkerType, setNewProjectWorkerType] = useState<"Individual" | "Group">("Individual");
  const [newProjectWorkerId, setNewProjectWorkerId] = useState("");
  const [newProjectDeadline, setNewProjectDeadline] = useState("");
  const [newProjectDepartment, setNewProjectDepartment] = useState("IT_SAAS");
  const [projectError, setProjectError] = useState("");
  const [projectSuccess, setProjectSuccess] = useState("");

  // Group Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Record<string, boolean>>({});
  const [leadMemberIds, setLeadMemberIds] = useState<Record<string, boolean>>({});
  const [groupError, setGroupError] = useState("");
  const [groupSuccess, setGroupSuccess] = useState("");

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState("");
  const [newTaskUserId, setNewTaskUserId] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");

  // Selected Group Details
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembersList, setGroupMembersList] = useState<GroupMember[]>([]);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");

  // Group Members Cache for filtering task assignment
  const [groupMembersCache, setGroupMembersCache] = useState<Record<string, GroupMember[]>>({});

  useEffect(() => {
    fetchProjects();
    fetchGroups();
    fetchAdminUsers();
    fetchTasks();
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [fetchProjects, fetchGroups, fetchAdminUsers, fetchTasks, connectWebSocket, disconnectWebSocket]);

  // Load members when selected group changes
  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.group_id);
    } else {
      setGroupMembersList([]);
    }
  }, [selectedGroup]);

  // Sync group roster cache
  useEffect(() => {
    const loadAllMembers = async () => {
      const cache: Record<string, GroupMember[]> = {};
      for (const g of groups) {
        const list = await fetchGroupMembers(g.group_id);
        cache[g.group_id] = list;
      }
      setGroupMembersCache(cache);
    };
    if (groups.length > 0) {
      loadAllMembers();
    }
  }, [groups, fetchGroupMembers]);

  const loadGroupMembers = async (groupId: string) => {
    const list = await fetchGroupMembers(groupId);
    setGroupMembersList(list);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectError("");
    setProjectSuccess("");
    if (!newProjectTitle.trim()) {
      setProjectError("Project title is required.");
      return;
    }
    
    const workerParams = {
      worker_type: newProjectWorkerType,
      assigned_user_id: newProjectWorkerType === "Individual" && newProjectWorkerId ? newProjectWorkerId : null,
      assigned_group_id: newProjectWorkerType === "Group" && newProjectWorkerId ? newProjectWorkerId : null,
    };

    const ok = await createProject({
      title: newProjectTitle.trim(),
      client_id: newProjectClientId || null,
      deadline: newProjectDeadline || null,
      department: newProjectDepartment || null,
      ...workerParams
    });

    if (ok) {
      setProjectSuccess(`Project "${newProjectTitle}" initialized successfully.`);
      setNewProjectTitle("");
      setNewProjectClientId("");
      setNewProjectWorkerId("");
      setNewProjectDeadline("");
      setNewProjectDepartment("IT_SAAS");
    } else {
      setProjectError("Failed to initialize project.");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError("");
    setGroupSuccess("");
    if (!newGroupName.trim()) {
      setGroupError("Group name is required.");
      return;
    }
    
    const group = await createGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined,
      project_id: null // No project assignment needed on creation
    });

    if (group) {
      // Add selected users as members
      const selectedUsersList = Object.keys(selectedMemberIds).filter(uid => selectedMemberIds[uid]);
      for (const uid of selectedUsersList) {
        await addUserToGroup(group.group_id, {
          user_id: uid,
          role: leadMemberIds[uid] ? "Lead" : "Member"
        });
      }

      setGroupSuccess(`Group "${newGroupName}" initialized with ${selectedUsersList.length} members.`);
      setNewGroupName("");
      setNewGroupDesc("");
      setSelectedMemberIds({});
      setLeadMemberIds({});
    } else {
      setGroupError("Failed to initialize group.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError("");
    setTaskSuccess("");
    if (!newTaskTitle.trim()) {
      setTaskError("Task title is required.");
      return;
    }
    if (!newTaskProjectId) {
      setTaskError("Please select a target project.");
      return;
    }
    const ok = await createTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      project_id: newTaskProjectId,
      assigned_user_id: newTaskUserId || null,
      due_date: newTaskDeadline || null
    });
    if (ok) {
      setTaskSuccess(`Task "${newTaskTitle}" deployed successfully.`);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskProjectId("");
      setNewTaskUserId("");
      setNewTaskDeadline("");
    } else {
      setTaskError("Failed to deploy task.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError("");
    setMemberSuccess("");
    if (!selectedGroup) return;
    if (!newMemberId) {
      setMemberError("Please select a user to add.");
      return;
    }
    const ok = await addUserToGroup(selectedGroup.group_id, {
      user_id: newMemberId,
      role: newMemberRole
    });
    if (ok) {
      setMemberSuccess("Member added successfully.");
      setNewMemberId("");
      loadGroupMembers(selectedGroup.group_id);
    } else {
      setMemberError("Failed to add user to group.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;
    if (confirm("Remove user from this group?")) {
      const ok = await removeUserFromGroup(selectedGroup.group_id, userId);
      if (ok) {
        loadGroupMembers(selectedGroup.group_id);
      }
    }
  };

  const handleDeleteProject = async (projectId: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete project "${title}"?`)) {
      await deleteProject(projectId);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    if (confirm(`Are you sure you want to permanently delete group "${group.name}"?`)) {
      const ok = await deleteGroup(group.group_id);
      if (ok && selectedGroup?.group_id === group.group_id) {
        setSelectedGroup(null);
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedMemberIds(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const toggleUserLead = (userId: string) => {
    setLeadMemberIds(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const clientUsers = (adminUsers || []).filter(u => u.user_type === "Client" || u.role_tier === 4);
  const employeeUsers = (adminUsers || []).filter(u => u.user_type !== "Client" && u.role_tier !== 4);

  // Filter staff associated with target project
  const getProjectAssociatedStaff = (projectId: string) => {
    if (!projectId) return employeeUsers;
    const assignedGroups = groups.filter(g => g.project_id === projectId);
    if (assignedGroups.length === 0) return [];
    
    const memberIds = new Set<string>();
    assignedGroups.forEach(g => {
      const members = groupMembersCache[g.group_id] || [];
      members.forEach(m => memberIds.add(m.user_id));
    });
    
    return employeeUsers.filter(u => memberIds.has(u.user_id));
  };

  // Helper to format Expiry Period
  const getProjectExpiryInfo = (createdAt: string, deadlineStr?: string | null): ExpiryInfo | null => {
    if (!deadlineStr) return null;
    const created = new Date(createdAt);
    const deadline = new Date(deadlineStr);
    const now = new Date();
    
    const createdStr = created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const expiryStr = deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    const totalMs = deadline.getTime() - created.getTime();
    const remainingMs = deadline.getTime() - now.getTime();
    const elapsedMs = now.getTime() - created.getTime();
    
    const daysTotal = Math.max(0, totalMs / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, remainingMs / (1000 * 60 * 60 * 24));
    
    const weeksTotal = daysTotal / 7;
    const weeksLeft = daysLeft / 7;
    
    const hoursTotal = Math.max(0, totalMs / (1000 * 60 * 60));
    const hoursLeft = Math.max(0, remainingMs / (1000 * 60 * 60));
    
    const isExpired = now.getTime() > deadline.getTime();
    const progressPercent = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 100;
    
    return {
      createdStr,
      expiryStr,
      daysTotal,
      daysLeft,
      weeksTotal,
      weeksLeft,
      hoursTotal,
      hoursLeft,
      isExpired,
      progressPercent
    };
  };

  // Helper to format Task Deadlines
  const formatTaskDeadline = (dueStr?: string | null): string => {
    if (!dueStr) return "No deadline";
    const date = new Date(dueStr);
    const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${formattedDate} (${dayName})`;
  };

  // Human-readable WebSocket Telemetry Logger Formatter
  const formatTelemetryLog = (log: any): string => {
    const timeStr = log.timestamp 
      ? new Date(log.timestamp).toLocaleTimeString() 
      : new Date().toLocaleTimeString();
      
    if (typeof log === 'string') {
      return `[${timeStr}] ${log}`;
    }
    
    const type = log.type || "SYS";
    
    switch (type) {
      case "user_status_changed": {
        const user = adminUsers.find(u => u.user_id === log.user_id);
        const name = user ? user.full_name : `Operator`;
        return `[${timeStr}] [STATUS] ${name} changed connectivity to ${log.status}`;
      }
      case "task_created": {
        const task = log.task || {};
        const proj = projects.find(p => p.project_id === task.project_id);
        const projName = proj ? proj.title : "Active Project";
        return `[${timeStr}] [DISPATCHER] Deployed new task: "${task.title}" inside "${projName}"`;
      }
      case "task_updated": {
        const task = log.task || {};
        const proj = projects.find(p => p.project_id === task.project_id);
        const projName = proj ? proj.title : "Active Project";
        return `[${timeStr}] [FLOW] Task "${task.title}" in "${projName}" is now marked [${log.status || task.status}]`;
      }
      case "task_assigned": {
        const user = adminUsers.find(u => u.user_id === log.assigned_user_id);
        const userName = user ? user.full_name : "Unassigned Staff";
        return `[${timeStr}] [RESOURCE] Task reassigned to ${userName}`;
      }
      case "blocker_beacon":
        return `[${timeStr}] [ALERT] Blocker Beacon triggered: ${log.message}`;
      default:
        if (log.message) {
          return `[${timeStr}] [EVENT] ${log.message}`;
        }
        return `[${timeStr}] [EVENT] Signals synchronized successfully.`;
    }
  };

  // Filters
  const filteredProjects = (projects || []).filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = (groups || []).filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = (tasks || []).filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats
  const projStats = {
    total: projects.length,
    active: projects.filter(p => p.status === "Active").length,
    paused: projects.filter(p => p.status === "Paused").length,
    postponed: projects.filter(p => p.status === "Postponed").length,
  };

  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "Done").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    blocked: tasks.filter(t => t.status === "Blocked").length,
    backlog: tasks.filter(t => t.status === "Backlog").length,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#050505] rounded-lg border border-zinc-800 overflow-hidden font-mono">
      
      {/* Fixed Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-zinc-800 p-6 bg-[#050505]">
        <div>
          <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest uppercase flex items-center">
            <Settings className="w-5 h-5 mr-3 text-[#00E5FF] animate-spin-slow" />
            Operations Matrix
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            COMPANY CONTROL PANEL & RESOURCE MATRIX
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#111] border border-zinc-800 px-3 py-1.5 rounded">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search matrix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-zinc-300 outline-none text-xs w-36 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex bg-[#111] p-1 rounded-lg border border-zinc-800 text-xs font-bold">
            <button 
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-1.5 rounded transition-all duration-300 ${activeTab === 'projects' ? 'bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)] border border-[#00E5FF]/30' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Projects
            </button>
            <button 
              onClick={() => setActiveTab("groups")}
              className={`px-4 py-1.5 rounded transition-all duration-300 ${activeTab === 'groups' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Groups
            </button>
            <button 
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-1.5 rounded transition-all duration-300 ${activeTab === 'tasks' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Tasks Queue
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable middle body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Main table lists */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === "projects" && (
              /* PROJECTS GRID TABLE */
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-5 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center border-b border-zinc-800/50 pb-2">
                  <Briefcase className="w-4 h-4 mr-2 text-[#00E5FF]" /> Active Projects List
                </h3>
                
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-xs">
                    NO OPERATIONAL PROJECTS DETECTED IN DATABASE
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Project Name</th>
                          <th className="py-3 px-2">Assigned Workforce</th>
                          <th className="py-3 px-2">Client</th>
                          <th className="py-3 px-2">Timeline & Expiry Metrics</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {filteredProjects.map((proj) => {
                          const clientName = clientUsers.find(c => c.user_id === proj.client_id)?.full_name || "Unassigned";
                          
                          // Workforce assignee string
                          let workforceStr = "Unassigned";
                          if (proj.worker_type === "Individual") {
                            const emp = employeeUsers.find(e => e.user_id === proj.assigned_user_id);
                            workforceStr = emp ? `👤 ${emp.full_name}` : "👤 Individual";
                          } else if (proj.worker_type === "Group") {
                            const grp = groups.find(g => g.group_id === proj.assigned_group_id);
                            workforceStr = grp ? `👥 Group: ${grp.name}` : "👥 Group";
                          }

                          return (
                            <tr 
                              key={proj.project_id} 
                              onClick={() => setSelectedProject(proj)}
                              className={`hover:bg-zinc-900/30 transition-colors cursor-pointer ${
                                selectedProject?.project_id === proj.project_id ? 'bg-[#00E5FF]/10' : ''
                              }`}
                            >
                              <td className="py-4 px-2 font-bold text-zinc-200">
                                <div>{proj.title}</div>
                                {proj.department && (
                                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase mt-1 inline-block">
                                    {proj.department.replace("_", " ")}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-2 text-zinc-400 font-bold">
                                {workforceStr}
                              </td>
                              <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={proj.client_id || ""}
                                  onChange={(e) => updateProject(proj.project_id, { client_id: e.target.value || null })}
                                  className="bg-[#0c0c0c] border border-zinc-800 text-zinc-300 text-[11px] px-2 py-1 rounded outline-none w-full max-w-[140px] focus:border-amber-500/50"
                                >
                                  <option value="">-- NO CLIENT --</option>
                                  {clientUsers.map(client => (
                                    <option key={client.user_id} value={client.user_id}>
                                      {client.full_name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              {/* EXPIRE LOGICAL METRICS */}
                              <td className="py-4 px-2 min-w-[220px]">
                                {(() => {
                                  const info = getProjectExpiryInfo(proj.created_at, proj.deadline);
                                  if (!info) return <span className="text-zinc-600">No deadline set</span>;
                                  return (
                                    <div className="space-y-1 text-[10px]">
                                      <div className="flex justify-between text-zinc-500 font-semibold">
                                        <span>Created: {info.createdStr}</span>
                                        <span className={info.isExpired ? "text-rose-500 font-bold" : "text-amber-500 font-bold"}>
                                          {info.isExpired ? "EXPIRED" : `Expires: ${info.expiryStr}`}
                                        </span>
                                      </div>
                                      
                                      {/* Progress Bar */}
                                      <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden border border-zinc-800">
                                        <div 
                                          className={`h-full ${info.isExpired ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-[#00E5FF]'}`}
                                          style={{ width: `${info.progressPercent}%` }}
                                        />
                                      </div>
                                      
                                      {/* Expiry Periods Breakdown */}
                                      <div className="grid grid-cols-3 gap-1 text-[9px] text-zinc-400 font-semibold mt-0.5">
                                        <div>
                                          <span className="text-zinc-600">DAYS:</span> {info.daysLeft.toFixed(1)} / {info.daysTotal.toFixed(1)}
                                        </div>
                                        <div>
                                          <span className="text-zinc-600">WEEKS:</span> {info.weeksLeft.toFixed(1)} / {info.weeksTotal.toFixed(1)}
                                        </div>
                                        <div>
                                          <span className="text-zinc-600">HOURS:</span> {info.hoursLeft.toFixed(0)}h left
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
                                <select 
                                  value={proj.status}
                                  onChange={(e) => updateProject(proj.project_id, { status: e.target.value })}
                                  className={`bg-[#0c0c0c] border text-[11px] px-2 py-1 rounded font-bold outline-none cursor-pointer ${
                                    proj.status === 'Active' ? 'border-emerald-500/30 text-emerald-400' :
                                    proj.status === 'Paused' ? 'border-amber-500/30 text-amber-400' :
                                    'border-rose-500/30 text-rose-400'
                                  }`}
                                >
                                  <option value="Active">Active</option>
                                  <option value="Paused">Paused</option>
                                  <option value="Postponed">Postponed</option>
                                </select>
                              </td>
                              <td className="py-4 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end space-x-1.5">
                                  <button 
                                    onClick={() => setDashboardProject(proj)}
                                    className="text-cyan-500 hover:text-cyan-400 p-1.5 transition-colors rounded hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
                                    title="Open Development Dashboard"
                                  >
                                    <FolderKanban className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProject(proj.project_id, proj.title)}
                                    className="text-zinc-600 hover:text-rose-400 p-1.5 transition-colors rounded hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "groups" && (
              /* GROUPS LIST */
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-5 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center border-b border-zinc-800/50 pb-2">
                  <Users className="w-4 h-4 mr-2 text-purple-400" /> Operational Groups
                </h3>

                {filteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-xs">
                    NO OPERATIONAL GROUPS DETECTED IN DATABASE
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGroups.map((group) => {
                      const isSelected = selectedGroup?.group_id === group.group_id;
                      return (
                        <div 
                          key={group.group_id} 
                          onClick={() => setSelectedGroup(group)}
                          className={`p-4 rounded border cursor-pointer transition-all duration-300 space-y-3 ${
                            isSelected 
                              ? 'bg-purple-950/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                              : 'bg-[#0a0a0a] border-zinc-800 hover:border-purple-500/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-zinc-200 text-sm tracking-wider uppercase">
                              {group.name}
                            </h4>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeleteGroup(group); 
                              }}
                              className="text-zinc-600 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <p className="text-zinc-500 text-[11px] line-clamp-2 min-h-[32px]">
                            {group.description || "No description provided."}
                          </p>

                          <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-[10px] text-zinc-400">
                            <span>CREATED: {new Date(group.created_at).toLocaleDateString()}</span>
                            <span className="text-purple-400 font-bold hover:underline">MANAGE ROSTER &rarr;</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              /* TASK QUEUE LIST */
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-5 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center border-b border-zinc-800/50 pb-2">
                  <Layers className="w-4 h-4 mr-2 text-emerald-400" /> Tasks Queue List
                </h3>

                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-xs">
                    NO OPERATIONAL TASKS DETECTED IN DATABASE
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Task Details</th>
                          <th className="py-3 px-2">Project</th>
                          <th className="py-3 px-2">Target Deadline</th>
                          <th className="py-3 px-2">Assigned Staff</th>
                          <th className="py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {filteredTasks.map((t) => {
                          const taskProj = projects.find(p => p.project_id === t.project_id);
                          
                          // Filter staff based on target project association
                          const projectStaff = taskProj ? getProjectAssociatedStaff(taskProj.project_id) : employeeUsers;
                          const staffList = projectStaff.length > 0 ? projectStaff : employeeUsers;

                          return (
                            <tr key={t.task_id} className="hover:bg-zinc-900/30 transition-colors">
                              <td className="py-3 px-2">
                                <div className="font-bold text-zinc-200">{t.title}</div>
                                <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{t.description || "No description."}</div>
                              </td>
                              <td className="py-3 px-2 text-zinc-400">
                                {taskProj ? taskProj.title : "Unassigned"}
                              </td>
                              <td className="py-3 px-2 text-zinc-300 font-semibold">
                                {formatTaskDeadline(t.due_date)}
                              </td>
                              <td className="py-3 px-2">
                                <select
                                  value={t.assigned_user_id || ""}
                                  onChange={(e) => assignTask(t.task_id, e.target.value)}
                                  className="bg-[#0c0c0c] border border-zinc-800 text-zinc-300 text-[11px] px-2 py-1 rounded outline-none w-full max-w-[155px]"
                                >
                                  <option value="">-- UNASSIGNED --</option>
                                  {staffList.map(emp => (
                                    <option key={emp.user_id} value={emp.user_id}>
                                      {emp.full_name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-2">
                                <select
                                  value={t.status}
                                  onChange={(e) => updateTaskStatus(t.task_id, e.target.value)}
                                  className={`bg-[#0c0c0c] border text-[11px] px-2 py-1 rounded font-bold outline-none cursor-pointer ${
                                    t.status === "Done" || t.status === "Deployed" ? "border-emerald-500/30 text-emerald-400" :
                                    t.status === "Blocked" ? "border-rose-500/30 text-rose-400" :
                                    "border-blue-500/30 text-blue-400"
                                  }`}
                                >
                                  <option value="Backlog">Backlog</option>
                                  <option value="Assigned">Assigned</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Blocked">Blocked</option>
                                  <option value="Review">Review</option>
                                  <option value="QA">QA</option>
                                  <option value="Deployed">Deployed</option>
                                  <option value="Done">Done</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right 1 Col: Forms and Detail Panels */}
          <div className="space-y-6">
            
            {activeTab === "projects" && (
              selectedProject ? (
                /* PROJECT EDIT RESOURCE MATRIX PANEL */
                <div className="bg-zinc-950/60 border border-[#00E5FF]/30 rounded-lg p-5 backdrop-blur-md space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <h3 className="text-xs font-bold text-[#00E5FF] uppercase tracking-widest flex items-center">
                      <Edit3 className="w-3.5 h-3.5 mr-1.5 text-[#00E5FF]" /> Project Resource Matrix
                    </h3>
                    <button 
                      onClick={() => { setSelectedProject(null); setProjectError(""); setProjectSuccess(""); }}
                      className="text-zinc-500 hover:text-zinc-350 text-[10px] uppercase font-bold"
                    >
                      ← Back
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateProjectSubmit} className="space-y-4 text-xs">
                    {projectError && <div className="p-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded">{projectError}</div>}
                    {projectSuccess && <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded">{projectSuccess}</div>}

                    {/* OPEN DASHBOARD BUTTON */}
                    <button
                      type="button"
                      onClick={() => setDashboardProject(selectedProject)}
                      className="w-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[#00E5FF] py-2 rounded font-bold uppercase transition-all tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                    >
                      <FolderKanban className="w-4 h-4 text-[#00E5FF]" />
                      <span>Open Dashboard</span>
                    </button>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Project Title</label>
                      <input
                        type="text"
                        value={editProjectTitle}
                        onChange={(e) => setEditProjectTitle(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Department</label>
                      <select
                        value={editProjectDepartment}
                        onChange={(e) => setEditProjectDepartment(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      >
                        <option value="IT_SAAS">IT & SAAS</option>
                        <option value="ADS_AGENCY">ADS AGENCY</option>
                        <option value="CORPORATE">CORPORATE</option>
                        <option value="MARKETING">MARKETING</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Client Lead</label>
                      <select
                        value={editProjectClientId}
                        onChange={(e) => setEditProjectClientId(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      >
                        <option value="">-- NO CLIENT --</option>
                        {clientUsers.map(client => (
                          <option key={client.user_id} value={client.user_id}>
                            {client.full_name} ({client.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* WORKFORCE ALLOCATION TYPE SELECTOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Worker Type Allocation</label>
                      <div className="grid grid-cols-2 gap-2 bg-[#111] p-1 rounded border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => { setEditProjectWorkerType("Individual"); setEditProjectWorkerId(""); }}
                          className={`py-1.5 rounded text-[11px] font-bold transition-all ${
                            editProjectWorkerType === "Individual" 
                              ? "bg-zinc-800 text-zinc-200 border border-zinc-700" 
                              : "text-zinc-500"
                          }`}
                        >
                          👤 Individual
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditProjectWorkerType("Group"); setEditProjectWorkerId(""); }}
                          className={`py-1.5 rounded text-[11px] font-bold transition-all ${
                            editProjectWorkerType === "Group" 
                              ? "bg-zinc-800 text-zinc-200 border border-zinc-700" 
                              : "text-zinc-500"
                          }`}
                        >
                          👥 Group/Squad
                        </button>
                      </div>
                    </div>

                    {/* ASSIGNED WORKER DYNAMIC SELECTOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">
                        {editProjectWorkerType === "Individual" ? "Assign Staff Member" : "Assign Operational Group"}
                      </label>
                      <select
                        value={editProjectWorkerId}
                        onChange={(e) => setEditProjectWorkerId(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      >
                        <option value="">-- UNASSIGNED --</option>
                        {editProjectWorkerType === "Individual" ? (
                          employeeUsers.map(emp => (
                            <option key={emp.user_id} value={emp.user_id}>
                              {emp.full_name} ({emp.functional_role || "Staff"})
                            </option>
                          ))
                        ) : (
                          groups.map(grp => (
                            <option key={grp.group_id} value={grp.group_id}>
                              {grp.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* PROJECT DEADLINE INPUT */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-zinc-500" /> Project Expiry/Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={editProjectDeadline}
                        onChange={(e) => setEditProjectDeadline(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/45 text-emerald-400 py-2 rounded font-bold uppercase transition-all duration-300 tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                    >
                      Update Configuration
                    </button>
                  </form>
                </div>
              ) : (
                /* PROJECT CREATION PANEL */
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-5 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center">
                    <Plus className="w-3.5 h-3.5 mr-1.5 text-[#00E5FF]" /> Deploy Project
                  </h3>
                  
                  <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                    {projectError && <div className="p-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded">{projectError}</div>}
                    {projectSuccess && <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded">{projectSuccess}</div>}

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Project Title</label>
                      <input
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="e.g. Apollo Client Upgrade"
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Department</label>
                      <select
                        value={newProjectDepartment}
                        onChange={(e) => setNewProjectDepartment(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      >
                        <option value="IT_SAAS">IT & SAAS</option>
                        <option value="ADS_AGENCY">ADS AGENCY</option>
                        <option value="CORPORATE">CORPORATE</option>
                        <option value="MARKETING">MARKETING</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Client Lead (Optional)</label>
                      <select
                        value={newProjectClientId}
                        onChange={(e) => setNewProjectClientId(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      >
                        <option value="">-- UNASSIGNED --</option>
                        {clientUsers.map(client => (
                          <option key={client.user_id} value={client.user_id}>
                            {client.full_name} ({client.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* WORKFORCE ALLOCATION TYPE SELECTOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Worker Type Allocation</label>
                      <div className="grid grid-cols-2 gap-2 bg-[#111] p-1 rounded border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => { setNewProjectWorkerType("Individual"); setNewProjectWorkerId(""); }}
                          className={`py-1.5 rounded text-[11px] font-bold transition-all ${
                            newProjectWorkerType === "Individual" 
                              ? "bg-zinc-800 text-zinc-200 border border-zinc-700" 
                              : "text-zinc-500"
                          }`}
                        >
                          👤 Individual
                        </button>
                        <button
                          type="button"
                          onClick={() => { setNewProjectWorkerType("Group"); setNewProjectWorkerId(""); }}
                          className={`py-1.5 rounded text-[11px] font-bold transition-all ${
                            newProjectWorkerType === "Group" 
                              ? "bg-zinc-800 text-zinc-200 border border-zinc-700" 
                              : "text-zinc-500"
                          }`}
                        >
                          👥 Group/Squad
                        </button>
                      </div>
                    </div>

                    {/* ASSIGNED WORKER DYNAMIC SELECTOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">
                        {newProjectWorkerType === "Individual" ? "Assign Staff Member" : "Assign Operational Group"}
                      </label>
                      <select
                        value={newProjectWorkerId}
                        onChange={(e) => setNewProjectWorkerId(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      >
                        <option value="">-- UNASSIGNED --</option>
                        {newProjectWorkerType === "Individual" ? (
                          employeeUsers.map(emp => (
                            <option key={emp.user_id} value={emp.user_id}>
                              {emp.full_name} ({emp.functional_role || "Staff"})
                            </option>
                          ))
                        ) : (
                          groups.map(grp => (
                            <option key={grp.group_id} value={grp.group_id}>
                              {grp.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* PROJECT DEADLINE INPUT */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-zinc-500" /> Project Expiry/Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={newProjectDeadline}
                        onChange={(e) => setNewProjectDeadline(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-[#00E5FF]/15 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/45 text-[#00E5FF] py-2 rounded font-bold uppercase transition-all duration-300 tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.08)]"
                    >
                      Deploy Project
                    </button>
                  </form>

                  {/* COUNTERS */}
                  <div className="pt-4 border-t border-zinc-900 space-y-2 text-[11px] text-zinc-400">
                    <div className="flex justify-between">
                      <span>TOTAL PROJECTS:</span>
                      <span className="font-bold text-zinc-200">{projStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ACTIVE MATRIX:</span>
                      <span className="font-bold text-emerald-400">{projStats.active}</span>
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === "groups" && (
              /* DYNAMIC MASTER-DETAIL ROSTER PANEL OR CREATION PANEL */
              selectedGroup ? (
                /* DETAIL RUSTER MATRIX PANEL */
                <div className="bg-zinc-950/60 border border-purple-500/30 rounded-lg p-5 backdrop-blur-md space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Group Roster Matrix
                    </h3>
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className="text-zinc-500 hover:text-zinc-300 flex items-center text-[10px] uppercase font-bold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Creator
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-[#111] border border-zinc-800/80 p-3 rounded">
                      <div className="font-bold text-zinc-200 uppercase">{selectedGroup.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">{selectedGroup.description || "No description provided."}</div>
                    </div>

                    {/* Add Member Form */}
                    <form onSubmit={handleAddMember} className="space-y-3 pt-2 border-t border-zinc-900">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assign User to Group</h4>
                      {memberError && <div className="p-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded text-[10px]">{memberError}</div>}
                      {memberSuccess && <div className="p-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">{memberSuccess}</div>}

                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={newMemberId}
                          onChange={(e) => setNewMemberId(e.target.value)}
                          className="bg-[#111] border border-zinc-800 text-zinc-300 px-2 py-1.5 rounded outline-none focus:border-purple-500"
                        >
                          <option value="">-- USER --</option>
                          {employeeUsers.map(emp => (
                            <option key={emp.user_id} value={emp.user_id}>
                              {emp.full_name}
                            </option>
                          ))}
                        </select>

                        <select 
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="bg-[#111] border border-zinc-800 text-zinc-300 px-2 py-1.5 rounded outline-none focus:border-purple-500"
                        >
                          <option value="Member">Member</option>
                          <option value="Lead">Lead</option>
                        </select>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#111] hover:bg-purple-950/20 border border-zinc-800 hover:border-purple-500/50 text-zinc-300 hover:text-purple-400 py-1.5 rounded font-bold uppercase transition-colors"
                      >
                        Add to Group
                      </button>
                    </form>

                    {/* Members List */}
                    <div className="space-y-2 pt-2 border-t border-zinc-900">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
                        <span>Roster Members</span>
                        <span className="text-purple-400">{groupMembersList.length} total</span>
                      </h4>
                      
                      {groupMembersList.length === 0 ? (
                        <div className="text-center py-4 text-zinc-600 text-[10px]">
                          NO MEMBERS ASSIGNED TO GROUP
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-zinc-900 pr-1">
                          {groupMembersList.map((m) => (
                            <div key={m.id} className="flex justify-between items-center py-2 text-[11px]">
                              <div>
                                <div className="font-bold text-zinc-300">{m.user_name}</div>
                                <div className="text-[9px] text-zinc-500">{m.user_email}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                  m.role === 'Lead' 
                                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' 
                                    : 'border-zinc-800 text-zinc-500'
                                }`}>
                                  {m.role}
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveMember(m.user_id)}
                                  className="text-zinc-600 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* GROUP CREATION PANEL */
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-5 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center">
                    <Plus className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Initialize Group
                  </h3>
                  
                  <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
                    {groupError && <div className="p-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded">{groupError}</div>}
                    {groupSuccess && <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded">{groupSuccess}</div>}

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Group Name</label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g. ADS AGENCY CORE"
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Description</label>
                      <textarea
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        placeholder="Roster description, functional purpose of the team..."
                        rows={2}
                        className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    {/* USER SELECTION MATRIX */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Add Initial Group Roster</label>
                      <div className="border border-zinc-800 rounded bg-[#0a0a0a] overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-800">
                              <th className="p-2 text-center w-10">Add</th>
                              <th className="p-2">Name</th>
                              <th className="p-2 text-center w-14">Lead</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {employeeUsers.map((u) => {
                              const isSelected = !!selectedMemberIds[u.user_id];
                              const isLead = !!leadMemberIds[u.user_id];
                              return (
                                <tr key={u.user_id} className={`hover:bg-zinc-900/40 ${isSelected ? 'bg-purple-950/5' : ''}`}>
                                  <td className="p-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleUserSelection(u.user_id)}
                                      className="accent-purple-500 rounded cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <div className="text-zinc-200 font-bold">{u.full_name}</div>
                                    <div className="text-[9px] text-zinc-500">{u.functional_role || "Staff"}</div>
                                  </td>
                                  <td className="p-2 text-center">
                                    <input
                                      type="checkbox"
                                      disabled={!isSelected}
                                      checked={isSelected && isLead}
                                      onChange={() => toggleUserLead(u.user_id)}
                                      className="accent-amber-500 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/40 text-purple-400 py-2 rounded font-bold uppercase transition-all duration-300 tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.08)]"
                    >
                      Initialize Group
                    </button>
                  </form>
                </div>
              )
            )}

            {activeTab === "tasks" && (
              /* TASK CREATION PANEL */
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-5 backdrop-blur-md space-y-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center">
                  <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Deploy Task
                </h3>

                <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                  {taskError && <div className="p-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded">{taskError}</div>}
                  {taskSuccess && <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded">{taskSuccess}</div>}

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Task Title</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Write API integration documentation"
                      className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Description</label>
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Granular detail of the deliverables..."
                      rows={2}
                      className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Target Project</label>
                    <select
                      value={newTaskProjectId}
                      onChange={(e) => {
                        setNewTaskProjectId(e.target.value);
                        setNewTaskUserId(""); // Reset selected staff when project changes
                      }}
                      className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-emerald-500"
                    >
                      <option value="">-- SELECT PROJECT --</option>
                      {projects.map(p => (
                        <option key={p.project_id} value={p.project_id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FILTERED STAFF DROPDOWN BY TARGET PROJECT */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Assigned Staff</label>
                    <select
                      value={newTaskUserId}
                      onChange={(e) => setNewTaskUserId(e.target.value)}
                      className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-emerald-500"
                    >
                      <option value="">-- UNASSIGNED --</option>
                      {(newTaskProjectId ? getProjectAssociatedStaff(newTaskProjectId) : employeeUsers).map(emp => (
                        <option key={emp.user_id} value={emp.user_id}>
                          {emp.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TASK DEADLINE INPUT */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-zinc-500" /> Task Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 py-2 rounded font-bold uppercase transition-all duration-300 tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                  >
                    Deploy Task
                  </button>
                </form>

                {/* COUNTERS */}
                <div className="pt-4 border-t border-zinc-900 space-y-2 text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>TOTAL TASKS:</span>
                    <span className="font-bold text-zinc-200">{taskStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DONE / DEPLOYED:</span>
                    <span className="font-bold text-emerald-400">{taskStats.done}</span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Flushed Telemetry Console Bar */}
      <div className="bg-[#080808] border-t border-zinc-800 p-4 w-full mt-auto">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center border-b border-zinc-900 pb-2 mb-2">
          <Terminal className="w-4 h-4 mr-2 text-rose-500" /> Operational telemetry logs (Live WS Stream)
        </h3>
        <div className="h-32 overflow-y-auto bg-black/60 p-3 rounded border border-zinc-900/60 text-[11px] text-zinc-400 space-y-1.5 scrollbar-thin">
          {activityLogs.length === 0 ? (
            <div className="text-zinc-650 italic">No telemetry data streamed yet. Listening for workspace signals...</div>
          ) : (
            activityLogs.map((log, index) => (
              <div key={index} className="flex space-x-2 border-l-2 border-rose-500/50 pl-2 py-0.5">
                <span className="text-zinc-300">{formatTelemetryLog(log)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {dashboardProject && (
        <ProjectDashboardView 
          project={dashboardProject} 
          onClose={() => setDashboardProject(null)} 
        />
      )}
    </div>
  );
}
