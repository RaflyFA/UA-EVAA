"use client";

import { useState } from "react";
import Image from "next/image";

export default function GuruProjectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedTanggal, setSelectedTanggal] = useState("Semua Tanggal");

  // Data dummy project persis seperti di mockup
  const [projectData, setProjectData] = useState([
    {
      id: "1",
      nama: "Nova Luthfi 3",
      judulProyek: "VII-A",
      tanggalPengajuan: "10 Agustus",
      status: "Diajukan", // Diajukan | Disetujui | Perlu Revisi
      avatar: "/guru/profile.jpg",
    },
    {
      id: "2",
      nama: "Nova Luthfi 2",
      judulProyek: "VII-A",
      tanggalPengajuan: "9 Agustus",
      status: "Disetujui",
      avatar: "/guru/profile.jpg",
    },
    {
      id: "3",
      nama: "Nova Luthfi 1",
      judulProyek: "VII-B",
      tanggalPengajuan: "8 Agustus",
      status: "Perlu Revisi",
      avatar: "/guru/profile.jpg",
    },
  ]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setProjectData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // Helper function untuk mendapatkan styling tombol status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Disetujui":
        return {
          bg: "bg-[#4ED953]",
          text: "text-[#3D4127]",
          iconFilter: "",
        };
      case "Perlu Revisi":
        return {
          bg: "bg-[#D3D8C3]",
          text: "text-[#3D4127]",
          iconFilter: "",
        };
      case "Diajukan":
      default:
        return {
          bg: "bg-[#636B2F]",
          text: "text-[#FBFFF3]",
          iconFilter: "brightness-0 invert",
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Control Bar (Search & Filters) */}
      <div className="w-full max-w-[1158px] flex items-center justify-start flex-wrap gap-3">
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

      {/* Main Content Box (Data Table) */}
      <div className="w-full max-w-[1158px] min-h-[545px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-3">
        {/* Table Header Row */}
        <div className="w-full max-w-[1110px] h-[24px] px-[12px] flex items-center gap-[10px] text-[16px] font-[500] text-[#9CA08D] leading-[24px]">
          <div className="flex-[3] truncate">Siswa</div>
          <div className="flex-[2] truncate">Judul Proyek</div>
          <div className="flex-[2.5] flex items-center gap-1.5 truncate">
            <span>Tanggal Pengajuan</span>
            <Image
              src="/guru/panah atas.svg"
              alt="Sort Tanggal"
              width={14}
              height={14}
              className="object-contain"
            />
          </div>
          <div className="w-[153px] flex-shrink-0 truncate">Status</div>
          <div className="w-6 flex-shrink-0" /> {/* Spacer titik 3 */}
        </div>

        {/* Table Data Rows */}
        <div className="flex flex-col gap-[8px] w-full max-w-[1110px]">
          {projectData.map((row) => {
            const statusStyle = getStatusStyles(row.status);
            return (
              <div
                key={row.id}
                className="w-full h-[64px] px-[12px] flex items-center gap-[10px] text-[#3D4127] transition-colors border-b border-[#EDF0E8] last:border-0 hover:bg-[#EDF0E8]/30 rounded-lg"
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

                {/* Kolom Judul Proyek */}
                <div className="flex-[2] text-[14px] font-medium text-[#3D4127]/80 truncate">
                  {row.judulProyek}
                </div>

                {/* Kolom Tanggal Pengajuan */}
                <div className="flex-[2.5] text-[14px] font-medium text-[#3D4127]/80 truncate">
                  {row.tanggalPengajuan}
                </div>

                {/* Kolom Status (Dropdown Button) */}
                <div className="w-[153px] flex-shrink-0">
                  <div
                    className={`w-[153px] h-[48px] rounded-[12px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer transition-colors shadow-sm ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span className="text-[14px] font-semibold truncate">
                      {row.status}
                    </span>
                    <Image
                      src="/guru/panah bawah.svg"
                      alt="Status Arrow"
                      width={16}
                      height={16}
                      className={`object-contain flex-shrink-0 ${statusStyle.iconFilter}`}
                    />
                  </div>
                </div>

                {/* Tombol Opsi 3 Titik */}
                <button
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
