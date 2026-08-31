"use client";

import Image from "next/image";
import Link from "next/link";

export default function GuruManajemenModulPage() {
  const modules = [
    {
      number: "1",
      title: "Niti Harti",
      description: "Pahami konsep dasar dan teorinya.",
      image: "/gambar 4.png",
    },
    {
      number: "2",
      title: "Niti Surti",
      description: "Mengelompokkan Informasi.",
      image: "/niti-surti.png",
    },
    {
      number: "3",
      title: "Niti Bukti",
      description: "Unggah dan Presentasikan.",
      image: "/niti-bukti-icon.png",
    },
    {
      number: "4",
      title: "Niti Bakti",
      description: "Aksi nyata dari tiga kategori lingkungan.",
      image: "/niti-bakti.png",
    },
    {
      number: "5",
      title: "Niti Sajati",
      description: "Pencapaian Pembelajaran.",
      image: "/niti-sajati.png",
    },
  ];

  return (
    <div className="w-full bg-[#FBFFF3] rounded-[16px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-6">
      {/* Header Content Section */}
      <div className="flex items-center justify-between w-full pb-2">
        <h1 className="text-[20px] font-bold text-[#3D4127]">Alur Modul</h1>

        <div className="flex items-center gap-4">
          {/* Tombol Salin Link */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 text-[#3D4127] transition-colors">
            <Image
              src="/guru/salinlink.svg"
              alt="Salin Link"
              width={18}
              height={18}
              className="object-contain"
            />
            <span className="text-[14px] font-semibold text-[#3D4127]">
              Salin Link
            </span>
          </button>

          {/* Tombol Opsi Titik 3 */}
          <button className="p-1.5 rounded-lg hover:bg-black/5 text-[#3D4127] transition-colors">
            <Image
              src="/guru/icon titik 3.svg"
              alt="Opsi"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Grid Alur Modul Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {modules.map((mod) => (
          <Link
            key={mod.number}
            href={`/guru/manajemen-modul/${mod.title.toLowerCase().replace(/\s+/g, "-")}`}
            className="block w-full"
          >
            <div className="relative w-full h-[180px] bg-[#EDF0E8] rounded-[20px] overflow-hidden shadow-md group cursor-pointer flex flex-col justify-end p-5 transition-transform duration-200 hover:-translate-y-1">
              {/* Lapisan Ilustrasi Gambar di Sebelah Kanan */}
              <div className="absolute right-0 top-0 bottom-0 w-[60%] pointer-events-none flex items-center justify-end z-10 opacity-90 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={mod.image}
                  alt={mod.title}
                  fill
                  className="object-contain object-right"
                />
              </div>

              {/* Lapisan Overlay Gradien #636B2F */}
              <div
                className="absolute inset-0 rounded-[20px] pointer-events-none z-20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
                }}
              />

              {/* Angka Besar Transparan di Kiri Atas (50% Opacity #FBFFF380) */}
              <span className="absolute top-3 left-4 z-30 font-bold text-[56px] leading-none text-[#FBFFF380] select-none">
                {mod.number}
              </span>

              {/* Konten Teks (Judul & Subtitle) di Bagian Bawah */}
              <div className="relative z-30 flex flex-col gap-1 pr-4">
                <h2 className="text-[22px] font-bold text-[#FBFFF3] leading-tight">
                  {mod.title}
                </h2>
                <p className="text-[13px] font-medium text-[#FBFFF3] leading-snug line-clamp-2 opacity-95">
                  {mod.description}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {/* Card 6: Tambahkan Alur */}
        <div className="w-full h-[180px] bg-[#EDF0E8]/60 hover:bg-[#EDF0E8] border-2 border-dashed border-[#D3D8C3] hover:border-[#636B2F] rounded-[20px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group">
          <div className="w-10 h-10 rounded-full bg-[#FBFFF3] flex items-center justify-center text-[#818671] group-hover:text-[#5B6628] group-hover:scale-110 transition-all shadow-sm">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[#818671] group-hover:text-[#5B6628] transition-colors">
            Tambahkan alur
          </span>
        </div>
      </div>
    </div>
  );
}
