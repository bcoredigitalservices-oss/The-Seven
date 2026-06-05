"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Terminal, Lock, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSevenStore } from "@/store/useSevenStore";

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState(1); // 1: Password, 2: TOTP
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { setSession, fetchUser, userProfile } = useSevenStore();

  useEffect(() => {
    fetchUser();
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  useEffect(() => {
    if (userProfile) {
      router.push("/workspace");
    }
  }, [userProfile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload = step === 1 
        ? { email, password } 
        : { email, password, totp_code: totpCode };

      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.detail === "TOTP_REQUIRED") {
          setStep(2);
          setIsLoading(false);
          return;
        }
        throw new Error(data.detail || "Authentication Failed");
      }

      setSession(data.access_token, data.user);
      // Let the useEffect handle routing to /workspace
      
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#00E5FF] to-transparent leading-none select-none tracking-tighter">
            7
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-4 text-[#00E5FF] tracking-[0.5em] font-mono text-xl"
        >
          SEVEN
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50" />
          
          <div className="flex items-center space-x-3 mb-8">
            <Terminal className="w-6 h-6 text-[#00E5FF]" />
            <h1 className="text-xl font-bold tracking-[0.2em] text-white">WORKSPACE LINK</h1>
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-[#ff1744]/10 border border-[#ff1744]/30 rounded flex items-start space-x-3"
              >
                <ShieldAlert className="w-5 h-5 text-[#ff1744] shrink-0 mt-0.5" />
                <p className="text-sm font-mono text-[#ff1744]">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                    IDENTIFICATION
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111111] border border-zinc-800 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                      placeholder="admin@bcore.digital"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                    SECURITY KEY
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#111111] border border-zinc-800 rounded pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-2">
                    2FA REQUIRED (TOTP)
                  </label>
                  <p className="text-xs font-mono text-zinc-400 mb-4">
                    Enter the 6-digit code from your Authenticator app.
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                      type="text"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      className="w-full bg-[#111111] border border-emerald-900/50 rounded pl-10 pr-4 py-3 text-white font-mono text-lg tracking-widest focus:outline-none focus:border-emerald-400 transition-colors"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-mono text-sm py-3 rounded transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "ESTABLISHING LINK..." : step === 1 ? "INITIALIZE LINK" : "VERIFY CODE"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
