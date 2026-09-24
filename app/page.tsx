"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden px-6 pt-4 pb-8">
      {/* Background Image */}
      {/* SVG Filter untuk efek penajaman (Sharpening) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="sharpen">
          <feConvolveMatrix 
            order="3" 
            preserveAlpha="true" 
            kernelMatrix="0 0  0 
                          -1  8 -1 
                           0 -1  0" 
          />
        </filter>
      </svg>

      {/* Background Image */}
      <Image
        src="/gambar 1.png"
        alt="Latar Belakang Beranda"
        fill
        priority
        unoptimized={true}
        className="object-cover object-[-185px] -z-10 contrast-[1.38] brightness-[0.42] saturate-[1.08]"
        style={{ filter: "contrast(1.38) brightness(0.82) saturate(1.08) url(#sharpen)" }}
      />
      
      {/* Background Overlay dengan warna hijau hutan sejuk */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3D4127]/30 via-[#3D4127]/10 to-[#3D4127]/60 -z-10" />

      {/* Top Header */}
      <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="light" />

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-[354px] bg-[#EDF0E826] backdrop-blur-[10px] rounded-[24px] p-8 flex flex-col items-center gap-6 z-10 shadow-lg border border-white/10 mt-auto mb-8">
        <div className="flex flex-col gap-6 w-full text-center">
          <h2 className="text-[32px] font-bold leading-[38px] text-[#FBFFF3]">
            Modul IPA Digital
          </h2>
          <p className="text-[16px] font-light leading-[24px] text-[#FBFFF3]">
            Modul IPA Digital Etosains Pancaniti Berbasis Kearifan Lokal Sunda
          </p>
        </div>
        
        <Link 
          href="/about"
          className="w-full h-[56px] bg-[#FBFFF3] rounded-[120px] flex items-center justify-center hover:bg-[#eef2e6] active:scale-98 transition-all shadow-md group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold text-[#3D4127] leading-none">Mulai</span>
            <span className="w-[20px] h-[20px] rounded-full bg-[#3D4127] flex items-center justify-center transition-transform group-hover:translate-x-1">
              <Image 
                src="/panah.png" 
                alt="Arrow Icon" 
                width={8} 
                height={8} 
              />
            </span>
          </div>
        </Link>
      </div>

      {/* Logos Footer */}
      <footer className="w-full max-w-[354px] flex justify-center z-10">
        <div className="w-[184px] h-[64px] bg-[#EDF0E826] backdrop-blur-[24px] rounded-[24px] px-4 py-2 flex items-center justify-between border border-white/10 shadow-lg">
          <div className="w-8 h-8 relative">
            <Image 
              src="/logo tutwurihandayani.png" 
              alt="Logo Tut Wuri Handayani" 
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="w-8 h-8 relative">
            <Image 
              src="/logo unsil.png" 
              alt="Logo Unsil" 
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="w-8 h-8 relative">
            <Image 
              src="/logo blu.png" 
              alt="Logo BLU" 
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="w-8 h-8 relative">
            <Image 
              src="/logodiktisaintek.png" 
              alt="Logo Dikti Saintek" 
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
        </div>
      </footer>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
