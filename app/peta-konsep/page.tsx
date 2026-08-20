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
    title: "1. Lingkungan",
    description:
      "Mempelajari pengertian lingkungan, komponen biotik (makhluk hidup) dan abiotik (benda tak hidup) yang saling mempengaruhi.",
  },
  {
    id: 2,
    title: "2. Interaksi Dalam Ekosistem",
    description:
      "Memahami pola-pola interaksi seperti simbiosis, predasi, kompetisi, rantai makanan, dan jaring-jaring makanan dalam ekosistem.",
  },
  {
    id: 3,
    title: "3. Perubahan Lingkungan",
    description:
      "Menganalisis faktor pencemaran dan perubahan lingkungan baik secara alami maupun akibat aktivitas manusia.",
  },
  {
    id: 4,
    title: "4. Dampak Terhadap Organisme",
    description:
      "Memahami efek pencemaran dan kerusakan lingkungan terhadap kelangsungan hidup organisme dan keanekaragaman hayati.",
  },
  {
    id: 5,
    title: "5. Upaya Pelestarian Lingkungan",
    description:
      "Mengaplikasikan tindakan nyata dan nilai kearifan lokal (Pancaniti) dalam menjaga keseimbangan ekosistem dan pelestarian alam.",
  },
];

export default function PetaKonsepPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Default state: all items closed as shown in visual reference
  const [openStates, setOpenStates] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
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

        {/* Header "Peta Konsep" */}
        <div className="relative w-full h-[160px] rounded-[24px] overflow-hidden p-6 flex flex-col justify-end shadow-md">
          {/* Background Image */}
          <Image
            src="/gambar 3.png"
            alt="Latar Belakang Peta Konsep"
            fill
            priority
            unoptimized={true}
            className="object-cover object-top -z-10 contrast-[1.38] brightness-[0.82] saturate-[1.08] scale-[1.25] origin-top"
            style={{ filter: "contrast(1.38) brightness(0.92) saturate(1.08)" }}
          />

          {/* Overlay Warna Hijau */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#636B2F]/75 to-[#525826]/90 -z-10" />

          {/* Overlay Blur (backdrop-filter: blur(12px) dari bawah ke atas sampai bagian tengah) */}
          <div
            className="absolute inset-0 backdrop-blur-[12px] pointer-events-none -z-10"
            style={{
              WebkitMaskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%)",
              maskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%)",
            }}
          />

          {/* Teks Judul Header & Subtitle + Panah Icon */}
          <div className="flex flex-col gap-1 z-10 w-full">
            <div className="flex items-start justify-between w-full">
              <h1 className="text-[30px] font-bold leading-[34px] text-[#FBFFF3] tracking-[0%]">
                Peta Konsep
              </h1>
              <div className="relative top-[4px] left-[5.72px] shrink-0">
                <Image
                  src="/panah besar.svg"
                  alt="Panah Peta Konsep"
                  width={22.28}
                  height={22.28}
                  className="object-contain"
                  style={{
                    width: "22.27614402770996px",
                    height: "22.27614402770996px",
                    transform: "rotate(0deg)",
                    opacity: 1,
                  }}
                />
              </div>
            </div>
            <p className="text-[14px] font-[400] leading-[18px] text-[#FBFFF3]/90 tracking-[0%]">
              Pengaruh Lingkungan Terhadap Organisme
            </p>
          </div>
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
