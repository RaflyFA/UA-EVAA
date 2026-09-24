"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import SiswaGuard from "@/components/SiswaGuard";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import LockedModal from "@/components/LockedModal";

export default function NitiSajatiPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [ucapan, setUcapan] = useState<string>(
    "Selamat! Anda telah menuntaskan seluruh rangkaian proses pembelajaran Niti Panca Jena dengan penuh dedikasi. Teruslah menjadi pelopor penjaga kelestarian lingkungan dan terapkan nilai kearifan lokal dalam keseharian!"
  );
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [sertifikat, setSertifikat] = useState<{
    nomor: string;
    url: string | null;
    tanggal: string;
  } | null>(null);

  // Proteksi akses & tandai Niti Sajati selesai saat dikunjungi
  useEffect(() => {
    async function init() {
      if (!profile?.id) return;

      try {
        // Ambil ucapan selamat dari Guru jika ada
        const { data: kontenData } = await supabase
          .from("konten_modul")
          .select("deskripsi")
          .eq("tahap_niti", "sajati")
          .eq("tipe_konten", "ucapan_selamat")
          .maybeSingle();

        if (kontenData?.deskripsi) {
          setUcapan(kontenData.deskripsi);
        }

        // Ambil seluruh status progress_siswa untuk menentukan capaian 1-4
        const { data: allProg } = await supabase
          .from("progress_siswa")
          .select("tahap_niti, status")
          .eq("siswa_id", profile.id);

        if (allProg) {
          const pMap: Record<string, boolean> = {};
          allProg.forEach((p) => {
            pMap[p.tahap_niti] = p.status === "disetujui";
          });
          setProgressMap(pMap);
        }

        // Ambil sertifikat jika sudah diterbitkan guru
        const { data: certData } = await supabase
          .from("sertifikat")
          .select("nomor_sertifikat, url_file, tanggal_terbit")
          .eq("siswa_id", profile.id)
          .maybeSingle();

        if (certData) {
          setSertifikat({
            nomor: certData.nomor_sertifikat,
            url: certData.url_file,
            tanggal: certData.tanggal_terbit,
          });
        }
      } catch (err) {
        console.error("Gagal mengambil data Niti Sajati:", err);
      }

      const { data: prog } = await supabase
        .from("progress_siswa")
        .select("status")
        .eq("siswa_id", profile.id)
        .eq("tahap_niti", "sajati")
        .maybeSingle();

      if (prog && prog.status === "terkunci") {
        setIsLocked(true);
        return;
      }

      // Tandai sajati selesai jika belum
      if (prog && prog.status !== "disetujui") {
        const now = new Date().toISOString();
        await supabase
          .from("progress_siswa")
          .update({
            status: "disetujui",
            tanggal_selesai: now,
            updated_at: now,
          })
          .eq("siswa_id", profile.id)
          .eq("tahap_niti", "sajati");
        
        setProgressMap((prev) => ({ ...prev, sajati: true }));
      }
    }

    init();
  }, [profile, router]);

  const achievements = [
    {
      id: 1,
      title: "Pencapaian 1 (Niti Harti)",
      description:
        "Memahami hubungan timbal balik komponen biotik-abiotik serta dampak intervensi manusia pada ekosistem.",
      isUnlocked: progressMap["harti"] ?? false,
    },
    {
      id: 2,
      title: "Pencapaian 2 (Niti Surti)",
      description:
        "Menumbuhkan empati ekologis dan merumuskan gagasan rencana aksi solusi kelestarian lingkungan hidup.",
      isUnlocked: progressMap["surti"] ?? false,
    },
    {
      id: 3,
      title: "Pencapaian 3 (Niti Bukti)",
      description:
        "Melaksanakan aksi nyata pelestarian lingkungan dan mengunggah dokumentasi bukti kegiatan.",
      isUnlocked: progressMap["bukti"] ?? false,
    },
    {
      id: 4,
      title: "Pencapaian 4 (Niti Bakti)",
      description:
        "Menerapkan komitmen pelestarian lingkungan secara berkelanjutan bersama keluarga dan masyarakat.",
      isUnlocked: progressMap["bakti"] ?? false,
    },
  ];

  return (
    <SiswaGuard>
      <LockedModal
        isOpen={isLocked}
        stageName="Niti Sajati (BAB 5)"
        requiredStageName="Niti Bakti (BAB 4)"
        onAction={() => router.push("/alur")}
      />
      <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-[140px] relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />

        {/* Header Niti Sajati - Lapisan 1: Dasaran Persegi Panjang Warna #EDF0E8 */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          {/* Lapisan 2: Gambar Lampiran Ilustrasi */}
          <div className="absolute right-0 top-0 bottom-0 w-[170px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/niti-sajati.png"
              alt="Niti Sajati Illustration"
              width={160}
              height={140}
              priority
              className="object-contain object-right opacity-90"
            />
          </div>

          {/* Lapisan 3: Efek Gradien #636B2F */}
          <div
            className="absolute inset-0 rounded-bl-[24px] rounded-br-[24px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
              opacity: 1,
            }}
          />

          {/* Lapisan 4: Teks "Niti Sajati" & Subtitle */}
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
                Niti Sajati
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "0%",
                  color: "#FBFFF3",
                }}
              >
                Pencapaian Pembelajaran.
              </p>
            </div>
          </div>
        </div>

        {/* Bagian Pesan Apresiasi & Refleksi dari Guru */}
        {ucapan && (
          <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-5 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              
              <h2 className="text-[16px] font-[600] leading-[22px] text-[#3D4127]">
                Pesan Apresiasi Guru
              </h2>
            </div>
            <p className="text-[13px] font-[400] leading-[21px] text-[#3D4127]/90 italic border-t border-[#3D4127]/15 pt-2.5 whitespace-pre-line">
              {ucapan}
            </p>
          </div>
        )}

        {/* Section Pencapaian Kompetensi */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-5">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Pencapaian Kompetensi
          </h2>

          <div className="flex flex-col gap-4">
            {achievements.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Image
                    src={item.isUnlocked ? "/icon-piala.svg" : "/icon-gembok.svg"}
                    alt={item.isUnlocked ? "Unlocked Trophy" : "Locked Item"}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <h3
                    className={`text-[15px] font-[600] leading-[20px] ${
                      item.isUnlocked ? "text-[#3D4127]" : "text-[#9CA08D]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-[13px] font-[400] leading-[18px] ${
                      item.isUnlocked ? "text-[#3D4127]/80" : "text-[#9CA08D]"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Sertifikat */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
              Sertifikat Kelulusan
            </h2>
            {sertifikat ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#636B2F]/15 text-[#636B2F]">
                Resmi Terbit
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDF0E8] text-[#9CA08D]">
                Menunggu Guru
              </span>
            )}
          </div>

          {sertifikat ? (
            <div className="flex flex-col gap-3">
              {/* Detail Info Sertifikat */}
              <div className="flex flex-col gap-1.5 text-[12px] bg-[#EDF0E8] p-3.5 rounded-[16px] border border-[#D3D8C3]/50">
                <div className="flex items-center justify-between">
                  <span className="text-[#3D4127]/60">Nomor:</span>
                  <span className="font-bold text-[#3D4127]">{sertifikat.nomor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#3D4127]/60">Tanggal Terbit:</span>
                  <span className="font-semibold text-[#3D4127]">
                    {new Date(sertifikat.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Kartu Pratinjau Sertifikat & Tombol Unduh */}
              {(() => {
                const isPdf = Boolean(
                  sertifikat.url &&
                    (sertifikat.url.toLowerCase().endsWith(".pdf") ||
                      sertifikat.url.toLowerCase().includes(".pdf?"))
                );
                const fileExt =
                  sertifikat.url?.split(".").pop()?.split("?")[0] || "png";
                const safeNomor = sertifikat.nomor.replace(/[^a-zA-Z0-9_-]/g, "_");
                const downloadFilename = `Sertifikat_${safeNomor}.${fileExt}`;

                return (
                  <div className="flex flex-col gap-3">
                    {/* Pratinjau Visual Berkas */}
                    <div className="relative w-full h-[180px] rounded-[16px] overflow-hidden border border-[#D3D8C3] bg-[#E2E6D8] flex items-center justify-center shadow-inner group">
                      {sertifikat.url ? (
                        isPdf ? (
                          <div className="flex flex-col items-center justify-center gap-2 text-[#3D4127] p-4 text-center">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[#636B2F]"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <span className="text-[12px] font-bold text-[#3D4127]">
                              Dokumen Sertifikat (PDF)
                            </span>
                          </div>
                        ) : (
                          <img
                            src={sertifikat.url}
                            alt="Pratinjau Sertifikat"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 80% 20%, #4d5722 0%, transparent 40%), radial-gradient(circle at 20% 80%, #636B2F 0%, transparent 40%), linear-gradient(135deg, #272a19 0%, #3D4127 100%)",
                          }}
                        />
                      )}

                      {/* Tombol Lihat Ukuran Penuh di Tab Baru */}
                      {sertifikat.url && (
                        <a
                          href={sertifikat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2.5 right-2.5 px-3 py-1 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold rounded-full backdrop-blur-sm transition-all flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <span>Lihat Gambar Penuh</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>

                    {/* Tombol Aksi Unduh Otomatis */}
                    <a
                      href={`/api/download?url=${encodeURIComponent(
                        sertifikat.url || ""
                      )}&filename=${encodeURIComponent(downloadFilename)}`}
                      download={downloadFilename}
                      className="w-full h-12 bg-[#5B6628] hover:bg-[#4d5722] text-white rounded-[16px] px-5 flex items-center justify-center gap-2.5 shadow-[0px_2px_4px_0px_#00000025] transition-all cursor-pointer select-none active:scale-[0.99]"
                    >
                      <Image
                        src="/icon-unduh.svg"
                        alt="Unduh Icon"
                        width={20}
                        height={20}
                        className="object-contain filter brightness-0 invert"
                      />
                      <span className="text-[14px] font-bold tracking-wide">
                        Unduh Sertifikat
                      </span>
                    </a>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="w-full rounded-[16px] border border-dashed border-[#D3D8C3] bg-[#EDF0E8]/40 p-5 flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#D3D8C3]/50 flex items-center justify-center text-[#3D4127]/60">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="text-[13px] font-bold text-[#3D4127]">
                Sertifikat Belum Diterbitkan
              </p>
              <p className="text-[12px] text-[#3D4127]/70 leading-[18px]">
                Guru belum mengunggah sertifikat resmi Anda. Setelah guru menerbitkannya melalui akun guru, sertifikat akan langsung muncul di sini untuk dilihat dan diunduh.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tombol Selesai (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          <Link href="/" className="block w-full">
            <button className="w-full h-[56px] bg-[#5B6628] hover:bg-[#4d5722] text-[#FBFFF3] rounded-[120px] flex items-center justify-center gap-2.5 transition-colors shadow-lg focus:outline-none">
              <span className="text-[16px] font-semibold leading-[24px]">
                Selesai
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
        </div>
      </div>

      {/* Sidebar Reusable */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  </SiswaGuard>
  );
}
