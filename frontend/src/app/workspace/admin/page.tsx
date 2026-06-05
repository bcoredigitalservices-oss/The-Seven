"use client";

import { useEffect, useState } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { ShieldAlert, Users, UserPlus, CheckCircle2 } from "lucide-react";
import { UserProfile } from "@/store/useSevenStore";

export default function MasterAdminDashboard() {
  const { userProfile } = useSevenStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  const [newFullname, setNewFullname] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleTier, setNewRoleTier] = useState(4);
  const [newDept, setNewDept] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("http://127.0.0.1:8000/api/auth/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("http://127.0.0.1:8000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: newFullname,
          email: newEmail,
          password: newPassword,
          role_tier: newRoleTier,
          department_id: newDept.toUpperCase(),
          current_status: "Active"
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create user");
      }

      setStatusMsg(`User ${newEmail} created successfully.`);
      setNewFullname("");
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (userProfile?.role_tier !== 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ShieldAlert className="w-12 h-12 text-[#ff1744] mb-4" />
        <h2 className="text-xl font-mono text-zinc-200">UNAUTHORIZED CLEARANCE</h2>
        <p className="text-zinc-500 text-sm mt-2">Only Tier 1 Executive Admins may access this sector.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-[#ff1744] tracking-widest font-mono uppercase flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2" />
          Master Admin Terminal
        </h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">USER PROVISIONING & CLEARANCE MANAGEMENT</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Create User Form */}
        <div className="lg:col-span-1 bg-[#111111] border border-zinc-800 rounded-lg p-6 h-fit">
          <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2 mb-4 flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Provision New User
          </h3>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-[#ff1744]/10 border border-[#ff1744]/30 rounded text-[#ff1744] text-xs font-mono break-words">
              {errorMsg}
            </div>
          )}
          {statusMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-mono flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Full Name</label>
              <input type="text" required value={newFullname} onChange={e => setNewFullname(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Email</label>
              <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Initial Password</label>
              <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Role Tier</label>
                <select value={newRoleTier} onChange={e => setNewRoleTier(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none">
                  <option value={1}>1 (Exec)</option>
                  <option value={2}>2 (Dir)</option>
                  <option value={3}>3 (Lead)</option>
                  <option value={4}>4 (Execut)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Department</label>
                <input type="text" placeholder="e.g. QA, DEV" required value={newDept} onChange={e => setNewDept(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none uppercase" />
              </div>
            </div>
            <button type="submit" className="w-full mt-4 bg-[#ff1744]/10 border border-[#ff1744]/30 text-[#ff1744] hover:bg-[#ff1744] hover:text-white font-mono text-sm py-2 rounded transition-colors">
              EXECUTE PROVISION
            </button>
          </form>
        </div>

        {/* User Directory */}
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800 rounded-lg p-6 overflow-hidden flex flex-col min-h-[400px]">
          <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Active Personnel Roster
          </h3>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-zinc-500 sticky top-0 bg-[#111111] shadow-[0_4px_10px_#111111]">
                <tr>
                  <th className="pb-3 font-normal uppercase tracking-widest">Email</th>
                  <th className="pb-3 font-normal uppercase tracking-widest">Clearance</th>
                  <th className="pb-3 font-normal uppercase tracking-widest">Dept</th>
                  <th className="pb-3 font-normal uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map(user => (
                  <tr key={user.user_id} className="hover:bg-black/30 transition-colors">
                    <td className="py-3 text-zinc-300">{user.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${user.role_tier === 1 ? 'bg-[#ff1744]/20 text-[#ff1744]' : 'bg-[#00E5FF]/10 text-[#00E5FF]'}`}>
                        TIER {user.role_tier}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400">{user.department_id}</td>
                    <td className="py-3 text-right">
                      <span className="text-emerald-400">{user.current_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
