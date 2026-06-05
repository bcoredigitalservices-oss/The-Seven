"use client";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import DeveloperDashboard from "@/components/DeveloperDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default function DashboardPage() {
  const { user } = useWorkspaceStore();

  if (!user) return null;

  // Role-based dashboards
  // Admin and Architect see the global console and blocker alerts
  // Developer sees only their assigned sprint board
  if (user.role === "Admin" || user.role === "Architect") {
    return <AdminDashboard />;
  }

  return <DeveloperDashboard />;
}
