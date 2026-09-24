"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GuruTopbar() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="w-full h-[64px] bg-[#FBFFF3] px-6 py-4 flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040] z-30 sticky top-0">
      {/* Brand / Title */}
      <div className="flex items-center gap-2">
        <span className="text-[20px] font-bold text-[#3D4127] tracking-tight">
          UA-EVAA
        </span>
        <span className="text-[16px] font-medium text-[#3D4127]/50">|</span>
        <span className="text-[14px] font-medium text-[#3D4127]/70">
          Modul IPA Digital
        </span>
      </div>

      {/* Action Icons & User Info */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* User Profile & Logout */}
        <div className="flex items-center gap-2.5 ml-1">
          <div className="flex flex-col text-right">
            <span className="text-[14px] font-semibold text-[#3D4127] leading-tight">
              {profile?.nama_lengkap || "Ibu Guru"}
            </span>
            <span className="text-[11px] text-[#3D4127]/60">
              {profile?.nomor_induk ? `NIP. ${profile.nomor_induk}` : "Guru Pengampu"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar dari akun"
            className="ml-2 px-3 py-1 bg-[#f87171]/15 hover:bg-[#f87171]/25 text-[#b91c1c] text-xs font-semibold rounded-lg border border-[#f87171]/30 transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
