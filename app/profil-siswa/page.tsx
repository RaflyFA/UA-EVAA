"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
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
  { label: string; badgeClass: string; icon: string }
> = {
  hadir: {
    label: "Hadir",
    badgeClass: "bg-[#16a34a]/15 text-[#15803d] border border-[#16a34a]/30",
    icon: "✓",
  },
  sakit: {
    label: "Sakit",
    badgeClass: "bg-[#0284c7]/15 text-[#0369a1] border border-[#0284c7]/30",
    icon: "✚",
  },
  izin: {
    label: "Izin",
    badgeClass: "bg-[#d97706]/15 text-[#b45309] border border-[#d97706]/30",
    icon: "✉",
  },
  alpa: {
    label: "Alpa",
    badgeClass: "bg-[#dc2626]/15 text-[#b91c1c] border border-[#dc2626]/30",
    icon: "✕",
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

  return (
    <SiswaGuard>
      <div className="min-h-screen bg-[#EDF0E8] flex flex-col font-sans">
        {/* Topbar */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 py-6 flex flex-col gap-6">
          {/* Header Card: Profil Siswa */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-6 sm:p-8 shadow-[0px_2px_4px_0px_#00000020] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#D3D8C3]/50">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden relative flex-shrink-0 border-3 border-[#636B2F] bg-[#EDF0E8] shadow-sm">
                <Image
                  src={profile?.avatar_url || "/guru/profile.jpg"}
                  alt={profile?.nama_lengkap || "Profil Siswa"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[22px] sm:text-[26px] font-bold text-[#3D4127] leading-tight">
                    {profile?.nama_lengkap || "Siswa"}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#636B2F] text-white tracking-wider">
                    {profile?.role || "Siswa"}
                  </span>
                </div>
                <p className="text-[14px] text-[#3D4127]/80 font-medium flex items-center gap-2 flex-wrap">
                  <span>
                    Kelas:{" "}
                    <strong className="text-[#3D4127]">
                      {profile?.kelas || "Belum Dipilih"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    NISN:{" "}
                    <strong className="text-[#3D4127]">
                      {profile?.nomor_induk || "-"}
                    </strong>
                  </span>
                  {user?.email && (
                    <>
                      <span>•</span>
                      <span className="text-[#3D4127]/60 text-[13px]">{user.email}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <Link
              href="/alur"
              className="px-5 py-2.5 bg-[#636B2F] hover:bg-[#525826] text-white rounded-[14px] font-bold text-[14px] transition-all shadow-sm flex items-center gap-2 self-stretch sm:self-auto justify-center"
            >
              <span>Alur Belajar</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {/* Section Rekapitulasi Nilai & Evaluasi Proyek Niti */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_4px_0px_#00000020] border border-[#D3D8C3]/50 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#3D4127]/10 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#636B2F]/10 flex items-center justify-center text-[#636B2F]">
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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#3D4127]">
                    Nilai & Evaluasi Proyek Niti
                  </h2>
                  <p className="text-[12px] text-[#3D4127]/60">
                    Hasil penilaian dan umpan balik dari Guru pembimbing
                  </p>
                </div>
              </div>

              {avgNilai !== null ? (
                <div className="flex items-center gap-2 bg-[#636B2F]/10 border border-[#636B2F]/30 px-3.5 py-1.5 rounded-full">
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

            {/* List Kartu Nilai 5 Tahap */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {penilaianList.map((item, idx) => {
                const isApproved =
                  item.status === "disetujui" || (item.nilai !== null && item.nilai >= 70);

                return (
                  <div
                    key={item.tahap}
                    className="bg-[#EDF0E8]/40 border border-[#D3D8C3]/60 rounded-[18px] p-4 flex flex-col justify-between gap-3 hover:border-[#636B2F]/40 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#636B2F]">
                          Tahap {idx + 1}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isApproved
                              ? "bg-[#16a34a]/15 text-[#15803d]"
                              : item.status === "menunggu_review"
                              ? "bg-[#d97706]/15 text-[#b45309]"
                              : "bg-[#9CA08D]/15 text-[#9CA08D]"
                          }`}
                        >
                          {isApproved
                            ? "✓ Tuntas"
                            : item.status === "menunggu_review"
                            ? "Review"
                            : "Proses"}
                        </span>
                      </div>

                      <h4 className="text-[15px] font-bold text-[#3D4127]">
                        {item.nama}
                      </h4>
                      <p className="text-[11px] text-[#3D4127]/60 line-clamp-2">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Nilai & Catatan Guru */}
                    <div className="pt-2 border-t border-[#D3D8C3]/50 flex flex-col gap-1.5">
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
                        <div className="bg-[#FBFFF3] p-2 rounded-lg border border-[#D3D8C3]/40 text-[11px] text-[#3D4127]">
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
                          <span>Berkas: {item.fileName || "Tugas"} ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stat Cards Grid: Rekap Kehadiran */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Persentase Hadir */}
            <div className="col-span-2 sm:col-span-1 bg-[#FBFFF3] rounded-[20px] p-4 shadow-sm border border-[#D3D8C3]/50 flex flex-col justify-between">
              <span className="text-[12px] font-semibold text-[#3D4127]/70">
                Kehadiran
              </span>
              <div className="mt-2">
                <span className="text-[28px] font-black text-[#636B2F]">
                  {stats.persentase}%
                </span>
                <p className="text-[11px] font-medium text-[#3D4127]/60">
                  {stats.hadir} dari {stats.total} pertemuan
                </p>
              </div>
            </div>

            {/* Hadir Card */}
            <div className="bg-[#FBFFF3] rounded-[20px] p-4 shadow-sm border border-[#D3D8C3]/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#15803d]">Hadir</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
              </div>
              <span className="text-[26px] font-extrabold text-[#15803d] mt-2">
                {stats.hadir}
              </span>
            </div>

            {/* Sakit Card */}
            <div className="bg-[#FBFFF3] rounded-[20px] p-4 shadow-sm border border-[#D3D8C3]/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#0369a1]">Sakit</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
              </div>
              <span className="text-[26px] font-extrabold text-[#0369a1] mt-2">
                {stats.sakit}
              </span>
            </div>

            {/* Izin Card */}
            <div className="bg-[#FBFFF3] rounded-[20px] p-4 shadow-sm border border-[#D3D8C3]/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#b45309]">Izin</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              </div>
              <span className="text-[26px] font-extrabold text-[#b45309] mt-2">
                {stats.izin}
              </span>
            </div>

            {/* Alpa Card */}
            <div className="bg-[#FBFFF3] rounded-[20px] p-4 shadow-sm border border-[#D3D8C3]/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#b91c1c]">Alpa</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
              </div>
              <span className="text-[26px] font-extrabold text-[#b91c1c] mt-2">
                {stats.alpa}
              </span>
            </div>
          </div>

          {/* Section Detail Riwayat Absensi */}
          <div className="w-full bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_4px_0px_#00000020] border border-[#D3D8C3]/50 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3D4127]/10 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#636B2F]/10 flex items-center justify-center text-[#636B2F]">
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
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h2 className="text-[18px] font-bold text-[#3D4127]">
                  Riwayat Kehadiran Siswa
                </h2>
              </div>
              <span className="text-[13px] font-semibold text-[#3D4127]/60">
                Total Tercatat: {attendanceRecords.length} Pertemuan
              </span>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#3D4127]/60">
                <div className="w-8 h-8 border-3 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
                <span className="text-[13px]">Memuat riwayat kehadiran & nilai...</span>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && attendanceRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#EDF0E8] flex items-center justify-center text-[#636B2F]">
                  <svg
                    width="26"
                    height="26"
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
                <h3 className="text-[16px] font-bold text-[#3D4127]">
                  Belum Ada Data Kehadiran
                </h3>
                <p className="text-[13px] text-[#3D4127]/70 max-w-[360px]">
                  Catatan kehadiran Anda akan otomatis tampil di sini setelah guru
                  melakukan absensi kelas.
                </p>
              </div>
            )}

            {/* Data Table */}
            {!isLoading && attendanceRecords.length > 0 && (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-[14px] text-[#3D4127]">
                  <thead>
                    <tr className="border-b border-[#D3D8C3] text-[12px] font-bold text-[#3D4127]/60 uppercase tracking-wider">
                      <th className="py-3 px-3 w-12 text-center">No</th>
                      <th className="py-3 px-3">Hari & Tanggal</th>
                      <th className="py-3 px-3">Kelas</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF0E8]">
                    {attendanceRecords.map((item, idx) => {
                      const cfg =
                        statusConfig[item.status] || statusConfig.hadir;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#EDF0E8]/50 transition-colors"
                        >
                          <td className="py-3 px-3 font-semibold text-[#3D4127]/60 text-center">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#3D4127]">
                            {formatTanggalIndonesia(item.tanggal)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#3D4127]/10 text-[12px] font-bold text-[#3D4127]">
                              {profile?.kelas ? `Kelas ${profile.kelas}` : "-"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${cfg.badgeClass}`}
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
        </main>
      </div>
    </SiswaGuard>
  );
}
