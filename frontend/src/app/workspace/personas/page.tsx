"use client";

import React, { useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { UserCheck, ShieldAlert, Cpu, Paintbrush, Briefcase, Megaphone, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PersonasPage() {
  const { userProfile, allUsers, fetchAllUsers, setSimulatedUser } = useSevenStore();
  const router = useRouter();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  if (userProfile?.role_tier !== 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <ShieldAlert className="w-12 h-12 text-[#ff1744] mb-4" />
        <h2 className="text-xl font-mono text-zinc-200 uppercase">ACCESS RESTRICTED</h2>
        <p className="text-zinc-550 text-xs mt-2 max-w-md font-mono">
          THE USER PERSONA MATRIX CONSOLE IS STRICTLY RESTRICTED TO TIER 1 EXECUTIVE ADMINISTRATORS (CEO).
        </p>
      </div>
    );
  }

  const handleSimulateRole = (roleId: string) => {
    let targetUser = null;
    if (roleId === "it") {
      targetUser = allUsers.find(u => u.email === "test.dev1@seven.com");
    } else if (roleId === "creative") {
      targetUser = allUsers.find(u => u.email === "test.dev2@seven.com");
    } else if (roleId === "corporate") {
      targetUser = allUsers.find(u => u.email === "test.hr@seven.com");
    } else if (roleId === "marketing") {
      targetUser = allUsers.find(u => u.email === "test.marketer@seven.com");
    } else if (roleId === "client") {
      targetUser = allUsers.find(u => u.email === "test.client@client.com");
    }

    if (targetUser) {
      setSimulatedUser(targetUser);
      router.push("/workspace");
    } else {
      // Fallback: If seed users are not found, simulate using generic fields
      const fallbackUser = allUsers.find(u => {
        const dept = (u.department || "").toLowerCase();
        if (roleId === "it") return dept.includes("dev") || dept.includes("tech") || dept.includes("saas");
        if (roleId === "creative") return dept.includes("creative") || dept.includes("design");
        if (roleId === "corporate") return dept.includes("corporate") || dept.includes("hr") || dept.includes("sales");
        if (roleId === "marketing") return dept.includes("marketing") || dept.includes("promo") || dept.includes("agency");
        if (roleId === "client") return u.user_type === "Client";
        return false;
      });
      if (fallbackUser) {
        setSimulatedUser(fallbackUser);
        router.push("/workspace");
      }
    }
  };

  const handleSimulateUser = (user: any) => {
    setSimulatedUser(user);
    router.push("/workspace");
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "it": return <Cpu className="w-4 h-4 text-cyan-400" />;
      case "creative": return <Paintbrush className="w-4 h-4 text-pink-400" />;
      case "corporate": return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "marketing": return <Megaphone className="w-4 h-4 text-[#ff1744]" />;
      case "client": return <User className="w-4 h-4 text-amber-400" />;
      default: return <User className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#ff1744] tracking-[0.2em] uppercase">AUDIT MATRIX</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1 flex items-center">
            <UserCheck className="w-6 h-6 mr-2.5 text-[#ff1744]" />
            USER PERSONA SIMULATOR
          </h1>
        </div>
      </div>

      {/* Roster & Quick simulation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1">
        
        {/* Left Columns: Simulation templates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5">
              SELECT GENERIC ROLE SIMULATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "it", name: "IT Developer Dashboard", desc: "Technical task backlogs, system status checks, and hours logs.", color: "border-cyan-900/30 text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-950/10" },
                { id: "creative", name: "Creative Brand Studio", desc: "Asset guidelines, HSL color variables, and creative deliveries.", color: "border-pink-900/30 text-pink-400 hover:border-pink-500/30 hover:bg-pink-950/10" },
                { id: "corporate", name: "Corporate CRM Console", desc: "Leads kanban triage, proposal PDF generators, and call log registries.", color: "border-emerald-900/30 text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/10" },
                { id: "marketing", name: "Marketing Promotion Hub", desc: "Promotions, campaign reach lists, conversion metrics, and surveys.", color: "border-red-900/30 text-[#ff1744] hover:border-red-500/30 hover:bg-red-950/10" },
                { id: "client", name: "Client transparency Portal", desc: "Milestones lists, downloads, and E2E secured client chat room.", color: "border-amber-900/30 text-amber-400 hover:border-amber-500/30 hover:bg-amber-950/10" },
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => handleSimulateRole(role.id)}
                  className={`w-full text-left p-4 rounded-xl border bg-zinc-950/40 transition-all font-mono space-y-2 ${role.color}`}
                >
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(role.id)}
                    <span className="font-bold text-xs text-white">{role.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: User Roster list */}
        <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5">
            USER ROSTER LIST
          </h3>
          <div className="space-y-2.5 overflow-y-auto max-h-[450px] custom-scrollbar pr-1 flex-1">
            {allUsers.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-zinc-650">No users found.</div>
            ) : (
              allUsers.map((user: any) => (
                <button
                  key={user.user_id}
                  onClick={() => handleSimulateUser(user)}
                  className="w-full text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-900 hover:border-zinc-800 transition-all font-mono flex items-start space-x-3 text-xs"
                >
                  <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-white truncate">{user.full_name}</p>
                    <p className="text-[9px] text-zinc-550 truncate">{user.email}</p>
                    <div className="flex items-center space-x-2 text-[8px] uppercase">
                      <span className="text-zinc-500">DEPT: {user.department || "N/A"}</span>
                      <span className="text-[#00E5FF]">TYPE: {user.user_type}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
