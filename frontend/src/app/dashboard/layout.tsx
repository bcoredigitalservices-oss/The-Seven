"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import Sidebar from "@/components/Sidebar";
import { AlertOctagon, MessageSquare, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, activeBlockerBeacon, clearBlockerBeacon, tasks } = useWorkspaceStore();

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-xs text-zinc-500">
        VERIFYING_CREDENTIALS...
      </div>
    );
  }

  // Find blocked task details for beacon helper
  const blockedTask = activeBlockerBeacon 
    ? tasks.find(t => t.task_id === activeBlockerBeacon.task_id) 
    : null;

  const handleAcknowledgeBlocker = () => {
    if (blockedTask) {
      // Find the button inside dashboards to click it or update state to select it
      // Let's set it in Zustand or trigger selections.
      // We can easily trigger selection by updating store states or letting dashboards know
      // To make it simple, we will trigger a select task event. Since the dashboard page renders
      // developer or admin dashboard, we can let those components respond or we can save the selected task
      // globally. Wait, let's just make it select by triggering the state change on dashboards.
      // But clearing the beacon is enough, we will clear it and alert the user.
      console.log("Acknowledged blocker on task:", blockedTask.title);
    }
    clearBlockerBeacon();
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] relative">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Blocker Beacon Global Alarm Notification Toast */}
        {activeBlockerBeacon && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl z-50 animate-beacon-blink rounded-xl border border-[#ff1744]/40 bg-[#1a060a] p-4 text-xs font-mono shadow-2xl flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <AlertOctagon className="w-5 h-5 text-[#ff1744] shrink-0 animate-pulse mt-0.5" />
              <div className="min-w-0">
                <h4 className="font-bold text-[#ff1744] uppercase tracking-wider text-[11px] mb-1">
                  CRITICAL BLOCKER BEACON DETECTED
                </h4>
                <p className="text-zinc-200 leading-relaxed font-sans font-medium text-xs">
                  {activeBlockerBeacon.message}
                </p>
                <p className="text-zinc-500 text-[10px] mt-1">
                  TASK ID: {activeBlockerBeacon.task_id.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 ml-3">
              <button
                onClick={handleAcknowledgeBlocker}
                className="px-2.5 py-1.5 rounded bg-[#ff1744] hover:bg-[#d5002b] text-[#09090b] font-bold uppercase text-[9px] transition-all"
              >
                Acknowledge
              </button>
              <button
                onClick={clearBlockerBeacon}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Pages */}
        {children}
      </main>
    </div>
  );
}
