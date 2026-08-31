"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

interface BahanBacaanItem {
  id: number;
  title: string;
  description: string;
}

const bahanBacaanData: BahanBacaanItem[] = [
  {
    id: 1,
    title: "Bahan Bacaan 1",
    description:
      "Pengenalan konsep dasar ekosistem, komponen biotik dan abiotik, serta interaksi antar makhluk hidup dalam lingkungan alam.",
  },
  {
    id: 2,
    title: "Bahan Bacaan 2",
    description:
      "Studi mengenai kearifan lokal masyarakat adat dalam pelestarian alam dan menjaga keseimbangan ekosistem secara berkelanjutan.",
  },
  {
    id: 3,
    title: "Bahan Bacaan 3",
    description:
      "Prinsip-prinsip Niti Harti dalam memahami ilmu pengetahuan dan penerapan teoritis pada kehidupan sehari-hari.",
  },
];

export default function NitiHartiPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openStates, setOpenStates] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const toggleAccordion = (id: number) => {
    setOpenStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-32 relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Header Niti Harti - Lapisan 1: Dasaran Persegi Panjang Warna #EDF0E8 */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          {/* Lapisan 2: Gambar Lampiran 1 (Di atas #EDF0E8, di bawah Overlay Blur) */}
          <div className="absolute right-0 top-0 bottom-0 w-[160px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/lampiran-1.png"
              alt="Niti Harti Illustration"
              width={140}
              height={140}
              priority
              className="object-contain object-right"
            />
          </div>

          {/* Lapisan 3: Efek Gradien #636B2F (Di atas Gambar, di bawah Teks) */}
          <div
            className="absolute inset-0 rounded-bl-[24px] rounded-br-[24px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
              opacity: 1,
            }}
          />

          {/* Lapisan 4: Teks "Niti Harti" & Subtitle (Paling Atas) */}
          <div className="relative z-30 w-full h-full p-6 flex flex-col justify-end gap-[12px]">
            <div className="flex flex-col gap-1 w-full max-w-[210px]">
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  lineHeight: "38px",
                  letterSpacing: "0%",
                  color: "#FBFFF3",
                }}
              >
                Niti Harti
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "20px",
                  letterSpacing: "0%",
                  color: "#FBFFF3",
                }}
              >
                Pahami konsep dasar dan teorinya.
              </p>
            </div>
          </div>
        </div>

        {/* List Dropdown Bahan Bacaan 1, 2, 3 */}
        <div className="flex flex-col gap-4 w-full">
          {bahanBacaanData.map((item) => {
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

        {/* Section Video Kearifan Lokal Kampung Adat Naga */}
        <div className="w-full bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Belajar dari kearifan Lokal Kampung Adat Naga
          </h2>
          <div className="relative w-full rounded-[16px] overflow-hidden">
            <Image
              src="/lampiran-2.png"
              alt="Belajar dari kearifan Lokal Kampung Adat Naga"
              width={306}
              height={172}
              className="w-full h-auto object-cover rounded-[16px]"
            />
          </div>
        </div>

        {/* Section Video Kearifan Lokal Masyarakat Adat Baduy */}
        <div className="w-full bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Belajar dari kearifan Lokal Masyarakat Adat Baduy
          </h2>
          <div className="relative w-full rounded-[16px] overflow-hidden">
            <Image
              src="/lampiran-3.png"
              alt="Belajar dari kearifan Lokal Masyarakat Adat Baduy"
              width={306}
              height={172}
              className="w-full h-auto object-cover rounded-[16px]"
            />
          </div>
        </div>
      </div>

      {/* Tombol Lanjut ke Niti Surti (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          <Link href="/niti-surti" className="block w-full">
            <button className="w-full h-[56px] bg-[#636B2F] rounded-[120px] flex items-center justify-center gap-2 hover:bg-[#525826] transition-colors shadow-lg focus:outline-none">
              <span className="text-[#FBFFF3] text-[16px] font-semibold leading-[24px]">
                Lanjut ke Niti Surti
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

      {/* Sidebar Reusable */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
