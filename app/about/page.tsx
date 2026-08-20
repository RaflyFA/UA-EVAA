"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function AboutPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-between px-6 pt-4 pb-8 relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />

        {/* Card Utama "Tentang Modul" */}
        <div className="relative w-full h-[251px] rounded-[24px] overflow-hidden p-6 flex flex-col justify-end shadow-md">
          {/* Background Image persis dengan Beranda */}
          <Image
            src="/gambar 1.png"
            alt="Latar Belakang Tentang Modul"
            fill
            priority
            unoptimized={true}
            className="object-cover object-top -z-10 contrast-[1.38] brightness-[0.42] saturate-[1.08]"
        style={{ filter: "contrast(1.38) brightness(0.82) saturate(1.08) url(#sharpen)" }}
          />

          {/* Gradient Tint Overlay Warna Hijau #636B2F */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#636B2F]/80 to-[#525826]/95 -z-10" />

          {/* Konten Card */}
          <div className="flex flex-col gap-[12px] z-10">
            <h2 className="text-[30px] font-bold leading-[34px] text-[#FBFFF3] tracking-wide">
              Tentang Modul
            </h2>
            <p className="text-[13px] font-[300] leading-[18px] tracking-[0%] text-[#EDF0E8]">
              Modul IPA Digital UA-EVAA mentransformasi pembelajaran sains dari
              sekadar hafalan menjadi reflektif. Mengintegrasikan sains modern
              dengan nilai Pancaniti masyarakat adat Sunda.
            </p>
          </div>
        </div>

        {/* Section "Panduan Akses" */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <span className="text-[16px] font-[500] leading-[24px] text-[#7C8268] tracking-[0%]">
            Panduan Akses
          </span>

          {/* Daftar Menu Panduan Akses */}
          <div className="flex flex-col gap-3 w-full">
            {/* 1. Tujuan Pembelajaran */}
            <Link
              href="/tujuan-pembelajaran"
              className="w-full h-[56px] bg-[#FBFFF3] border-2 border-[#A5AA94] rounded-[120px] px-6 py-4 flex items-center justify-between hover:bg-[#f2f6e9] active:scale-[0.98] transition-all shadow-sm group"
            >
              <div className="flex items-center gap-[12px]">
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <Image
                    src="/icon-tujuan-pembelajaran.svg"
                    alt="Tujuan Pembelajaran"
                    width={17}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-[16px] font-[600] leading-[24px] text-[#3F432E]">
                  Tujuan Pembelajaran
                </span>
              </div>
              <svg
                width="10"
                height="18"
                viewBox="0 0 10 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M1.5 1.5L8.5 9L1.5 16.5"
                  stroke="#3F432E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* 2. Capaian Pembelajaran */}
            <Link
              href="/capaian-pembelajaran"
              className="w-full h-[56px] bg-[#FBFFF3] border-2 border-[#A5AA94] rounded-[120px] px-6 py-4 flex items-center justify-between hover:bg-[#f2f6e9] active:scale-[0.98] transition-all shadow-sm group"
            >
              <div className="flex items-center gap-[12px]">
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <Image
                    src="/icon-capaian-pembelajaran.svg"
                    alt="Capaian Pembelajaran"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-[16px] font-[600] leading-[24px] text-[#3F432E]">
                  Capaian Pembelajaran
                </span>
              </div>
              <svg
                width="10"
                height="18"
                viewBox="0 0 10 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M1.5 1.5L8.5 9L1.5 16.5"
                  stroke="#3F432E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* 3. Peta Konsep */}
            <Link
              href="/peta-konsep"
              className="w-full h-[56px] bg-[#FBFFF3] border-2 border-[#A5AA94] rounded-[120px] px-6 py-4 flex items-center justify-between hover:bg-[#f2f6e9] active:scale-[0.98] transition-all shadow-sm group"
            >
              <div className="flex items-center gap-[12px]">
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <Image
                    src="/icon-peta-konsep.svg"
                    alt="Peta Konsep"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-[16px] font-[600] leading-[24px] text-[#3F432E]">
                  Peta Konsep
                </span>
              </div>
              <svg
                width="10"
                height="18"
                viewBox="0 0 10 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M1.5 1.5L8.5 9L1.5 16.5"
                  stroke="#3F432E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Tombol "Alur Modul" di bagian bawah */}
        <div className="w-full mt-auto pt-6">
          <Link
            href="/alur"
            className="w-full h-[56px] bg-[#636B2F] rounded-[120px] px-6 py-4 flex items-center justify-center gap-2 hover:bg-[#525926] active:scale-[0.98] transition-all shadow-md group"
          >
            <span className="text-[14px] font-[600] leading-[24px] text-[#FBFFF3]">
              Alur Modul
            </span>
            <span className="w-6 h-6 rounded-full bg-[#FBFFF3] flex items-center justify-center transition-transform group-hover:translate-x-1">
              <svg
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 1.5L6.5 6L1.5 10.5"
                  stroke="#636B2F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
