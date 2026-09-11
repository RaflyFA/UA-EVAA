"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SiswaGuardProps {
  children: React.ReactNode;
}

export default function SiswaGuard({ children }: SiswaGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (profile && profile.role !== "siswa") {
        router.replace("/guru/manajemen-modul");
      }
    }
  }, [user, profile, loading, router]);

  // Loading state jika auth belum selesai, atau profile masih diambil, atau role bukan siswa (sedang proses redirect)
  if (loading || !user || !profile || profile.role !== "siswa") {
    return (
      <div className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3D4127]">
            Memverifikasi hak akses Siswa...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
