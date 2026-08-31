"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function NitiSajatiPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const achievements = [
    {
      id: 1,
      title: "Pencapaian 1",
      description: "Lorem ipsum dolor sit amet.",
      isUnlocked: true,
    },
    {
      id: 2,
      title: "Pencapaian 2",
      description: "Lorem ipsum dolor sit amet.",
      isUnlocked: true,
    },
    {
      id: 3,
      title: "Pencapaian 3",
      description: "Lorem ipsum dolor sit amet.",
      isUnlocked: false,
    },
    {
      id: 4,
      title: "Pencapaian 4",
      description: "Lorem ipsum dolor sit amet.",
      isUnlocked: false,
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-[140px] relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Header Niti Sajati - Lapisan 1: Dasaran Persegi Panjang Warna #EDF0E8 */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          {/* Lapisan 2: Gambar Lampiran Ilustrasi */}
          <div className="absolute right-0 top-0 bottom-0 w-[170px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/niti-sajati.png"
              alt="Niti Sajati Illustration"
              width={160}
              height={140}
              priority
              className="object-contain object-right opacity-90"
            />
          </div>

          {/* Lapisan 3: Efek Gradien #636B2F */}
          <div
            className="absolute inset-0 rounded-bl-[24px] rounded-br-[24px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
              opacity: 1,
            }}
          />

          {/* Lapisan 4: Teks "Niti Sajati" & Subtitle */}
          <div className="relative z-30 w-full h-full p-6 flex flex-col justify-end gap-[12px]">
            <div className="flex flex-col gap-1 w-full max-w-[220px]">
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
                Niti Sajati
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "0%",
                  color: "#FBFFF3",
                }}
              >
                Pencapaian Pembelajaran.
              </p>
            </div>
          </div>
        </div>

        {/* Section Pencapaian Kompetensi */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-5">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Pencapaian Kompetensi
          </h2>

          <div className="flex flex-col gap-4">
            {achievements.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Image
                    src={item.isUnlocked ? "/icon-piala.svg" : "/icon-gembok.svg"}
                    alt={item.isUnlocked ? "Unlocked Trophy" : "Locked Item"}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <h3
                    className={`text-[15px] font-[600] leading-[20px] ${
                      item.isUnlocked ? "text-[#3D4127]" : "text-[#9CA08D]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-[13px] font-[400] leading-[18px] ${
                      item.isUnlocked ? "text-[#3D4127]/80" : "text-[#9CA08D]"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Sertifikat */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Sertifikat
          </h2>

          {/* Inner Certificate Container / Placeholder */}
          <div className="relative w-full h-[180px] rounded-[16px] overflow-hidden flex flex-col items-center justify-center p-4 group cursor-pointer border border-[#D3D8C3]">
            {/* Latar Belakang Placeholder Sertifikat dengan Corak Abstrak */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-[2px] scale-105 transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 80% 20%, #1e40af 0%, transparent 40%), radial-gradient(circle at 20% 80%, #0284c7 0%, transparent 40%), linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              }}
            />

            {/* Dark Overlay untuk legibilitas teks */}
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

            {/* Konten Tombol Unduh Sertifikat */}
            <div className="relative z-10 flex items-center justify-center gap-2.5 text-white bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 hover:bg-black/30 transition-all">
              <Image
                src="/icon-unduh.svg"
                alt="Unduh Icon"
                width={20}
                height={20}
                className="object-contain filter brightness-0 invert"
              />
              <span className="text-[14px] font-[600] tracking-wide text-white">
                Unduh Sertifikat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Selesai (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          <Link href="/" className="block w-full">
            <button className="w-full h-[56px] bg-[#5B6628] hover:bg-[#4d5722] text-[#FBFFF3] rounded-[120px] flex items-center justify-center gap-2.5 transition-colors shadow-lg focus:outline-none">
              <span className="text-[16px] font-semibold leading-[24px]">
                Selesai
              </span>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#5B6628] font-bold text-xs">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* Sidebar Reusable */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
