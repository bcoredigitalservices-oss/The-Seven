"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function BlockerBeacon({ taskId }: { taskId: string }) {
  const [isActivating, setIsActivating] = useState(false);

  const activateBeacon = async () => {
    setIsActivating(true);
    try {
      const token = localStorage.getItem("seven_token");
      await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Blocked" })
      });
      // The backend broadcasts the event, which updates UI globally.
    } catch (error) {
      console.error(error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <button
      onClick={activateBeacon}
      disabled={isActivating}
      className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#ff1744]/10 border border-[#ff1744]/30 hover:bg-[#ff1744] hover:text-white text-[#ff1744] font-mono text-xs rounded transition-all w-full mt-4"
    >
      <ShieldAlert className="w-4 h-4" />
      <span>{isActivating ? "BROADCASTING..." : "INITIATE BLOCKER BEACON"}</span>
    </button>
  );
}
