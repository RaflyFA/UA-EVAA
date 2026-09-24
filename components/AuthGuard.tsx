"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Saat masih loading status auth atau jika belum login (sedang proses redirect ke /login)
  if (loading || !user) {
    return (
      <div className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3D4127]">
            Memverifikasi akun...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
