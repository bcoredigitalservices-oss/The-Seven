"use client";

import React, { useState, useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { Landmark, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, ClipboardList, AlertCircle, RefreshCw } from "lucide-react";

export default function FinancePage() {
  const { userProfile, simulatedUser } = useSevenStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Expense");
  const [amount, setAmount] = useState<number>(0);
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const activeUser = simulatedUser || userProfile;

  const fetchFinanceLogs = async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser 
        ? `/api/v1/finance/logs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/finance/logs";
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFinanceLogs();
  }, [simulatedUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFinanceLogs();
    setIsRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      setErrorMsg("Please enter a valid title and positive amount.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("seven_token");
      const url = simulatedUser 
        ? `/api/v1/finance/logs?simulate_user_id=${simulatedUser.user_id}`
        : "/api/v1/finance/logs";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, category, amount, reference })
      });

      if (res.ok) {
        setSuccessMsg("Financial entry logged successfully.");
        setTitle("");
        setAmount(0);
        setReference("");
        fetchFinanceLogs();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Failed to submit finance log.");
      }
    } catch (err) {
      setErrorMsg("Network error connecting to ledger.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const totalInflow = logs
    .filter(l => l.category === "Investment" || l.category === "Inflow")
    .reduce((sum, l) => sum + l.amount, 0);

  const totalOutflow = logs
    .filter(l => l.category !== "Investment" && l.category !== "Inflow")
    .reduce((sum, l) => sum + l.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Investment": return "bg-emerald-950/20 border-emerald-900/30 text-emerald-400";
      case "Salaries": return "bg-amber-950/20 border-amber-900/30 text-amber-400";
      case "Marketing": return "bg-pink-950/20 border-pink-900/30 text-pink-400";
      case "R&D": return "bg-cyan-950/20 border-cyan-900/30 text-cyan-400";
      case "Operations": return "bg-zinc-900 border-zinc-800 text-zinc-400";
      default: return "bg-red-950/20 border-red-900/30 text-red-400";
    }
  };

  const isAuthorizedToLog = activeUser?.role_tier === 1 || 
    (activeUser?.department || "").toLowerCase().includes("corporate") || 
    (activeUser?.department || "").toLowerCase().includes("finance");

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-emerald-400 tracking-[0.2em] uppercase">TREASURY LEDGER</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1 flex items-center">
            <Landmark className="w-6 h-6 mr-2.5 text-emerald-400" />
            FINANCIAL TRACKING DASHBOARD
          </h1>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          <span>REFRESH RUNWAY</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0e0e0e]/95 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-zinc-550 uppercase">TOTAL CAPITAL INVESTED</p>
              <p className="text-lg font-bold text-white font-mono mt-0.5">${totalInflow.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0e0e]/95 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-red-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-zinc-550 uppercase">TOTAL OUTFLOW / OPEX</p>
              <p className="text-lg font-bold text-white font-mono mt-0.5">${totalOutflow.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0e0e]/95 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-zinc-550 uppercase">NET BALANCE RUNWAY</p>
              <p className="text-lg font-bold text-white font-mono mt-0.5">${netBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1">
        
        {/* Logs Table (2/3 width) */}
        <div className="lg:col-span-2 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col min-h-[400px]">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-3 mb-4">
            FINANCIAL TRANSACTION REGISTRY
          </h3>
          <div className="flex-1 overflow-x-auto">
            {logs.length === 0 ? (
              <div className="py-20 text-center text-xs font-mono text-zinc-505">
                No transaction logs registered in the treasury ledger.
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase">
                    <th className="pb-2.5 font-normal">Reference Subject</th>
                    <th className="pb-2.5 font-normal">Category</th>
                    <th className="pb-2.5 font-normal">Details / Reference</th>
                    <th className="pb-2.5 font-normal text-right">Amount</th>
                    <th className="pb-2.5 font-normal text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-350">
                  {logs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3 font-semibold text-white truncate max-w-[150px]">
                        {log.title}
                      </td>
                      <td className="py-3">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 break-words max-w-[200px]">
                        {log.reference || "N/A"}
                      </td>
                      <td className={`py-3 text-right font-bold ${
                        log.category === "Investment" || log.category === "Inflow" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {log.category === "Investment" || log.category === "Inflow" ? "+" : "-"}${log.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-zinc-550 text-[10px]">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Transaction Logger Form (1/3 width) */}
        <div className="lg:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-3 flex items-center space-x-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span>LOG TRANSACTION</span>
          </h3>

          {!isAuthorizedToLog ? (
            <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg text-center text-xs font-mono text-zinc-550 flex flex-col items-center space-y-2">
              <AlertCircle className="w-8 h-8 text-zinc-650" />
              <span>READ-ONLY LEDGER ACCESS</span>
              <p className="text-[10px] text-zinc-600 leading-relaxed pt-1">
                Transaction logging is restricted to Treasury Administrators and Corporate Finance Leads.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-550 uppercase">Item Subject / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production Infrastructure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-550 uppercase">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-[11px]"
                >
                  <option value="Expense">Operational Expense</option>
                  <option value="Investment">Capital Investment</option>
                  <option value="Salaries">Employee Salaries</option>
                  <option value="Marketing">Marketing Campaigns</option>
                  <option value="R&D">Research & Development</option>
                  <option value="Operations">Internal Operations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-550 uppercase">Amount ($USD) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount || ""}
                  placeholder="Amount in USD"
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-550 uppercase">Reference ID / Description</label>
                <textarea
                  placeholder="e.g. Inv-9284 / Q3 server scaling fees"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-[11px] resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-[10px] text-red-500 font-bold">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-[10px] text-emerald-400 font-bold">{successMsg}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/50 text-emerald-400 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{isSubmitting ? "RECORDING..." : "COMMIT ENTRY"}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
