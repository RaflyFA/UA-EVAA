"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function NitiSurtiPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [masalah, setMasalah] = useState("");
  const [solusi, setSolusi] = useState("");
  const [isValidated, setIsValidated] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-32 relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Header Niti Surti - Lapisan 1: Dasaran Persegi Panjang Warna #EDF0E8 */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          {/* Lapisan 2: Gambar Lampiran Puzzle (Di atas #EDF0E8, di bawah Overlay Gradien) */}
          <div className="absolute right-0 top-0 bottom-0 w-[160px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/niti-surti.png"
              alt="Niti Surti Illustration"
              width={140}
              height={140}
              priority
              className="object-contain object-right opacity-90"
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

          {/* Lapisan 4: Teks "Niti Surti" & Subtitle (Paling Atas) */}
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
                Niti Surti
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
                Mengelompokkan Informasi.
              </p>
            </div>
          </div>
        </div>

        {/* Bagian Masalah Yang Ditemukan */}
        <div className="w-full max-w-[354px] h-[109px] bg-[#FBFFF3] rounded-[24px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col justify-between gap-[12px]">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Masalah Yang Ditemukan
          </h2>
          <div className="w-full border-t border-[#3D4127]/15 pt-2">
            <input
              type="text"
              value={masalah}
              onChange={(e) => setMasalah(e.target.value)}
              placeholder="Ketik kalimat yang ingin disampaikan..."
              className="w-full bg-transparent text-[14px] font-[400] leading-[20px] text-[#3D4127] placeholder-[#9CA08D] focus:outline-none"
            />
          </div>
        </div>

        {/* Bagian Alternatif Solusi */}
        <div className="w-full max-w-[354px] h-[109px] bg-[#FBFFF3] rounded-[24px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col justify-between gap-[12px]">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Alternatif Solusi
          </h2>
          <div className="w-full border-t border-[#3D4127]/15 pt-2">
            <input
              type="text"
              value={solusi}
              onChange={(e) => setSolusi(e.target.value)}
              placeholder="Ketik kalimat yang ingin disampaikan..."
              className="w-full bg-transparent text-[14px] font-[400] leading-[20px] text-[#3D4127] placeholder-[#9CA08D] focus:outline-none"
            />
          </div>
        </div>

        {/* Bagian Memvalidasi Kebenaran Informasi */}
        <div
          onClick={() => setIsValidated(!isValidated)}
          className="w-full max-w-[354px] h-[56px] bg-[#FBFFF3] rounded-[24px] pt-[16px] pr-[24px] pb-[16px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex items-center gap-[12px] cursor-pointer select-none"
        >
          {/* Bulatan Input 24x24 */}
          <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
            {isValidated ? (
              <div className="w-[24px] h-[24px] rounded-full border-[2.5px] border-[#636B2F] bg-[#636B2F] flex items-center justify-center transition-colors">
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 5L5 8.5L12.5 1"
                    stroke="#FBFFF3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-[24px] h-[24px] rounded-full border-[2.5px] border-[#3D4127] bg-transparent transition-colors" />
            )}
          </div>
          <span className="text-[14px] font-[600] leading-[24px] text-[#3D4127]">
            Memvalidasi Kebenaran Informasi
          </span>
        </div>
      </div>

      {/* Tombol Lanjut ke Niti Bukti (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          <Link href="/niti-bukti" className="block w-full">
            <button
              className={`w-full h-[56px] rounded-[120px] flex items-center justify-center gap-2 transition-colors shadow-lg focus:outline-none ${
                isValidated
                  ? "bg-[#636B2F] text-[#FBFFF3] hover:bg-[#525826]"
                  : "bg-[#3D41271A] text-[#9CA08D]"
              }`}
            >
              <span className="text-[16px] font-semibold leading-[24px]">
                Lanjut ke Niti Bukti
              </span>
              <Image
                src={
                  isValidated
                    ? "/panah-button-terang.svg"
                    : "/panah-nobg.svg"
                }
                alt="Panah"
                width={20}
                height={20}
                className={isValidated ? "" : "opacity-40"}
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
