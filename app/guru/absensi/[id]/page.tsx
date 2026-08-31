"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GuruDetailAbsensiPage() {
  const params = useParams();
  const id = params?.id as string;

  const [judulAbsensi, setJudulAbsensi] = useState("Absensi Kehadiran VII-A 4");
  const [selectedKelas, setSelectedKelas] = useState("VII-A");
  const [selectedTanggal, setSelectedTanggal] = useState("11 Agustus 2026");
  const [searchQuery, setSearchQuery] = useState("");

  // State status absensi per siswa
  // Opsi status: "Hadir" | "Sakit/Izin" | "Tidak Hadir"
  const [siswaAbsensi, setSiswaAbsensi] = useState([
    { id: "1", nama: "Nova Luthfi 1", avatar: "/guru/profile.jpg", status: "Hadir" },
    { id: "2", nama: "Nova Luthfi 2", avatar: "/guru/profile.jpg", status: "Sakit/Izin" },
    { id: "3", nama: "Nova Luthfi 3", avatar: "/guru/profile.jpg", status: "Hadir" },
    { id: "4", nama: "Nova Luthfi 4", avatar: "/guru/profile.jpg", status: "Hadir" },
    { id: "5", nama: "Nova Luthfi 5", avatar: "/guru/profile.jpg", status: "Tidak Hadir" },
    { id: "6", nama: "Nova Luthfi 6", avatar: "/guru/profile.jpg", status: "Sakit/Izin" },
    { id: "7", nama: "Nova Luthfi 7", avatar: "/guru/profile.jpg", status: "Hadir" },
    { id: "8", nama: "Nova Luthfi 8", avatar: "/guru/profile.jpg", status: "Hadir" },
  ]);

  const handleStatusChange = (siswaId: string, newStatus: string) => {
    setSiswaAbsensi((prev) =>
      prev.map((siswa) =>
        siswa.id === siswaId ? { ...siswa, status: newStatus } : siswa
      )
    );
  };

  const statusOptions = ["Hadir", "Sakit/Izin", "Tidak Hadir"];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Bar Main Content (Width: 1158px, Height: 72px) */}
      <div className="w-full max-w-[1158px] h-[72px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[16px] pb-[16px] pl-[24px] flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040]">
        {/* Breadcrumb Kiri */}
        <div className="flex items-center gap-2 text-[16px] text-[#3D4127]">
          <Link
            href="/guru/absensi"
            className="font-bold hover:opacity-80 transition-opacity"
          >
            Absensi Kehadiran
          </Link>
          <span className="text-[#3D4127]/40 font-normal">/</span>
          <span className="font-medium text-[#3D4127]">{judulAbsensi}</span>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-4">
          <Link
            href="/guru/absensi"
            className="text-[#636B2F] font-semibold text-[14px] hover:opacity-80 transition-opacity"
          >
            Batalkan
          </Link>
          <button className="bg-[#636B2F] text-[#FBFFF3] rounded-[12px] px-4 py-2 font-semibold text-[14px] hover:bg-[#525826] shadow-sm transition-colors">
            Simpan Absensi
          </button>
        </div>
      </div>

      {/* Kotak Judul Absensi (Width: 1158px, Height: 124px, Padding: 24px) */}
      <div className="w-full max-w-[1158px] h-[124px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex items-center gap-4 shadow-[0px_2px_2px_0px_#00000040]">
        {/* Field Judul Absensi */}
        <div className="flex-[1.5] flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#3D4127]/60">
            Judul Absensi
          </label>
          <input
            type="text"
            value={judulAbsensi}
            onChange={(e) => setJudulAbsensi(e.target.value)}
            className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
          />
        </div>

        {/* Field Kelas */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#3D4127]/60">
            Kelas
          </label>
          <div className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 flex items-center justify-between cursor-pointer">
            <span>{selectedKelas}</span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Select Kelas"
              width={16}
              height={16}
              className="object-contain"
            />
          </div>
        </div>

        {/* Field Tanggal */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#3D4127]/60">
            Tanggal
          </label>
          <div className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 flex items-center justify-between cursor-pointer">
            <span>{selectedTanggal}</span>
            <Image
              src="/guru/kalender.svg"
              alt="Select Tanggal"
              width={18}
              height={18}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Input Search Standalone (Width: 230px, Height: 50px) */}
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

      {/* Kotak Detail Absen Per Siswa (Width: 1158px, Min-Height: 523px, Padding: 24px) */}
      <div className="w-full max-w-[1158px] min-h-[523px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[6px] shadow-[0px_2px_2px_0px_#00000040]">
        <div className="flex flex-col gap-[8px] w-full max-w-[1110px]">
          {siswaAbsensi.map((siswa) => (
            <div
              key={siswa.id}
              className="w-full h-[48px] px-[12px] flex items-center justify-between gap-[12px] text-[#3D4127] border-b border-[#EDF0E8] last:border-0 hover:bg-[#EDF0E8]/30 rounded-lg transition-colors"
            >
              {/* Kolom Siswa (Avatar + Nama) */}
              <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0 border border-[#3D4127]/10">
                  <Image
                    src={siswa.avatar}
                    alt={siswa.nama}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[14px] font-semibold text-[#3D4127]">
                  {siswa.nama}
                </span>
              </div>

              {/* Segmented Control Status Absensi (Width: 314px, Height: 46px, Padding: 6px) */}
              <div className="w-[314px] h-[46px] bg-[#EDF0E8] rounded-[16px] p-[6px] flex items-center gap-[6px] flex-shrink-0">
                {statusOptions.map((opt) => {
                  const isActive = siswa.status === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleStatusChange(siswa.id, opt)}
                      className={`w-[97px] h-[34px] rounded-[10px] py-[5px] px-[12px] flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#636B2F] text-[#FBFFF3] font-semibold shadow-sm"
                          : "text-[#3D4127] font-medium hover:bg-black/5"
                      }`}
                    >
                      <span className="text-[13px] leading-none truncate">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
