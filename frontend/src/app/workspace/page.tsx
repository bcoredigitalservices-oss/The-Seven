"use client";

import { useSevenStore } from "@/store/useSevenStore";
import Tier1ExecutiveView from "@/components/workspace/Tier1ExecutiveView";
import Tier2DirectionalView from "@/components/workspace/Tier2DirectionalView";
import Tier3LeadershipView from "@/components/workspace/Tier3LeadershipView";
import Tier4ExecutionView from "@/components/workspace/Tier4ExecutionView";
import { ShieldAlert } from "lucide-react";

export default function WorkspacePage() {
  const { userProfile, error } = useSevenStore();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ShieldAlert className="w-12 h-12 text-[#ff1744] mb-4" />
        <h2 className="text-xl font-mono text-zinc-200">WORKSPACE LINK FAILED</h2>
        <p className="text-zinc-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full font-mono text-zinc-500">
        AWAITING PROFILE METADATA...
      </div>
    );
  }

  return (
    <PolymorphicDashboard />
  );
}

// We can define this in the same file or a new one. For simplicity, here:
import { useHasCapability } from "@/hooks/useHasCapability";
import { useState } from "react";
import AdminOverrideDrawer from "@/components/workspace/AdminOverrideDrawer";
import ActivityLedger from "@/components/workspace/ActivityLedger";
import BlockerBeacon from "@/components/workspace/BlockerBeacon";
import ContextChat from "@/components/workspace/ContextChat";
import { Zap, Radio } from "lucide-react";

function PolymorphicDashboard() {
  const hasStrategy = useHasCapability("strategy:view_matrix");
  const hasDevOverride = useHasCapability("dev:override_blocker");
  const hasAdminManage = useHasCapability("admin:manage_users");
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleForceClear = async (taskId: string, status: string) => {
    const token = localStorage.getItem("seven_token");
    const res = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to update status");
    }
  };

  // Demo broadcast logic
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    const token = localStorage.getItem("seven_token");
    await fetch("http://127.0.0.1:8000/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ message: broadcastMsg })
    });
    setBroadcastMsg("");
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {hasStrategy && (
        <div className="bg-[#111] border border-zinc-800 p-6 rounded-lg grid grid-cols-3 gap-6">
          {/* Actionable Metrics */}
          <div 
            onClick={() => {
              // Simulated selected blocked task
              setSelectedTask({
                task_id: "demo-task-1",
                title: "CRITICAL: Database Locking Issue",
                description: "The main users table is locking during batch updates.",
                status: "Blocked"
              });
              setDrawerOpen(true);
            }}
            className="cursor-pointer hover:bg-zinc-800/50 transition-colors p-4 border border-zinc-800 rounded bg-black flex flex-col items-center justify-center text-center"
          >
            <p className="text-[#ff1744] text-3xl font-bold font-mono">1</p>
            <p className="text-zinc-500 text-xs font-mono uppercase mt-2">Active Blocker (Click to Override)</p>
          </div>
          <div className="p-4 border border-zinc-800 rounded bg-black flex flex-col items-center justify-center text-center">
            <p className="text-emerald-400 text-3xl font-bold font-mono">100%</p>
            <p className="text-zinc-500 text-xs font-mono uppercase mt-2">Squad Velocity</p>
          </div>
          
          {hasAdminManage && (
            <div className="p-4 border border-zinc-800 rounded bg-black/50 col-span-3 lg:col-span-1 flex flex-col">
              <h3 className="text-xs font-mono text-[#00E5FF] mb-2 flex items-center uppercase">
                <Radio className="w-4 h-4 mr-2" />
                Unified Broadcast Terminal
              </h3>
              <form onSubmit={handleBroadcast} className="flex space-x-2 mt-auto">
                <input 
                  type="text" 
                  placeholder="Transmit global system alert..." 
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  className="flex-1 bg-black border border-zinc-800 text-xs p-2 outline-none focus:border-[#00E5FF] font-mono text-zinc-200"
                />
                <button type="submit" className="bg-[#00E5FF]/20 text-[#00E5FF] px-3 font-mono text-xs hover:bg-[#00E5FF] hover:text-black transition-colors">
                  SEND
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Execution Modules */}
        <div className="bg-[#111] border border-zinc-800 p-6 rounded-lg flex flex-col">
           <h3 className="text-[#00E5FF] font-mono uppercase mb-4 border-b border-zinc-800 pb-2">Operational Execution Engine</h3>
           <div className="mb-4">
             <BlockerBeacon />
           </div>
           <div className="flex-1 overflow-hidden min-h-[300px]">
             {/* Note: In a real app we'd pass a real channel ID. Hardcoding for demo layout. */}
             <ContextChat channelId="demo-channel-id" />
           </div>
        </div>

        {/* Global Feed */}
        <div className="bg-[#111] border border-zinc-800 p-6 rounded-lg flex flex-col">
          <h3 className="text-emerald-400 font-mono uppercase mb-4 border-b border-zinc-800 pb-2">Global System Telemetry</h3>
          <div className="flex-1 overflow-hidden">
            <ActivityLedger />
          </div>
        </div>

      </div>

      <AdminOverrideDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        task={selectedTask}
        onForceClear={handleForceClear}
      />
    </div>
  );
}
