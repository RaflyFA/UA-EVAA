"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  // State untuk melacak dropdown mana yang terbuka
  const [activeDropdown, setActiveDropdown] = useState<"tentang" | "alur" | null>(null);

  // Mencegah scroll pada body saat sidebar terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleDropdown = (menu: "tentang" | "alur") => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-[#3D4127]/25 backdrop-blur-[4px] z-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full max-w-[390px] bg-[#EDF0E8] z-[60] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col px-6 py-10 overflow-y-auto`}
      >
        {/* Header Sidebar */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            onClick={onClose}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "24px",
              color: "#3D4127",
            }}
          >
            UA-EVAA
          </Link>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#D3D8C3] transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3D4127"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menu Buttons List */}
        <div className="flex flex-col gap-3 w-full max-w-[354px] mx-auto">
          {/* Beranda Button */}
          <Link
            href="/"
            onClick={onClose}
            className="w-full h-14 bg-[#FBFFF3] hover:bg-[#D3D8C3] transition-colors duration-200 rounded-[24px] px-6 flex items-center justify-start text-[#3D4127] shadow-[0px_2px_2px_0px_#00000040] select-none"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            Beranda
          </Link>

          {/* Tentang Modul Dropdown Container */}
          <div
            className={`w-full bg-[#FBFFF3] rounded-[24px] shadow-[0px_2px_2px_0px_#00000040] overflow-hidden transition-all duration-300 flex flex-col`}
          >
            <div className="w-full h-14 hover:bg-[#D3D8C3] transition-colors duration-200 px-6 flex items-center justify-between text-[#3D4127] select-none">
              <Link
                href="/about"
                onClick={onClose}
                className="flex-1 h-full flex items-center text-[#3D4127] cursor-pointer"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Tentang Modul
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown("tentang");
                }}
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-[#3D4127]/10 transition-colors cursor-pointer"
                aria-label="Toggle Tentang Modul Dropdown"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3D4127"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-300 ${
                    activeDropdown === "tentang" ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Dropdown Items */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                activeDropdown === "tentang" ? "max-h-60 opacity-100 py-4 px-8" : "max-h-0 opacity-0 py-0 px-8"
              } flex flex-col gap-4 border-t border-[#3D4127]/5`}
            >
              <Link
                href="/tujuan-pembelajaran"
                onClick={onClose}
                className="text-[#3D4127] hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Tujuan Pembelajaran
              </Link>
              <Link
                href="/capaian-pembelajaran"
                onClick={onClose}
                className="text-[#3D4127] hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Capaian Pembelajaran
              </Link>
              <Link
                href="/peta-konsep"
                onClick={onClose}
                className="text-[#3D4127] hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Peta Konsep
              </Link>
            </div>
          </div>

          {/* Alur Modul Dropdown Container & Tugas Button (Hanya tampil jika user sudah login) */}
          {user && (
            <>
              <div
                className={`w-full bg-[#FBFFF3] rounded-[24px] shadow-[0px_2px_2px_0px_#00000040] overflow-hidden transition-all duration-300 flex flex-col`}
              >
                <div className="w-full h-14 hover:bg-[#D3D8C3] transition-colors duration-200 px-6 flex items-center justify-between text-[#3D4127] select-none">
                  <Link
                    href="/alur"
                    onClick={onClose}
                    className="flex-1 h-full flex items-center text-[#3D4127] cursor-pointer"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    Alur Modul
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown("alur");
                    }}
                    className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-[#3D4127]/10 transition-colors cursor-pointer"
                    aria-label="Toggle Alur Modul Dropdown"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3D4127"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-300 ${
                        activeDropdown === "alur" ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Dropdown Items */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeDropdown === "alur" ? "max-h-[320px] opacity-100 py-4 px-8" : "max-h-0 opacity-0 py-0 px-8"
                  } flex flex-col gap-4 border-t border-[#3D4127]/5`}
                >
                  {[
                    { name: "BAB 1: Niti Harti", href: "/niti-harti" },
                    { name: "BAB 2: Niti Surti", href: "/niti-surti" },
                    { name: "BAB 3: Niti Bukti", href: "/niti-bukti" },
                    { name: "BAB 4: Niti Bakti", href: "/niti-bakti" },
                    { name: "BAB 5: Niti Sajati", href: "/niti-sajati" },
                  ].map((bab) => (
                    <Link
                      key={bab.name}
                      href={bab.href}
                      onClick={onClose}
                      className="text-[#3D4127] hover:opacity-70 transition-opacity"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "24px",
                      }}
                    >
                      {bab.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tugas Button */}
              <Link
                href="/niti-bukti"
                onClick={onClose}
                className="w-full h-14 bg-[#FBFFF3] hover:bg-[#D3D8C3] transition-colors duration-200 rounded-[24px] px-6 flex items-center justify-start text-[#3D4127] shadow-[0px_2px_2px_0px_#00000040] select-none"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Tugas (Unggah Aksi)
              </Link>
            </>
          )}

          {/* Dashboard Guru Shortcut (Jika login sebagai Guru) */}
          {profile?.role === "guru" && (
            <Link
              href="/guru/manajemen-modul"
              onClick={onClose}
              className="w-full h-14 bg-[#5B6628] hover:bg-[#4d5722] text-white transition-colors duration-200 rounded-[24px] px-6 flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040] select-none"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              <span>Dashboard Guru</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-md">Guru</span>
            </Link>
          )}

          {/* User Auth Section (Masuk / Profil / Keluar) */}
          <div className="w-full border-t border-[#3D4127]/15 my-2 pt-2 flex flex-col gap-2">
            {profile ? (
              <div className="w-full bg-[#FBFFF3] rounded-[20px] p-4 flex flex-col gap-3 shadow-[0px_2px_2px_0px_#00000030]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-[#3D4127] leading-tight">
                      {profile.nama_lengkap}
                    </span>
                    <span className="text-[12px] font-medium text-[#3D4127]/70">
                      {profile.role === "guru"
                        ? `Guru Pengampu ${profile.nomor_induk ? `(${profile.nomor_induk})` : ""}`
                        : `Siswa ${profile.kelas || ""} ${profile.nomor_induk ? `• NISN: ${profile.nomor_induk}` : ""}`}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-[#5B6628]/15 text-[#5B6628]">
                    {profile.role}
                  </span>
                </div>
                {profile.role === "siswa" && (
                  <Link
                    href="/profil-siswa"
                    onClick={onClose}
                    className="w-full py-2.5 bg-[#5B6628]/10 hover:bg-[#5B6628]/20 text-[#5B6628] text-[13px] font-bold rounded-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Profil & Nilai Siswa</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    onClose();
                    router.push("/login");
                  }}
                  className="w-full py-2 bg-[#f87171]/15 hover:bg-[#f87171]/25 text-[#b91c1c] text-[13px] font-bold rounded-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Keluar Akun
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="w-full h-14 bg-[#5B6628] hover:bg-[#4d5722] text-white transition-colors duration-200 rounded-[24px] px-6 flex items-center justify-center gap-2 shadow-[0px_2px_2px_0px_#00000040] select-none"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Masuk / Daftar Akun
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
