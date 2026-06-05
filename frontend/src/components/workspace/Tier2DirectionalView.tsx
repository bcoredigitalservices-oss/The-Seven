export default function Tier2DirectionalView() {
  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 rounded-lg border border-zinc-800">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase">Tier 2 // Directional Strategy</h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">SQUAD ALLOCATION & PROJECT TRAJECTORY</p>
      </header>
      <div className="flex-1">
        <div className="bg-[#111111] border border-zinc-800 rounded p-4 mb-4">
          <h3 className="text-sm text-zinc-300 font-bold mb-4 border-b border-zinc-800 pb-2">Active Squads</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-xs text-zinc-400 font-mono">
              <span>[SQD-ALPHA]</span>
              <span className="text-emerald-400">ON TRACK</span>
            </li>
            <li className="flex justify-between items-center text-xs text-zinc-400 font-mono">
              <span>[SQD-OMEGA]</span>
              <span className="text-amber-400">AT RISK</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
