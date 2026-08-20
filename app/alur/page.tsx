"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function AlurModulPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sistem progresi: BAB 1 terbuka, yang lain terkunci.
  const [activeBab, setActiveBab] = useState(1);

  const babs = [
    { id: 1, title: "BAB 1: Niti Harti" },
    { id: 2, title: "BAB 2: Niti Surti" },
    { id: 3, title: "BAB 3: Niti Bukti" },
    { id: 4, title: "BAB 4: Niti Bakti" },
    { id: 5, title: "BAB 5: Niti Sajati" },
  ];

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-between px-6 pt-4 pb-8 relative overflow-x-hidden font-sans">
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Judul Halaman */}
        <div className="w-full">
          <h1 className="text-[28px] font-bold leading-[38px] text-[#3D4127]">
            Alur Modul 1
          </h1>
        </div>

        {/* Struktur Alur Modul */}
        <div className="w-full flex flex-col items-center pb-24">
          {babs.map((bab, index) => {
            const isActive = bab.id === activeBab;
            const isCompleted = bab.id < activeBab;
            const isLocked = bab.id > activeBab;

            return (
              <div key={bab.id} className="w-full flex flex-col items-center">
                {/* Card BAB */}
                {isActive || isCompleted ? (
                  <div className="w-full h-[56px] rounded-[120px] border-[2px] border-[#9CA08D] bg-[#FBFFF3] flex items-center justify-between px-6 py-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icon-bab-nyala.svg"
                        alt="Icon BAB Aktif"
                        width={24}
                        height={24}
                      />
                      <span className="text-[#3D4127] text-[16px] font-semibold leading-[24px]">
                        {bab.title}
                      </span>
                    </div>
                    <Image
                      src="/panah-nobg.svg"
                      alt="Arrow Right"
                      width={20}
                      height={20}
                    />
                  </div>
                ) : (
                  <div className="w-full h-[56px] rounded-[120px] bg-[#3D41271A] flex items-center px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icon-gembok.svg"
                        alt="Icon Gembok"
                        width={24}
                        height={24}
                      />
                      <span className="text-[#9CA08D] text-[16px] font-semibold leading-[24px]">
                        {bab.title}
                      </span>
                    </div>
                  </div>
                )}

                {/* Panah Antar BAB */}
                {index < babs.length - 1 && (
                  <div className="my-2 flex justify-center">
                    <Image
                      src="/panah kebawah.svg"
                      alt="Panah Bawah"
                      width={24}
                      height={24}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tombol Mulai Niti Harti (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          <Link href="/niti-harti" className="block w-full">
            <button className="w-full h-[56px] bg-[#636B2F] rounded-[120px] flex items-center justify-center gap-2 hover:bg-[#525826] transition-colors shadow-lg focus:outline-none">
              <span className="text-[#FBFFF3] text-[16px] font-semibold leading-[24px]">
                Mulai Niti Harti
              </span>
              <Image
                src="/panah-button-terang.svg"
                alt="Panah"
                width={20}
                height={20}
              />
            </button>
          </Link>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
