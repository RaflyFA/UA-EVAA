"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface StageMeta {
  number: string;
  title: string;
  subtitle: string;
  bgFileName: string;
  bgImage: string;
  tahap: string;
}

const STAGE_CONFIG: Record<string, StageMeta> = {
  "niti-harti": {
    number: "1",
    title: "Niti Harti",
    subtitle: "Pahami konsep dasar dan teorinya.",
    bgFileName: "latarbelakang-1.jpg",
    bgImage: "/gambar 4.png",
    tahap: "harti",
  },
  "niti-surti": {
    number: "2",
    title: "Niti Surti",
    subtitle: "Mengelompokkan Informasi.",
    bgFileName: "latarbelakang-2.jpg",
    bgImage: "/niti-surti.png",
    tahap: "surti",
  },
  "niti-bukti": {
    number: "3",
    title: "Niti Bukti",
    subtitle: "Unggah dan Presentasikan.",
    bgFileName: "latarbelakang-3.jpg",
    bgImage: "/niti-bukti-icon.png",
    tahap: "bukti",
  },
  "niti-bakti": {
    number: "4",
    title: "Niti Bakti",
    subtitle: "Aksi nyata dari tiga kategori lingkungan.",
    bgFileName: "latarbelakang-4.jpg",
    bgImage: "/niti-bakti.png",
    tahap: "bakti",
  },
  "niti-sajati": {
    number: "5",
    title: "Niti Sajati",
    subtitle: "Pencapaian Pembelajaran.",
    bgFileName: "latarbelakang-5.jpg",
    bgImage: "/niti-sajati.png",
    tahap: "sajati",
  },
};

interface DeskripsiCard {
  id: string;
  judul: string;
  deskripsi: string;
}

interface YoutubeCard {
  id: string;
  judul: string;
  url: string;
  image: string;
}

export default function GuruEditModulPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "niti-harti";

  // Konfigurasi metadata modul berdasarkan slug
  const config = STAGE_CONFIG[rawSlug] || {
    number: "1",
    title: rawSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    subtitle: "Pahami konsep dan alur pembelajarannya.",
    bgFileName: "latarbelakang-1.jpg",
    bgImage: "/gambar 4.png",
    tahap: "harti",
  };

  // State form
  const [bgFileName, setBgFileName] = useState(config.bgFileName);
  const [judulModul, setJudulModul] = useState(config.title);
  const [deskripsiModul, setDeskripsiModul] = useState(config.subtitle);

  // State Kartu Deskripsi (Bahan Bacaan)
  const [deskripsiCards, setDeskripsiCards] = useState<DeskripsiCard[]>([
    {
      id: "desc-1",
      judul: "Bahan Bacaan 1",
      deskripsi:
        "Pengenalan konsep dasar ekosistem, komponen biotik dan abiotik, serta interaksi antar makhluk hidup dalam lingkungan alam.",
    },
    {
      id: "desc-2",
      judul: "Bahan Bacaan 2",
      deskripsi:
        "Studi mengenai kearifan lokal masyarakat adat dalam pelestarian alam dan menjaga keseimbangan ekosistem secara berkelanjutan.",
    },
    {
      id: "desc-3",
      judul: "Bahan Bacaan 3",
      deskripsi:
        "Prinsip-prinsip pembelajaran dalam memahami ilmu pengetahuan dan penerapan teoritis pada kehidupan sehari-hari.",
    },
  ]);

  // State Kartu YouTube
  const [youtubeCards, setYoutubeCards] = useState<YoutubeCard[]>([
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

  // Status loading, saving, notification, dan accordion preview
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState<Record<string, boolean>>({});

  // 1. Fetch konten dari Supabase saat slug berubah
  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("konten_modul")
          .select("*")
          .eq("tahap_niti", config.tahap)
          .order("urutan", { ascending: true });

        if (!error && data && data.length > 0) {
          const loadedBacaan = data
            .filter((item) => item.tipe_konten === "bacaan")
            .map((item) => ({
              id: item.id,
              judul: item.judul || "Bahan Bacaan",
              deskripsi: item.deskripsi || "",
            }));

          const loadedVideos = data
            .filter((item) => item.tipe_konten === "video")
            .map((item, idx) => ({
              id: item.id,
              judul: item.judul || "Video Pembelajaran",
              url: item.url_youtube || "",
              image: idx % 2 === 0 ? "/lampiran-2.png" : "/lampiran-3.png",
            }));

          if (loadedBacaan.length > 0) {
            setDeskripsiCards(loadedBacaan);
          }
          if (loadedVideos.length > 0) {
            setYoutubeCards(loadedVideos);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data konten modul:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [config.tahap]);

  // 2. Handler Tambah Kartu Deskripsi
  const handleAddDeskripsi = () => {
    const nextNumber = deskripsiCards.length + 1;
    const newCard: DeskripsiCard = {
      id: `desc-${Date.now()}`,
      judul: `Bahan Bacaan ${nextNumber}`,
      deskripsi: "Tuliskan materi dan deskripsi bacaan di sini...",
    };
    setDeskripsiCards([...deskripsiCards, newCard]);
  };

  // 3. Handler Duplicate Kartu Deskripsi
  const handleDuplicateDeskripsi = (index: number) => {
    const target = deskripsiCards[index];
    const duplicated: DeskripsiCard = {
      id: `desc-${Date.now()}`,
      judul: `${target.judul} (Salinan)`,
      deskripsi: target.deskripsi,
    };
    const updated = [...deskripsiCards];
    updated.splice(index + 1, 0, duplicated);
    setDeskripsiCards(updated);
  };

  // 4. Handler Hapus Kartu Deskripsi
  const handleDeleteDeskripsi = (index: number) => {
    if (deskripsiCards.length <= 1) {
      alert("Minimal harus ada 1 Kartu Deskripsi.");
      return;
    }
    const updated = deskripsiCards.filter((_, i) => i !== index);
    setDeskripsiCards(updated);
  };

  // 5. Handler Tambah Kartu YouTube
  const handleAddYoutube = () => {
    const newCard: YoutubeCard = {
      id: `yt-${Date.now()}`,
      judul: "Video Pembelajaran Baru",
      url: "https://www.youtube.com/watch?v=...",
      image: "/lampiran-2.png",
    };
    setYoutubeCards([...youtubeCards, newCard]);
  };

  // 6. Handler Duplicate Kartu YouTube
  const handleDuplicateYoutube = (index: number) => {
    const target = youtubeCards[index];
    const duplicated: YoutubeCard = {
      id: `yt-${Date.now()}`,
      judul: `${target.judul} (Salinan)`,
      url: target.url,
      image: target.image,
    };
    const updated = [...youtubeCards];
    updated.splice(index + 1, 0, duplicated);
    setYoutubeCards(updated);
  };

  // 7. Handler Hapus Kartu YouTube
  const handleDeleteYoutube = (index: number) => {
    const updated = youtubeCards.filter((_, i) => i !== index);
    setYoutubeCards(updated);
  };

  // 8. Handler Simpan Perubahan ke Supabase
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      // Ambil profile guru aktif (jika ada)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Hapus data lama untuk bab/tahap ini agar sinkron
      await supabase
        .from("konten_modul")
        .delete()
        .eq("tahap_niti", config.tahap);

      // Siapkan baris baru kartu bacaan
      const rowsBacaan = deskripsiCards.map((card, idx) => ({
        tahap_niti: config.tahap,
        tipe_konten: "bacaan",
        judul: card.judul,
        deskripsi: card.deskripsi,
        urutan: idx + 1,
        dibuat_oleh: user?.id || null,
      }));

      // Siapkan baris baru kartu video
      const rowsVideo = youtubeCards.map((card, idx) => ({
        tahap_niti: config.tahap,
        tipe_konten: "video",
        judul: card.judul,
        url_youtube: card.url,
        urutan: deskripsiCards.length + idx + 1,
        dibuat_oleh: user?.id || null,
      }));

      const allRows = [...rowsBacaan, ...rowsVideo];

      if (allRows.length > 0) {
        const { error: insertError } = await supabase
          .from("konten_modul")
          .insert(allRows);

        if (insertError) throw insertError;
      }

      setNotification({
        type: "success",
        message: "Perubahan modul berhasil disimpan ke database!",
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error("Gagal menyimpan perubahan modul:", err);
      setNotification({
        type: "error",
        message:
          "Gagal menyimpan ke database: " +
          (err.message || "Terjadi kesalahan koneksi"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper untuk toggle accordion preview
  const togglePreviewAccordion = (id: string) => {
    setPreviewExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toast Notifikasi */}
      {notification && (
        <div
          className={`w-full max-w-[1158px] p-4 rounded-[12px] font-medium text-[14px] flex items-center justify-between shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
              : "bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-[12px] underline ml-4 hover:opacity-75"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Bar Main Content */}
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
          <span className="font-medium text-[#3D4127]">{judulModul}</span>
          {isLoading && (
            <span className="text-[12px] text-[#636B2F] animate-pulse ml-2">
              (Memuat data...)
            </span>
          )}
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-4">
          <Link
            href="/guru/manajemen-modul"
            className="text-[#636B2F] font-semibold text-[14px] hover:opacity-80 transition-opacity"
          >
            Batalkan
          </Link>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-[#636B2F] text-[#FBFFF3] rounded-[12px] px-5 py-2 font-semibold text-[14px] hover:bg-[#525826] shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>

      {/* Grid Content: Editor Kiri (828px) & Preview Kanan (318px) */}
      <div className="w-full max-w-[1158px] flex gap-[12px] items-start">
        {/* ================= EDITOR KIRI (828px) ================= */}
        <div className="w-[828px] flex-shrink-0 flex flex-col gap-[16px]">
          {/* 1. KARTU DASAR */}
          <div className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#3D4127]">
                Kartu Dasar ({config.title})
              </h2>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#636B2F] bg-[#EDF0E8] px-2.5 py-1 rounded-full border border-[#D3D8C3]/50">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Struktur Kurikulum Terkunci
              </span>
            </div>

            {/* Field Latar Belakang */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#3D4127]/60">
                Latar Belakang
              </label>
              <div className="w-full bg-[#EDF0E8]/70 rounded-[12px] p-3 flex items-center justify-between border border-[#D3D8C3]/40">
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
                  <span className="text-[14px] font-medium text-[#3D4127]/80">
                    {bgFileName || "latarbelakang-modul.jpg"}
                  </span>
                </div>
              </div>
            </div>

            {/* Field Judul Alur Modul (Terkunci) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#3D4127]/60">
                  Judul Alur Modul
                </label>
                <span className="text-[11px] text-[#3D4127]/50 italic">
                  Tidak dapat diubah
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={judulModul}
                  readOnly
                  tabIndex={-1}
                  className="w-full bg-[#EDF0E8]/60 text-[#3D4127]/70 font-semibold text-[14px] rounded-[12px] p-3 pr-10 border border-[#D3D8C3]/50 cursor-not-allowed select-none focus:outline-none"
                />
                <div className="absolute right-3 text-[#3D4127]/40 pointer-events-none">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Field Subtitle / Deskripsi Alur Modul (Terkunci) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#3D4127]/60">
                  Deskripsi Singkat Modul
                </label>
                <span className="text-[11px] text-[#3D4127]/50 italic">
                  Tidak dapat diubah
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={deskripsiModul}
                  readOnly
                  tabIndex={-1}
                  className="w-full bg-[#EDF0E8]/60 text-[#3D4127]/70 font-semibold text-[14px] rounded-[12px] p-3 pr-10 border border-[#D3D8C3]/50 cursor-not-allowed select-none focus:outline-none"
                />
                <div className="absolute right-3 text-[#3D4127]/40 pointer-events-none">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <p className="text-[11.5px] text-[#3D4127]/60 bg-[#EDF0E8]/40 p-2.5 rounded-[8px] border border-[#D3D8C3]/30">
              💡 <strong>Catatan:</strong> Nama dan deskripsi alur bab ditetapkan secara baku sesuai kurikulum. Anda dapat mengelola materi <strong>Kartu Deskripsi (Bahan Bacaan)</strong> dan <strong>Kartu YouTube</strong> di bawah ini.
            </p>
          </div>

          {/* 2. KARTU DESKRIPSI (LIST BAHAN BACAAN) */}
          <div className="flex flex-col gap-[12px]">
            {deskripsiCards.map((card, idx) => (
              <div
                key={card.id}
                className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]"
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
                      Kartu Deskripsi #{idx + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateDeskripsi(idx)}
                      title="Duplikat Kartu"
                      className="p-1.5 hover:bg-black/5 rounded transition-colors cursor-pointer"
                    >
                      <Image
                        src="/guru/icon salin.svg"
                        alt="Duplicate"
                        width={18}
                        height={18}
                        className="object-contain opacity-70"
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteDeskripsi(idx)}
                      title="Hapus Kartu"
                      className="p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer text-red-600"
                    >
                      <Image
                        src="/guru/icon delet.svg"
                        alt="Delete"
                        width={18}
                        height={18}
                        className="object-contain opacity-70 hover:opacity-100"
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

            {/* Tombol Tambah Kartu Deskripsi Baru */}
            <button
              onClick={handleAddDeskripsi}
              className="w-full py-3 bg-[#EDF0E8]/70 hover:bg-[#EDF0E8] border-2 border-dashed border-[#D3D8C3] hover:border-[#636B2F] rounded-[16px] flex items-center justify-center gap-2 text-[#636B2F] font-bold text-[14px] transition-all cursor-pointer shadow-sm"
            >
              <svg
                width="20"
                height="20"
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
              <span>Tambah Kartu Deskripsi Baru</span>
            </button>
          </div>

          {/* 3. KARTU YOUTUBE */}
          <div className="flex flex-col gap-[12px]">
            {youtubeCards.map((card, idx) => (
              <div
                key={card.id}
                className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]"
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
                      Kartu YouTube #{idx + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateYoutube(idx)}
                      title="Duplikat Video"
                      className="p-1.5 hover:bg-black/5 rounded transition-colors cursor-pointer"
                    >
                      <Image
                        src="/guru/icon salin.svg"
                        alt="Duplicate"
                        width={18}
                        height={18}
                        className="object-contain opacity-70"
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteYoutube(idx)}
                      title="Hapus Video"
                      className="p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer text-red-600"
                    >
                      <Image
                        src="/guru/icon delet.svg"
                        alt="Delete"
                        width={18}
                        height={18}
                        className="object-contain opacity-70 hover:opacity-100"
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
                        Judul Video
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
                        placeholder="https://www.youtube.com/watch?v=..."
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
                      Pratinjau Video
                    </label>
                    <div className="w-full h-[110px] rounded-[12px] overflow-hidden relative shadow-sm border border-[#D3D8C3] bg-black/5 flex items-center justify-center">
                      <Image
                        src={card.image || "/lampiran-2.png"}
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

            {/* Tombol Tambah Kartu YouTube Baru */}
            <button
              onClick={handleAddYoutube}
              className="w-full py-3 bg-[#EDF0E8]/70 hover:bg-[#EDF0E8] border-2 border-dashed border-[#D3D8C3] hover:border-[#636B2F] rounded-[16px] flex items-center justify-center gap-2 text-[#636B2F] font-bold text-[14px] transition-all cursor-pointer shadow-sm"
            >
              <svg
                width="20"
                height="20"
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
              <span>Tambah Kartu YouTube Baru</span>
            </button>
          </div>
        </div>

        {/* ================= PANEL PREVIEW KANAN (318px x 885px) ================= */}
        <div className="w-[318px] min-h-[885px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] p-[16px] flex flex-col gap-[14px] sticky top-[76px] shadow-sm">
          {/* Label Preview */}
          <div className="w-full text-center text-[13px] font-bold text-[#636B2F] bg-[#EDF0E8] py-1 rounded-md">
            Pratinjau Tampilan Siswa
          </div>

          {/* Kartu Modul Header Preview */}
          <div className="relative w-full h-[140px] rounded-[16px] overflow-hidden shadow-md p-4 flex flex-col justify-end">
            <Image
              src={config.bgImage || "/gambar 4.png"}
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
            {deskripsiCards.map((item) => {
              const isOpen = previewExpanded[item.id] ?? false;
              return (
                <div
                  key={item.id}
                  className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[12px] p-3 flex flex-col shadow-sm transition-all"
                >
                  <div
                    onClick={() => togglePreviewAccordion(item.id)}
                    className="flex items-center justify-between text-[14px] font-semibold text-[#3D4127] cursor-pointer"
                  >
                    <span className="line-clamp-1">{item.judul}</span>
                    <Image
                      src="/guru/panah bawah.svg"
                      alt="Expand"
                      width={14}
                      height={14}
                      className={`object-contain opacity-70 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <p className="text-[12px] text-[#3D4127]/80 mt-2 pt-2 border-t border-[#D3D8C3]/50 leading-relaxed">
                      {item.deskripsi || "(Belum ada deskripsi bacaan)"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* List Kartu YouTube Video Preview */}
          <div className="flex flex-col gap-[12px] w-full mt-1">
            {youtubeCards.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5 w-full">
                <span className="text-[13px] font-bold text-[#3D4127] line-clamp-2">
                  {item.judul}
                </span>
                <div className="w-full h-[120px] rounded-[12px] overflow-hidden relative shadow-sm border border-[#D3D8C3] bg-black/5">
                  <Image
                    src={item.image || "/lampiran-2.png"}
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
