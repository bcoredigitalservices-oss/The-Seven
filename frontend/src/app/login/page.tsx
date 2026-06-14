"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSevenStore } from "@/store/useSevenStore";
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

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode]     = useState("");
  const [step, setStep]             = useState(1);
  const [errorMsg, setErrorMsg]     = useState("");
  const [isLoading, setIsLoading]   = useState(false);

  const router = useRouter();
  const { setSession, fetchUser, userProfile } = useSevenStore();

  useEffect(() => {
    fetchUser();
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  useEffect(() => {
    if (userProfile) router.push("/workspace");
  }, [userProfile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const payload =
        step === 1
          ? { email, password }
          : { email, password, totp_code: totpCode };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.detail === "TOTP_REQUIRED") { setStep(2); setIsLoading(false); return; }
        throw new Error(data.detail || "Authentication Failed");
      }
      setSession(data.access_token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  /* ── Splash ───────────────────────────────────────────────── */
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#030308] flex flex-col items-center justify-center overflow-hidden z-50">
        <StarfieldBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col items-center z-10"
        >
          {/* Logo first, then text below */}
          <Logo className="w-72 h-72 md:w-[26rem] md:h-[26rem] mb-4" animate={true} />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl md:text-6xl" style={sevenStyle}>SEVEN</span>
            <span
              className="text-xs mt-2 tracking-[0.45em] uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(200,200,220,0.55)", fontWeight: 300 }}
            >
              by
            </span>
            <span className="flex items-center gap-2 text-lg uppercase mt-1">
              <span style={bcoreStyle}>B-Core</span>
              <span style={digitalStyle}>Digital</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Login form ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center p-4 relative overflow-hidden">
      <StarfieldBackground />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none z-0 opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <GradientBorderCard>
          <div className="p-8">

            {/* ── Header ── */}
            <div className="flex flex-col items-center mb-8">

              {/* Logo — enters first with spring bounce */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.05 }}
              >
                <Logo className="w-44 h-44 mb-2" animate={true} />
              </motion.div>

              {/* Text block — delayed so logo appears first */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <h1 className="text-4xl" style={sevenStyle}>SEVEN</h1>
                <span
                  className="text-[10px] mt-2 tracking-[0.55em] uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(200,200,220,0.5)", fontWeight: 300 }}
                >
                  by
                </span>
                {/* B-CORE DIGITAL with glow blob behind it */}
                <div className="relative flex items-center gap-2 mt-1 px-6 py-2">
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{
                      background: "linear-gradient(120deg, rgba(10,26,92,0.6), rgba(72,185,232,0.25))",
                      animation: "bcoreGlow 3s ease-in-out infinite",
                    }}
                  />
                  <span className="relative text-lg" style={bcoreStyle}>B-Core</span>
                  <span className="relative text-lg" style={digitalStyle}>Digital</span>
                </div>
              </motion.div>
            </div>

            {/* ── Error ── */}
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
            </AnimatePresence>

            {/* ── Form ── */}
            <form onSubmit={handleLogin} className="space-y-6">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Email */}
                  <div>
                    <label
                      className="block text-xs text-zinc-300 uppercase mb-2"
                      style={labelStyle}
                    >
                      IDENTIFICATION
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0d0d18] border border-zinc-700/60 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#4face6] transition-colors placeholder:text-zinc-600"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      className="block text-xs text-zinc-300 uppercase mb-2"
                      style={labelStyle}
                    >
                      SECURITY KEY
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0d0d18] border border-zinc-700/60 rounded-lg pl-10 pr-12 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#4face6] transition-colors placeholder:text-zinc-600"
                        placeholder="Enter your password"
                        required
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
                    <label
                      className="block text-xs text-emerald-400 uppercase mb-2"
                      style={labelStyle}
                    >
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
                        className="w-full bg-[#0d0d18] border border-emerald-900/50 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-lg tracking-widest focus:outline-none focus:border-emerald-400 transition-colors"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
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
                {isLoading ? "ESTABLISHING LINK..." : step === 1 ? "INITIALIZE LINK" : "VERIFY CODE"}
              </button>
            </form>

          </div>
        </GradientBorderCard>
      </div>
    </div>
  );
}
