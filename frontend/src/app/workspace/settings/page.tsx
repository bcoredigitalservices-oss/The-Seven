"use client";

import React, { useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { Settings, Shield, Paintbrush, User, Key } from "lucide-react";

export default function SettingsPage() {
  const { userProfile, simulatedUser } = useSevenStore();
  const [e2eEnabled, setE2eEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("45m");
  const [telemetry, setTelemetry] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("cyan");

  const [isUpdating, setIsUpdating] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  const activeUser = simulatedUser || userProfile;

  const handleSavePreferences = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 2000);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">SYSTEM PARAMETERS</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1 flex items-center">
            <Settings className="w-6 h-6 mr-2.5 text-[#00E5FF]" />
            SETTINGS CONFIGURATION
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1 flex-1">
        
        {/* Profile Card & Details (1 column) */}
        <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 h-fit">
          <div className="flex items-center space-x-4 border-b border-zinc-850 pb-4">
            <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#00E5FF]">
              <User className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white font-mono truncate">{activeUser?.full_name}</h2>
              <p className="text-[10px] text-zinc-550 font-mono truncate uppercase">{activeUser?.user_type} // {activeUser?.department || "No Dept"}</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">USER ID:</span>
              <span className="text-zinc-350 select-all font-bold text-[10px]">{activeUser?.user_id}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">EMAIL REGISTER:</span>
              <span className="text-zinc-350 truncate max-w-[170px]">{activeUser?.email}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">ROLE AUTH LEVEL:</span>
              <span className="text-pink-400 font-bold">{activeUser?.user_type === "Client" ? "Client Node" : `TIER ${activeUser?.role_tier}`}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">ACTIVE STATUS:</span>
              <span className="text-emerald-400 font-bold uppercase">{activeUser?.current_status}</span>
            </div>
          </div>
        </div>

        {/* Configurations Forms (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security & Encryption Preferences */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3">
              <Shield className="w-4 h-4 text-[#00E5FF]" />
              <span>CRYPTOGRAPHIC PROTOCOLS</span>
            </h3>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-300">End-to-End Chat Encryption</p>
                  <p className="text-[10px] text-zinc-500 max-w-sm leading-relaxed">
                    Force client-side AES/RSA local decryption before displaying group & direct message logs.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={e2eEnabled}
                  onChange={(e) => setE2eEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-black text-[#00E5FF] focus:ring-[#00E5FF]/20"
                />
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-300">Workspace Telemetry Ingestion</p>
                  <p className="text-[10px] text-zinc-550 max-w-sm leading-relaxed">
                    Transmit anonymized audit parameters to the executive controller matrix.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={telemetry}
                  onChange={(e) => setTelemetry(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-black text-[#00E5FF] focus:ring-[#00E5FF]/20"
                />
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-300">Secure Session Timeout</p>
                  <p className="text-[10px] text-zinc-550 max-w-sm leading-relaxed">
                    Duration of inactive link connectivity before forcing key termination.
                  </p>
                </div>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="bg-black border border-zinc-850 rounded px-2.5 py-1 text-white text-[11px]"
                >
                  <option value="15m">15 Minutes</option>
                  <option value="45m">45 Minutes</option>
                  <option value="2h">2 Hours</option>
                  <option value="never">Never Timeout</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aesthetic Preferences */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2 border-b border-zinc-850 pb-3">
              <Paintbrush className="w-4 h-4 text-[#00E5FF]" />
              <span>VISUAL INTERFACE PRESETS</span>
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-2">
                <p className="font-bold text-zinc-300">Highlight Workspace Accent Color</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "cyan", name: "Neon Cyan", color: "bg-[#00E5FF]" },
                    { id: "pink", name: "Hot Pink", color: "bg-pink-500" },
                    { id: "emerald", name: "Emerald", color: "bg-emerald-500" }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded border bg-zinc-950/45 hover:bg-zinc-900/40 text-left transition-all ${
                        selectedTheme === theme.id ? "border-[#00E5FF]/40" : "border-zinc-900"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${theme.color}`} />
                      <span className="text-[11px] text-white font-bold">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Action Panel */}
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-zinc-900 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-550">
              {prefSuccess && <span className="text-emerald-400 font-bold uppercase">Preferences Committed</span>}
            </span>
            <button
              onClick={handleSavePreferences}
              disabled={isUpdating}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/50 text-[#00E5FF] px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isUpdating ? "COMMITTING..." : "SAVE PREFERENCES"}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
