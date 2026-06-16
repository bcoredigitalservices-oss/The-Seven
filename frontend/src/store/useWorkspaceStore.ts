import { create } from "zustand";

export interface User {
  user_id: string;
  full_name: string;
  role: "Admin" | "Architect" | "Developer";
  current_status: "Active" | "Deep Work" | "Blocked" | "Offline";
}

export interface Project {
  project_id: string;
  title: string;
  status: string;
  client_id?: string | null;
  client_ids?: string[] | null;
}

export interface Task {
  task_id: string;
  project_id: string;
  assigned_user_id: string | null;
  title: string;
  description: string | null;
  status: "Backlog" | "Assigned" | "In Progress" | "Blocked" | "Review" | "QA" | "Deployed" | "Done";
  project?: Project;
  assigned_user?: User;
}

export interface Channel {
  channel_id: string;
  attached_task_id: string | null;
  channel_type: "Task" | "Epic" | "Blocker_Beacon";
}

export interface Message {
  message_id: string;
  channel_id: string;
  sender_id: string | null;
  content: string;
  is_code_snippet: boolean;
  created_at: string;
  sender?: User;
}

interface BlockerBeaconAlert {
  task_id: string;
  user_id: string;
  message: string;
}

interface WorkspaceState {
  user: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  currentChannel: Channel | null;
  messages: Message[];
  isConnected: boolean;
  isDeepWorkMode: boolean;
  activeBlockerBeacon: BlockerBeaconAlert | null;
  apiBaseUrl: string;
  wsUrl: string;
  ws: WebSocket | null;

  // Actions
  login: (userIdOrName: string) => Promise<User>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: { title: string; description: string; project_id: string; assigned_user_id?: string }) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: string) => Promise<Task>;
  assignTask: (taskId: string, userId: string) => Promise<Task>;
  updateUserStatus: (status: string) => Promise<User>;
  setDeepWorkMode: (value: boolean) => Promise<void>;
  fetchChannelMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string, isCodeSnippet: boolean) => Promise<Message>;
  clearBlockerBeacon: () => void;
}

// Initial mock data if API fails or for offline mode
const MOCK_USERS: User[] = [
  { user_id: "d03b6d76-881c-43f0-8be0-b5bc8b15d290", full_name: "Abhinav Architect", role: "Architect", current_status: "Deep Work" },
  { user_id: "a9e6db58-e350-4824-bfbe-0985223e7178", full_name: "Sarah Chen", role: "Developer", current_status: "Active" },
  { user_id: "01b87a8b-cb65-4f40-a3e9-a417534440aa", full_name: "John Doe", role: "Developer", current_status: "Blocked" },
  { user_id: "f5b84c8a-ebc5-4920-94e8-8a8b2767098e", full_name: "System Administrator", role: "Admin", current_status: "Active" }
];

const MOCK_PROJECTS: Project[] = [
  { project_id: "c5b2a0c4-9a4f-4d92-bbbe-f4a478b88301", title: "SEVEN Core Platform", status: "Active" }
];

const MOCK_TASKS: Task[] = [
  { task_id: "t1111111-1111-1111-1111-111111111111", project_id: "c5b2a0c4-9a4f-4d92-bbbe-f4a478b88301", assigned_user_id: "a9e6db58-e350-4824-bfbe-0985223e7178", title: "Configure Tailwind design system & tokens", description: "Set up electric blue and charcoal styles, custom animations, and responsive utilities.", status: "Done" },
  { task_id: "t2222222-2222-2222-2222-222222222222", project_id: "c5b2a0c4-9a4f-4d92-bbbe-f4a478b88301", assigned_user_id: "a9e6db58-e350-4824-bfbe-0985223e7178", title: "Setup Next.js PWA configuration", description: "Configure next-pwa wrapper, create manifest.json and standard assets.", status: "In Progress" },
  { task_id: "t3333333-3333-3333-3333-333333333333", project_id: "c5b2a0c4-9a4f-4d92-bbbe-f4a478b88301", assigned_user_id: "01b87a8b-cb65-4f40-a3e9-a417534440aa", title: "Implement WebSockets Real-time connection in Next.js", description: "Connect Next.js Zustand store directly to FastAPI WebSockets for status & blocker updates.", status: "Blocked" },
  { task_id: "t4444444-4444-4444-4444-444444444444", project_id: "c5b2a0c4-9a4f-4d92-bbbe-f4a478b88301", assigned_user_id: "d03b6d76-881c-43f0-8be0-b5bc8b15d290", title: "Create FastAPI Router and WebSocket manager", description: "Design base connection manager and define endpoints for core models.", status: "Review" }
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  // Setup WebSocket connection
  const setupWebSocket = (user: User) => {
    // Close existing connection if any
    const existingWs = get().ws;
    if (existingWs) {
      existingWs.close();
    }

    try {
      const ws = new WebSocket(`${get().wsUrl}/ws/${user.user_id}`);

      ws.onopen = () => {
        set({ isConnected: true });
        console.log("WebSocket connected.");
      };

      ws.onclose = () => {
        set({ isConnected: false, ws: null });
        console.log("WebSocket disconnected.");
        // Try reconnecting after 5 seconds
        setTimeout(() => {
          const currentUser = get().user;
          if (currentUser) {
            setupWebSocket(currentUser);
          }
        }, 5000);
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        console.log("WebSocket message received:", payload);

        switch (payload.type) {
          case "user_status_changed":
            set((state) => {
              const updatedUsers = state.users.map((u) =>
                u.user_id === payload.user_id ? { ...u, current_status: payload.status } : u
              );
              const updatedCurrentUser = state.user && state.user.user_id === payload.user_id
                ? { ...state.user, current_status: payload.status }
                : state.user;
              return { users: updatedUsers, user: updatedCurrentUser };
            });
            break;

          case "task_updated":
            set((state) => {
              const updatedTasks = state.tasks.map((t) =>
                t.task_id === payload.task.task_id ? { ...t, ...payload.task } : t
              );
              return { tasks: updatedTasks };
            });
            break;

          case "task_created":
            set((state) => {
              if (state.tasks.some((t) => t.task_id === payload.task.task_id)) return state;
              return { tasks: [...state.tasks, payload.task] };
            });
            break;

          case "new_message":
            set((state) => {
              if (state.currentChannel?.channel_id === payload.message.channel_id) {
                // Prevent duplicate inserts
                if (state.messages.some((m) => m.message_id === payload.message.message_id)) return state;
                return { messages: [...state.messages, payload.message] };
              }
              return state;
            });
            break;

          case "blocker_beacon":
            set({
              activeBlockerBeacon: {
                task_id: payload.task_id,
                user_id: payload.user_id,
                message: payload.message,
              },
            });
            // Auto clear blocker beacon after 15 seconds to prevent spam
            setTimeout(() => {
              get().clearBlockerBeacon();
            }, 15000);
            break;

          default:
            break;
        }
      };

      set({ ws });
    } catch (e) {
      console.error("Failed to connect WebSocket:", e);
    }
  };

  return {
    user: null,
    users: [],
    projects: [],
    tasks: [],
    currentChannel: null,
    messages: [],
    isConnected: false,
    isDeepWorkMode: false,
    activeBlockerBeacon: null,
    apiBaseUrl: "",
    wsUrl: (typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host : ''),
    ws: null,

    login: async (userIdOrName: string) => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userIdOrName }),
        });

        if (!response.ok) throw new Error("Login failed");

        const loggedInUser: User = await response.json();
        set({ user: loggedInUser });
        setupWebSocket(loggedInUser);
        
        // Fetch fresh data
        get().fetchUsers();
        get().fetchProjects();
        get().fetchTasks();

        return loggedInUser;
      } catch (e) {
        console.warn("API login failed, falling back to mock login");
        // Fallback Mock Login
        const mockUser = MOCK_USERS.find(
          (u) => u.user_id === userIdOrName || u.full_name.toLowerCase().includes(userIdOrName.toLowerCase())
        ) || MOCK_USERS[1]; // fallback to Sarah Chen (Developer)

        set({
          user: mockUser,
          users: MOCK_USERS,
          projects: MOCK_PROJECTS,
          tasks: MOCK_TASKS.map(t => ({
            ...t,
            project: MOCK_PROJECTS[0],
            assigned_user: MOCK_USERS.find(u => u.user_id === t.assigned_user_id)
          })),
        });
        return mockUser;
      }
    },

    logout: () => {
      const ws = get().ws;
      if (ws) ws.close();
      set({
        user: null,
        currentChannel: null,
        messages: [],
        isConnected: false,
        activeBlockerBeacon: null,
        ws: null,
      });
    },

    fetchUsers: async () => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/auth/users`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        set({ users: data });
      } catch (e) {
        console.warn("Fallback to mock users");
        if (get().users.length === 0) set({ users: MOCK_USERS });
      }
    },

    fetchProjects: async () => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/projects`);
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        set({ projects: data });
      } catch (e) {
        console.warn("Fallback to mock projects");
        if (get().projects.length === 0) set({ projects: MOCK_PROJECTS });
      }
    },

    fetchTasks: async () => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/tasks`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        set({ tasks: data });
      } catch (e) {
        console.warn("Fallback to mock tasks");
        if (get().tasks.length === 0) {
          set({
            tasks: MOCK_TASKS.map(t => ({
              ...t,
              project: MOCK_PROJECTS[0],
              assigned_user: MOCK_USERS.find(u => u.user_id === t.assigned_user_id)
            }))
          });
        }
      }
    },

    createTask: async (taskData) => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error("Failed to create task");
        const newTask = await response.json();
        return newTask;
      } catch (e) {
        console.warn("Mock creating task");
        const newTask: Task = {
          task_id: `t_${Date.now()}`,
          project_id: taskData.project_id,
          assigned_user_id: taskData.assigned_user_id || null,
          title: taskData.title,
          description: taskData.description || null,
          status: "Backlog",
          project: get().projects.find(p => p.project_id === taskData.project_id),
          assigned_user: get().users.find(u => u.user_id === taskData.assigned_user_id)
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      }
    },

    updateTaskStatus: async (taskId, status) => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/tasks/${taskId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error("Failed to update status");
        const updatedTask = await response.json();
        return updatedTask;
      } catch (e) {
        console.warn("Mock updating task status");
        
        let triggerBeacon = false;
        let assignedUser: string | null = null;
        
        set((state) => {
          const updatedTasks = state.tasks.map((t) => {
            if (t.task_id === taskId) {
              if (status === "Blocked") {
                triggerBeacon = true;
                assignedUser = t.assigned_user_id;
              }
              return { ...t, status: status as any };
            }
            return t;
          });
          return { tasks: updatedTasks };
        });

        // Trigger local mock alert for Blocker Beacon if blocked
        if (triggerBeacon) {
          const userObj = get().users.find(u => u.user_id === assignedUser);
          set({
            activeBlockerBeacon: {
              task_id: taskId,
              user_id: assignedUser || "unknown",
              message: `Blocker Beacon activated by ${userObj?.full_name || 'Developer'} on: '${get().tasks.find(t => t.task_id === taskId)?.title}'`,
            }
          });
          
          // Set user status to Blocked in mock mode
          if (assignedUser) {
            set((state) => ({
              users: state.users.map((u) => u.user_id === assignedUser ? { ...u, current_status: "Blocked" } : u),
              user: state.user && state.user.user_id === assignedUser ? { ...state.user, current_status: "Blocked" } : state.user
            }));
          }

          setTimeout(() => { get().clearBlockerBeacon(); }, 15000);
        }

        return get().tasks.find((t) => t.task_id === taskId)!;
      }
    },

    assignTask: async (taskId, userId) => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/tasks/${taskId}/assign/${userId}`, {
          method: "PUT",
        });
        if (!response.ok) throw new Error("Failed to assign task");
        const updatedTask = await response.json();
        return updatedTask;
      } catch (e) {
        console.warn("Mock assigning task");
        set((state) => {
          const userObj = state.users.find(u => u.user_id === userId);
          const updatedTasks = state.tasks.map((t) =>
            t.task_id === taskId ? { ...t, assigned_user_id: userId, assigned_user: userObj } : t
          );
          return { tasks: updatedTasks };
        });
        return get().tasks.find((t) => t.task_id === taskId)!;
      }
    },

    updateUserStatus: async (status) => {
      const currentUser = get().user;
      if (!currentUser) throw new Error("No active user");

      try {
        const response = await fetch(`${get().apiBaseUrl}/api/users/${currentUser.user_id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_status: status }),
        });
        if (!response.ok) throw new Error("Failed to update user status");
        const updatedUser = await response.json();
        set({ user: updatedUser });
        return updatedUser;
      } catch (e) {
        console.warn("Mock updating user status");
        const updatedUser = { ...currentUser, current_status: status as any };
        set((state) => ({
          user: updatedUser,
          users: state.users.map(u => u.user_id === currentUser.user_id ? updatedUser : u)
        }));
        return updatedUser;
      }
    },

    setDeepWorkMode: async (value) => {
      set({ isDeepWorkMode: value });
      const currentUser = get().user;
      if (currentUser) {
        const targetStatus = value ? "Deep Work" : "Active";
        await get().updateUserStatus(targetStatus);
      }
    },

    fetchChannelMessages: async (channelId) => {
      try {
        const response = await fetch(`${get().apiBaseUrl}/api/channels/${channelId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        set({ messages: data });
      } catch (e) {
        console.warn("Mock loading messages channel");
        set({ messages: [] });
      }
    },

    sendMessage: async (channelId, content, isCodeSnippet) => {
      const currentUser = get().user;
      if (!currentUser) throw new Error("No sender profile found");

      try {
        const response = await fetch(`${get().apiBaseUrl}/api/messages?sender_id=${currentUser.user_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel_id: channelId,
            content,
            is_code_snippet: isCodeSnippet
          }),
        });
        if (!response.ok) throw new Error("Failed to send message");
        const newMsg = await response.json();
        return newMsg;
      } catch (e) {
        console.warn("Mock sending message locally");
        const newMsg: Message = {
          message_id: `m_${Date.now()}`,
          channel_id: channelId,
          sender_id: currentUser.user_id,
          content,
          is_code_snippet: isCodeSnippet,
          created_at: new Date().toISOString(),
          sender: currentUser
        };
        set(state => ({ messages: [...state.messages, newMsg] }));
        return newMsg;
      }
    },

    clearBlockerBeacon: () => {
      set({ activeBlockerBeacon: null });
    }
  };
});
