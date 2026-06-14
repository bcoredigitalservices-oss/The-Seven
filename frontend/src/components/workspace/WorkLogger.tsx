import React, { useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { Clock, Check } from "lucide-react";

interface WorkLoggerProps {
  taskId: string;
}

export default function WorkLogger({ taskId }: WorkLoggerProps) {
  const { submitWorkLog } = useSevenStore();
  const [hours, setHours] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hours <= 0) return;
    
    setIsSubmitting(true);
    const ok = await submitWorkLog(taskId, hours, description);
    setIsSubmitting(false);

    if (ok) {
      setSuccess(true);
      setDescription("");
      setHours(1);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-3 bg-black/40 border border-zinc-950 p-2 rounded-md font-mono text-[10px] w-full max-w-lg"
    >
      <div className="flex items-center space-x-1.5 min-w-[70px]">
        <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
        <span className="text-zinc-500 uppercase">Hours:</span>
      </div>
      
      <input
        type="number"
        step="0.5"
        min="0.5"
        max="24"
        required
        value={hours}
        onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
        className="w-14 bg-[#111] border border-zinc-800 focus:border-[#00E5FF]/50 text-zinc-200 text-center py-1 rounded outline-none"
      />

      <input
        type="text"
        placeholder="LOG ENTRY DESCRIPTION..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1 bg-[#111] border border-zinc-800 focus:border-[#00E5FF]/50 text-zinc-200 px-3 py-1 rounded outline-none text-left"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-3 py-1 rounded border uppercase font-bold tracking-widest text-[9px] transition-all flex items-center space-x-1 ${
          success
            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
            : "bg-[#00E5FF]/5 border-[#00E5FF]/20 hover:bg-[#00E5FF]/10 text-[#00E5FF] hover:border-[#00E5FF]/40 cursor-pointer"
        }`}
      >
        {isSubmitting ? (
          <span className="animate-pulse">Saving...</span>
        ) : success ? (
          <>
            <Check className="w-3 h-3" />
            <span>Success</span>
          </>
        ) : (
          <span>LOG TIME</span>
        )}
      </button>
    </form>
  );
}
