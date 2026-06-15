"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import StarfieldBackground from "@/components/StarfieldBackground";

/* ─── Inline style constants ─────────────────────────────────── */
const sevenStyle: React.CSSProperties = {
  fontFamily: "'Alegreya', Georgia, serif",
  fontWeight: 700,
  letterSpacing: "0.18em",
  background: "linear-gradient(90deg, #e82934, #ff8243, #f8de7c, #ff7678, #9966cc, #4face6, #e82934)",
  backgroundSize: "300% 100%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "sevenGradient 5s linear infinite",
};

const bcoreStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontWeight: 700,
  letterSpacing: "0.22em",
  background: "linear-gradient(120deg, #0a1a5c, #1a3a8c, #2251c5, #1a3a8c, #0a1a5c)",
  backgroundSize: "300% 100%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "bcoreGradient 4s ease infinite",
};

const digitalStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontWeight: 600,
  letterSpacing: "0.22em",
  background: "linear-gradient(120deg, #48b9e8, #87ceeb, #b8e4f7, #87ceeb, #48b9e8)",
  backgroundSize: "300% 100%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "digitalGradient 4s ease infinite 0.5s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 500,
  letterSpacing: "0.18em",
};

/* ─── Animated gradient border wrapper ───────────────────────── */
function GradientBorderCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-[1.5px] rounded-xl">
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: "linear-gradient(90deg, #e82934, #ff8243, #4face6, #9966cc, #e82934)",
          backgroundSize: "300% 100%",
          animation: "borderSpin 6s ease infinite",
          opacity: 0.7,
        }}
      />
      {/* Inner card */}
      <div className="relative bg-[#070710] rounded-xl z-10">
        {children}
      </div>
    </div>
  );
}

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg("Security validation token is missing. Please check your invitation link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) {
      setErrorMsg("Cannot initialize. Token is missing.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to set password");
      }

      setSuccessMsg("Password successfully initialized. Redirecting to terminal login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center p-4 relative overflow-hidden">
      <StarfieldBackground />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none z-0 opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <GradientBorderCard>
          <div className="p-8">

            {/* ── Header ── */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 16 }}
              >
                <Logo className="w-32 h-32 mb-2" animate={true} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <h1 className="text-3xl" style={sevenStyle}>SEVEN</h1>
                <span className="text-[9px] mt-1 tracking-[0.55em] uppercase text-zinc-500 font-mono">
                  INITIALIZATION INTERFACE
                </span>
                <div className="relative flex items-center gap-1.5 mt-1 px-4 py-1">
                  <span className="text-sm" style={bcoreStyle}>B-Core</span>
                  <span className="text-sm" style={digitalStyle}>Digital</span>
                </div>
              </motion.div>
            </div>

            {/* ── Status Messages ── */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-[#ff1744]/10 border border-[#ff1744]/30 rounded-lg flex items-start space-x-3"
                >
                  <ShieldAlert className="w-5 h-5 text-[#ff1744] shrink-0 mt-0.5" />
                  <p className="text-sm font-mono text-[#ff1744]">{errorMsg}</p>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start space-x-3"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-mono text-emerald-400">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs text-zinc-300 uppercase mb-2" style={labelStyle}>
                  NEW SECURITY PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0d0d18] border border-zinc-700/60 rounded-lg pl-10 pr-12 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#4face6] transition-colors placeholder:text-zinc-600"
                    placeholder="Minimum 8 characters"
                    required
                    disabled={isLoading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 uppercase mb-2" style={labelStyle}>
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0d0d18] border border-zinc-700/60 rounded-lg pl-10 pr-12 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#4face6] transition-colors placeholder:text-zinc-600"
                    placeholder="Re-enter your password"
                    required
                    disabled={isLoading || !token}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-3 rounded-lg font-mono text-sm tracking-widest transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(90deg, #e82934, #ff8243, #4face6, #9966cc, #e82934)",
                  backgroundSize: "300% 100%",
                  animation: "borderSpin 6s ease infinite",
                  color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                {isLoading ? "PROVISIONING..." : "INITIALIZE SECURITY KEY"}
              </button>
            </form>

          </div>
        </GradientBorderCard>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030308] flex items-center justify-center text-zinc-500 font-mono text-sm">
        ESTABLISHING SECURE CONNECTION CHANNEL...
      </div>
    }>
      <SetupPasswordForm />
    </Suspense>
  );
}
