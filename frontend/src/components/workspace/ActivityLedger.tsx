"use client";

import { useSevenStore } from "@/store/useSevenStore";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, CheckCircle, Activity } from "lucide-react";
import { useEffect } from "react";

export default function ActivityLedger() {
  const { activityLogs, connectWebSocket } = useSevenStore();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-4 h-[400px] flex flex-col font-mono mt-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center">
          <Terminal className="w-4 h-4 mr-2 text-[#00E5FF]" />
          ACTIVITY LEDGER
        </h3>
        <span className="text-[10px] text-emerald-400 animate-pulse flex items-center">
          <Activity className="w-3 h-3 mr-1" /> LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        <AnimatePresence initial={false}>
          {activityLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="text-xs border-l-2 pl-3 py-1 bg-black/40 rounded-r overflow-hidden"
              style={{
                borderColor: log.type === 'blocker_beacon' ? '#ff1744' : 
                             log.type === 'task_updated' ? '#00E5FF' : '#52525b'
              }}
            >
              <div className="flex items-center text-[9px] text-zinc-500 mb-1 tracking-widest uppercase">
                <span>SYSTEM EVENT // {log.type.replace(/_/g, ' ')}</span>
              </div>
              
              {log.type === 'blocker_beacon' && (
                <div className="text-[#ff1744] flex items-start">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2 shrink-0 mt-0.5" />
                  <span>{log.message}</span>
                </div>
              )}
              
              {log.type === 'task_updated' && (
                <div className="text-zinc-300">
                  Task <span className="text-[#00E5FF]">{log.task?.title}</span> updated to <span className="text-emerald-400">{log.task?.status}</span>
                </div>
              )}
              
              {log.type === 'user_status_changed' && (
                <div className="text-zinc-400">
                  User status updated to: <span className="text-white">{log.status}</span>
                </div>
              )}
              
              {log.type === 'new_message' && (
                <div className="text-zinc-400 truncate">
                  New message in context channel.
                </div>
              )}
            </motion.div>
          ))}
          {activityLogs.length === 0 && (
            <div className="text-zinc-600 text-xs italic text-center mt-10">Awaiting system events...</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
