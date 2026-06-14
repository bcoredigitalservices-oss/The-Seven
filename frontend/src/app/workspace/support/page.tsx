"use client";

import React, { useState, useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { HelpCircle, RefreshCw, Send, CheckCircle2, UserPlus, FileText } from "lucide-react";

export default function SupportPage() {
  const { userProfile, simulatedUser, allUsers, fetchAllUsers } = useSevenStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Assignee selected per request
  const [selectedAssignee, setSelectedAssignee] = useState<{ [key: string]: string }>({});

  const activeUser = simulatedUser || userProfile;

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser 
        ? `http://127.0.0.1:8080/api/v1/support/requests?simulate_user_id=${simulatedUser.user_id}`
        : "http://127.0.0.1:8080/api/v1/support/requests";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchAllUsers();
  }, [simulatedUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();
    setIsRefreshing(false);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser 
        ? `http://127.0.0.1:8080/api/v1/support/requests?simulate_user_id=${simulatedUser.user_id}`
        : "http://127.0.0.1:8080/api/v1/support/requests";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });

      if (res.ok) {
        setSuccessMsg("Support ticket raised successfully.");
        setTitle("");
        setDescription("");
        fetchRequests();
      } else {
        setErrorMsg("Failed to lodge support ticket.");
      }
    } catch (err) {
      setErrorMsg("Network timeout lodging support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (requestId: string) => {
    const assigneeId = selectedAssignee[requestId];
    if (!assigneeId) return;

    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`http://127.0.0.1:8080/api/v1/support/requests/${requestId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_to_id: assigneeId })
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (requestId: string) => {
    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser 
        ? `http://127.0.0.1:8080/api/v1/support/requests/${requestId}/resolve?simulate_user_id=${simulatedUser.user_id}`
        : `http://127.0.0.1:8080/api/v1/support/requests/${requestId}/resolve`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isCEO = activeUser?.role_tier === 1;
  const isClient = activeUser?.user_type === "Client";
  const isEmployee = !isCEO && !isClient;

  // Filter employees for dropdown assignment
  const staffMembers = allUsers.filter((u: any) => u.user_type !== "Client" && u.role_tier !== 1);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">SYSTEM ESCALATIONS</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2.5 text-[#00E5FF]" />
            HELP & SUPPORT HUB
          </h1>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00E5FF]" : ""}`} />
          <span>REFRESH TICKETS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1 flex-1">
        
        {/* Left Column(s): Support logs list */}
        <div className="lg:col-span-2 space-y-4 flex flex-col min-h-[400px]">
          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase">
            {isCEO && "PENDING SUPPORT REQUESTS FOR TRIAGE"}
            {isEmployee && "SUPPORT TICKETS ASSIGNED / FILED"}
            {isClient && "YOUR FILED SUPPORT TICKETS"}
          </h3>

          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {requests.length === 0 ? (
              <div className="p-8 bg-zinc-950/40 border border-zinc-900 rounded-xl text-center text-xs font-mono text-zinc-550">
                No active help & support requests.
              </div>
            ) : (
              requests.map((req: any) => {
                const statusColor = 
                  req.status === "Pending" ? "border-amber-900/30 text-amber-400 bg-amber-950/10" :
                  req.status === "Resolved" ? "border-emerald-900/30 text-emerald-400 bg-emerald-950/10" :
                  "border-cyan-900/30 text-cyan-400 bg-cyan-950/10";

                return (
                  <div key={req.request_id} className="p-4 bg-zinc-950/50 border border-zinc-900 rounded-xl space-y-3 text-xs font-mono">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="font-bold text-white uppercase text-sm block">{req.title}</span>
                        <span className="text-[9px] text-zinc-550">
                          Filed by: {req.creator_name} // {new Date(req.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold ${statusColor}`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-zinc-400 leading-relaxed text-[11px] bg-black/35 p-2.5 rounded border border-zinc-900">
                      {req.description}
                    </p>

                    {/* Meta info & Action section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-zinc-900 gap-3 text-[10px]">
                      <div>
                        {req.assignee_name ? (
                          <span className="text-zinc-500">
                            Assigned to: <strong className="text-cyan-400">{req.assignee_name}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-500 italic">Unassigned ticket</span>
                        )}
                      </div>

                      {/* CEO Triage Controls */}
                      {isCEO && req.status === "Pending" && (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedAssignee[req.request_id] || ""}
                            onChange={(e) => setSelectedAssignee({
                              ...selectedAssignee,
                              [req.request_id]: e.target.value
                            })}
                            className="bg-black border border-zinc-800 rounded px-2 py-1 text-white text-[10px] focus:outline-none"
                          >
                            <option value="">Select Assignee</option>
                            {staffMembers.map((staff: any) => (
                              <option key={staff.user_id} value={staff.user_id}>
                                {staff.full_name} ({staff.department || "Staff"})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(req.request_id)}
                            className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/35 text-[#00E5FF] px-2.5 py-1 rounded transition-colors flex items-center space-x-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        </div>
                      )}

                      {/* Employee Resolve Control */}
                      {isEmployee && req.assigned_to_id === activeUser?.user_id && req.status !== "Resolved" && (
                        <button
                          onClick={() => handleResolve(req.request_id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 px-2.5 py-1 rounded transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket creator form */}
        {!isCEO && (
          <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col h-fit space-y-4">
            <div className="border-b border-zinc-850 pb-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#00E5FF]" />
                <span>FILE SUPPORT TICKET</span>
              </h3>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-550 uppercase">Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SaaS Deployment Node Crashing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00E5FF]/45 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-550 uppercase">Elaborated Scope / Context *</label>
                <textarea
                  required
                  placeholder="Describe the issue or required resource logs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00E5FF]/45 text-[11px] resize-none"
                />
              </div>

              {successMsg && <p className="text-[10px] text-emerald-400 font-bold">{successMsg}</p>}
              {errorMsg && <p className="text-[10px] text-red-500 font-bold">{errorMsg}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/50 text-[#00E5FF] font-bold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "LODGING..." : "LODGE TICKET"}</span>
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
