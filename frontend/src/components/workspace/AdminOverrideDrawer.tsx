"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, CheckCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { useHasCapability } from "@/hooks/useHasCapability";

interface AdminOverrideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null; // Selected blocked task
  onForceClear: (taskId: string, newStatus: string) => Promise<void>;
}

export default function AdminOverrideDrawer({ isOpen, onClose, task, onForceClear }: AdminOverrideDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasDevOverride = useHasCapability("dev:override_blocker");

  const handleClear = async (status: string) => {
    if (!task) return;
    setLoading(true);
    setError("");
    try {
      await onForceClear(task.task_id, status);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to clear blocker");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-zinc-800 z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-[#111111]">
              <h2 className="text-xl font-bold font-mono text-[#00E5FF] flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2" />
                ADMIN OVERRIDE
              </h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="bg-[#1a1a1a] p-4 rounded border border-zinc-800 mb-6">
                <p className="text-[10px] text-zinc-500 font-mono mb-1">TARGET ASSET</p>
                <h3 className="text-zinc-200 font-bold">{task.title}</h3>
                <p className="text-sm text-zinc-400 mt-2">{task.description || "No description provided."}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">CURRENT STATUS:</span>
                  <span className="text-[#ff1744] bg-[#ff1744]/10 px-2 py-1 rounded">{task.status}</span>
                </div>
              </div>

              {!hasDevOverride && (
                <div className="p-4 bg-[#ff1744]/10 border border-[#ff1744]/30 rounded text-[#ff1744] text-sm font-mono mb-6">
                  ACCESS DENIED: You do not possess the `dev:override_blocker` capability required to mutate this asset's operational status.
                </div>
              )}

              {error && (
                <div className="p-4 bg-[#ff1744]/10 border border-[#ff1744]/30 rounded text-[#ff1744] text-sm font-mono mb-6">
                  {error}
                </div>
              )}

              <h4 className="text-[10px] text-zinc-500 font-mono mb-4 border-b border-zinc-800 pb-2">AVAILABLE MUTATIONS</h4>
              
              <div className="space-y-4">
                <button 
                  disabled={!hasDevOverride || loading}
                  onClick={() => handleClear("In Progress")}
                  className="w-full flex items-center justify-between p-4 bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="text-left">
                    <p className="text-[#00E5FF] font-bold font-mono text-sm">FORCE RESUME (IN PROGRESS)</p>
                    <p className="text-zinc-500 text-xs mt-1">Lifts the blocker and returns asset to active development.</p>
                  </div>
                  <RotateCcw className="w-5 h-5 text-[#00E5FF] group-hover:rotate-180 transition-transform duration-500" />
                </button>

                <button 
                  disabled={!hasDevOverride || loading}
                  onClick={() => handleClear("Done")}
                  className="w-full flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="text-left">
                    <p className="text-emerald-400 font-bold font-mono text-sm">OVERRIDE & COMPLETE (DONE)</p>
                    <p className="text-zinc-500 text-xs mt-1">Bypasses QA and marks the asset as completely resolved.</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
