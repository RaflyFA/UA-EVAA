"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        className={`fixed inset-0 bg-[#3D4127]/25 backdrop-blur-[4px] z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full max-w-[390px] bg-[#EDF0E8] z-50 shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col px-6 py-10 overflow-y-auto`}
      >
        {/* Header Sidebar */}
        <div className="flex justify-between items-center mb-8">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "24px",
              color: "#3D4127",
            }}
          >
            UA-EVAA
          </span>
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

          {/* Alur Modul Dropdown Container */}
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
              {["BAB 1: Niti Harti", "BAB 2: Niti Surti", "BAB 3: Niti Bukti", "BAB 4: Niti Bakti", "BAB 5: Niti Sajati"].map(
                (bab) => (
                  <Link
                    key={bab}
                    href="#"
                    className="text-[#3D4127] hover:opacity-70 transition-opacity"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    {bab}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Tugas Button */}
          <Link
            href="#"
            className="w-full h-14 bg-[#FBFFF3] hover:bg-[#D3D8C3] transition-colors duration-200 rounded-[24px] px-6 flex items-center justify-start text-[#3D4127] shadow-[0px_2px_2px_0px_#00000040] select-none"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            Tugas
          </Link>

          {/* Profil & Pengaturan Button */}
          <Link
            href="#"
            className="w-full h-14 bg-[#FBFFF3] hover:bg-[#D3D8C3] transition-colors duration-200 rounded-[24px] px-6 flex items-center justify-start text-[#3D4127] shadow-[0px_2px_2px_0px_#00000040] select-none"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            Profil & Pengaturan
          </Link>
        </div>
      </aside>
    </>
  );
}
