"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GuruAbsensiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedTanggal, setSelectedTanggal] = useState("Semua Tanggal");

  // Data dummy 9 baris persis seperti mockup
  const absensiData = [
    {
      id: "1",
      nama: "Absensi Kehadiran VII-C 3",
      kelas: "VII-C",
      tanggal: "10 Agustus, 2026",
      jumlahKehadiran: "5/6",
    },
    {
      id: "2",
      nama: "Absensi Kehadiran VII-B 3",
      kelas: "VII-B",
      tanggal: "10 Agustus, 2026",
      jumlahKehadiran: "6/6",
    },
    {
      id: "3",
      nama: "Absensi Kehadiran VII-A 3",
      kelas: "VII-A",
      tanggal: "10 Agustus, 2026",
      jumlahKehadiran: "5/6",
    },
    {
      id: "4",
      nama: "Absensi Kehadiran VII-C 2",
      kelas: "VII-C",
      tanggal: "9 Agustus, 2026",
      jumlahKehadiran: "6/6",
    },
    {
      id: "5",
      nama: "Absensi Kehadiran VII-B 2",
      kelas: "VII-B",
      tanggal: "9 Agustus, 2026",
      jumlahKehadiran: "5/6",
    },
    {
      id: "6",
      nama: "Absensi Kehadiran VII-A 2",
      kelas: "VII-A",
      tanggal: "9 Agustus, 2026",
      jumlahKehadiran: "6/6",
    },
    {
      id: "7",
      nama: "Absensi Kehadiran VII-C 1",
      kelas: "VII-C",
      tanggal: "8 Agustus, 2026",
      jumlahKehadiran: "4/6",
    },
    {
      id: "8",
      nama: "Absensi Kehadiran VII-B 1",
      kelas: "VII-B",
      tanggal: "8 Agustus, 2026",
      jumlahKehadiran: "6/6",
    },
    {
      id: "9",
      nama: "Absensi Kehadiran VII-A 1",
      kelas: "VII-A",
      tanggal: "8 Agustus, 2026",
      jumlahKehadiran: "6/6",
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
              placeholder="Cari nama..."
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

          {/* Filter Semua Tanggal */}
          <div className="w-[164px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer">
            <span className="text-[14px] font-medium text-[#3D4127] truncate">
              {selectedTanggal}
            </span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Filter Tanggal"
              width={16}
              height={16}
              className="object-contain flex-shrink-0"
            />
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Tombol Rekap Absensi */}
          <button className="w-[159px] h-[50px] border-2 border-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#636B2F] font-semibold text-[15px] hover:bg-[#636B2F]/10 transition-colors">
            Rekap Absensi
          </button>

          {/* Tombol Absensi Kehadiran */}
          <Link
            href="/guru/absensi/1"
            className="w-[185px] h-[50px] bg-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#FBFFF3] font-semibold text-[15px] hover:bg-[#525826] shadow-sm transition-colors"
          >
            Absensi Kehadiran
          </Link>
        </div>
      </div>

      {/* Main Content Box (Data Table) */}
      <div className="w-full max-w-[1158px] min-h-[545px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-3">
        {/* Table Header Row */}
        <div className="w-full max-w-[1110px] h-[24px] px-[12px] flex items-center gap-[10px] text-[16px] font-[500] text-[#9CA08D] leading-[24px]">
          <div className="flex-[3] truncate">Nama</div>
          <div className="flex-[1.5] truncate">Kelas</div>
          <div className="flex-[2] flex items-center gap-1.5 truncate">
            <span>Tanggal</span>
            <Image
              src="/guru/panah atas.svg"
              alt="Sort Tanggal"
              width={14}
              height={14}
              className="object-contain"
            />
          </div>
          <div className="flex-[2] truncate">Jumlah Kehadiran</div>
          <div className="w-6" /> {/* Placeholder untuk tombol 3 titik */}
        </div>

        {/* Table Data Rows */}
        <div className="flex flex-col gap-[8px] w-full max-w-[1110px]">
          {absensiData.map((row) => (
            <Link
              key={row.id}
              href={`/guru/absensi/${row.id}`}
              className="w-full h-[40px] bg-[#EDF0E8] rounded-[7px] px-[12px] py-[8px] flex items-center gap-[10px] text-[#3D4127] transition-colors hover:bg-[#e2e6db] cursor-pointer"
            >
              <div className="flex-[3] text-[14px] font-semibold truncate">
                {row.nama}
              </div>
              <div className="flex-[1.5] text-[14px] font-medium text-[#3D4127]/80 truncate">
                {row.kelas}
              </div>
              <div className="flex-[2] text-[14px] font-medium text-[#3D4127]/80 truncate">
                {row.tanggal}
              </div>
              <div className="flex-[2] text-[14px] font-medium text-[#3D4127]/80 truncate">
                {row.jumlahKehadiran}
              </div>
              <button
                onClick={(e) => e.preventDefault()}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
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
