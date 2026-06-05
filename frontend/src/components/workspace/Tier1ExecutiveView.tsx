export default function Tier1ExecutiveView() {
  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 rounded-lg border border-zinc-800">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase">Tier 1 // Executive Overview</h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">MACRO-LEVEL VELOCITY METRICS</p>
      </header>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] p-4 rounded border border-zinc-800 flex flex-col justify-center items-center">
          <span className="text-4xl font-bold text-white mb-2 font-mono">94%</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Sprint Health</span>
        </div>
        <div className="bg-[#111111] p-4 rounded border border-zinc-800 flex flex-col justify-center items-center">
          <span className="text-4xl font-bold text-[#ff1744] mb-2 font-mono">12</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Active Blockers</span>
        </div>
        <div className="bg-[#111111] p-4 rounded border border-zinc-800 flex flex-col justify-center items-center">
          <span className="text-4xl font-bold text-emerald-400 mb-2 font-mono">4.2k</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Commits / 24H</span>
        </div>
      </div>
    </div>
  );
}
