"use client";

import { useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { LogOut, Activity, Briefcase, Bug, Compass, FolderKanban, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SystemBroadcastOverlay from "@/components/workspace/SystemBroadcastOverlay";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, fetchUser, signOut, isLoading, connectWebSocket, disconnectWebSocket } = useSevenStore();
  const router = useRouter();

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
  
  // Conditionally render links. If department_id contains QA, show Bug Pipeline
  const deptId = userProfile?.department_id || "";
  const isQA = deptId.toLowerCase().includes("qa");
  
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex overflow-hidden">
      <SystemBroadcastOverlay />
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/80 flex flex-col h-screen">
        <div className="p-6 border-b border-zinc-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#00E5FF] flex items-center justify-center font-mono font-bold text-lg text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            7
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-white">SEVEN</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4 px-2">Navigation</p>
          
          <Link href="/workspace" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-[#151515] text-[#00E5FF] border border-[#00E5FF]/20 font-mono text-xs hover:bg-[#1a1a1a] transition-colors">
            <Activity className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/workspace/projects" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-zinc-400 font-mono text-xs hover:bg-[#111111] hover:text-zinc-200 transition-colors">
            <FolderKanban className="w-4 h-4" />
            <span>Squads & Projects</span>
          </Link>

          {/* Department-Specific Links */}
          {isQA && (
            <Link href="/workspace/bugs" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-zinc-400 font-mono text-xs hover:bg-[#111111] hover:text-amber-400 transition-colors">
              <Bug className="w-4 h-4" />
              <span>Bug Pipeline</span>
            </Link>
          )}

          {userProfile?.role_tier === 1 && (
            <>
              <Link href="/workspace/strategy" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-zinc-400 font-mono text-xs hover:bg-[#111111] hover:text-emerald-400 transition-colors">
                <Compass className="w-4 h-4" />
                <span>Strategy Matrix</span>
              </Link>
              <Link href="/workspace/admin" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-zinc-400 font-mono text-xs hover:bg-[#ff1744]/10 hover:text-[#ff1744] transition-colors border border-transparent hover:border-[#ff1744]/20">
                <ShieldAlert className="w-4 h-4" />
                <span>Master Admin</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-800/80 bg-[#0d0d0d]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-200 truncate">{userProfile?.full_name}</p>
              <p className="text-[9px] font-mono text-zinc-500 uppercase truncate">
                Tier {userProfile?.role_tier} // {userProfile?.current_status}
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
      <main className="flex-1 overflow-y-auto bg-black relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none opacity-20" />
        
        <div className="relative z-10 p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
