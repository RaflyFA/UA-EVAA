"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GuruSidebar() {
  const pathname = usePathname();
  const [selectedModul, setSelectedModul] = useState("Alur Modul 1");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    {
      name: "Manajemen Modul",
      href: "/guru/manajemen-modul",
      iconActive: "/guru/manajemen modul active.png",
      iconInactive: "/guru/manajemen modul.svg",
    },
    {
      name: "Absensi Siswa",
      href: "/guru/absensi",
      iconActive: "/guru/absensi aktif.svg",
      iconInactive: "/guru/absensi.png",
    },
    {
      name: "Siswa dan Penilaian",
      href: "/guru/siswa",
      iconActive: "/guru/siswa aktif.svg",
      iconInactive: "/guru/siswa.png",
    },
    {
      name: "Project",
      href: "/guru/project",
      iconActive: "/guru/project aktif.svg",
      iconInactive: "/guru/project.png",
    },
  ];

  return (
    <aside className="w-[318px] bg-[#FBFFF3] rounded-[16px] p-[12px] flex flex-col gap-[6px] flex-shrink-0 shadow-[0px_2px_2px_0px_#00000040] sticky top-[76px] self-start">
      {/* Dropdown Alur Modul */}
      <div className="relative w-full mb-2">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full h-[48px] bg-[#EDF0E8] rounded-[12px] px-4 flex items-center justify-between font-semibold text-[#3D4127] text-[14px] hover:bg-[#e4e8dc] transition-colors"
        >
          <span>{selectedModul}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#FBFFF3] border border-[#D3D8C3] rounded-[12px] shadow-lg overflow-hidden z-20">
            {["Alur Modul 1", "Alur Modul 2", "Alur Modul 3"].map((modul) => (
              <div
                key={modul}
                onClick={() => {
                  setSelectedModul(modul);
                  setIsDropdownOpen(false);
                }}
                className="px-4 py-2.5 text-[14px] font-medium text-[#3D4127] hover:bg-[#EDF0E8] cursor-pointer transition-colors"
              >
                {modul}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Menu List */}
      <div className="flex flex-col gap-[6px] w-full">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} className="w-full">
              <div
                className={`w-full h-[48px] px-4 rounded-[12px] flex items-center gap-3 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#5B6628] text-white shadow-sm font-semibold"
                    : "hover:bg-[#EDF0E8] text-[#3D4127] font-medium"
                }`}
              >
                <div className="w-5 h-5 relative flex items-center justify-center flex-shrink-0">
                  <Image
                    src={isActive ? item.iconActive : item.iconInactive}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="text-[14px] leading-tight truncate">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Divider Line */}
        <div className="w-full border-t border-[#EDF0E8] my-2" />

        {/* Pengaturan Menu */}
        <Link href="/guru/pengaturan" className="w-full">
          <div
            className={`w-full h-[48px] px-4 rounded-[12px] flex items-center gap-3 transition-colors cursor-pointer ${
              pathname === "/guru/pengaturan"
                ? "bg-[#5B6628] text-white shadow-sm font-semibold"
                : "hover:bg-[#EDF0E8] text-[#3D4127] font-medium"
            }`}
          >
            <div className="w-5 h-5 relative flex items-center justify-center flex-shrink-0">
              <Image
                src="/guru/pengaturan.png"
                alt="Pengaturan"
                width={20}
                height={20}
                className={`object-contain ${
                  pathname === "/guru/pengaturan" ? "filter brightness-0 invert" : ""
                }`}
              />
            </div>
            <span className="text-[14px] leading-tight truncate">
              Pengaturan
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
