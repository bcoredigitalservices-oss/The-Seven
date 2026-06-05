import { CheckCircle, Clock } from "lucide-react";
import BlockerBeacon from "./BlockerBeacon";
import ContextChat from "./ContextChat";

export default function Tier4ExecutionView() {
  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 rounded-lg border border-zinc-800 space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase">Tier 4 // Execution</h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">ASSIGNED TASKS & DEEP WORK INTEGRATION</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-[#111111] border border-zinc-800 rounded flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-black/50">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Current Sprint Queue</span>
            <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded">2 ACTIVE</span>
          </div>
          <ul className="divide-y divide-zinc-800/50 flex-1 overflow-y-auto">
            <li className="px-4 py-3 hover:bg-[#1a1a24] transition-colors group flex flex-col">
              <div className="flex items-start">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-mono text-zinc-200 group-hover:text-white">Implement Redis Cache Layer</p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">TASK-904 // IN PROGRESS</p>
                </div>
              </div>
              <div className="mt-2">
                <BlockerBeacon taskId="t1111111-1111-1111-1111-111111111111" />
              </div>
            </li>
            <li className="px-4 py-3 hover:bg-[#1a1a24] transition-colors cursor-pointer group flex items-start">
              <CheckCircle className="w-4 h-4 text-zinc-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-mono text-zinc-400 line-through">Update API Documentation</p>
                <p className="text-[10px] font-mono text-zinc-600 mt-1">TASK-882 // DONE</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col">
          <ContextChat channelId="1" />
        </div>
      </div>
    </div>
  );
}
