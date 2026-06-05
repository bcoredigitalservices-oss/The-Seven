"use client";

import { useEffect, useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useHasCapability } from "@/hooks/useHasCapability";

export default function SystemBroadcastOverlay() {
  const { activityLogs } = useSevenStore();
  const [activeBroadcast, setActiveBroadcast] = useState<any | null>(null);

  // We need to pass the hook dynamically, which we can't do in a loop,
  // but we can evaluate it if target_capability is provided.
  // We'll extract this logic in a way that respects hooks rules if we can,
  // but for simplicity, we'll listen to the store and check our local caps.
  
  const hasDevOverride = useHasCapability("dev:override_blocker");
  const hasAdminManage = useHasCapability("admin:manage_users");
  const hasStrategyView = useHasCapability("strategy:view_matrix");

  const checkCap = (target: string) => {
    if (target === "dev:override_blocker") return hasDevOverride;
    if (target === "admin:manage_users") return hasAdminManage;
    if (target === "strategy:view_matrix") return hasStrategyView;
    return false;
  };

  useEffect(() => {
    if (activityLogs.length > 0) {
      const latestLog = activityLogs[0];
      if (latestLog.type === "system_broadcast") {
        
        // Filter by capability if specified
        if (latestLog.target_capability && latestLog.target_capability !== "") {
          const hasAccess = checkCap(latestLog.target_capability);
          if (!hasAccess) return;
        }

        setActiveBroadcast(latestLog);
      }
    }
  }, [activityLogs]);

  return (
    <AnimatePresence>
      {activeBroadcast && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 p-4"
        >
          <div className="bg-[#ff1744] text-white p-6 rounded-lg shadow-2xl border-2 border-[#ff1744]/50 flex items-start justify-between max-w-4xl mx-auto backdrop-blur-md bg-opacity-90">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-3 rounded-full animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono tracking-widest uppercase">System Override Alert // {activeBroadcast.sender}</h3>
                <p className="mt-2 text-lg">{activeBroadcast.message}</p>
                {activeBroadcast.target_capability && (
                  <p className="mt-4 text-xs font-mono bg-black/30 inline-block px-2 py-1 rounded">
                    TARGETING CAPABILITY: {activeBroadcast.target_capability}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setActiveBroadcast(null)}
              className="text-white hover:text-black hover:bg-white/50 p-2 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
