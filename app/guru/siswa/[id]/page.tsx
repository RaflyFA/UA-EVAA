"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GuruDetailPenilaianPage() {
  const params = useParams();
  const id = params?.id as string;

  const [judulPenilaian, setJudulPenilaian] = useState("Penilaian Modul 1");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedTanggal, setSelectedTanggal] = useState("11 Agustus 2026");
  const [searchQuery, setSearchQuery] = useState("");

  // Track accordion mana yang sedang terbuka (ID siswa).
  // Default: Siswa 1 terbuka.
  const [expandedId, setExpandedId] = useState<string | null>("1");

  // Data dummy siswa beserta detail penilaiam 5 komponen
  const [siswaPenilaianList, setSiswaPenilaianList] = useState([
    {
      id: "1",
      nama: "Nova Luthfi 1",
      avatar: "/guru/profile.jpg",
      komponen: [
        { nama: "Niti Harti", nilai: "100", maksimal: "/ 100", keterangan: "-" },
        { nama: "Niti Surti", nilai: "92", maksimal: "/ 100", keterangan: "Penilaian Modul 1" },
        { nama: "Niti Bukti", nilai: "88", maksimal: "/ 100", keterangan: "Rencana Aksi lengkap" },
        { nama: "Niti Bakti", nilai: "85", maksimal: "/ 100", keterangan: "Laporannya lengkap, hanya perlu sedikit perbaikan" },
        { nama: "Niti Sajati", nilai: "100", maksimal: "/ 100", keterangan: "-" },
      ],
    },
    {
      id: "2",
      nama: "Nova Luthfi 2",
      avatar: "/guru/profile.jpg",
      komponen: [
        { nama: "Niti Harti", nilai: "95", maksimal: "/ 100", keterangan: "-" },
        { nama: "Niti Surti", nilai: "90", maksimal: "/ 100", keterangan: "Sangat baik" },
        { nama: "Niti Bukti", nilai: "92", maksimal: "/ 100", keterangan: "Lengkap" },
        { nama: "Niti Bakti", nilai: "88", maksimal: "/ 100", keterangan: "Baik" },
        { nama: "Niti Sajati", nilai: "95", maksimal: "/ 100", keterangan: "-" },
      ],
    },
    {
      id: "3",
      nama: "Nova Luthfi 3",
      avatar: "/guru/profile.jpg",
      komponen: [
        { nama: "Niti Harti", nilai: "80", maksimal: "/ 100", keterangan: "-" },
        { nama: "Niti Surti", nilai: "85", maksimal: "/ 100", keterangan: "Cukup" },
        { nama: "Niti Bukti", nilai: "80", maksimal: "/ 100", keterangan: "Perlu perbaikan" },
        { nama: "Niti Bakti", nilai: "82", maksimal: "/ 100", keterangan: "Cukup" },
        { nama: "Niti Sajati", nilai: "85", maksimal: "/ 100", keterangan: "-" },
      ],
    },
    {
      id: "4",
      nama: "Nova Luthfi 4",
      avatar: "/guru/profile.jpg",
      komponen: [
        { nama: "Niti Harti", nilai: "90", maksimal: "/ 100", keterangan: "-" },
        { nama: "Niti Surti", nilai: "88", maksimal: "/ 100", keterangan: "Baik" },
        { nama: "Niti Bukti", nilai: "85", maksimal: "/ 100", keterangan: "Cukup baik" },
        { nama: "Niti Bakti", nilai: "90", maksimal: "/ 100", keterangan: "Sangat baik" },
        { nama: "Niti Sajati", nilai: "92", maksimal: "/ 100", keterangan: "-" },
      ],
    },
    {
      id: "5",
      nama: "Nova Luthfi 5",
      avatar: "/guru/profile.jpg",
      komponen: [
        { nama: "Niti Harti", nilai: "75", maksimal: "/ 100", keterangan: "-" },
        { nama: "Niti Surti", nilai: "78", maksimal: "/ 100", keterangan: "Perlu pendampingan" },
        { nama: "Niti Bukti", nilai: "80", maksimal: "/ 100", keterangan: "Cukup" },
        { nama: "Niti Bakti", nilai: "75", maksimal: "/ 100", keterangan: "Perlu revisi" },
        { nama: "Niti Sajati", nilai: "80", maksimal: "/ 100", keterangan: "-" },
      ],
    },
    {
      id: "6",
      nama: "Nova Luthfi 6",
      avatar: "/guru/profile.jpg",
      komponen: [
        { nama: "Niti Harti", nilai: "88", maksimal: "/ 100", keterangan: "-" },
        { nama: "Niti Surti", nilai: "90", maksimal: "/ 100", keterangan: "Baik" },
        { nama: "Niti Bukti", nilai: "88", maksimal: "/ 100", keterangan: "Lengkap" },
        { nama: "Niti Bakti", nilai: "85", maksimal: "/ 100", keterangan: "Cukup baik" },
        { nama: "Niti Sajati", nilai: "90", maksimal: "/ 100", keterangan: "-" },
      ],
    },
  ]);

  const toggleAccordion = (siswaId: string) => {
    setExpandedId((prev) => (prev === siswaId ? null : siswaId));
  };

  const handleInputChange = (
    siswaIdx: number,
    komponenIdx: number,
    field: "nilai" | "keterangan",
    val: string
  ) => {
    const updated = [...siswaPenilaianList];
    updated[siswaIdx].komponen[komponenIdx][field] = val;
    setSiswaPenilaianList(updated);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Bar Main Content (Width: 1158px, Height: 72px) */}
      <div className="w-full max-w-[1158px] h-[72px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[16px] pb-[16px] pl-[24px] flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040]">
        {/* Breadcrumb Kiri */}
        <div className="flex items-center gap-2 text-[16px] text-[#3D4127]">
          <Link
            href="/guru/siswa"
            className="font-bold hover:opacity-80 transition-opacity"
          >
            Input Nilai
          </Link>
          <span className="text-[#3D4127]/40 font-normal">/</span>
          <span className="font-medium text-[#3D4127]">{judulPenilaian}</span>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-4">
          <Link
            href="/guru/siswa"
            className="text-[#636B2F] font-semibold text-[14px] hover:opacity-80 transition-opacity"
          >
            Batalkan
          </Link>
          <button className="bg-[#636B2F] text-[#FBFFF3] rounded-[12px] px-4 py-2 font-semibold text-[14px] hover:bg-[#525826] shadow-sm transition-colors">
            Simpan Nilai
          </button>
        </div>
      </div>

      {/* Kotak Judul (Width: 1158px, Height: 124px, Padding: 24px) */}
      <div className="w-full max-w-[1158px] h-[124px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex items-center gap-4 shadow-[0px_2px_2px_0px_#00000040]">
        {/* Field Judul Absensi / Penilaian */}
        <div className="flex-[1.5] flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#3D4127]/60">
            Judul Absensi
          </label>
          <input
            type="text"
            value={judulPenilaian}
            onChange={(e) => setJudulPenilaian(e.target.value)}
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

      {/* Standalone Search Input (Width: 230px, Height: 50px) */}
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

      {/* Daftar Accordion Kartu Siswa */}
      <div className="w-full max-w-[1158px] flex flex-col gap-[12px]">
        {siswaPenilaianList.map((siswa, siswaIdx) => {
          const isOpen = expandedId === siswa.id;

          return (
            <div
              key={siswa.id}
              className="w-full max-w-[1158px] bg-[#FBFFF3] rounded-[12px] p-[24px] shadow-[0px_2px_2px_0px_#00000040] transition-all duration-300 ease-in-out overflow-hidden"
            >
              {/* Header Siswa (Selalu tampil, klik untuk toggle) */}
              <div
                onClick={() => toggleAccordion(siswa.id)}
                className="flex items-center justify-between cursor-pointer w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-[#3D4127]/10 flex-shrink-0">
                    <Image
                      src={siswa.avatar}
                      alt={siswa.nama}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[15px] font-bold text-[#3D4127]">
                    {siswa.nama}
                  </span>
                </div>
                <Image
                  src="/guru/panah bawah.svg"
                  alt="Toggle Accordion"
                  width={16}
                  height={16}
                  className={`object-contain cursor-pointer opacity-70 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>

              {/* Konten Terbuka (Dropdown Content dengan Grid Smooth Transition) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100 mt-[14px]"
                    : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden flex flex-col gap-[10px]">
                  {/* Header Tabel (Height: 20px, Color: #9CA08D) */}
                  <div className="w-full max-w-[1110px] h-[20px] px-1 flex items-center gap-[10px] text-[13px] font-medium text-[#9CA08D]">
                    <div className="flex-[2] truncate">Komponen Penilaian</div>
                    <div className="w-[120px] text-center truncate">Nilai (1-100)</div>
                    <div className="w-[90px] text-center truncate">Maksimal</div>
                    <div className="flex-[3] truncate">Keterangan</div>
                  </div>

                  {/* Baris Isi Tabel (Height: 50px per baris) */}
                  <div className="flex flex-col gap-[6px] w-full max-w-[1110px]">
                    {siswa.komponen.map((item, kompIdx) => (
                      <div
                        key={item.nama}
                        className="w-full h-[50px] px-1 flex items-center gap-[10px] text-[#3D4127]"
                      >
                        {/* Nama Komponen */}
                        <div className="flex-[2] text-[14px] font-semibold text-[#3D4127] truncate">
                          {item.nama}
                        </div>

                        {/* Input Nilai */}
                        <div className="w-[120px] flex justify-center">
                          <input
                            type="text"
                            value={item.nilai}
                            onChange={(e) =>
                              handleInputChange(
                                siswaIdx,
                                kompIdx,
                                "nilai",
                                e.target.value
                              )
                            }
                            className="w-[100px] h-[40px] bg-[#EDF0E8] rounded-[10px] px-3 text-center text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
                          />
                        </div>

                        {/* Teks Maksimal */}
                        <div className="w-[90px] text-center text-[14px] font-medium text-[#3D4127]/80">
                          {item.maksimal}
                        </div>

                        {/* Input Keterangan */}
                        <div className="flex-[3]">
                          <input
                            type="text"
                            value={item.keterangan}
                            onChange={(e) =>
                              handleInputChange(
                                siswaIdx,
                                kompIdx,
                                "keterangan",
                                e.target.value
                              )
                            }
                            className="w-full h-[40px] bg-[#EDF0E8] rounded-[10px] px-3 text-[#3D4127] font-medium text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Total Rata-rata (Color: #9CA08D) */}
                  <div className="w-full max-w-[1110px] pt-3 text-[14px] font-medium text-[#9CA08D]">
                    Total Rata-rata: 93 / 100
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
