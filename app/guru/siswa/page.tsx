"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GuruSiswaPenilaianPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedProgres, setSelectedProgres] = useState("Semua Progres");

  // Data dummy 6 siswa persis seperti pada mockup
  const siswaData = [
    {
      id: "1",
      nama: "Nova Luthfi 1",
      kelas: "VII-A",
      avatar: "/guru/profile.jpg",
      progress: [true, true, false, false, false],
    },
    {
      id: "2",
      nama: "Nova Luthfi 2",
      kelas: "VII-A",
      avatar: "/guru/profile.jpg",
      progress: [true, true, true, true, true],
    },
    {
      id: "3",
      nama: "Nova Luthfi 3",
      kelas: "VII-B",
      avatar: "/guru/profile.jpg",
      progress: [true, true, true, true, false],
    },
    {
      id: "4",
      nama: "Nova Luthfi 4",
      kelas: "VII-B",
      avatar: "/guru/profile.jpg",
      progress: [true, true, true, false, false],
    },
    {
      id: "5",
      nama: "Nova Luthfi 5",
      kelas: "VII-C",
      avatar: "/guru/profile.jpg",
      progress: [true, true, false, false, false],
    },
    {
      id: "6",
      nama: "Nova Luthfi 6",
      kelas: "VII-C",
      avatar: "/guru/profile.jpg",
      progress: [true, true, true, false, false],
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Control Bar (Search, Filters, Action Buttons) */}
      <div className="w-full max-w-[1158px] flex items-center justify-between flex-wrap gap-3">
        {/* Left Side: Search & Filters */}
        <div className="flex items-center gap-3">
          {/* Input Search */}
          <div className="w-[230px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full bg-transparent text-[#3D4127] placeholder-[#3D4127]/50 text-[14px] font-medium focus:outline-none"
            />
            <Image
              src="/guru/search.svg"
              alt="Search"
              width={18}
              height={18}
              className="object-contain flex-shrink-0 cursor-pointer"
            />
          </div>

          {/* Filter Semua Kelas */}
          <div className="w-[164px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer">
            <span className="text-[14px] font-medium text-[#3D4127] truncate">
              {selectedKelas}
            </span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Filter Kelas"
              width={16}
              height={16}
              className="object-contain flex-shrink-0"
            />
          </div>

          {/* Filter Semua Progres */}
          <div className="w-[164px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer">
            <span className="text-[14px] font-medium text-[#3D4127] truncate">
              {selectedProgres}
            </span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Filter Progres"
              width={16}
              height={16}
              className="object-contain flex-shrink-0"
            />
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Tombol Rekap Nilai */}
          <button className="w-[159px] h-[50px] border-2 border-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#636B2F] font-semibold text-[15px] hover:bg-[#636B2F]/10 transition-colors">
            Rekap Nilai
          </button>

          {/* Tombol Input Nilai */}
          <Link
            href="/guru/siswa/1"
            className="w-[185px] h-[50px] bg-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#FBFFF3] font-semibold text-[15px] hover:bg-[#525826] shadow-sm transition-colors"
          >
            Input Nilai
          </Link>
        </div>
      </div>

      {/* Main Content Box (Data Table) */}
      <div className="w-full max-w-[1158px] min-h-[545px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-3">
        {/* Table Header Row */}
        <div className="w-full max-w-[1110px] h-[24px] px-[12px] flex items-center gap-[10px] text-[16px] font-[500] text-[#9CA08D] leading-[24px]">
          <div className="flex-[3] flex items-center gap-1.5 truncate">
            <span>Siswa</span>
            <Image
              src="/guru/panah atas.svg"
              alt="Sort Siswa"
              width={14}
              height={14}
              className="object-contain"
            />
          </div>
          <div className="flex-[2] truncate">Kelas</div>
          <div className="flex-[4] truncate">Progres Modul 1</div>
          <div className="w-6" /> {/* Placeholder untuk tombol 3 titik */}
        </div>

        {/* Table Data Rows */}
        <div className="flex flex-col gap-[8px] w-full max-w-[1110px]">
          {siswaData.map((row) => (
            <Link
              key={row.id}
              href={`/guru/siswa/${row.id}`}
              className="w-full h-[48px] px-[12px] flex items-center gap-[10px] text-[#3D4127] transition-colors border-b border-[#EDF0E8] last:border-0 hover:bg-[#EDF0E8]/30 rounded-lg cursor-pointer"
            >
              {/* Kolom Siswa (Avatar + Nama) */}
              <div className="flex-[3] flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0 border border-[#3D4127]/10">
                  <Image
                    src={row.avatar}
                    alt={row.nama}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[14px] font-semibold text-[#3D4127]">
                  {row.nama}
                </span>
              </div>

              {/* Kolom Kelas */}
              <div className="flex-[2] text-[14px] font-medium text-[#3D4127]/80 truncate">
                {row.kelas}
              </div>

              {/* Kolom Progres Modul (5 Kapsul) */}
              <div className="flex-[4] flex items-center gap-[8px]">
                {row.progress.map((isFilled, idx) => (
                  <div
                    key={idx}
                    className={`w-[75.2px] h-[24px] rounded-[12px] transition-colors ${
                      isFilled
                        ? "bg-[#636B2F]"
                        : "bg-[#D3D8C3]/60 border border-[#D3D8C3]"
                    }`}
                  />
                ))}
              </div>

              {/* Tombol Opsi 3 Titik */}
              <button
                onClick={(e) => e.preventDefault()}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 transition-colors flex-shrink-0"
                aria-label="Opsi"
              >
                <Image
                  src="/guru/icon titik 3.svg"
                  alt="Opsi"
                  width={18}
                  height={18}
                  className="object-contain opacity-70"
                />
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
