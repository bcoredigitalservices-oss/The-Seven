import { create } from 'zustand';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role_tier: number;
  department_id: string | null;
  current_status: string;
  department?: string | null;
  sub_department?: string | null;
  functional_role?: string | null;
  specialization?: string | null;
  seniority_level?: string | null;
  user_type?: string | null;
}

export interface Project {
  project_id: string;
  title: string;
  status: string;
  client_id?: string | null;
  created_at: string;
  deadline?: string | null;
  worker_type?: string | null;
  assigned_user_id?: string | null;
  assigned_group_id?: string | null;
  department?: string | null;
  pipeline?: any[] | null;
  timeline?: any[] | null;
}

export interface Task {
  task_id: string;
  project_id: string;
  assigned_user_id: string | null;
  title: string;
  description: string | null;
  status: string;
  industry_meta?: any;
  priority?: string;
  due_date?: string | null;
}

export interface Lead {
  lead_id: string;
  source: string;
  raw_payload?: any;
  normalized_data: {
    name?: string;
    industry?: string;
    [key: string]: any;
  };
  client_name?: string | null;
  project_title?: string | null;
  contact_email?: string | null;
  email_verification_status?: string | null;
  phone?: string | null;
  website_url?: string | null;
  apollo_id?: string | null;
  status: string;
  assigned_to: string | null;
  created_at: string;
  maturity_status?: string;
  enrichment_attempts?: number;
  last_enrichment_error?: string | null;
  contact_person_name?: string | null;
  linkedin_url?: string | null;
}

export interface WorkLog {
  log_id: string;
  user_id: string;
  task_id: string;
  date_logged: string;
  hours_spent: number;
  description: string | null;
}

export interface EmployeeCustomLog {
  log_id: string;
  user_id: string;
  log_content: string;
  created_at: string;
}

export interface Group {
  group_id: string;
  name: string;
  description: string | null;
  project_id?: string | null;
  created_at: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  user_name?: string;
  user_email?: string;
}

export interface DashboardOverview {
  active_projects: Project[] | null;
  assigned_tasks: Task[] | null;
  department_blockers: Task[] | null;
  system_metrics: Record<string, any> | null;
}

interface SevenStore {
  userProfile: UserProfile | null;
  simulatedUser: UserProfile | null;
  setSimulatedUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (token: string, user: UserProfile) => void;
  currentUserCapabilities: any[];
  fetchCurrentUserCapabilities: () => Promise<void>;
  
  // WebSocket State
  ws: WebSocket | null;
  wsConnected: boolean;
  activityLogs: any[];
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  addActivityLog: (log: any) => void;

  // Admin Portal State
  allUsers: UserProfile[];
  capabilities: any[];
  fetchAllUsers: () => Promise<void>;
  fetchCapabilities: () => Promise<void>;

  // Dashboard Data State
  dashboardData: DashboardOverview | null;
  fetchDashboardOverview: () => Promise<void>;

  // Business Analytics State
  businessAnalyticsData: any | null;
  fetchBusinessAnalytics: () => Promise<void>;

  // Leads State
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  updateLeadStatus: (leadId: string, status: string) => Promise<boolean>;
  updateLeadContact: (leadId: string, contactData: {
    contact_person_name?: string;
    contact_email?: string;
    phone?: string;
    website_url?: string;
    linkedin_url?: string;
    client_name?: string;
    project_title?: string;
  }) => Promise<Lead | null>;
  assignLead: (leadId: string, userId: string) => Promise<boolean>;
  createManualLead: (leadData: {
    source: string;
    name: string;
    industry: string;
    budget?: string;
    url?: string;
    description?: string;
    contact_email?: string;
    contact_person_name?: string;
    phone?: string;
    email_verification_status?: string;
  }) => Promise<boolean>;
  triggerFetchLeads: () => Promise<boolean>;
  pullApolloLeads: (query: string, location?: string, limit?: number) => Promise<{ success: boolean; error?: string }>;
  enrichLead: (leadId: string) => Promise<{ success: boolean; error?: string }>;
  verifyLeadEmail: (leadId: string) => Promise<{ success: boolean; error?: string }>;
  runScraper: (targetUrls: string[], depth?: number) => Promise<boolean>;
  findEmail: (domain: string, firstName: string, lastName: string) => Promise<any>;
  verifyEmail: (email: string) => Promise<any>;

  // Work Logs State
  workLogs: WorkLog[];
  fetchWorkLogs: () => Promise<void>;
  submitWorkLog: (taskId: string, hours: number, description: string) => Promise<boolean>;

  // Custom Logs State
  customLogs: EmployeeCustomLog[];
  fetchCustomLogs: () => Promise<void>;
  submitCustomLog: (content: string) => Promise<boolean>;

  // Tier 1 Admin User Management
  adminUsers: UserProfile[];
  fetchAdminUsers: () => Promise<void>;
  createUser: (userData: any) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUserMetadata: (userId: string, updateData: any) => Promise<boolean>;
  resendInvite: (userId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  projects: Project[];
  fetchProjects: () => Promise<void>;
  createProject: (projectData: { 
    title: string; 
    client_id?: string | null;
    deadline?: string | null;
    worker_type?: string | null;
    assigned_user_id?: string | null;
    assigned_group_id?: string | null;
    department?: string | null;
  }) => Promise<boolean>;
  updateProject: (projectId: string, updateData: any) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;

  // Task Management State
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  createTask: (taskData: { title: string; description: string; project_id: string; assigned_user_id?: string | null; due_date?: string | null }) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: string) => Promise<boolean>;
  assignTask: (taskId: string, userId: string) => Promise<boolean>;

  // Group Management State
  groups: Group[];
  fetchGroups: () => Promise<void>;
  createGroup: (groupData: { name: string; description?: string; project_id?: string | null }) => Promise<Group | null>;
  updateGroup: (groupId: string, groupData: { name?: string; description?: string; project_id?: string | null }) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  fetchGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  addUserToGroup: (groupId: string, memberData: { user_id: string; role: string }) => Promise<boolean>;
  removeUserFromGroup: (groupId: string, userId: string) => Promise<boolean>;

  // Beacons, Meetings & Reminders State
  beacons: any[];
  meetings: any[];
  reminders: any[];
  fetchBeacons: () => Promise<void>;
  fetchMeetings: () => Promise<void>;
  fetchReminders: () => Promise<void>;
  replyBeacon: (beaconId: string, replyContent: string) => Promise<boolean>;
  replyReminder: (reminderId: string, replyContent: string) => Promise<boolean>;
}

export const useSevenStore = create<SevenStore>((set, get) => ({
  userProfile: null,
  simulatedUser: null,
  setSimulatedUser: (user: UserProfile | null) => set({ simulatedUser: user }),
  currentUserCapabilities: [],
  isLoading: true,
  error: null,
  ws: null,
  wsConnected: false,
  activityLogs: [],
  beacons: [],
  meetings: [],
  reminders: [],
  
  fetchCurrentUserCapabilities: async () => {
    const { userProfile } = get();
    if (!userProfile) return;
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/users/${userProfile.user_id}/capabilities`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        set({ currentUserCapabilities: await res.json() });
      }
    } catch (e) {
      console.error("Failed to load user capabilities");
    }
  },

  setSession: (token: string, user: UserProfile) => {
    localStorage.setItem("seven_token", token);
    localStorage.setItem("seven_user", JSON.stringify(user));
    set({ userProfile: user, isLoading: false, error: null });
    get().fetchCurrentUserCapabilities();
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("seven_token");
      if (!token) {
        set({ userProfile: null, isLoading: false, currentUserCapabilities: [] });
        return;
      }
      
      const res = await fetch("/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        get().signOut();
        return;
      }
      
      const user = await res.json();
      localStorage.setItem("seven_user", JSON.stringify(user));
      set({ userProfile: user, isLoading: false });
      get().fetchCurrentUserCapabilities();
    } catch (err: any) {
      const storedUser = localStorage.getItem("seven_user");
      if (storedUser) {
        set({ userProfile: JSON.parse(storedUser), isLoading: false });
        get().fetchCurrentUserCapabilities();
      } else {
        set({ error: err.message, isLoading: false, userProfile: null, currentUserCapabilities: [] });
      }
    }
  },

  signOut: async () => {
    get().disconnectWebSocket();
    localStorage.removeItem("seven_token");
    localStorage.removeItem("seven_user");
    set({ userProfile: null, currentUserCapabilities: [] });
  },

  connectWebSocket: () => {
    const { userProfile, ws } = get();
    if (!userProfile) return;
    if (ws) return; // already connecting/connected

    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const wsHost = isLocal ? 'localhost:8080' : (typeof window !== 'undefined' ? window.location.host : '');
    const socket = new WebSocket(`${typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' : ''}${wsHost}/ws/${userProfile.user_id}`);
    
    socket.onopen = () => {
      set({ ws: socket, wsConnected: true });
      console.log("[WS] Connected to SEVEN Ecosystem");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[WS MSG]", data);
      get().addActivityLog(data);
      if (data && data.type === "new_lead_arrived") {
        get().fetchLeads();
      }
      if (data && data.type === "project_deleted") {
        set((state) => ({
          projects: state.projects.filter((p) => p.project_id !== data.project_id)
        }));
      }
      if (data && data.type === "user_status_changed") {
        if (data.user_id === userProfile?.user_id && data.status === "Blocked") {
          get().signOut();
          // Force page reload to clear memory state and redirect to login
          window.location.href = "/login";
          return;
        }
        set((state) => ({
          allUsers: state.allUsers.map((u) => 
            u.user_id === data.user_id ? { ...u, current_status: data.status } : u
          )
        }));
      }
      if (data && data.type === "project_updated" && data.project) {
        const updatedProj = data.project;
        set((state) => ({
          projects: state.projects.map((p) => 
            p.project_id === updatedProj.project_id ? updatedProj : p
          )
        }));
      }
      if (data && (data.type === "task_created" || data.type === "task_updated" || data.type === "blocker_beacon" || data.type === "new_reminder" || data.type === "new_meeting")) {
        // Automatically refresh dashboard telemetry
        get().fetchDashboardOverview();
        
        // Also update local tasks array if a task was updated/created
        if (data.task) {
          const t = data.task;
          set((state) => {
            const exists = state.tasks.some(x => x.task_id === t.task_id);
            if (exists) {
              return {
                tasks: state.tasks.map(x => x.task_id === t.task_id ? t : x)
              };
            } else {
              return {
                tasks: [...state.tasks, t]
              };
            }
          });
        }
      }
    };

    socket.onclose = () => {
      set({ ws: null, wsConnected: false });
      console.log("[WS] Disconnected");
    };

    socket.onerror = (error) => {
      console.error("[WS ERROR]", error);
      socket.close();
    };
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, wsConnected: false });
    }
  },

  addActivityLog: (log: any) => {
    set((state) => ({
      activityLogs: [log, ...state.activityLogs].slice(0, 50) // keep last 50 logs
    }));
  },

  // Admin Portal State Implementations
  allUsers: [],
  capabilities: [],
  
  fetchAllUsers: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/auth/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const users = await res.json();
        set({ allUsers: users });
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  },

  fetchCapabilities: async () => {
    try {
      const res = await fetch("/api/capabilities");
      if (res.ok) {
        const caps = await res.json();
        set({ capabilities: caps });
      }
    } catch (err) {
      console.error("Failed to fetch capabilities", err);
    }
  },

  dashboardData: null,
  fetchDashboardOverview: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/dashboard/overview?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/dashboard/overview";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ dashboardData: data });
      }
    } catch (e) {
      console.error("Failed to load dashboard overview data", e);
    }
  },

  businessAnalyticsData: null,
  fetchBusinessAnalytics: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/business-analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ businessAnalyticsData: data });
      }
    } catch (e) {
      console.error("Failed to load business analytics data", e);
    }
  },

  leads: [],
  fetchLeads: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/leads", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ leads: data });
      } else {
        console.warn("GET /api/v1/leads failed or not implemented on backend yet.");
        set({ leads: [] });
      }
    } catch (e) {
      console.error("Failed to load leads", e);
    }
  },

  updateLeadStatus: async (leadId: string, status: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/leads/${leadId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        get().fetchLeads();
        if (status === "Qualified") {
          get().fetchProjects();
          get().fetchDashboardOverview();
        }
        return true;
      }
    } catch (e) {
      console.error("Failed to update lead status", e);
    }
    return false;
  },

  updateLeadContact: async (leadId: string, contactData: any) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
      });
      if (res.ok) {
        const data = await res.json();
        get().fetchLeads();
        return data;
      }
    } catch (e) {
      console.error("Failed to update lead contact details", e);
    }
    return null;
  },

  assignLead: async (leadId: string, userId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/leads/${leadId}/assign/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        get().fetchLeads();
        return true;
      }
    } catch (e) {
      console.error("Failed to assign lead", e);
    }
    return false;
  },

  createManualLead: async (leadData: {
    source: string;
    name: string;
    industry: string;
    budget?: string;
    url?: string;
    description?: string;
    contact_email?: string;
    contact_person_name?: string;
    phone?: string;
    email_verification_status?: string;
  }) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/leads/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });
      if (res.ok) {
        get().fetchLeads();
        return true;
      }
    } catch (e) {
      console.error("Failed to create manual lead", e);
    }
    return false;
  },

  triggerFetchLeads: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/leads/fetch", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        get().fetchLeads();
        return true;
      }
    } catch (e) {
      console.error("Failed to trigger live lead fetch", e);
    }
    return false;
  },

  pullApolloLeads: async (query: string, location?: string, limit?: number) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/leads/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query, location, limit })
      });
      if (res.ok) {
        get().fetchLeads();
        return { success: true };
      } else {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.detail || "API returned an error code" };
      }
    } catch (e: any) {
      console.error("Failed to pull Apollo leads", e);
      return { success: false, error: e.message || "Network error" };
    }
  },

  enrichLead: async (leadId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/leads/${leadId}/enrich`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        get().fetchLeads();
        return { success: true };
      } else {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.detail || "API returned an error code" };
      }
    } catch (e: any) {
      console.error("Failed to enrich lead", e);
      return { success: false, error: e.message || "Network error" };
    }
  },

  verifyLeadEmail: async (leadId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/leads/${leadId}/verify`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        get().fetchLeads();
        return { success: true };
      } else {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.detail || "API returned an error code" };
      }
    } catch (e: any) {
      console.error("Failed to verify lead email", e);
      return { success: false, error: e.message || "Network error" };
    }
  },

  runScraper: async (targetUrls: string[], depth?: number) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/scrape/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ target_urls: targetUrls, depth })
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.error("Failed to run scraper job", e);
    }
    return false;
  },

  findEmail: async (domain: string, firstName: string, lastName: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/email/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ domain, first_name: firstName, last_name: lastName })
      });
      if (res.ok) {
        return await res.json();
      } else {
        const data = await res.json().catch(() => ({}));
        return { error: data.detail || "API returned an error code" };
      }
    } catch (e: any) {
      console.error("Failed to find email", e);
      return { error: e.message || "Network error" };
    }
  },

  verifyEmail: async (email: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        return await res.json();
      } else {
        const data = await res.json().catch(() => ({}));
        return { error: data.detail || "API returned an error code" };
      }
    } catch (e: any) {
      console.error("Failed to verify email", e);
      return { error: e.message || "Network error" };
    }
  },


  workLogs: [],
  fetchWorkLogs: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/worklogs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/worklogs";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ workLogs: data });
      }
    } catch (e) {
      console.error("Failed to fetch work logs", e);
    }
  },
  submitWorkLog: async (taskId: string, hours: number, description: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/worklogs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/worklogs";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: taskId,
          hours_spent: hours,
          description: description
        })
      });
      if (res.ok) {
        get().fetchWorkLogs();
        return true;
      }
    } catch (e) {
      console.error("Failed to submit work log", e);
    }
    return false;
  },

  customLogs: [],
  fetchCustomLogs: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/custom-logs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/custom-logs";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ customLogs: data });
      }
    } catch (e) {
      console.error("Failed to fetch custom logs", e);
    }
  },
  submitCustomLog: async (content: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/custom-logs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/custom-logs";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          log_content: content
        })
      });
      if (res.ok) {
        get().fetchCustomLogs();
        return true;
      }
    } catch (e) {
      console.error("Failed to submit custom log", e);
    }
    return false;
  },

  adminUsers: [],
  fetchAdminUsers: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ adminUsers: data });
      }
    } catch (e) {
      console.error("Failed to fetch admin users", e);
    }
  },
  createUser: async (userData: any) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        get().fetchAdminUsers();
        return true;
      }
    } catch (e) {
      console.error("Failed to create user", e);
    }
    return false;
  },
  deleteUser: async (userId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        get().fetchAdminUsers();
        return true;
      }
    } catch (e) {
      console.error("Failed to delete user", e);
    }
    return false;
  },
  updateUserMetadata: async (userId: string, updateData: any) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        get().fetchAdminUsers();
        return true;
      }
    } catch (e) {
      console.error("Failed to update user metadata", e);
    }
    return false;
  },
  resendInvite: async (userId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/admin/users/${userId}/resend-invite`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      } else {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.detail || "Failed to resend invite" };
      }
    } catch (e: any) {
      console.error("Failed to resend invite", e);
      return { success: false, error: e.message || "Network error" };
    }
  },
  projects: [],
  fetchProjects: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/projects", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ projects: data });
      }
    } catch (e) {
      console.error("Failed to fetch projects in useSevenStore", e);
    }
  },
  createProject: async (projectData: { 
    title: string; 
    client_id?: string | null;
    deadline?: string | null;
    worker_type?: string | null;
    assigned_user_id?: string | null;
    assigned_group_id?: string | null;
    department?: string | null;
  }) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        get().fetchProjects();
        return true;
      }
    } catch (e) {
      console.error("Failed to create project", e);
    }
    return false;
  },
  updateProject: async (projectId: string, updateData: any) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        get().fetchProjects();
        return true;
      }
    } catch (e) {
      console.error("Failed to update project", e);
    }
    return false;
  },
  deleteProject: async (projectId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        get().fetchProjects();
        return true;
      }
    } catch (e) {
      console.error("Failed to delete project", e);
    }
    return false;
  },

  // Task Management Actions
  tasks: [],
  fetchTasks: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ tasks: data });
      }
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    }
  },
  createTask: async (taskData: { title: string; description: string; project_id: string; assigned_user_id?: string | null; due_date?: string | null }) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        get().fetchTasks();
        return true;
      }
    } catch (e) {
      console.error("Failed to create task", e);
    }
    return false;
  },
  updateTaskStatus: async (taskId: string, status: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        get().fetchTasks();
        return true;
      }
    } catch (e) {
      console.error("Failed to update task status", e);
    }
    return false;
  },
  assignTask: async (taskId: string, userId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/tasks/${taskId}/assign/${userId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        get().fetchTasks();
        return true;
      }
    } catch (e) {
      console.error("Failed to assign task", e);
    }
    return false;
  },

  // Group Management Actions
  groups: [],
  fetchGroups: async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        set({ groups: data });
      }
    } catch (e) {
      console.error("Failed to fetch groups", e);
    }
  },
  createGroup: async (groupData: { name: string; description?: string; project_id?: string | null }) => {
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData)
      });
      if (res.ok) {
        const newGroup = await res.json();
        get().fetchGroups();
        return newGroup;
      }
    } catch (e) {
      console.error("Failed to create group", e);
    }
    return null;
  },
  updateGroup: async (groupId: string, groupData: { name?: string; description?: string; project_id?: string | null }) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData)
      });
      if (res.ok) {
        get().fetchGroups();
        return true;
      }
    } catch (e) {
      console.error("Failed to update group", e);
    }
    return false;
  },
  deleteGroup: async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        get().fetchGroups();
        return true;
      }
    } catch (e) {
      console.error("Failed to delete group", e);
    }
    return false;
  },
  fetchGroupMembers: async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch group members", e);
    }
    return [];
  },
  addUserToGroup: async (groupId: string, memberData: { user_id: string; role: string }) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData)
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to add user to group", e);
    }
    return false;
  },
  removeUserFromGroup: async (groupId: string, userId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "DELETE"
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to remove user from group", e);
    }
    return false;
  },

  fetchBeacons: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/events/beacons", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ beacons: data });
      }
    } catch (e) {
      console.error("Failed to fetch beacons", e);
    }
  },

  fetchMeetings: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/events/meetings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ meetings: data });
      }
    } catch (e) {
      console.error("Failed to fetch meetings", e);
    }
  },

  fetchReminders: async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/events/reminders?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/events/reminders";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ reminders: data });
      }
    } catch (e) {
      console.error("Failed to fetch reminders", e);
    }
  },

  replyBeacon: async (beaconId: string, replyContent: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/events/beacons/${beaconId}/reply?simulate_user_id=${simulatedUser.user_id}`
        : `/api/v1/events/beacons/${beaconId}/reply`;
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyContent })
      });
      if (res.ok) {
        get().fetchBeacons();
        get().fetchDashboardOverview();
        return true;
      }
    } catch (e) {
      console.error("Failed to reply beacon", e);
    }
    return false;
  },

  replyReminder: async (reminderId: string, replyContent: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const simulatedUser = get().simulatedUser;
      const url = simulatedUser 
        ? `/api/v1/events/reminders/${reminderId}/reply?simulate_user_id=${simulatedUser.user_id}`
        : `/api/v1/events/reminders/${reminderId}/reply`;
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyContent })
      });
      if (res.ok) {
        get().fetchReminders();
        get().fetchDashboardOverview();
        return true;
      }
    } catch (e) {
      console.error("Failed to reply reminder", e);
    }
    return false;
  }
}));

