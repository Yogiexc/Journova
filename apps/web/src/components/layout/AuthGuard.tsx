"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (requiredRole && !hasRole(requiredRole)) {
        router.push("/dashboard/author");
      }
    }
  }, [user, isLoading, hasRole, requiredRole, router]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  if (!user || (requiredRole && !hasRole(requiredRole))) {
    return null;
  }

  return <>{children}</>;
}
