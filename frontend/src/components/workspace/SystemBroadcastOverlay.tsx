"use client";

import { useEffect, useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Bell, Calendar, ShieldAlert } from "lucide-react";
import { useHasCapability } from "@/hooks/useHasCapability";

export default function SystemBroadcastOverlay() {
  const { activityLogs, userProfile, simulatedUser } = useSevenStore();
  const [activeBroadcast, setActiveBroadcast] = useState<any | null>(null);

  const activeUser = simulatedUser || userProfile;

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
      
      // Helper: fire native browser notification
      const fireNativeNotification = (title: string, body: string) => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: "/icons/icon-192x192.png" });
        }
      };

      // 1. System Broadcast
      if (latestLog.type === "system_broadcast") {
        if (latestLog.target_capability && latestLog.target_capability !== "") {
          const hasAccess = checkCap(latestLog.target_capability);
          if (!hasAccess) return;
        }
        setActiveBroadcast({
          title: `System Override Alert // ${latestLog.sender || "Admin"}`,
          message: latestLog.message,
          variant: "system",
          target_capability: latestLog.target_capability
        });
        fireNativeNotification("⚠️ System Alert — B-Core Digital", latestLog.message);
      }
      
      // 2. Blocker Beacon
      else if (latestLog.type === "blocker_beacon") {
        setActiveBroadcast({
          title: "CRITICAL BLOCKER BEACON",
          message: latestLog.message,
          variant: "danger",
          sender: latestLog.sender_name || "Developer"
        });
        fireNativeNotification(
          `🚨 BLOCKER BEACON — ${latestLog.sender_name || "Team Member"}`,
          latestLog.message
        );
      }
      
      // 3. New Reminder
      else if (latestLog.type === "new_reminder") {
        if (activeUser && latestLog.target_id === activeUser.user_id) {
          setActiveBroadcast({
            title: "PERSONAL REMINDER ALERT",
            message: latestLog.message,
            variant: "warning",
            sender: "Coordinator"
          });
          fireNativeNotification("🔔 Reminder — B-Core Digital", latestLog.message);
        }
      }
      
      // 4. New Meeting Schedule
      else if (latestLog.type === "new_meeting") {
        if (latestLog.target_type === "all" || (activeUser && latestLog.target_id === activeUser.user_id)) {
          setActiveBroadcast({
            title: "MEETING SCHEDULED",
            message: `${latestLog.message} (Access link: ${latestLog.link})`,
            variant: "info",
            sender: latestLog.creator_name || "Scheduler"
          });
          fireNativeNotification(
            `📅 Meeting Scheduled — ${latestLog.creator_name || "B-Core"}`,
            latestLog.message
          );
        }
      }
    }
  }, [activityLogs, activeUser]);

  if (!activeBroadcast) return null;

  // Determine styles and icon based on alert variant
  let bgClass = "bg-[#ff1744]";
  let borderClass = "border-[#ff1744]/55";
  let glowClass = "shadow-[0_0_20px_rgba(255,23,68,0.4)]";
  let titleColor = "text-white";
  let Icon = AlertTriangle;

  if (activeBroadcast.variant === "danger") {
    bgClass = "bg-[#d50000]";
    borderClass = "border-[#d50000]/60";
    glowClass = "shadow-[0_0_25px_rgba(213,0,0,0.5)]";
    titleColor = "text-[#ffeb3b]";
    Icon = ShieldAlert;
  } else if (activeBroadcast.variant === "warning") {
    bgClass = "bg-[#ff6d00]";
    borderClass = "border-[#ff6d00]/60";
    glowClass = "shadow-[0_0_20px_rgba(255,109,0,0.4)]";
    Icon = Bell;
  } else if (activeBroadcast.variant === "info") {
    bgClass = "bg-[#0091ea]";
    borderClass = "border-[#0091ea]/60";
    glowClass = "shadow-[0_0_20px_rgba(0,145,234,0.4)]";
    Icon = Calendar;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <div className={`${bgClass} text-white p-5 rounded-xl border-2 ${borderClass} ${glowClass} flex items-start justify-between max-w-4xl mx-auto backdrop-blur-md bg-opacity-95 transition-all duration-300`}>
          <div className="flex items-start space-x-4">
            <div className="bg-white/20 p-3 rounded-xl animate-pulse flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-md font-extrabold font-mono tracking-[0.15em] uppercase ${titleColor}`}>
                {activeBroadcast.title}
              </h3>
              <p className="mt-1.5 text-sm font-mono leading-relaxed text-zinc-100">
                {activeBroadcast.message}
              </p>
              {activeBroadcast.target_capability && (
                <p className="mt-2 text-[10px] font-mono bg-black/40 inline-block px-2 py-0.5 rounded tracking-wide text-zinc-300">
                  TARGETING CAPABILITY: {activeBroadcast.target_capability}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setActiveBroadcast(null)}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors ml-4 shrink-0"
            title="Dismiss Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
