import { CheckCircle, Clock } from "lucide-react";
import BlockerBeacon from "./BlockerBeacon";
import ContextChat from "./ContextChat";
import { Task } from "@/store/useSevenStore";
import WorkLogger from "./WorkLogger";

interface Tier4ExecutionViewProps {
  assignedTasks: Task[];
}

export default function Tier4ExecutionView({ assignedTasks }: Tier4ExecutionViewProps) {
  const activeTasks = assignedTasks.filter(t => t.status !== "Done" && t.status !== "Deployed");
  
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
            <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded">{activeTasks.length} ACTIVE</span>
          </div>
          <ul className="divide-y divide-zinc-800/50 flex-1 overflow-y-auto">
            {assignedTasks.length > 0 ? (
              assignedTasks.map((task) => {
                const isActive = task.status !== "Done" && task.status !== "Deployed";
                return (
                  <li key={task.task_id} className="px-4 py-4 hover:bg-[#1a1a24] transition-colors group flex flex-col">
                    <div className="flex items-start">
                      {isActive ? (
                        <Clock className="w-4 h-4 text-emerald-400 mt-0.5 mr-3" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-zinc-600 mt-0.5 mr-3" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-mono ${isActive ? "text-zinc-200 group-hover:text-white" : "text-zinc-600 line-through"}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1">
                          {task.status} {task.priority ? `// ${task.priority.toUpperCase()}` : ""}
                        </p>
                        {isActive && (
                          <div className="mt-3">
                            <WorkLogger taskId={task.task_id} />
                          </div>
                        )}
                      </div>
                    </div>
                    {task.status === "Blocked" && (
                      <div className="mt-3">
                        <BlockerBeacon taskId={task.task_id} />
                      </div>
                    )}
                  </li>
                );
              })
            ) : (
              <p className="text-zinc-500 text-xs font-mono p-4">No assigned tasks found.</p>
            )}
          </ul>
        </div>
        
        <div className="flex flex-col">
          {/* Note: Use a fallback or demo channel ID if no active task has channel */}
          <ContextChat channelId="demo-channel-id" />
        </div>
      </div>
    </div>
  );
}
