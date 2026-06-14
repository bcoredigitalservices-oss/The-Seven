"use client";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useSevenStore } from "@/store/useSevenStore";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, 
  Terminal, 
  User as UserIcon, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  Zap, 
  VolumeX, 
  RefreshCw 
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, 
    logout, 
    isConnected, 
    isDeepWorkMode, 
    setDeepWorkMode, 
    updateUserStatus,
    users,
    login 
  } = useWorkspaceStore();
  const { userProfile } = useSevenStore();
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleDeepWork = async () => {
    await setDeepWorkMode(!isDeepWorkMode);
  };

  const handleStatusChange = async (status: string) => {
    await updateUserStatus(status);
    setIsStatusOpen(false);
  };

  // Demo Role Swapper: Updates role on current user locally
  const handleRoleSwap = (role: "Admin" | "Architect" | "Developer") => {
    useWorkspaceStore.setState((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, role };
      return {
        user: updatedUser,
        users: state.users.map((u) => u.user_id === state.user?.user_id ? updatedUser : u)
      };
    });
  };

  const statusColors = {
    "Active": "bg-emerald-400 glow-active",
    "Deep Work": "bg-[#00e5ff] glow-deep-work",
    "Blocked": "bg-[#ff1744] animate-pulse",
    "Offline": "bg-zinc-500"
  };

  const roleIcons = {
    "Admin": <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />,
    "Architect": <Cpu className="w-3.5 h-3.5 text-[#00e5ff]" />,
    "Developer": <Terminal className="w-3.5 h-3.5 text-zinc-400" />
  };

  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#0d0d12]/90 flex flex-col justify-between h-screen sticky top-0 font-sans z-20">
      <div>
        {/* Logo Section */}
        <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between">
          <div onClick={() => router.push('/workspace')} className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#00e5ff] to-cyan-800 flex items-center justify-center font-mono font-bold text-sm text-[#09090b] shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              7
            </div>
            <span className="font-bold tracking-widest text-sm text-white font-mono">B-CORE DIGITAL</span>
          </div>

          {/* WS Realtime Sync Status Indicator */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-500 animate-ping"}`} />
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">
              {isConnected ? "Sync ON" : "Offline"}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-zinc-800/60 bg-[#12121a]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center relative">
              <UserIcon className="w-5 h-5 text-zinc-400" />
              {/* Status Indicator Dot */}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090b] ${statusColors[user.current_status] || "bg-zinc-500"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate">{user.full_name}</p>
              <div className="flex items-center space-x-1 mt-0.5">
                {roleIcons[user.role]}
                <span className="text-xs text-zinc-500 font-mono">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Quick status dropdown selector */}
          <div className="relative mt-3">
            <button 
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full text-left px-3 py-1.5 rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-xs font-mono text-zinc-400 flex items-center justify-between transition-all"
            >
              <span>Status: <strong className="text-zinc-200">{user.current_status}</strong></span>
              <span className="text-[10px] text-zinc-600">▼</span>
            </button>
            
            {isStatusOpen && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-lg border border-zinc-800 bg-[#0d0d12] shadow-xl p-1 z-30 font-mono text-xs">
                {["Active", "Deep Work", "Blocked", "Offline"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 flex items-center space-x-2 transition-all"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      st === "Active" ? "bg-emerald-400" :
                      st === "Deep Work" ? "bg-[#00e5ff]" :
                      st === "Blocked" ? "bg-[#ff1744] animate-pulse" :
                      "bg-zinc-500"
                    }`} />
                    <span>{st}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deep Work Toggle Panel */}
        <div className="p-4 border-b border-zinc-800/40">
          <div className={`p-3 rounded-xl border transition-all duration-300 ${
            isDeepWorkMode 
              ? "bg-[#00e5ff]/5 border-[#00e5ff]/20 shadow-[0_0_15px_rgba(0,229,255,0.05)]" 
              : "bg-zinc-900/40 border-zinc-850"
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-mono text-zinc-400 flex items-center uppercase">
                <VolumeX className="w-3.5 h-3.5 mr-1 text-[#00e5ff]" />
                Deep Work Mode
              </span>
              <button
                onClick={toggleDeepWork}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDeepWorkMode ? "bg-[#00e5ff]" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                    isDeepWorkMode ? "translate-x-4 bg-[#09090b]" : "translate-x-0 bg-zinc-400"
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-mono">
              {isDeepWorkMode 
                ? "DND active. All notifications muted. Global status locked to Deep Work."
                : "Standard mode. Dynamic status and notifications active."}
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5">
          <span className="px-3 text-[10px] font-mono text-zinc-600 uppercase tracking-widest block mb-2">Workspace</span>
          
          {userProfile?.role_tier === 1 ? (
            <>
              <button 
                onClick={() => router.push('/workspace/users')} 
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 transition-all ${
                  pathname === '/workspace/users'
                    ? "bg-[#00e5ff]/5 border border-[#00e5ff]/10 text-[#00e5ff]"
                    : "bg-transparent border border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Users Dashboard</span>
              </button>
              <button 
                onClick={() => router.push('/workspace/admin')} 
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 transition-all ${
                  pathname === '/workspace/admin'
                    ? "bg-[#00e5ff]/5 border border-[#00e5ff]/10 text-[#00e5ff]"
                    : "bg-transparent border border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>IAM Root Console</span>
              </button>
              <button 
                onClick={() => router.push('/workspace/operations')} 
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 transition-all ${
                  pathname === '/workspace/operations'
                    ? "bg-[#00e5ff]/5 border border-[#00e5ff]/10 text-[#00e5ff]"
                    : "bg-transparent border border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Operations Matrix</span>
              </button>
              <button 
                onClick={() => router.push('/workspace/leads')} 
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 transition-all ${
                  pathname === '/workspace/leads'
                    ? "bg-[#00e5ff]/5 border border-[#00e5ff]/10 text-[#00e5ff]"
                    : "bg-transparent border border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Growth Engine (Leads)</span>
              </button>
              <button 
                onClick={() => router.push('/workspace/analytics')} 
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 transition-all ${
                  pathname === '/workspace/analytics'
                    ? "bg-[#00e5ff]/5 border border-[#00e5ff]/10 text-[#00e5ff]"
                    : "bg-transparent border border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Business Analytics</span>
              </button>
            </>
          ) : (
            <button className="w-full text-left px-3 py-2 rounded-lg bg-[#00e5ff]/5 border border-[#00e5ff]/10 text-[#00e5ff] font-mono text-xs flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Sprint Board</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer / Demo Control Center */}
      <div className="p-4 border-t border-zinc-850 space-y-4">
        {/* Demo Switch Panel */}
        <div className="p-3 rounded-lg bg-[#11111a]/80 border border-zinc-800">
          <div className="flex items-center space-x-1 mb-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">
              Demo Switcher
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {["Developer", "Architect", "Admin"].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwap(r as any)}
                className={`py-1 rounded text-[9px] font-mono border transition-all ${
                  user.role === r 
                    ? "bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-350"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-lg border border-zinc-800 hover:border-red-500/20 hover:bg-red-950/10 text-zinc-500 hover:text-[#ff1744] font-mono text-xs flex items-center justify-center space-x-2 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Node</span>
        </button>
      </div>
    </aside>
  );
}
