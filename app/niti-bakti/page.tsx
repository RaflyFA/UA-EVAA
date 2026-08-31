"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function NitiBaktiPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    {
      id: "kampanye",
      title: "Kampanye Lingkungan",
      image: "/kampanye-lingkungan.png",
    },
    {
      id: "daur-ulang",
      title: "Daur Ulang",
      image: "/daur ulang.png",
    },
    {
      id: "konservasi",
      title: "Upaya Konservasi",
      image: "/Upaya Konservasi.png",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadStatus("uploading");

      // Simulasi loading unggah selama 2.5 detik
      setTimeout(() => {
        setUploadStatus("success");
      }, 2500);
    }
  };

  const handleBoxClick = () => {
    if (uploadStatus === "idle") {
      fileInputRef.current?.click();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-[140px] relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Header Niti Bakti - Lapisan 1: Dasaran Persegi Panjang Warna #EDF0E8 */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          {/* Lapisan 2: Gambar Lampiran Ilustrasi (Di atas #EDF0E8, di bawah Overlay Gradien) */}
          <div className="absolute right-0 top-0 bottom-0 w-[170px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/niti-bakti.png"
              alt="Niti Bakti Illustration"
              width={160}
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

          {/* Lapisan 4: Teks "Niti Bakti" & Subtitle (Paling Atas) */}
          <div className="relative z-30 w-full h-full p-6 flex flex-col justify-end gap-[12px]">
            <div className="flex flex-col gap-1 w-full max-w-[220px]">
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
                Niti Bakti
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "20px",
                  letterSpacing: "0%",
                  color: "#FBFFF3",
                }}
              >
                Aksi nyata dari tiga kategori lingkungan.
              </p>
            </div>
          </div>
        </div>

        {/* Section Pilih Kategori Aksi */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Pilih Kategori Aksi
          </h2>

          {/* Scrollable Container Kategori */}
          <div className="w-full flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-none w-[134px] h-[180px] bg-[#EDF0E8] rounded-[12px] p-[16px] flex flex-col items-center justify-between gap-[12px] cursor-pointer transition-all duration-200 snap-start border-2 ${
                    isSelected
                      ? "border-[#636B2F] shadow-sm bg-[#e4e8dc]"
                      : "border-transparent hover:border-[#D3D8C3]"
                  }`}
                >
                  <div className="w-full h-[96px] relative rounded-[8px] overflow-hidden flex items-center justify-center bg-[#D3D8C3]/30">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[13px] font-[600] text-[#3D4127] text-center leading-[16px] flex-1 flex items-center justify-center">
                    {cat.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Unggah Laporan */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Unggah Laporan
          </h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />

          {/* Render UI berdasarkan Status Unggahan */}
          {uploadStatus === "idle" ? (
            /* Mode Dashed Box Awal */
            <div
              onClick={handleBoxClick}
              className="w-full max-w-[306px] h-[159px] bg-[#EDF0E8] rounded-[11px] border-2 border-dashed border-[#D3D8C3] pb-[16px] flex flex-col items-center justify-center gap-[6px] cursor-pointer hover:border-[#636B2F] transition-colors select-none mx-auto"
            >
              <Image
                src="/icon-upload.svg"
                alt="Icon Upload"
                width={48}
                height={48}
                className="object-contain"
              />
              <p className="text-[12px] font-[500] leading-[18px] text-[#9CA08D] text-center px-4">
                Format PDF / Word, Maks 10 MB
              </p>
            </div>
          ) : (
            /* Mode Loading / Success Row (Sesuai Lampiran 1 & 2) */
            <div className="w-full max-w-[306px] h-[56px] rounded-[16px] border border-[#D3D8C3] bg-[#FBFFF3] px-4 flex items-center justify-between mx-auto shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <Image
                  src="/file.svg"
                  alt="File Icon"
                  width={28}
                  height={28}
                  className="object-contain flex-shrink-0"
                />
                <span className="text-[14px] font-[600] text-[#3D4127] truncate">
                  {uploadedFile?.name || "Laporan.pdf"}
                </span>
              </div>

              {uploadStatus === "uploading" ? (
                /* Spinner Loading (Lampiran 1) */
                <div className="w-6 h-6 border-2 border-[#9CA08D] border-t-[#636B2F] rounded-full animate-spin flex-shrink-0" />
              ) : (
                /* Tombol Batal/Hapus X (Lampiran 2) */
                <button
                  onClick={handleCancel}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 text-[#3D4127] transition-colors flex-shrink-0"
                  aria-label="Hapus file"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Lanjut ke Niti Sajati (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          {uploadStatus === "success" ? (
            <Link href="/niti-sajati" className="block w-full">
              <button className="w-full h-[56px] bg-[#5B6628] hover:bg-[#4d5722] text-[#FBFFF3] rounded-[120px] flex items-center justify-center gap-2.5 transition-colors shadow-lg focus:outline-none">
                <span className="text-[16px] font-semibold leading-[24px]">
                  Lanjut ke Niti Sajati
                </span>
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#5B6628] font-bold text-xs">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            </Link>
          ) : (
            <button
              disabled
              className="w-full h-[56px] bg-[#D3D8C3] text-[#9CA08D] rounded-[120px] flex items-center justify-center gap-2.5 cursor-not-allowed focus:outline-none"
            >
              <span className="text-[16px] font-semibold leading-[24px]">
                Lanjut ke Niti Sajati
              </span>
              <div className="w-6 h-6 rounded-full bg-[#9CA08D]/40 flex items-center justify-center text-[#9CA08D] font-bold text-xs">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Reusable */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
