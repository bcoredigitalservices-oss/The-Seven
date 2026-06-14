"use client";

import { useEffect, useState } from "react";
import { useSevenStore, UserProfile } from "@/store/useSevenStore";
import { ShieldAlert, UserPlus, Check, X, Minus, MailCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsersPortal() {
  const { allUsers, capabilities, fetchAllUsers, fetchCapabilities, userProfile, resendInvite } = useSevenStore();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userCaps, setUserCaps] = useState<any[]>([]);
  const [loadingCaps, setLoadingCaps] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ userId: string; state: "loading" | "success" | "error"; msg?: string } | null>(null);

  // New User Form State
  const [showNewUser, setShowNewUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newTier, setNewTier] = useState(4);
  const [newDept, setNewDept] = useState("development");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchAllUsers();
    fetchCapabilities();
  }, [fetchAllUsers, fetchCapabilities]);

  const loadUserCapabilities = async (userId: string) => {
    setLoadingCaps(true);
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch(`/api/users/${userId}/capabilities`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setUserCaps(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingCaps(false);
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    loadUserCapabilities(user.user_id);
    setShowNewUser(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          email: newEmail,
          full_name: newName,
          password: newPassword,
          role_tier: newTier,
          department_id: newDept,
          current_status: "Active"
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to create user");
      }
      await fetchAllUsers();
      setShowNewUser(false);
      setNewEmail(""); setNewName(""); setNewPassword("");
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const toggleCapability = async (capabilityId: string, currentState: string | null) => {
    if (!selectedUser) return;
    const token = localStorage.getItem("seven_token");
    
    // Cycle: Inherited -> Granted -> Denied -> Inherited
    try {
      if (currentState === null) {
        // Inherited -> Granted
        await fetch(`/api/users/${selectedUser.user_id}/capabilities/${capabilityId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ is_granted: true })
        });
      } else if (currentState === "granted") {
        // Granted -> Denied
        await fetch(`/api/users/${selectedUser.user_id}/capabilities/${capabilityId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ is_granted: false })
        });
      } else {
        // Denied -> Inherited (Delete override)
        await fetch(`/api/users/${selectedUser.user_id}/capabilities/${capabilityId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
      
      // Refresh user caps
      loadUserCapabilities(selectedUser.user_id);
    } catch (e) {
      console.error(e);
    }
  };

  if (userProfile?.role_tier !== 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <ShieldAlert className="w-12 h-12 text-[#ff1744] mb-4" />
        <h2 className="text-xl font-mono text-zinc-200">RESTRICTED ZONE</h2>
        <p className="text-sm mt-2">Only Master Admins can access this portal.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="border-b border-zinc-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#ff1744] tracking-widest font-mono uppercase flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3" />
            Admin // Capabilities & Roster
          </h2>
          <p className="text-sm text-zinc-500 font-mono mt-1">CAPABILITY OVERRIDES AND USER PROVISIONING</p>
        </div>
        <button 
          onClick={() => { setShowNewUser(true); setSelectedUser(null); }}
          className="bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 px-4 py-2 font-mono text-sm hover:bg-[#00E5FF] hover:text-black transition-colors rounded flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          PROVISION USER
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* User Roster */}
        <div className="lg:col-span-1 bg-[#111111] border border-zinc-800 rounded flex flex-col overflow-hidden">
          <div className="bg-black/50 p-3 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            System Roster
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-zinc-800/50">
              {allUsers.map(u => (
                <li 
                  key={u.user_id} 
                  onClick={() => handleSelectUser(u)}
                  className={`p-4 cursor-pointer hover:bg-[#1a1a24] transition-colors ${selectedUser?.user_id === u.user_id ? 'bg-[#1a1a24] border-l-2 border-[#00E5FF]' : 'border-l-2 border-transparent'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{u.full_name}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">{u.email}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">T{u.role_tier}</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-zinc-600 uppercase">
                    DEPT: {u.department_id || 'N/A'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dynamic Action Panel */}
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800 rounded flex flex-col overflow-hidden relative">
          
          {showNewUser ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-6">
              <h3 className="text-[#00E5FF] font-mono text-lg mb-6 border-b border-zinc-800 pb-2">PROVISION NEW AGENT</h3>
              {formError && <div className="text-[#ff1744] text-xs font-mono mb-4 bg-[#ff1744]/10 p-2 border border-[#ff1744]/30">{formError}</div>}
              
              <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-mono mb-1">FULL NAME</label>
                  <input type="text" value={newName} onChange={e=>setNewName(e.target.value)} required className="w-full bg-black border border-zinc-800 p-2 text-sm text-zinc-200 focus:border-[#00E5FF] outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-mono mb-1">EMAIL</label>
                  <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required className="w-full bg-black border border-zinc-800 p-2 text-sm text-zinc-200 focus:border-[#00E5FF] outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-mono mb-1">TEMPORARY PASSWORD</label>
                  <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 p-2 text-sm text-zinc-200 focus:border-[#00E5FF] outline-none font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono mb-1">ROLE TIER (1-4)</label>
                    <input type="number" min="1" max="4" value={newTier} onChange={e=>setNewTier(parseInt(e.target.value))} className="w-full bg-black border border-zinc-800 p-2 text-sm text-zinc-200 focus:border-[#00E5FF] outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono mb-1">DEPARTMENT</label>
                    <input type="text" value={newDept} onChange={e=>setNewDept(e.target.value)} className="w-full bg-black border border-zinc-800 p-2 text-sm text-zinc-200 focus:border-[#00E5FF] outline-none font-mono" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 p-2 mt-4 font-mono text-sm hover:bg-[#00E5FF] hover:text-black transition-colors">
                  EXECUTE PROVISIONING
                </button>
              </form>
            </motion.div>
          ) : selectedUser ? (
            <div className="flex flex-col h-full">
              <div className="bg-black/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <h3 className="text-zinc-200 font-mono font-bold">{selectedUser.full_name} // OVERRIDES</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">{selectedUser.email}</p>
                </div>
                <button
                  onClick={async () => {
                    setResendStatus({ userId: selectedUser.user_id, state: "loading" });
                    const result = await resendInvite(selectedUser.user_id);
                    setResendStatus({
                      userId: selectedUser.user_id,
                      state: result.success ? "success" : "error",
                      msg: result.success ? result.message : result.error,
                    });
                    setTimeout(() => setResendStatus(null), 5000);
                  }}
                  disabled={resendStatus?.userId === selectedUser.user_id && resendStatus?.state === "loading"}
                  className="flex items-center space-x-2 text-[10px] font-mono px-3 py-1.5 rounded border transition-all
                    bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendStatus?.userId === selectedUser.user_id && resendStatus?.state === "loading" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <MailCheck className="w-3 h-3" />
                  )}
                  <span>RESEND INVITE</span>
                </button>
              </div>
              {resendStatus?.userId === selectedUser.user_id && resendStatus.state !== "loading" && (
                <div className={`px-4 py-2 text-[10px] font-mono border-b ${
                  resendStatus.state === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[#ff1744]/10 border-[#ff1744]/30 text-[#ff1744]"
                }`}>
                  {resendStatus.state === "success" ? "✓" : "✗"} {resendStatus.msg}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Group by category if we wanted, but we will just list all capabilities for now */}
                <div>
                  <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">Master Capability Matrix</h4>
                  {loadingCaps ? (
                    <p className="text-zinc-500 font-mono text-sm animate-pulse">Syncing overrides...</p>
                  ) : (
                    <div className="space-y-4">
                      {capabilities.map(cap => {
                        const override = userCaps.find(uc => uc.capability.capability_id === cap.capability_id);
                        let state = null; // Inherited
                        if (override) {
                          state = override.is_granted ? "granted" : "denied";
                        }
                        
                        return (
                          <div key={cap.capability_id} className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded">
                            <div>
                              <p className="text-sm text-zinc-200 font-mono font-bold">{cap.token}</p>
                              <p className="text-xs text-zinc-500 mt-1">{cap.description}</p>
                            </div>
                            <button 
                              onClick={() => toggleCapability(cap.capability_id, state)}
                              className={`flex items-center justify-center w-32 py-1.5 px-3 rounded text-[10px] font-mono border transition-all ${
                                state === 'granted' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                state === 'denied' ? 'bg-[#ff1744]/10 border-[#ff1744]/30 text-[#ff1744]' :
                                'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                              }`}
                            >
                              {state === 'granted' && <Check className="w-3 h-3 mr-2" />}
                              {state === 'denied' && <X className="w-3 h-3 mr-2" />}
                              {state === null && <Minus className="w-3 h-3 mr-2" />}
                              {state === 'granted' ? 'GRANTED' : state === 'denied' ? 'DENIED' : 'INHERITED'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono text-sm flex-col">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
              SELECT A USER OR PROVISION A NEW AGENT
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
