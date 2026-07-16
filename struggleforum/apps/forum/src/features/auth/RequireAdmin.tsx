"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/src/features/auth/AuthProvider";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
