import { useSevenStore } from "@/store/useSevenStore";

export function useHasCapability(token: string): boolean {
  const { userProfile, currentUserCapabilities } = useSevenStore();

  if (!userProfile) return false;

  // 1. Check for explicit overrides
  const override = currentUserCapabilities.find(uc => uc.capability.token === token);
  if (override) {
    return override.is_granted;
  }

  // 2. Fallback to Baseline Role Inheritance
  if (userProfile.role_tier === 1) {
    return true; // Master Admin has everything implicitly
  }

  // Example hardcoded baseline matrices for lower tiers
  // In a full production system, this mapping could come from the backend.
  if (token === "dev:override_blocker") {
    // Tiers 1-3 have this by default. Tier 4 does not.
    return userProfile.role_tier <= 3;
  }

  if (token === "admin:manage_users") {
    // Only Tier 1 has this by default.
    return userProfile.role_tier === 1;
  }

  if (token === "strategy:view_matrix") {
    // Tiers 1-2 have this by default.
    return userProfile.role_tier <= 2;
  }

  // If no override and no baseline match, default deny.
  return false;
}
