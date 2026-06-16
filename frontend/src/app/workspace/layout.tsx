"use client";

import { useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { LogOut, Activity, Briefcase, Bug, Compass, FolderKanban, ShieldAlert, Zap, LineChart, Settings, HelpCircle, Calendar, MessageCircle, UserCheck, CheckSquare, Target, Landmark, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import SystemBroadcastOverlay from "@/components/workspace/SystemBroadcastOverlay";
import { Logo } from "@/components/Logo";

// Match login page branding styles exactly with enhanced readability gradients
const bcoreStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontWeight: 700,
  letterSpacing: "0.18em",
  background: "linear-gradient(120deg, #3b82f6, #60a5fa, #93c5fd, #60a5fa, #3b82f6)",
  backgroundSize: "300% 100%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "bcoreGradient 4s ease infinite",
};

const digitalStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontWeight: 600,
  letterSpacing: "0.18em",
  background: "linear-gradient(120deg, #00E5FF, #87ceeb, #e0f7fa, #87ceeb, #00E5FF)",
  backgroundSize: "300% 100%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "digitalGradient 4s ease infinite 0.5s",
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, simulatedUser, setSimulatedUser, fetchUser, signOut, isLoading, connectWebSocket, disconnectWebSocket } = useSevenStore();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    fetchUser();
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [fetchUser, connectWebSocket, disconnectWebSocket]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-[#00E5FF] animate-pulse">
        Initializing Workspace State...
      </div>
    );
  }
  
  // Use activeUser for checking roles, department, and types
  const activeUser = simulatedUser || userProfile;
  const deptId = activeUser?.department_id || "";
  const isQA = deptId.toLowerCase().includes("qa");
  const isMarketing = (activeUser?.department || "").toLowerCase().includes("marketing") || (activeUser?.department || "").toLowerCase().includes("agency");
  const isFinance = activeUser?.role_tier === 1 || (activeUser?.department || "").toLowerCase().includes("corporate") || (activeUser?.department || "").toLowerCase().includes("finance");
  
  const isCEO = activeUser?.role_tier === 1;
  const isClient = activeUser?.user_type === "Client";
  
  return (
    <div className="h-screen bg-[#050505] text-zinc-200 flex overflow-hidden">
      <SystemBroadcastOverlay />
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/80 flex flex-col h-screen">
        <div className="p-5 border-b border-zinc-800/80 flex items-center space-x-3">
          <Logo className="w-12 h-12 shrink-0" animate={true} />
          <div className="flex flex-col leading-[1.1]">
            <span className="text-[13px] uppercase font-bold" style={bcoreStyle}>B-Core</span>
            <span className="text-[13px] uppercase font-semibold" style={digitalStyle}>Digital</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4 px-2">Navigation</p>
          
          {isCEO ? (
            <>
              <Link href="/workspace" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace") ? "bg-[#151515] text-[#00E5FF] border-[#00E5FF]/20" : "text-zinc-400 hover:bg-[#111111] hover:text-[#00E5FF] border-transparent"}`}>
                <Activity className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/workspace/users" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/users") ? "bg-[#151515] text-[#00E5FF] border-[#00E5FF]/20" : "text-zinc-400 hover:bg-[#111111] hover:text-[#00E5FF] border-transparent"}`}>
                <UserCheck className="w-4 h-4" />
                <span>Users Dashboard</span>
              </Link>
              <Link href="/workspace/admin" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/admin") ? "bg-[#ff1744]/10 text-[#ff1744] border-[#ff1744]/20" : "text-zinc-400 hover:bg-[#111111] hover:text-[#ff1744] border-transparent"}`}>
                <ShieldAlert className="w-4 h-4" />
                <span>Root Console</span>
              </Link>
              <Link href="/workspace/operations" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/operations") ? "bg-[#111111] text-emerald-400 border-emerald-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-emerald-400 border-transparent"}`}>
                <FolderKanban className="w-4 h-4" />
                <span>Operations Matrix</span>
              </Link>
              <Link href="/workspace/leads" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/leads") ? "bg-[#111111] text-purple-400 border-purple-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-purple-400 border-transparent"}`}>
                <Zap className="w-4 h-4" />
                <span>Growth Engine (Leads)</span>
              </Link>
              <Link href="/workspace/analytics" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/analytics") ? "bg-[#111111] text-amber-400 border-amber-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-amber-400 border-transparent"}`}>
                <LineChart className="w-4 h-4" />
                <span>Business Analytics</span>
              </Link>
              <Link href="/workspace/proposals" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/proposals") ? "bg-[#111111] text-amber-400 border-amber-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-amber-400 border-transparent"}`}>
                <FileText className="w-4 h-4" />
                <span>Proposal Builder</span>
              </Link>
              <Link href="/workspace/marketing" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/marketing") ? "bg-[#111111] text-pink-400 border-pink-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-pink-400 border-transparent"}`}>
                <LineChart className="w-4 h-4" />
                <span>Marketing Hub</span>
              </Link>
              <div className="pt-2 mt-2 border-t border-zinc-800/80">
                <Link href="/workspace/events" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/events") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                  <Calendar className="w-4 h-4" />
                  <span>Events Options</span>
                </Link>
                <Link href="/workspace/communication" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/communication") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                  <MessageCircle className="w-4 h-4" />
                  <span>Communication Options</span>
                </Link>
                <Link href="/workspace/personas" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/personas") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                  <UserCheck className="w-4 h-4" />
                  <span>Users Persona</span>
                </Link>
                <Link href="/workspace/daily-checkup" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/daily-checkup") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                  <CheckSquare className="w-4 h-4" />
                  <span>Daily Checkup Options</span>
                </Link>
                <Link href="/workspace/finance" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/finance") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                  <Landmark className="w-4 h-4" />
                  <span>Finance Options</span>
                </Link>
              </div>
            </>
          ) : isClient ? (
            <>
              <Link href="/workspace" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace") ? "bg-[#151515] text-[#00E5FF] border-[#00E5FF]/20" : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-[#00E5FF] border-transparent"}`}>
                <Activity className="w-4 h-4" />
                <span>Client Portal</span>
              </Link>
              <Link href="/workspace/communication" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/communication") ? "bg-[#111111] text-zinc-200 border-[#00E5FF]/20" : "text-zinc-400 hover:bg-[#111111] hover:text-[#00E5FF] border-transparent"}`}>
                <MessageCircle className="w-4 h-4" />
                <span>Secured Client Chat</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/workspace" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace") ? "bg-[#151515] text-[#00E5FF] border-[#00E5FF]/20" : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-[#00E5FF] border-transparent"}`}>
                <Activity className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link href="/workspace/projects" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/projects") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                <FolderKanban className="w-4 h-4" />
                <span>Squads & Projects</span>
              </Link>

              {isFinance && (
                <Link href="/workspace/finance" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/finance") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                  <Landmark className="w-4 h-4" />
                  <span>Finance</span>
                </Link>
              )}

              {isMarketing && (
                <Link href="/workspace/marketing" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/marketing") ? "bg-[#111111] text-pink-400 border-pink-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-pink-400 border-transparent"}`}>
                  <LineChart className="w-4 h-4" />
                  <span>Marketing Hub</span>
                </Link>
              )}

              <Link href="/workspace/daily-checkup" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/daily-checkup") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
                <CheckSquare className="w-4 h-4" />
                <span>Daily Logging</span>
              </Link>

              <Link href="/workspace/communication" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/communication") ? "bg-[#111111] text-zinc-200 border-[#00E5FF]/20" : "text-zinc-400 hover:bg-[#111111] hover:text-[#00E5FF] border-transparent"}`}>
                <MessageCircle className="w-4 h-4" />
                <span>Communication</span>
              </Link>

              {isQA && (
                <Link href="/workspace/bugs" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/bugs") ? "bg-[#111111] text-amber-400 border-amber-400/20" : "text-zinc-400 hover:bg-[#111111] hover:text-amber-400 border-transparent"}`}>
                  <Bug className="w-4 h-4" />
                  <span>Bug Pipeline</span>
                </Link>
              )}
            </>
          )}

          {/* Simple Menus */}
          <div className="pt-4 mt-4 border-t border-zinc-800/80">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4 px-2">General</p>
            <Link href="/workspace/settings" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/settings") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <Link href="/workspace/support" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-colors border ${isActive("/workspace/support") ? "bg-[#111111] text-zinc-200 border-zinc-700" : "text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 border-transparent"}`}>
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800/80 bg-[#0d0d0d]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-200 truncate">{activeUser?.full_name}</p>
              <p className="text-[9px] font-mono text-zinc-550 uppercase truncate">
                {activeUser?.user_type === "Client" ? "Client Node" : `Tier ${activeUser?.role_tier}`} &bull; {activeUser?.current_status}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 text-[10px] font-mono py-2 rounded border border-zinc-800 text-zinc-400 hover:bg-[#ff1744]/10 hover:text-[#ff1744] hover:border-[#ff1744]/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>TERMINATE LINK</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-black relative flex flex-col">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none opacity-20" />
        
        {simulatedUser && (
          <div className="bg-[#ff1744]/15 border-b border-[#ff1744]/30 px-6 py-3 flex items-center justify-between text-xs font-mono text-[#ff1744] shadow-md z-30">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#ff1744] animate-ping" />
              <span>SIMULATION ACTIVE: Viewing workspace as <strong>{simulatedUser.full_name}</strong> ({simulatedUser.user_type || "Employee"} / {simulatedUser.department || "No Dept"})</span>
            </div>
            <button 
              onClick={() => setSimulatedUser(null)}
              className="bg-[#ff1744]/20 hover:bg-[#ff1744]/30 border border-[#ff1744]/40 px-3 py-1 rounded text-[10px] font-bold text-white transition-all tracking-wider"
            >
              EXIT SIMULATION
            </button>
          </div>
        )}

        <div className="relative z-10 p-8 flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
