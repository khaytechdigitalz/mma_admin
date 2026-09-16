"use client";

import { useAuth } from "@/context/AuthContext";

interface CanProps {
  /** A single permission slug, e.g. "products.delete". */
  permission?: string;
  /** Alternative: pass several slugs; visible if the user has ANY of them. */
  anyOf?: string[];
  /** Alternative: pass several slugs; visible only if the user has ALL of them. */
  allOf?: string[];
  children: React.ReactNode;
  /** Optional fallback to render instead of nothing (e.g. a disabled button). */
  fallback?: React.ReactNode;
}

/**
 * Gates a button/action by permission. This only hides UI - it is not a
 * substitute for the backend checking the same permission on the actual
 * API call. Use it around Add/Edit/Delete/Approve-style buttons:
 *
 *   <Can permission="customers.delete">
 *     <button onClick={...}><Trash2 /></button>
 *   </Can>
 */
export function Can({ permission, anyOf, allOf, children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = useAuth();

  // While the user's permissions are still loading, don't flash the
  // action and then yank it away - just don't render it yet.
  if (loading) return null;

  let allowed = true;
  if (permission) allowed = hasPermission(permission);
  else if (anyOf) allowed = hasAnyPermission(anyOf);
  else if (allOf) allowed = hasAllPermissions(allOf);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
