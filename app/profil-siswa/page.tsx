"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import SiswaGuard from "@/components/SiswaGuard";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa";

interface AbsensiRecord {
  id: string;
  tanggal: string;
  status: AttendanceStatus;
  created_at: string;
}

interface TahapPenilaianItem {
  tahap: string;
  nama: string;
  deskripsi: string;
  status: string;
  nilai: number | null;
  catatan: string;
  fileUrl?: string;
  fileName?: string;
}

const statusConfig: Record<
  AttendanceStatus,
  { label: string; badgeClass: string; icon?: string }
> = {
  hadir: {
    label: "Hadir",
    badgeClass: "bg-[#636B2F]/15 text-[#3D4127] border border-[#636B2F]/30",
  },
  sakit: {
    label: "Sakit",
    badgeClass: "bg-[#636B2F]/15 text-[#3D4127] border border-[#636B2F]/30",
  },
  izin: {
    label: "Izin",
    badgeClass: "bg-[#636B2F]/15 text-[#3D4127] border border-[#636B2F]/30",
  },
  alpa: {
    label: "Alpa",
    badgeClass: "bg-[#636B2F]/15 text-[#3D4127] border border-[#636B2F]/30",
  },
};

const DEFAULT_TAHAP_INFO = [
  { tahap: "harti", nama: "Niti Harti", deskripsi: "Pemahaman materi & konsep filosofi lingkungan" },
  { tahap: "surti", nama: "Niti Surti", deskripsi: "Observasi & identifikasi permasalahan lingkungan" },
  { tahap: "bukti", nama: "Niti Bukti", deskripsi: "Perencanaan aksi nyata & penyusunan proposal" },
  { tahap: "bakti", nama: "Niti Bakti", deskripsi: "Pelaksanaan aksi lingkungan & laporan karya" },
  { tahap: "sajati", nama: "Niti Sajati", deskripsi: "Refleksi mendalam & penuntasan sertifikasi" },
];

export default function ProfilSiswaPage() {
  const { user, profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AbsensiRecord[]>([]);
  const [penilaianList, setPenilaianList] = useState<TahapPenilaianItem[]>([]);
  const [filterAbsensi, setFilterAbsensi] = useState<"semua" | "hadir" | "absen">("semua");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Ambil data absensi
        const [absensiRes, progressRes, nilaiRes, submissionRes] = await Promise.all([
          supabase
            .from("absensi")
            .select("id, tanggal, status, created_at")
            .eq("siswa_id", user.id)
            .order("tanggal", { ascending: false }),
          supabase
            .from("progress_siswa")
            .select("tahap_niti, status")
            .eq("siswa_id", user.id),
          supabase
            .from("nilai")
            .select("submission_id, nilai_angka, catatan, created_at")
            .eq("siswa_id", user.id),
          supabase
            .from("submission_aksi")
            .select("id, tahap_niti, file_url, nama_file, status, catatan_revisi")
            .eq("siswa_id", user.id),
        ]);

        if (absensiRes.data) {
          setAttendanceRecords(
            absensiRes.data.map((row) => ({
              id: row.id,
              tanggal: row.tanggal,
              status: (row.status || "").toLowerCase() as AttendanceStatus,
              created_at: row.created_at,
            }))
          );
        }

        // Cek apakah ada catatan JSON 5 komponen di tabel nilai
        let parsedKomponenArray: Array<{ nama: string; nilai: string; keterangan: string }> | null = null;
        if (nilaiRes.data && nilaiRes.data.length > 0) {
          for (const n of nilaiRes.data) {
            if (n.catatan && n.catatan.startsWith("[")) {
              try {
                const parsed = JSON.parse(n.catatan);
                if (Array.isArray(parsed)) {
                  parsedKomponenArray = parsed;
                  break;
                }
              } catch {
                // Ignore
              }
            }
          }
        }

        // 2. Gabungkan data penilaian 5 Tahap Niti
        const list: TahapPenilaianItem[] = DEFAULT_TAHAP_INFO.map((item) => {
          const prog = (progressRes.data || []).find((p) => p.tahap_niti === item.tahap);
          const sub = (submissionRes.data || []).find((s) => s.tahap_niti === item.tahap);

          let nilaiAngka: number | null = null;
          let catatanText = "-";

          // Cek dari parsed komponen array jika ada
          if (parsedKomponenArray) {
            const matched = parsedKomponenArray.find(
              (pk) => pk.nama.toLowerCase() === item.nama.toLowerCase()
            );
            if (matched) {
              const val = parseFloat(matched.nilai);
              if (!isNaN(val)) nilaiAngka = val;
              if (matched.keterangan) catatanText = matched.keterangan;
            }
          }

          // Cek dari submission specific nilai jika ada
          if (sub) {
            const matchedNilai = (nilaiRes.data || []).find(
              (n) => n.submission_id === sub.id
            );
            if (matchedNilai) {
              if (matchedNilai.nilai_angka !== null) {
                nilaiAngka = Number(matchedNilai.nilai_angka);
              }
              if (matchedNilai.catatan && !matchedNilai.catatan.startsWith("[")) {
                catatanText = matchedNilai.catatan;
              }
            }
            if (sub.catatan_revisi && catatanText === "-") {
              catatanText = sub.catatan_revisi;
            }
          }

          let statusDisplay = prog?.status || "terkunci";
          if (sub?.status) {
            statusDisplay = sub.status;
          }

          return {
            tahap: item.tahap,
            nama: item.nama,
            deskripsi: item.deskripsi,
            status: statusDisplay,
            nilai: nilaiAngka,
            catatan: catatanText,
            fileUrl: sub?.file_url,
            fileName: sub?.nama_file,
          };
        });

        setPenilaianList(list);
      } catch (err) {
        console.error("Error loading student profile data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Statistik Kehadiran
  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const hadir = attendanceRecords.filter((r) => r.status === "hadir").length;
    const sakit = attendanceRecords.filter((r) => r.status === "sakit").length;
    const izin = attendanceRecords.filter((r) => r.status === "izin").length;
    const alpa = attendanceRecords.filter((r) => r.status === "alpa").length;
    const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, sakit, izin, alpa, persentase };
  }, [attendanceRecords]);

  // Rata-rata Nilai Proyek
  const avgNilai = useMemo(() => {
    const validScores = penilaianList
      .map((p) => p.nilai)
      .filter((n): n is number => n !== null && !isNaN(n));
    if (validScores.length === 0) return null;
    const sum = validScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / validScores.length);
  }, [penilaianList]);

  // Helper format tanggal bahasa Indonesia
  const formatTanggalIndonesia = (tanggalStr: string) => {
    try {
      const d = new Date(tanggalStr + "T00:00:00");
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return tanggalStr;
    }
  };

  // Helper mendapatkan tanggal dan nama bulan singkat untuk card mobile
  const getDayAndMonth = (tanggalStr: string) => {
    try {
      const d = new Date(tanggalStr + "T00:00:00");
      const day = d.getDate();
      const month = d.toLocaleDateString("id-ID", { month: "short" });
      return { day, month };
    } catch {
      return { day: "-", month: "-" };
    }
  };

  // Data absensi yang difilter
  const filteredRecords = useMemo(() => {
    if (filterAbsensi === "hadir") {
      return attendanceRecords.filter((r) => r.status === "hadir");
    }
    if (filterAbsensi === "absen") {
      return attendanceRecords.filter((r) => r.status !== "hadir");
    }
    return attendanceRecords;
  }, [attendanceRecords, filterAbsensi]);

  return (
    <SiswaGuard>
      <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-4 sm:px-6 pt-4 pb-16 relative overflow-x-hidden font-sans">
        {/* Container utama dengan lebar konsisten pada mobile dan responsif sampai desktop */}
        <div className="w-full max-w-[354px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[860px] flex flex-col items-center gap-5 z-10 flex-1">
          {/* Topbar Reusable */}
            <Topbar
              onMenuClick={() => setIsSidebarOpen(true)}
              variant="dark"
              className="max-w-[354px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[860px]"
            />

          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Header Card: Profil Siswa (Tanpa Gambar Profil) */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-5 sm:p-6 shadow-[0px_2px_4px_0px_#00000015] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#D3D8C3]/60">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[30px] sm:text-[30px] font-black text-[#3D4127] leading-tight tracking-tight">
                  {profile?.nama_lengkap || "Siswa"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#5B6628] text-white tracking-wider">
                  {profile?.role || "Siswa"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#3D4127]/80 font-medium flex-wrap">
                <span className="px-2.5 py-1 rounded-[10px] bg-[#EDF0E8] font-semibold text-[#3D4127]">
                  Kelas {profile?.kelas || "VII-A"}
                </span>
                <span className="px-2.5 py-1 rounded-[10px] bg-[#EDF0E8] font-semibold text-[#3D4127]">
                  NISN: {profile?.nomor_induk || "-"}
                </span>
                {user?.email && (
                  <span className="text-[#3D4127]/60 text-[12px]">
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/alur"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#5B6628] hover:bg-[#4d5722] text-[#FBFFF3] rounded-[16px] font-bold text-[13px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Alur Belajar</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {/* Section Rekapitulasi Nilai & Evaluasi Proyek Niti (Tanpa Icon Pena) */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-5 sm:p-6 shadow-[0px_2px_4px_0px_#00000015] border border-[#D3D8C3]/60 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3D4127]/10 flex-wrap gap-2">
              <div>
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#3D4127]">
                  Nilai & Evaluasi Proyek Niti
                </h2>
                
              </div>

              {avgNilai !== null ? (
                <div className="flex items-center gap-2 bg-[#636B2F]/15 border border-[#636B2F]/30 px-3.5 py-1.5 rounded-full">
                  <span className="text-[12px] font-semibold text-[#3D4127]">
                    Rata-rata Nilai:
                  </span>
                  <span className="text-[15px] font-black text-[#636B2F]">
                    {avgNilai} / 100
                  </span>
                </div>
              ) : (
                <span className="text-[12px] font-medium text-[#9CA08D] bg-[#EDF0E8] px-3 py-1 rounded-full">
                  Menunggu Evaluasi Guru
                </span>
              )}
            </div>

            {/* List Kartu Nilai 5 Tahap (Tanpa Efek Hover Border) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
              {penilaianList.map((item, idx) => {
                const isApproved =
                  item.status === "disetujui" || (item.nilai !== null && item.nilai >= 70);

                return (
                  <div
                    key={item.tahap}
                    className="bg-[#EDF0E8]/50 border border-[#D3D8C3] rounded-[18px] p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#636B2F]">
                          Tahap {idx + 1}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isApproved
                            ? "bg-[#636B2F]/20 text-[#3D4127]"
                            : item.status === "menunggu_review"
                              ? "bg-[#636B2F]/10 text-[#636B2F]"
                              : "bg-[#9CA08D]/15 text-[#9CA08D]"
                            }`}
                        >
                          {isApproved
                            ? "Tuntas"
                            : item.status === "menunggu_review"
                              ? "Review"
                              : "Proses"}
                        </span>
                      </div>

                      <h4 className="text-[15px] font-bold text-[#3D4127]">
                        {item.nama}
                      </h4>
                      <p className="text-[11px] text-[#3D4127]/65 line-clamp-2">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Nilai & Catatan Guru */}
                    <div className="pt-2 border-t border-[#D3D8C3]/60 flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] font-semibold text-[#3D4127]/70">
                          Nilai:
                        </span>
                        {item.nilai !== null ? (
                          <span className="text-[16px] font-black text-[#636B2F]">
                            {item.nilai}{" "}
                            <span className="text-[11px] font-normal text-[#3D4127]/60">
                              / 100
                            </span>
                          </span>
                        ) : (
                          <span className="text-[12px] font-medium text-[#9CA08D]">
                            -
                          </span>
                        )}
                      </div>

                      {item.catatan && item.catatan !== "-" && (
                        <div className="bg-[#FBFFF3] p-2.5 rounded-xl border border-[#D3D8C3]/50 text-[11px] text-[#3D4127]">
                          <strong className="text-[#636B2F]">Catatan: </strong>
                          {item.catatan}
                        </div>
                      )}

                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#636B2F] hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <span>{item.fileName || "Tugas"} ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 1: Ringkasan Kehadiran Eksekutif (All-in-One Industry Standard Card) */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-5 sm:p-6 shadow-[0px_2px_4px_0px_#00000015] border border-[#D3D8C3]/60 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3D4127]/10 flex-wrap gap-2">
              <div>
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#3D4127]">
                  Ringkasan Kehadiran
                </h2>
              </div>

              {/* Badge Persentase */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#636B2F]/15 border border-[#636B2F]/30 text-[#3D4127]">
                <span className="w-2 h-2 rounded-full bg-[#636B2F]" />
                <span className="text-[14px] font-black text-[#636B2F]">
                  {stats.persentase}%
                </span>
                <span className="text-[11px] font-semibold text-[#3D4127]/70">
                  Presensi
                </span>
              </div>
            </div>

            {/* Visual Progress Bar Presensi */}
            <div className="flex flex-col gap-2 bg-[#EDF0E8]/50 p-3.5 rounded-[18px] border border-[#D3D8C3]/50">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-[#3D4127]/75">
                  Kehadiran Terpenuhi
                </span>
                <span className="font-bold text-[#3D4127]">
                  <strong className="text-[#636B2F]">{stats.hadir}</strong> dari {stats.total} sesi pertemuan
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#D3D8C3]/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5B6628] to-[#636B2F] rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? stats.persentase : 0}%` }}
                />
              </div>
            </div>

            {/* 4 Kolom Metrik Presensi Terpadu */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-1">
              {/* Hadir */}
              <div className="flex flex-col items-center justify-center py-3 px-1 rounded-[16px] bg-[#EDF0E8]/60 border border-[#D3D8C3]/60 text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#636B2F]">
                  <span>Hadir</span>
                </div>
                <span className="text-[20px] sm:text-[24px] font-black text-[#3D4127] mt-0.5">
                  {stats.hadir}
                </span>
              </div>

              {/* Sakit */}
              <div className="flex flex-col items-center justify-center py-3 px-1 rounded-[16px] bg-[#EDF0E8]/60 border border-[#D3D8C3]/60 text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#3D4127]/70">
                  <span>Sakit</span>
                </div>
                <span className="text-[20px] sm:text-[24px] font-black text-[#3D4127] mt-0.5">
                  {stats.sakit}
                </span>
              </div>

              {/* Izin */}
              <div className="flex flex-col items-center justify-center py-3 px-1 rounded-[16px] bg-[#EDF0E8]/60 border border-[#D3D8C3]/60 text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#3D4127]/70">
                  <span>Izin</span>
                </div>
                <span className="text-[20px] sm:text-[24px] font-black text-[#3D4127] mt-0.5">
                  {stats.izin}
                </span>
              </div>

              {/* Alpa */}
              <div className="flex flex-col items-center justify-center py-3 px-1 rounded-[16px] bg-[#EDF0E8]/60 border border-[#D3D8C3]/60 text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#3D4127]/70">
                  <span>Alpa</span>
                </div>
                <span className="text-[20px] sm:text-[24px] font-black text-[#3D4127] mt-0.5">
                  {stats.alpa}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Riwayat Presensi (Responsive Mobile-First List & Desktop Table) */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-5 sm:p-6 shadow-[0px_2px_4px_0px_#00000015] border border-[#D3D8C3]/60 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3D4127]/10 gap-3">
              <div>
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#3D4127]">
                  Riwayat Pertemuan
                </h2>

              </div>

              {/* Filter Tabs Interaktif */}
              <div className="flex items-center gap-1.5 p-1 rounded-[14px] bg-[#EDF0E8] border border-[#D3D8C3]/60 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilterAbsensi("semua")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[10px] transition-colors cursor-pointer ${filterAbsensi === "semua"
                    ? "bg-[#636B2F] text-white shadow-xs"
                    : "text-[#3D4127]/70 hover:text-[#3D4127]"
                    }`}
                >
                  Semua ({attendanceRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAbsensi("hadir")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[10px] transition-colors cursor-pointer ${filterAbsensi === "hadir"
                    ? "bg-[#636B2F] text-white shadow-xs"
                    : "text-[#3D4127]/70 hover:text-[#3D4127]"
                    }`}
                >
                  Hadir ({stats.hadir})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAbsensi("absen")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[10px] transition-colors cursor-pointer ${filterAbsensi === "absen"
                    ? "bg-[#636B2F] text-white shadow-xs"
                    : "text-[#3D4127]/70 hover:text-[#3D4127]"
                    }`}
                >
                  Absen ({stats.sakit + stats.izin + stats.alpa})
                </button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#3D4127]/60">
                <div className="w-8 h-8 border-3 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
                <span className="text-[13px]">Memuat riwayat kehadiran...</span>
              </div>
            )}

            {/* Empty state: Belum ada data sama sekali */}
            {!isLoading && attendanceRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#EDF0E8] flex items-center justify-center text-[#636B2F]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-bold text-[#3D4127]">
                  Belum Ada Data Kehadiran
                </h3>
                <p className="text-[12px] text-[#3D4127]/70 max-w-[340px]">
                  Catatan kehadiran Anda akan otomatis tampil di sini setelah guru melakukan absensi kelas.
                </p>
              </div>
            )}

            {/* Empty state: Hasil filter kosong */}
            {!isLoading && attendanceRecords.length > 0 && filteredRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <p className="text-[14px] font-bold text-[#3D4127]">
                  Tidak ada data untuk filter ini
                </p>
                <p className="text-[12px] text-[#3D4127]/60">
                  Silakan pilih filter "Semua" untuk melihat seluruh sesi pertemuan.
                </p>
              </div>
            )}

            {/* 1. Mobile View (Card Timeline List yang Nyaman dan Rapi di HP) */}
            {!isLoading && filteredRecords.length > 0 && (
              <div className="flex flex-col gap-2.5 sm:hidden">
                {filteredRecords.map((item, idx) => {
                  const { day, month } = getDayAndMonth(item.tanggal);
                  const cfg = statusConfig[item.status] || statusConfig.hadir;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#EDF0E8]/60 border border-[#D3D8C3] rounded-[18px] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Kalender Badge */}
                        <div className="w-11 h-11 rounded-[12px] bg-[#FBFFF3] border border-[#D3D8C3] flex flex-col items-center justify-center text-center flex-shrink-0 shadow-2xs">
                          <span className="text-[9px] uppercase font-bold text-[#636B2F] leading-none">
                            {month}
                          </span>
                          <span className="text-[15px] font-black text-[#3D4127] leading-tight">
                            {day}
                          </span>
                        </div>

                        {/* Info Tanggal & Pertemuan */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-[#3D4127] truncate">
                            {formatTanggalIndonesia(item.tanggal)}
                          </span>
                          <span className="text-[11px] text-[#3D4127]/65">
                            Pertemuan #{attendanceRecords.length - idx} • {profile?.kelas ? `Kelas ${profile.kelas}` : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.badgeClass}`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Desktop / Tablet View (Table Berstruktur Lengkap) */}
            {!isLoading && filteredRecords.length > 0 && (
              <div className="hidden sm:block w-full overflow-x-auto">
                <table className="w-full text-left text-[13px] text-[#3D4127]">
                  <thead>
                    <tr className="border-b border-[#D3D8C3] text-[11px] font-bold text-[#3D4127]/60 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center">Sesi</th>
                      <th className="py-2.5 px-3">Hari & Tanggal</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                      <th className="py-2.5 px-3 text-right">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF0E8]">
                    {filteredRecords.map((item, idx) => {
                      const cfg = statusConfig[item.status] || statusConfig.hadir;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#EDF0E8]/50 transition-colors"
                        >
                          <td className="py-3 px-3 font-semibold text-[#3D4127]/60 text-center">
                            #{attendanceRecords.length - idx}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#3D4127]">
                            {formatTanggalIndonesia(item.tanggal)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-md bg-[#3D4127]/10 text-[11px] font-bold text-[#3D4127]">
                              {profile?.kelas ? `Kelas ${profile.kelas}` : "-"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${cfg.badgeClass}`}
                            >
                              <span>{cfg.icon}</span>
                              <span>{cfg.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-[12px] font-medium text-[#3D4127]/60">
                            Dicatat oleh Guru
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </SiswaGuard>
  );
}
