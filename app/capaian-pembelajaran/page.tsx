"use client";

import { useState } from "react";
import Image from "next/image";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

interface AccordionItem {
  id: number;
  title: string;
  description: string;
}

const accordionData: AccordionItem[] = [
  {
    id: 1,
    title: "Capaian 1 (Niti Harti)",
    description:
      "Siswa mampu mengidentifikasi hubungan biotik-abiotik dan dampak perubahan lingkungan.",
  },
  {
    id: 2,
    title: "Capaian 2 (Niti Surti)",
    description:
      "Siswa berhasil merumuskan minimal 3 rencana tindakan solusi lingkungan yang logis.",
  },
  {
    id: 3,
    title: "Capaian 3 (Niti Bukti)",
    description:
      "Siswa berpartisipasi aktif melaksanakan proyek simulasi keseimbangan ekosistem.",
  },
  {
    id: 4,
    title: "Capaian 4 (Niti Bakti & Niti Sajati)",
    description:
      "Siswa menunjukkan 3 indikator kesadaran lingkungan (Kognitif, Emosional, dan Perilaku).",
  },
  {
    id: 5,
    title: "Tujuan Akhir",
    description:
      "Siswa memiliki Keterampilan Abad ke-21 dan Kesadaran Lingkungan.",
  },
];

export default function CapaianPembelajaranPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Default state: all 5 items open as shown in visual reference
  const [openStates, setOpenStates] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const toggleAccordion = (id: number) => {
    setOpenStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-8 relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />

        {/* Header "Capaian Pembelajaran" */}
        <div className="relative w-full h-[140px] rounded-[24px] overflow-hidden p-6 flex items-center shadow-md">
          {/* Background Image */}
          <Image
            src="/gambar 2.png"
            alt="Latar Belakang Capaian Pembelajaran"
            fill
            priority
            unoptimized={true}
            className="object-cover object-center -z-10 contrast-[1.38] brightness-[0.82] saturate-[1.08]"
            style={{ filter: "contrast(1.38) brightness(0.92) saturate(1.08)" }}
          />

          {/* Overlay Warna Hijau */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#636B2F]/75 to-[#525826]/90 -z-10" />

          {/* Teks Judul Header */}
          <h1 className="text-[30px] font-bold leading-[36px] text-[#FBFFF3] tracking-[0%] whitespace-pre-line z-10 mt-7">
            {"Capaian\nPembelajaran"}
          </h1>
        </div>

        {/* List Accordion Cards */}
        <div className="flex flex-col gap-4 w-full">
          {accordionData.map((item) => {
            const isOpen = openStates[item.id];
            return (
              <div
                key={item.id}
                className="w-full bg-[#FBFFF3] rounded-[24px] px-6 py-5 shadow-[0px_2px_2px_0px_#00000040] flex flex-col justify-start transition-all duration-300"
              >
                {/* Header Card (Judul & Toggle Arrow) */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full flex items-start justify-between text-left cursor-pointer focus:outline-none select-none gap-3"
                  aria-expanded={isOpen}
                >
                  <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127] tracking-[0%]">
                    {item.title}
                  </h2>
                  <div className="mt-0.5 shrink-0 flex items-center justify-center">
                    <Image
                      src="/panah-nobg.svg"
                      alt="Toggle Accordion"
                      width={18}
                      height={18}
                      className={`transition-transform duration-300 object-contain ${
                        isOpen ? "-rotate-90" : "rotate-90"
                      }`}
                    />
                  </div>
                </button>

                {/* Content Deskripsi Accordion */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3 pt-2 border-t border-[#3D4127]/10"
                      : "grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0 border-transparent"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[14px] font-[500] leading-[20px] text-[#3D4127] tracking-[0%]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
