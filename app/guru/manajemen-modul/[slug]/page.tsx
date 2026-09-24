"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ToastNotification from "@/components/ToastNotification";

interface StageMeta {
  number: string;
  title: string;
  subtitle: string;
  bgFileName: string;
  bgImage: string;
  tahap: "harti" | "surti" | "bukti" | "bakti" | "sajati";
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

// Helper untuk mengekstrak Video ID & Thumbnail YouTube
function getYoutubeVideoId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

function getYoutubeThumbnail(url?: string): string | null {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
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
    tahap: "harti" as const,
  };

  // State form umum
  const [bgFileName] = useState(config.bgFileName);
  const [judulModul] = useState(config.title);
  const [deskripsiModul] = useState(config.subtitle);

  // State khusus Niti Harti
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

  // State khusus Niti Surti (Instruksi / Studi Kasus)
  const [instruksiSurti, setInstruksiSurti] = useState(
    "Amati fenomena dan permasalahan lingkungan di sekitar sekolah atau tempat tinggal Anda. Rumuskan masalah utama yang ditemukan serta alternatif solusi nyata yang dapat diterapkan secara berkelanjutan."
  );

  // State khusus Niti Bukti (Panduan & Syarat Tugas)
  const [panduanBukti, setPanduanBukti] = useState(
    "Susun dokumen rencana aksi proyek lingkungan secara berkelompok. Unggah laporan dokumen dalam format PDF (maksimal 10 MB) sebagai bukti pemahaman sebelum melanjutkan ke tahap aksi nyata."
  );

  // State khusus Niti Bakti (Panduan Aksi Lingkungan)
  const [panduanBakti, setPanduanBakti] = useState(
    "Pilihlah salah satu dari 3 kategori aksi lingkungan (Daur Ulang Sampah, Menanam Pohon, atau Gerakan Hemat Energi). Laksanakan aksi tersebut bersama kelompok, dokumentasikan, lalu unggah laporan PDF bukti aksi Anda."
  );

  // State khusus Niti Sajati (Pesan Apresiasi & Refleksi)
  const [ucapanSajati, setUcapanSajati] = useState(
    "Selamat! Anda telah menuntaskan seluruh rangkaian proses pembelajaran Niti Panca Jena dengan penuh dedikasi. Teruslah menjadi pelopor penjaga kelestarian lingkungan dan terapkan nilai kearifan lokal dalam keseharian!"
  );

  // Status loading, saving, notification, dan accordion preview
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState<Record<string, boolean>>({});

  // Kategori aksi khusus pratinjau Niti Bakti (sinkron dengan halaman siswa)
  const baktiCategories = [
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
  const [previewSelectedCategory, setPreviewSelectedCategory] = useState<string>("daur-ulang");

  // 1. Fetch konten dari Supabase saat slug/tahap berubah
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
          if (config.tahap === "harti") {
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
                image: getYoutubeThumbnail(item.url_youtube) || (idx % 2 === 0 ? "/lampiran-2.png" : "/lampiran-3.png"),
              }));

            if (loadedBacaan.length > 0) setDeskripsiCards(loadedBacaan);
            if (loadedVideos.length > 0) setYoutubeCards(loadedVideos);
          } else if (config.tahap === "surti") {
            const item = data.find((d) => d.tipe_konten === "instruksi");
            if (item?.deskripsi) setInstruksiSurti(item.deskripsi);
          } else if (config.tahap === "bukti") {
            const item = data.find((d) => d.tipe_konten === "panduan_tugas");
            if (item?.deskripsi) setPanduanBukti(item.deskripsi);
          } else if (config.tahap === "bakti") {
            const item = data.find((d) => d.tipe_konten === "panduan_tugas");
            if (item?.deskripsi) setPanduanBakti(item.deskripsi);
          } else if (config.tahap === "sajati") {
            const item = data.find((d) => d.tipe_konten === "ucapan_selamat");
            if (item?.deskripsi) setUcapanSajati(item.deskripsi);
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

  // Handler Niti Harti (Bacaan)
  const handleAddDeskripsi = () => {
    const nextNumber = deskripsiCards.length + 1;
    const newCard: DeskripsiCard = {
      id: `desc-${Date.now()}`,
      judul: `Bahan Bacaan ${nextNumber}`,
      deskripsi: "Tuliskan materi dan deskripsi bacaan di sini...",
    };
    setDeskripsiCards([...deskripsiCards, newCard]);
  };

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

  const handleDeleteDeskripsi = (index: number) => {
    if (deskripsiCards.length <= 1) {
      setNotification({
        type: "error",
        message: "Minimal harus ada 1 Kartu Deskripsi.",
      });
      return;
    }
    const updated = deskripsiCards.filter((_, i) => i !== index);
    setDeskripsiCards(updated);
  };

  // Handler Niti Harti (Video)
  const handleAddYoutube = () => {
    const newCard: YoutubeCard = {
      id: `yt-${Date.now()}`,
      judul: "Video Pembelajaran Baru",
      url: "https://www.youtube.com/watch?v=...",
      image: "/lampiran-2.png",
    };
    setYoutubeCards([...youtubeCards, newCard]);
  };

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

  const handleDeleteYoutube = (index: number) => {
    const updated = youtubeCards.filter((_, i) => i !== index);
    setYoutubeCards(updated);
  };

  // Handler Simpan Perubahan ke Supabase
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Hapus data lama untuk tahap ini agar sinkron
      await supabase
        .from("konten_modul")
        .delete()
        .eq("tahap_niti", config.tahap);

      let rowsToInsert: any[] = [];

      if (config.tahap === "harti") {
        const rowsBacaan = deskripsiCards.map((card, idx) => ({
          tahap_niti: "harti",
          tipe_konten: "bacaan",
          judul: card.judul,
          deskripsi: card.deskripsi,
          urutan: idx + 1,
          dibuat_oleh: user?.id || null,
        }));

        const rowsVideo = youtubeCards.map((card, idx) => ({
          tahap_niti: "harti",
          tipe_konten: "video",
          judul: card.judul,
          url_youtube: card.url,
          urutan: deskripsiCards.length + idx + 1,
          dibuat_oleh: user?.id || null,
        }));

        rowsToInsert = [...rowsBacaan, ...rowsVideo];
      } else if (config.tahap === "surti") {
        rowsToInsert = [
          {
            tahap_niti: "surti",
            tipe_konten: "instruksi",
            judul: "Instruksi Studi Kasus",
            deskripsi: instruksiSurti,
            urutan: 1,
            dibuat_oleh: user?.id || null,
          },
        ];
      } else if (config.tahap === "bukti") {
        rowsToInsert = [
          {
            tahap_niti: "bukti",
            tipe_konten: "panduan_tugas",
            judul: "Panduan Tugas Rencana Aksi",
            deskripsi: panduanBukti,
            urutan: 1,
            dibuat_oleh: user?.id || null,
          },
        ];
      } else if (config.tahap === "bakti") {
        rowsToInsert = [
          {
            tahap_niti: "bakti",
            tipe_konten: "panduan_tugas",
            judul: "Panduan Aksi Nyata Lingkungan",
            deskripsi: panduanBakti,
            urutan: 1,
            dibuat_oleh: user?.id || null,
          },
        ];
      } else if (config.tahap === "sajati") {
        rowsToInsert = [
          {
            tahap_niti: "sajati",
            tipe_konten: "ucapan_selamat",
            judul: "Pesan Refleksi & Apresiasi",
            deskripsi: ucapanSajati,
            urutan: 1,
            dibuat_oleh: user?.id || null,
          },
        ];
      }

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("konten_modul")
          .insert(rowsToInsert);

        if (insertError) throw insertError;
      }

      setNotification({
        type: "success",
        message: `Konten untuk ${config.title} berhasil disimpan ke database!`,
      });
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
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
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
          {/* 1. KARTU DASAR (Sama untuk semua bab) */}
          <div className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#3D4127]">
                Kartu Dasar ({config.title})
              </h2>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#636B2F] bg-[#EDF0E8] px-2.5 py-1 rounded-full border border-[#D3D8C3]/50">
                
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
                  Baku dari kurikulum
                </span>
              </div>
              <input
                type="text"
                value={judulModul}
                readOnly
                tabIndex={-1}
                className="w-full bg-[#EDF0E8]/60 text-[#3D4127]/70 font-semibold text-[14px] rounded-[12px] p-3 border border-[#D3D8C3]/50 cursor-not-allowed select-none focus:outline-none"
              />
            </div>

            {/* Field Subtitle / Deskripsi Alur Modul (Terkunci) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#3D4127]/60">
                  Deskripsi Singkat Modul
                </label>
                <span className="text-[11px] text-[#3D4127]/50 italic">
                  Baku dari kurikulum
                </span>
              </div>
              <input
                type="text"
                value={deskripsiModul}
                readOnly
                tabIndex={-1}
                className="w-full bg-[#EDF0E8]/60 text-[#3D4127]/70 font-semibold text-[14px] rounded-[12px] p-3 border border-[#D3D8C3]/50 cursor-not-allowed select-none focus:outline-none"
              />
            </div>
          </div>

          {/* ================= 2. KONTEN SPESIFIK BERDASARKAN TAHAP ================= */}

          {/* A. KHUSUS TAHAP 1: NITI HARTI (Bahan Bacaan & Video) */}
          {config.tahap === "harti" && (
            <>
              {/* List Kartu Deskripsi Bacaan */}
              <div className="flex flex-col gap-[12px]">
                {deskripsiCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]"
                  >
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
                          className="p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer"
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

              {/* List Kartu YouTube Video */}
              <div className="flex flex-col gap-[12px]">
                {youtubeCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[12px] shadow-[0px_2px_2px_0px_#00000040]"
                  >
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
                          className="p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer"
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

                    <div className="flex gap-4 w-full items-start">
                      <div className="flex-1 flex flex-col gap-[12px]">
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
                              const newUrl = e.target.value;
                              newCards[idx].url = newUrl;
                              newCards[idx].image = getYoutubeThumbnail(newUrl) || card.image;
                              setYoutubeCards(newCards);
                            }}
                            className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="w-[200px] flex flex-col gap-1 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-medium text-[#3D4127]/60">
                            Pratinjau Video
                          </label>
                          {getYoutubeVideoId(card.url) && (
                            <a
                              href={`https://www.youtube.com/watch?v=${getYoutubeVideoId(card.url)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#636B2F] hover:underline font-semibold"
                              title="Buka di YouTube"
                            >
                              Buka ↗
                            </a>
                          )}
                        </div>
                        <div className="w-full h-[110px] rounded-[12px] overflow-hidden relative shadow-sm border border-[#D3D8C3] bg-black/5 flex items-center justify-center">
                          {(() => {
                            const thumbUrl = getYoutubeThumbnail(card.url) || card.image || "/lampiran-2.png";
                            return (
                              <>
                                <img
                                  src={thumbUrl}
                                  alt={card.judul}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/lampiran-2.png";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                  <div className="w-8 h-6 bg-red-600 rounded-md flex items-center justify-center shadow">
                                    <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5" />
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

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
            </>
          )}

          {/* B. KHUSUS TAHAP 2: NITI SURTI (Teks Instruksi / Studi Kasus) */}
          {config.tahap === "surti" && (
            <div className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-[0px_2px_2px_0px_#00000040]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#3D4127]">
                    Teks Instruksi & Studi Kasus Siswa
                  </h3>
                  <p className="text-[13px] text-[#3D4127]/70 mt-1">
                    Teks ini akan dibaca oleh siswa di halaman Niti Surti sebagai pengantar sebelum mereka mengidentifikasi masalah dan merumuskan alternatif solusi.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#3D4127]">
                  Uraian Studi Kasus & Petunjuk Tugas
                </label>
                <textarea
                  value={instruksiSurti}
                  onChange={(e) => setInstruksiSurti(e.target.value)}
                  rows={8}
                  placeholder="Ketik studi kasus, fenomena lingkungan, atau instruksi langkah kerja untuk siswa..."
                  className="w-full bg-[#EDF0E8] rounded-[12px] p-4 text-[#3D4127] text-[14px] leading-relaxed border border-[#D3D8C3]/50 focus:outline-none focus:border-[#636B2F] transition-colors"
                />
              </div>

              <div className="p-3 bg-[#EDF0E8]/50 rounded-[10px] border border-[#D3D8C3]/40 text-[12px] text-[#3D4127]/80 flex items-center gap-2">
                
                <span>
                  Setelah membaca instruksi ini, siswa akan mengisi form <strong>Masalah Yang Ditemukan</strong>, <strong>Alternatif Solusi</strong>, dan melakukan <strong>Validasi Kebenaran Informasi</strong>.
                </span>
              </div>
            </div>
          )}

          {/* C. KHUSUS TAHAP 3: NITI BUKTI (Panduan Rencana Aksi) */}
          {config.tahap === "bukti" && (
            <div className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-[0px_2px_2px_0px_#00000040]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#3D4127]">
                    Panduan & Syarat Dokumen Rencana Aksi
                  </h3>
                  <p className="text-[13px] text-[#3D4127]/70 mt-1">
                    Teks panduan yang akan dibaca siswa di halaman Niti Bukti sebelum mengunggah file laporan PDF rencana aksi kelompok mereka.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#3D4127]">
                  Uraian Panduan & Kriteria Penilaian
                </label>
                <textarea
                  value={panduanBukti}
                  onChange={(e) => setPanduanBukti(e.target.value)}
                  rows={8}
                  placeholder="Ketik kriteria tugas, format penulisan, sistematika laporan aksi..."
                  className="w-full bg-[#EDF0E8] rounded-[12px] p-4 text-[#3D4127] text-[14px] leading-relaxed border border-[#D3D8C3]/50 focus:outline-none focus:border-[#636B2F] transition-colors"
                />
              </div>

              <div className="p-3 bg-[#EDF0E8]/50 rounded-[10px] border border-[#D3D8C3]/40 text-[12px] text-[#3D4127]/80 flex items-center gap-2">
                
                <span>
                  Siswa wajib mengunggah file dokumen dalam format PDF (maks. 10 MB) sesuai panduan di atas agar dapat dinilai oleh guru.
                </span>
              </div>
            </div>
          )}

          {/* D. KHUSUS TAHAP 4: NITI BAKTI (Panduan Aksi Nyata) */}
          {config.tahap === "bakti" && (
            <div className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-[0px_2px_2px_0px_#00000040]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#3D4127]">
                    Panduan Pelaksanaan Aksi Nyata Lingkungan
                  </h3>
                  <p className="text-[13px] text-[#3D4127]/70 mt-1">
                    Petunjuk operasional aksi nyata untuk 3 kategori lingkungan (Daur Ulang, Menanam Pohon, Hemat Energi) serta ketentuan dokumentasinya.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#3D4127]">
                  Uraian Petunjuk Aksi & Bukti Kegiatan
                </label>
                <textarea
                  value={panduanBakti}
                  onChange={(e) => setPanduanBakti(e.target.value)}
                  rows={8}
                  placeholder="Ketik instruksi pelaksanaan aksi lingkungan, kriteria foto/video dokumentasi, serta sistematika laporan..."
                  className="w-full bg-[#EDF0E8] rounded-[12px] p-4 text-[#3D4127] text-[14px] leading-relaxed border border-[#D3D8C3]/50 focus:outline-none focus:border-[#636B2F] transition-colors"
                />
              </div>

              <div className="p-3 bg-[#EDF0E8]/50 rounded-[10px] border border-[#D3D8C3]/40 text-[12px] text-[#3D4127]/80 flex items-center gap-2">
                <span>
                  Siswa akan memilih kategori aksi yang mereka laksanakan, lalu mengunggah berkas PDF laporan kegiatan nyata tersebut.
                </span>
              </div>
            </div>
          )}

          {/* E. KHUSUS TAHAP 5: NITI SAJATI (Apresiasi & Refleksi) */}
          {config.tahap === "sajati" && (
            <div className="w-[828px] bg-[#FBFFF3] rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-[0px_2px_2px_0px_#00000040]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#3D4127]">
                    Pesan Apresiasi & Refleksi Pembelajaran
                  </h3>
                  <p className="text-[13px] text-[#3D4127]/70 mt-1">
                    Pesan hangat atau kata-kata motivasi penutup dari Guru yang akan dibaca siswa ketika berhasil menuntaskan seluruh 5 bab alur Niti Panca Jena.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#3D4127]">
                  Teks Ucapan Selamat & Penguatan Karakter
                </label>
                <textarea
                  value={ucapanSajati}
                  onChange={(e) => setUcapanSajati(e.target.value)}
                  rows={8}
                  placeholder="Ketik pesan selamat, dorongan moral, atau refleksi kelestarian lingkungan untuk siswa..."
                  className="w-full bg-[#EDF0E8] rounded-[12px] p-4 text-[#3D4127] text-[14px] leading-relaxed border border-[#D3D8C3]/50 focus:outline-none focus:border-[#636B2F] transition-colors"
                />
              </div>

              <div className="p-3 bg-[#EDF0E8]/50 rounded-[10px] border border-[#D3D8C3]/40 text-[12px] text-[#3D4127]/80 flex items-center gap-2">
                <span>💡</span>
                <span>
                  Halaman Niti Sajati merupakan penutup rangkaian materi tempat siswa melihat lencana capaian dan memperoleh sertifikat penghargaan.
                </span>
              </div>
            </div>
          )}
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

          {/* PREVIEW KHUSUS NITI HARTI */}
          {config.tahap === "harti" && (
            <>
              {/* List Bahan Bacaan (Accordion Items) */}
              <div className="flex flex-col gap-[8px] w-full">
                <span className="text-[12px] font-bold text-[#3D4127]/70 uppercase tracking-wider">
                  Bahan Bacaan
                </span>
                {deskripsiCards.map((item) => {
                  const isOpen = previewExpanded[item.id] ?? false;
                  return (
                    <div
                      key={item.id}
                      className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[12px] p-3 flex flex-col shadow-sm transition-all"
                    >
                      <div
                        onClick={() => togglePreviewAccordion(item.id)}
                        className="flex items-center justify-between text-[13px] font-semibold text-[#3D4127] cursor-pointer"
                      >
                        <span className="line-clamp-1">{item.judul}</span>
                        <Image
                          src="/guru/panah bawah.svg"
                          alt="Expand"
                          width={12}
                          height={12}
                          className={`object-contain opacity-70 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {isOpen && (
                        <p className="text-[11.5px] text-[#3D4127]/80 mt-2 pt-2 border-t border-[#D3D8C3]/50 leading-relaxed">
                          {item.deskripsi || "(Belum ada deskripsi bacaan)"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* List Kartu YouTube Video Preview */}
              <div className="flex flex-col gap-[10px] w-full mt-1">
                <span className="text-[12px] font-bold text-[#3D4127]/70 uppercase tracking-wider">
                  Video Pembelajaran
                </span>
                {youtubeCards.map((item) => {
                  const thumb = getYoutubeThumbnail(item.url) || item.image || "/lampiran-2.png";
                  return (
                    <div key={item.id} className="flex flex-col gap-1 w-full">
                      <span className="text-[12px] font-bold text-[#3D4127] line-clamp-1">
                        {item.judul}
                      </span>
                      <div className="w-full h-[110px] rounded-[12px] overflow-hidden relative shadow-sm border border-[#D3D8C3] bg-black/5">
                        <img
                          src={thumb}
                          alt={item.judul}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/lampiran-2.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-8 h-6 bg-red-600 rounded-md flex items-center justify-center shadow">
                            <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* PREVIEW KHUSUS NITI SURTI */}
          {config.tahap === "surti" && (
            <div className="flex flex-col gap-3 w-full">
              {/* Box Instruksi Studi Kasus dari Guru */}
              <div className="w-full bg-[#FBFFF3] border-2 border-[#636B2F]/30 rounded-[14px] p-3 flex flex-col gap-1.5 shadow-sm">
                <span className="text-[12px] font-bold text-[#636B2F] flex items-center gap-1">
                  Instruksi & Studi Kasus
                </span>
                <p className="text-[12px] text-[#3D4127] leading-relaxed line-clamp-6">
                  {instruksiSurti || "(Belum ada teks instruksi)"}
                </p>
              </div>

              {/* Mockup Form Input Siswa */}
              <div className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] p-3 flex flex-col gap-1 shadow-sm opacity-90">
                <span className="text-[12px] font-semibold text-[#3D4127]">
                  Masalah Yang Ditemukan
                </span>
                <div className="w-full h-7 bg-[#EDF0E8]/70 rounded-[6px] border border-[#D3D8C3]/60 px-2 flex items-center text-[11px] text-[#3D4127]/40">
                  Ketik masalah...
                </div>
              </div>

              <div className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] p-3 flex flex-col gap-1 shadow-sm opacity-90">
                <span className="text-[12px] font-semibold text-[#3D4127]">
                  Alternatif Solusi
                </span>
                <div className="w-full h-7 bg-[#EDF0E8]/70 rounded-[6px] border border-[#D3D8C3]/60 px-2 flex items-center text-[11px] text-[#3D4127]/40">
                  Ketik solusi...
                </div>
              </div>

              <div className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] p-2.5 flex items-center gap-2 shadow-sm">
                <div className="w-4 h-4 rounded-full border-2 border-[#636B2F] bg-[#636B2F] flex items-center justify-center">
                  <span className="text-white text-[9px]">✓</span>
                </div>
                <span className="text-[11px] font-semibold text-[#3D4127]">
                  Memvalidasi Kebenaran Informasi
                </span>
              </div>
            </div>
          )}

          {/* PREVIEW KHUSUS NITI BUKTI */}
          {config.tahap === "bukti" && (
            <div className="flex flex-col gap-3 w-full">
              {/* Box Panduan Tugas dari Guru */}
              <div className="w-full bg-[#FBFFF3] border-2 border-[#636B2F]/30 rounded-[14px] p-3 flex flex-col gap-1.5 shadow-sm">
                <span className="text-[12px] font-bold text-[#636B2F] flex items-center gap-1">
                  📑 Panduan Rencana Aksi
                </span>
                <p className="text-[12px] text-[#3D4127] leading-relaxed line-clamp-6">
                  {panduanBukti || "(Belum ada panduan tugas)"}
                </p>
              </div>

              {/* Mockup Box Unggah File Siswa */}
              <div className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] p-3 flex flex-col items-center justify-center gap-2 shadow-sm text-center">
                <span className="text-[12px] font-bold text-[#3D4127]">
                  Unggah Rencana Aksi
                </span>
                <div className="w-full h-20 border-2 border-dashed border-[#D3D8C3] rounded-[10px] bg-[#EDF0E8]/50 flex flex-col items-center justify-center gap-1 p-2">
                  <span className="text-[18px]">📄</span>
                  <span className="text-[11px] font-medium text-[#636B2F]">
                    Pilih Berkas PDF (Maks 10MB)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW KHUSUS NITI BAKTI */}
          {config.tahap === "bakti" && (
            <div className="flex flex-col gap-3 w-full">
              {/* Box Panduan Aksi Nyata */}
              <div className="w-full bg-[#FBFFF3] border-2 border-[#636B2F]/30 rounded-[14px] p-3 flex flex-col gap-1.5 shadow-sm">
                <span className="text-[12px] font-bold text-[#636B2F] flex items-center gap-1">
                  🌱 Panduan Aksi Nyata
                </span>
                <p className="text-[12px] text-[#3D4127] leading-relaxed line-clamp-6">
                  {panduanBakti || "(Belum ada panduan aksi)"}
                </p>
              </div>

              {/* Section Pilih Kategori Aksi (Sesuai Tampilan Asli Siswa) */}
              <div className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] p-3 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#3D4127]">
                    Pilih Kategori Aksi
                  </span>
                  
                </div>

                <div className="relative w-full">
                  <div className="w-full flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x scroll-smooth">
                    {baktiCategories.map((cat) => {
                      const isSelected = previewSelectedCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setPreviewSelectedCategory(cat.id)}
                          className={`flex-none w-[110px] h-[145px] bg-[#EDF0E8] rounded-[12px] p-2.5 flex flex-col items-center justify-between gap-2 cursor-pointer transition-all duration-200 snap-start border-2 ${
                            isSelected
                              ? "border-[#636B2F] shadow-sm bg-[#e4e8dc]"
                              : "border-transparent hover:border-[#D3D8C3]"
                          }`}
                        >
                          <div className="w-full h-[76px] relative rounded-[8px] overflow-hidden flex items-center justify-center bg-[#D3D8C3]/30">
                            <Image
                              src={cat.image}
                              alt={cat.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-[11px] font-[600] text-[#3D4127] text-center leading-[14px] flex-1 flex items-center justify-center">
                            {cat.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mockup Unggah Bukti */}
              <div className="w-full bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] p-3 flex flex-col gap-2 shadow-sm">
                <span className="text-[12px] font-bold text-[#3D4127]">
                  Unggah Laporan
                </span>
                <div className="w-full h-20 border-2 border-dashed border-[#D3D8C3] rounded-[10px] bg-[#EDF0E8]/50 flex flex-col items-center justify-center gap-1 p-2">
                  <Image
                    src="/icon-upload.svg"
                    alt="Icon Upload"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className="text-[10px] font-medium text-[#9CA08D]">
                    Format PDF / Word, Maks 10 MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW KHUSUS NITI SAJATI (Sesuai Tampilan Asli Siswa) */}
          {config.tahap === "sajati" && (
            <div className="flex flex-col gap-3.5 w-full">
              {/* Bagian Pesan Apresiasi & Refleksi dari Guru */}
              <div className="w-full bg-[#FBFFF3] rounded-[16px] p-4 shadow-[0px_2px_2px_0px_#00000040] border border-[#D3D8C3]/50 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  
                  <h3 className="text-[13px] font-[600] leading-[18px] text-[#3D4127]">
                    Pesan Apresiasi Guru
                  </h3>
                </div>
                <p className="text-[11.5px] font-[400] leading-[18px] text-[#3D4127]/90 italic border-t border-[#3D4127]/15 pt-2 whitespace-pre-line">
                  "{ucapanSajati || "Selamat atas pencapaian Anda!"}"
                </p>
              </div>

              {/* Section Pencapaian Kompetensi */}
              <div className="w-full bg-[#FBFFF3] rounded-[16px] p-4 shadow-[0px_2px_2px_0px_#00000040] border border-[#D3D8C3]/50 flex flex-col gap-3">
                <h3 className="text-[13px] font-[600] leading-[18px] text-[#3D4127]">
                  Pencapaian Kompetensi
                </h3>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      id: 1,
                      title: "Pencapaian 1 (Niti Harti)",
                      description:
                        "Memahami hubungan timbal balik komponen biotik-abiotik serta dampak intervensi manusia pada ekosistem.",
                    },
                    {
                      id: 2,
                      title: "Pencapaian 2 (Niti Surti)",
                      description:
                        "Menumbuhkan empati ekologis dan merumuskan gagasan rencana aksi solusi kelestarian lingkungan hidup.",
                    },
                    {
                      id: 3,
                      title: "Pencapaian 3 (Niti Bukti)",
                      description:
                        "Melaksanakan aksi nyata pelestarian lingkungan dan mengunggah dokumentasi bukti kegiatan.",
                    },
                    {
                      id: 4,
                      title: "Pencapaian 4 (Niti Bakti)",
                      description:
                        "Menerapkan komitmen pelestarian lingkungan secara berkelanjutan bersama keluarga dan masyarakat.",
                    },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Image
                          src="/icon-piala.svg"
                          alt="Unlocked Trophy"
                          width={18}
                          height={18}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[11.5px] font-[600] leading-[16px] text-[#3D4127]">
                          {item.title}
                        </h4>
                        <p className="text-[10.5px] font-[400] leading-[14px] text-[#3D4127]/80 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Sertifikat */}
              <div className="w-full bg-[#FBFFF3] rounded-[16px] p-4 shadow-[0px_2px_2px_0px_#00000040] border border-[#D3D8C3]/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-[600] leading-[18px] text-[#3D4127]">
                    Sertifikat Kelulusan
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#636B2F]/15 text-[#636B2F]">
                    Resmi Terbit
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Detail Info Sertifikat */}
                  <div className="flex flex-col gap-1 text-[10.5px] bg-[#EDF0E8] p-2.5 rounded-[10px] border border-[#D3D8C3]/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[#3D4127]/60">Nomor:</span>
                      <span className="font-bold text-[#3D4127]">SRT-EVAA-2026-001</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#3D4127]/60">Tanggal Terbit:</span>
                      <span className="font-semibold text-[#3D4127]">
                        {new Date().toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Inner Certificate Card dengan Tombol Unduh */}
                  <div className="relative w-full h-[100px] rounded-[12px] overflow-hidden flex flex-col items-center justify-center p-2.5 border border-[#636B2F]/40 shadow-sm select-none">
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-[1.5px] scale-105"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 80% 20%, #4d5722 0%, transparent 40%), radial-gradient(circle at 20% 80%, #636B2F 0%, transparent 40%), linear-gradient(135deg, #272a19 0%, #3D4127 100%)",
                      }}
                    />

                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />

                    <div className="relative z-10 flex flex-col items-center gap-1 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-white bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-md">
                        <Image
                          src="/icon-unduh.svg"
                          alt="Unduh Icon"
                          width={14}
                          height={14}
                          className="object-contain filter brightness-0 invert"
                        />
                        <span className="text-[11px] font-[600] tracking-wide text-white">
                          Lihat / Unduh Sertifikat
                        </span>
                      </div>
                      <span className="text-[9px] text-white/80">
                        Pratinjau tampilan unduh siswa
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
