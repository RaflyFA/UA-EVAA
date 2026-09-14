"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface GuruGuardProps {
  children: React.ReactNode;
}

export default function GuruGuard({ children }: GuruGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // Peran aktif dengan prioritas data profile, fallback ke user_metadata
  const effectiveRole = profile?.role || (user?.user_metadata?.role as "guru" | "siswa" | undefined);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (effectiveRole && effectiveRole !== "guru") {
        router.replace("/");
      }
    }
  }, [user, effectiveRole, loading, router]);

  // Timeout guard: jika dalam 5 detik setelah loading selesai role tetap tidak valid, redirect ke login
  useEffect(() => {
    if (!loading && user && !effectiveRole) {
      const timer = setTimeout(() => {
        setTimedOut(true);
        router.replace("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, effectiveRole, router]);

  // Loading state jika auth belum selesai, atau profile masih diambil, atau role bukan guru (sedang proses redirect)
  if (loading || !user || !effectiveRole || effectiveRole !== "guru" || timedOut) {
    return (
      <div className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3D4127]">
            Memverifikasi hak akses Guru...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
