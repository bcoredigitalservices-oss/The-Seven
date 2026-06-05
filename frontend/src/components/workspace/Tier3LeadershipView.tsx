import { ShieldAlert } from "lucide-react";
import ActivityLedger from "./ActivityLedger";

export default function Tier3LeadershipView() {
  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 rounded-lg border border-zinc-800 space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase">Tier 3 // Leadership Operations</h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">SQUAD VELOCITY & ACTIVE BLOCKER BEACONS</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-zinc-800 rounded p-4">
          <h3 className="text-sm text-zinc-300 font-bold mb-4 border-b border-zinc-800 pb-2">Squad Velocity</h3>
          <div className="flex flex-col justify-center items-center h-32">
            <span className="text-3xl font-mono text-emerald-400">82 PTS</span>
            <span className="text-[10px] text-zinc-500 mt-2 uppercase">Current Sprint Burn</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-red-900/30 rounded p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#ff1744]" />
          <h3 className="text-sm text-[#ff1744] font-bold mb-4 border-b border-red-900/30 pb-2 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" />
            BLOCKER BEACONS
          </h3>
          <ul className="space-y-4">
            <li className="text-xs font-mono text-zinc-300">
              <span className="text-[#ff1744] mr-2">[BEACON-01]</span>
              Database migration locked in staging environment.
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-1">
        <ActivityLedger />
      </div>
    </div>
  );
}
