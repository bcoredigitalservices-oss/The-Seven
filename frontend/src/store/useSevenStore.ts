import { create } from 'zustand';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role_tier: number;
  department_id: string | null;
  current_status: string;
}

interface SevenStore {
  userProfile: UserProfile | null;
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
}

export const useSevenStore = create<SevenStore>((set, get) => ({
  userProfile: null,
  currentUserCapabilities: [],
  isLoading: true,
  error: null,
  ws: null,
  wsConnected: false,
  activityLogs: [],
  
  fetchCurrentUserCapabilities: async () => {
    const { userProfile } = get();
    if (!userProfile) return;
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userProfile.user_id}/capabilities`, {
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
      const storedUser = localStorage.getItem("seven_user");
      
      if (!token || !storedUser) {
        set({ userProfile: null, isLoading: false, currentUserCapabilities: [] });
        return;
      }
      
      set({ userProfile: JSON.parse(storedUser), isLoading: false });
      get().fetchCurrentUserCapabilities();
    } catch (err: any) {
      set({ error: err.message, isLoading: false, userProfile: null, currentUserCapabilities: [] });
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

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/${userProfile.user_id}`);
    
    socket.onopen = () => {
      set({ ws: socket, wsConnected: true });
      console.log("[WS] Connected to SEVEN Ecosystem");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[WS MSG]", data);
      get().addActivityLog(data);
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
      const res = await fetch("http://127.0.0.1:8000/api/auth/users", {
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
      const res = await fetch("http://127.0.0.1:8000/api/capabilities");
      if (res.ok) {
        const caps = await res.json();
        set({ capabilities: caps });
      }
    } catch (err) {
      console.error("Failed to fetch capabilities", err);
    }
  }
}));
