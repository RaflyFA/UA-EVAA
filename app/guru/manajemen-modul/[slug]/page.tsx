"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GuruEditModulPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Format nama modul dari slug (misal: "niti-harti" -> "Niti Harti")
  const moduleName = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Niti Harti";

  // State form
  const [bgFileName, setBgFileName] = useState("latarbelakang-1.jpg");
  const [judulModul, setJudulModul] = useState(moduleName);
  const [deskripsiModul, setDeskripsiModul] = useState(
    "Pahami konsep dasar dan teorinya."
  );

  // State Kartu Deskripsi
  const [deskripsiCards, setDeskripsiCards] = useState([
    {
      id: "1",
      judul: "Bahan Bacaan 1",
      deskripsi:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      id: "2",
      judul: "Bahan Bacaan 2",
      deskripsi:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      id: "3",
      judul: "Bahan Bacaan 3",
      deskripsi:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
  ]);

  // State Kartu YouTube
  const [youtubeCards, setYoutubeCards] = useState([
    {
      id: "yt-1",
      judul: "Belajar dari kearifan Lokal Kampung Adat Naga",
      url: "https://www.youtube.com/watch?v=xxxxxxxxxx",
      image: "/lampiran-2.png",
    },
    {
      id: "yt-2",
      judul: "Belajar dari kearifan Lokal Masyarakat Adat Baduy",
      url: "https://www.youtube.com/watch?v=xxxxxxxxxx",
      image: "/lampiran-3.png",
    },
  ]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Bar Main Content (Width: 1158px, Height: 72px) */}
      <div className="w-full max-w-[1158px] h-[72px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[16px] pb-[16px] pl-[24px] flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040]">
        {/* Breadcrumb Kiri */}
        <div className="flex items-center gap-2 text-[16px] text-[#3D4127]">
          <Link
            href="/guru/manajemen-modul"
            className="font-bold hover:opacity-80 transition-opacity"
          >
            Alur Modul
          </Link>
          <span className="text-[#3D4127]/40 font-normal">/</span>
          <span className="font-medium text-[#3D4127]">{moduleName}</span>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-4">
          <Link
            href="/guru/manajemen-modul"
            className="text-[#636B2F] font-semibold text-[14px] hover:opacity-80 transition-opacity"
          >
            Batalkan
          </Link>
          <button className="bg-[#636B2F] text-[#FBFFF3] rounded-[12px] px-4 py-2 font-semibold text-[14px] hover:bg-[#525826] shadow-sm transition-colors">
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Grid Content: Editor Kiri (828px) & Preview Kanan (318px) */}
      <div className="w-full max-w-[1158px] flex gap-[12px] items-start">
        {/* ================= EDITOR KIRI (828px) ================= */}
        <div className="w-[828px] flex-shrink-0 flex flex-col gap-[12px]">
          {/* 1. KARTU DASAR (828px x 336px) */}
          <div className="w-[828px] h-[336px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]">
            <h2 className="text-[16px] font-bold text-[#3D4127]">
              Kartu Dasar
            </h2>

            {/* Field Latar Belakang */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#3D4127]/60">
                Latar Belakang
              </label>
              <div className="w-full bg-[#EDF0E8] rounded-[12px] p-3 flex items-center justify-between border border-[#D3D8C3]/40">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#FBFFF3] rounded flex items-center justify-center border border-[#3D4127]/20">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-medium text-[#3D4127]">
                    {bgFileName}
                  </span>
                </div>
                {bgFileName && (
                  <button
                    onClick={() => setBgFileName("")}
                    className="p-1 hover:bg-black/5 rounded transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Field Judul Alur Modul */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#3D4127]/60">
                Judul Alur Modul
              </label>
              <input
                type="text"
                value={judulModul}
                onChange={(e) => setJudulModul(e.target.value)}
                className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
              />
            </div>

            {/* Field Subtitle / Deskripsi Alur Modul */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#3D4127]/60">
                Judul Alur Modul
              </label>
              <input
                type="text"
                value={deskripsiModul}
                onChange={(e) => setDeskripsiModul(e.target.value)}
                className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. KARTU DESKRIPSI (x3, 828px x 296px) */}
          {deskripsiCards.map((card, idx) => (
            <div
              key={card.id}
              className="w-[828px] min-h-[296px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]"
            >
              {/* Header Kartu */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Image
                    src="/guru/garis 3.svg"
                    alt="Drag"
                    width={18}
                    height={18}
                    className="object-contain cursor-grab opacity-70"
                  />
                  <h3 className="text-[16px] font-bold text-[#3D4127]">
                    Kartu Deskripsi
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-1 hover:bg-black/5 rounded transition-colors">
                    <Image
                      src="/guru/icon salin.svg"
                      alt="Duplicate"
                      width={18}
                      height={18}
                      className="object-contain opacity-70"
                    />
                  </button>
                  <button className="p-1 hover:bg-black/5 rounded transition-colors">
                    <Image
                      src="/guru/icon delet.svg"
                      alt="Delete"
                      width={18}
                      height={18}
                      className="object-contain opacity-70"
                    />
                  </button>
                  <button className="p-1 hover:bg-black/5 rounded transition-colors">
                    <Image
                      src="/guru/icon titik 3.svg"
                      alt="Options"
                      width={18}
                      height={18}
                      className="object-contain opacity-70"
                    />
                  </button>
                </div>
              </div>

              {/* Field Judul */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#3D4127]/60">
                  Judul
                </label>
                <input
                  type="text"
                  value={card.judul}
                  onChange={(e) => {
                    const newCards = [...deskripsiCards];
                    newCards[idx].judul = e.target.value;
                    setDeskripsiCards(newCards);
                  }}
                  className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
                />
              </div>

              {/* Field Deskripsi */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#3D4127]/60">
                  Deskripsi
                </label>
                <textarea
                  value={card.deskripsi}
                  onChange={(e) => {
                    const newCards = [...deskripsiCards];
                    newCards[idx].deskripsi = e.target.value;
                    setDeskripsiCards(newCards);
                  }}
                  rows={3}
                  className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] text-[14px] border border-[#D3D8C3]/40 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          ))}

          {/* 3. KARTU YOUTUBE (x2, 828px x 248.2px) */}
          {youtubeCards.map((card, idx) => (
            <div
              key={card.id}
              className="w-[828px] min-h-[248px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]"
            >
              {/* Header Kartu */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Image
                    src="/guru/garis 3.svg"
                    alt="Drag"
                    width={18}
                    height={18}
                    className="object-contain cursor-grab opacity-70"
                  />
                  <h3 className="text-[16px] font-bold text-[#3D4127]">
                    Kartu YouTube
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-1 hover:bg-black/5 rounded transition-colors">
                    <Image
                      src="/guru/icon salin.svg"
                      alt="Duplicate"
                      width={18}
                      height={18}
                      className="object-contain opacity-70"
                    />
                  </button>
                  <button className="p-1 hover:bg-black/5 rounded transition-colors">
                    <Image
                      src="/guru/icon delet.svg"
                      alt="Delete"
                      width={18}
                      height={18}
                      className="object-contain opacity-70"
                    />
                  </button>
                  <button className="p-1 hover:bg-black/5 rounded transition-colors">
                    <Image
                      src="/guru/icon titik 3.svg"
                      alt="Options"
                      width={18}
                      height={18}
                      className="object-contain opacity-70"
                    />
                  </button>
                </div>
              </div>

              {/* Body: Inputs (Kiri) & Thumbnail Pratinjau (Kanan) */}
              <div className="flex gap-4 w-full items-start">
                <div className="flex-1 flex flex-col gap-[12px]">
                  {/* Field Judul */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#3D4127]/60">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={card.judul}
                      onChange={(e) => {
                        const newCards = [...youtubeCards];
                        newCards[idx].judul = e.target.value;
                        setYoutubeCards(newCards);
                      }}
                      className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
                    />
                  </div>

                  {/* Field Tautan YouTube */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#3D4127]/60">
                      Tautan YouTube
                    </label>
                    <input
                      type="text"
                      value={card.url}
                      onChange={(e) => {
                        const newCards = [...youtubeCards];
                        newCards[idx].url = e.target.value;
                        setYoutubeCards(newCards);
                      }}
                      className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pratinjau Thumbnail Video di Kanan */}
                <div className="w-[200px] flex flex-col gap-1 flex-shrink-0">
                  <label className="text-[12px] font-medium text-[#3D4127]/60">
                    Pratinjau
                  </label>
                  <div className="w-full h-[110px] rounded-[12px] overflow-hidden relative shadow-sm border border-[#D3D8C3]">
                    <Image
                      src={card.image}
                      alt={card.judul}
                      fill
                      className="object-cover"
                    />
                    {/* YouTube Red Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-8 h-6 bg-red-600 rounded-md flex items-center justify-center shadow">
                        <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= PANEL PREVIEW KANAN (318px x 885px) ================= */}
        <div className="w-[318px] min-h-[885px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] pt-[12px] pr-[12px] pb-[13px] pl-[12px] flex flex-col gap-[12px] sticky top-[76px]">
          {/* Label Preview */}
          <div className="w-full text-center text-[13px] font-medium text-[#3D4127]/60">
            (Preview)
          </div>

          {/* Kartu Modul Header Preview */}
          <div className="relative w-full h-[140px] rounded-[16px] overflow-hidden shadow-md p-4 flex flex-col justify-end">
            <Image
              src="/gambar 4.png"
              alt="Modul Preview"
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
              }}
            />
            <div className="relative z-10 flex flex-col gap-0.5">
              <h4 className="text-[20px] font-bold text-[#FBFFF3]">
                {judulModul}
              </h4>
              <p className="text-[12px] font-medium text-[#FBFFF3]/90 line-clamp-2">
                {deskripsiModul}
              </p>
            </div>
          </div>

          {/* List Bahan Bacaan (Accordion Items) */}
          <div className="flex flex-col gap-[8px] w-full">
            {deskripsiCards.map((item) => (
              <div
                key={item.id}
                className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[12px] px-4 py-3 flex items-center justify-between text-[14px] font-semibold text-[#3D4127] cursor-pointer hover:bg-[#EDF0E8]/40 transition-colors shadow-sm"
              >
                <span>{item.judul}</span>
                <Image
                  src="/guru/panah bawah.svg"
                  alt="Expand"
                  width={14}
                  height={14}
                  className="object-contain opacity-70"
                />
              </div>
            ))}
          </div>

          {/* List Kartu YouTube Video Preview */}
          <div className="flex flex-col gap-[12px] w-full mt-1">
            {youtubeCards.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5 w-full">
                <span className="text-[13px] font-bold text-[#3D4127] line-clamp-2">
                  {item.judul}
                </span>
                <div className="w-full h-[120px] rounded-[12px] overflow-hidden relative shadow-sm border border-[#D3D8C3]">
                  <Image
                    src={item.image}
                    alt={item.judul}
                    fill
                    className="object-cover"
                  />
                  {/* YouTube Red Play Icon Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-10 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow">
                      <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
