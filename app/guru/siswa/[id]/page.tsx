"use client";

import { useState, useEffect, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface KomponenNilai {
  tahap: "harti" | "surti" | "bukti" | "bakti" | "sajati";
  nama: string;
  nilai: string;
  maksimal: string;
  keterangan: string;
}

interface SubmissionItem {
  id: string;
  tahap_niti: "bukti" | "bakti";
  nama_file: string;
  file_url: string;
  status: string;
  catatan_revisi: string | null;
  tanggal_submit: string;
}

interface JawabanSurti {
  masalah_ditemukan: string;
  alternatif_solusi: string;
  validasi_kebenaran: boolean;
}

interface SiswaPenilaian {
  id: string;
  nama: string;
  kelas: string;
  avatar: string;
  komponen: KomponenNilai[];
  submissions: Record<string, SubmissionItem | undefined>;
  jawabanSurti?: JawabanSurti;
}

const DEFAULT_KOMPONEN: KomponenNilai[] = [
  { tahap: "harti", nama: "Niti Harti", nilai: "0", maksimal: "/ 100", keterangan: "" },
  { tahap: "surti", nama: "Niti Surti", nilai: "0", maksimal: "/ 100", keterangan: "" },
  { tahap: "bukti", nama: "Niti Bukti", nilai: "0", maksimal: "/ 100", keterangan: "" },
  { tahap: "bakti", nama: "Niti Bakti", nilai: "0", maksimal: "/ 100", keterangan: "" },
  { tahap: "sajati", nama: "Niti Sajati", nilai: "0", maksimal: "/ 100", keterangan: "" },
];

function getDocumentPreviewUrl(fileUrl?: string, fileName?: string): string {
  if (!fileUrl) return "#";
  const name = (fileName || fileUrl).toLowerCase();
  const ext = name.split("?")[0].split(".").pop() || "";

  // Format berkas Microsoft Office (Word, Excel, PowerPoint) tidak memiliki viewer bawaan di browser
  // Menggunakan Google Docs Viewer agar langsung terbuka di tab baru untuk pratinjau dokumen tanpa auto-download
  const officeExtensions = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  if (officeExtensions.includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false`;
  }

  // File PDF, gambar (jpg, png, webp) atau berkas native browser lainnya bisa langsung dibuka di tab baru
  return fileUrl;
}

export default function GuruDetailPenilaianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const targetId = resolvedParams?.id;

  const [judulPenilaian] = useState("Penilaian Proyek Niti");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [isKelasDropdownOpen, setIsKelasDropdownOpen] = useState(false);
  const [selectedTanggal] = useState(() => {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveNotification, setSaveNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Unsaved changes state & modal
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);

  // Accordion active state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Daftar data siswa beserta tugas & penilaian
  const [siswaList, setSiswaList] = useState<SiswaPenilaian[]>([]);

  // Current logged in teacher
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // 1. Fetch data dari Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Ambil session user guru
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          setTeacherId(authData.user.id);
        }

        // Ambil seluruh siswa
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("id, nama_lengkap, kelas, avatar_url")
          .eq("role", "siswa")
          .order("nama_lengkap", { ascending: true });

        if (pErr) throw pErr;

        if (!profiles || profiles.length === 0) {
          setSiswaList([]);
          setIsLoading(false);
          return;
        }

        const studentIds = profiles.map((p) => p.id);

        // Ambil submissions (Niti Bukti & Bakti)
        const { data: submissions } = await supabase
          .from("submission_aksi")
          .select("*")
          .in("siswa_id", studentIds);

        // Ambil jawaban Niti Surti
        const { data: surtiAnswers } = await supabase
          .from("jawaban_niti_surti")
          .select("*")
          .in("siswa_id", studentIds);

        // Ambil nilai yang sudah ada
        const { data: nilaiRows } = await supabase
          .from("nilai")
          .select("*")
          .in("siswa_id", studentIds);

        // Bentuk struktur data penilaian tiap siswa
        const formatted: SiswaPenilaian[] = profiles.map((p) => {
          // Cari submission siswa
          const studentSubs = (submissions || []).filter(
            (s) => s.siswa_id === p.id
          );
          const subMap: Record<string, SubmissionItem | undefined> = {};
          studentSubs.forEach((sub) => {
            subMap[sub.tahap_niti] = sub;
          });

          // Cari jawaban surti
          const surtiAns = (surtiAnswers || []).find((a) => a.siswa_id === p.id);

          // Cari data nilai lama jika ada
          const studentNilai = (nilaiRows || []).filter(
            (n) => n.siswa_id === p.id
          );

          // Coba parse catatan JSON jika ada
          let customKomponen: KomponenNilai[] | null = null;
          for (const nRow of studentNilai) {
            if (nRow.catatan && nRow.catatan.startsWith("[")) {
              try {
                const parsed = JSON.parse(nRow.catatan);
                if (Array.isArray(parsed) && parsed.length === 5) {
                  customKomponen = parsed;
                  break;
                }
              } catch {
                // Not JSON, ignore
              }
            }
          }

          // Pasangkan nilai ke komponen
          const komponen = DEFAULT_KOMPONEN.map((k) => {
            if (customKomponen) {
              const matched = customKomponen.find(
                (ck) => ck.nama.toLowerCase() === k.nama.toLowerCase()
              );
              if (matched) return matched;
            }

            // Jika ada nilai row untuk submission bukti / bakti
            if (k.tahap === "bukti" && subMap.bukti) {
              const subNilai = studentNilai.find(
                (n) => n.submission_id === subMap.bukti?.id
              );
              if (subNilai) {
                return {
                  ...k,
                  nilai: String(subNilai.nilai_angka ?? k.nilai),
                  keterangan: subNilai.catatan || k.keterangan,
                };
              }
            }
            if (k.tahap === "bakti" && subMap.bakti) {
              const subNilai = studentNilai.find(
                (n) => n.submission_id === subMap.bakti?.id
              );
              if (subNilai) {
                return {
                  ...k,
                  nilai: String(subNilai.nilai_angka ?? k.nilai),
                  keterangan: subNilai.catatan || k.keterangan,
                };
              }
            }

            return { ...k };
          });

          return {
            id: p.id,
            nama: p.nama_lengkap || "Siswa",
            kelas: p.kelas || "VII-A",
            avatar: p.avatar_url || "/guru/profile.jpg",
            komponen,
            submissions: subMap,
            jawabanSurti: surtiAns,
          };
        });

        setSiswaList(formatted);

        // Expand target siswa jika ada di URL, atau siswa pertama
        if (targetId && formatted.some((s) => s.id === targetId)) {
          setExpandedId(targetId);
        } else if (formatted.length > 0) {
          setExpandedId(formatted[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat data penilaian:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [targetId]);

  // Tutup dropdown kelas jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-kelas]")) {
        setIsKelasDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Opsi Kelas
  const availableClasses = useMemo(() => {
    return [
      "Semua Kelas",
      ...Array.from(new Set(siswaList.map((s) => s.kelas).filter(Boolean))),
    ];
  }, [siswaList]);

  // Filter Siswa
  const filteredSiswa = useMemo(() => {
    return siswaList.filter((s) => {
      const matchSearch = s.nama
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchKelas =
        selectedKelas === "Semua Kelas" || s.kelas === selectedKelas;
      return matchSearch && matchKelas;
    });
  }, [siswaList, searchQuery, selectedKelas]);

  // Toggle Accordion
  const toggleAccordion = (siswaId: string) => {
    setExpandedId((prev) => (prev === siswaId ? null : siswaId));
  };

  // Handle Perubahan Nilai
  const handleInputChange = (
    siswaId: string,
    kompIdx: number,
    field: "nilai" | "keterangan",
    val: string
  ) => {
    setIsDirty(true);
    setSiswaList((prev) =>
      prev.map((s) => {
        if (s.id !== siswaId) return s;
        const newKomponen = [...s.komponen];
        newKomponen[kompIdx] = {
          ...newKomponen[kompIdx],
          [field]: val,
        };
        return {
          ...s,
          komponen: newKomponen,
        };
      })
    );
  };

  // Navigasi Aman (Unsaved Changes)
  const handleSafeNavigate = (url: string) => {
    if (isDirty) {
      setPendingNavigationUrl(url);
      setShowUnsavedModal(true);
    } else {
      router.push(url);
    }
  };

  const confirmDiscardAndNavigate = () => {
    setIsDirty(false);
    setShowUnsavedModal(false);
    if (pendingNavigationUrl) {
      router.push(pendingNavigationUrl);
    }
  };

  // Hitung rata-rata
  const hitungRataRata = (komponen: KomponenNilai[]) => {
    const validScores = komponen
      .map((k) => parseFloat(k.nilai))
      .filter((n) => !isNaN(n));
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / validScores.length);
  };

  // 2. Simpan Nilai ke Supabase
  const handleSaveNilai = async () => {
    setIsSaving(true);
    setSaveNotification(null);

    try {
      // Ambil user guru yang sedang login
      let currentTeacherId = teacherId;
      if (!currentTeacherId) {
        const { data: userData } = await supabase.auth.getUser();
        currentTeacherId = userData?.user?.id || null;
      }

      if (!currentTeacherId) {
        throw new Error("Sesi guru tidak ditemukan. Silakan masuk kembali.");
      }

      const now = new Date().toISOString();

      // Loop setiap siswa dan simpan penilaian
      for (const siswa of siswaList) {
        const rataRata = hitungRataRata(siswa.komponen);

        // A. Update submission Niti Bukti jika ada
        const buktiSub = siswa.submissions.bukti;
        const buktiKomp = siswa.komponen.find((k) => k.tahap === "bukti");
        if (buktiSub && buktiKomp) {
          const parsed = parseFloat(buktiKomp.nilai);
          const score = isNaN(parsed) ? 0 : parsed;
          await supabase
            .from("submission_aksi")
            .update({
              status: score >= 70 ? "disetujui" : "perlu_revisi",
              catatan_revisi: buktiKomp.keterangan,
              direview_oleh: currentTeacherId,
              tanggal_review: now,
            })
            .eq("id", buktiSub.id);

          // Simpan ke tabel nilai
          await supabase.from("nilai").upsert({
            submission_id: buktiSub.id,
            siswa_id: siswa.id,
            nilai_angka: score,
            catatan: buktiKomp.keterangan || JSON.stringify(siswa.komponen),
            diberikan_oleh: currentTeacherId,
            created_at: now,
          });

          // Update progress_siswa untuk bukti
          if (score >= 70) {
            await supabase
              .from("progress_siswa")
              .update({ status: "disetujui", tanggal_selesai: now })
              .eq("siswa_id", siswa.id)
              .eq("tahap_niti", "bukti");

            // Buka Niti Bakti jika terkunci
            await supabase
              .from("progress_siswa")
              .update({ status: "tersedia" })
              .eq("siswa_id", siswa.id)
              .eq("tahap_niti", "bakti")
              .eq("status", "terkunci");
          }
        }

        // B. Update submission Niti Bakti jika ada
        const baktiSub = siswa.submissions.bakti;
        const baktiKomp = siswa.komponen.find((k) => k.tahap === "bakti");
        if (baktiSub && baktiKomp) {
          const parsed = parseFloat(baktiKomp.nilai);
          const score = isNaN(parsed) ? 0 : parsed;
          await supabase
            .from("submission_aksi")
            .update({
              status: score >= 70 ? "disetujui" : "perlu_revisi",
              catatan_revisi: baktiKomp.keterangan,
              direview_oleh: currentTeacherId,
              tanggal_review: now,
            })
            .eq("id", baktiSub.id);

          // Simpan ke tabel nilai
          await supabase.from("nilai").upsert({
            submission_id: baktiSub.id,
            siswa_id: siswa.id,
            nilai_angka: score,
            catatan: baktiKomp.keterangan || JSON.stringify(siswa.komponen),
            diberikan_oleh: currentTeacherId,
            created_at: now,
          });

          // Update progress_siswa untuk bakti
          if (score >= 70) {
            await supabase
              .from("progress_siswa")
              .update({ status: "disetujui", tanggal_selesai: now })
              .eq("siswa_id", siswa.id)
              .eq("tahap_niti", "bakti");

            // Buka Niti Sajati jika terkunci
            await supabase
              .from("progress_siswa")
              .update({ status: "tersedia" })
              .eq("siswa_id", siswa.id)
              .eq("tahap_niti", "sajati")
              .eq("status", "terkunci");
          }
        }

        // C. Update validasi Niti Surti jika siswa sudah menjawab
        if (siswa.jawabanSurti) {
          await supabase
            .from("jawaban_niti_surti")
            .update({ validasi_kebenaran: true, updated_at: now })
            .eq("siswa_id", siswa.id);

          await supabase
            .from("progress_siswa")
            .update({ status: "disetujui", tanggal_selesai: now })
            .eq("siswa_id", siswa.id)
            .eq("tahap_niti", "surti");
        }

        // D. Update progress Harti & Sajati jika dinilai >= 70
        const hartiKomp = siswa.komponen.find((k) => k.tahap === "harti");
        if (hartiKomp && (parseFloat(hartiKomp.nilai) || 0) >= 70) {
          await supabase
            .from("progress_siswa")
            .update({ status: "disetujui", tanggal_selesai: now })
            .eq("siswa_id", siswa.id)
            .eq("tahap_niti", "harti");
        }

        const sajatiKomp = siswa.komponen.find((k) => k.tahap === "sajati");
        if (sajatiKomp && (parseFloat(sajatiKomp.nilai) || 0) >= 70) {
          await supabase
            .from("progress_siswa")
            .update({ status: "disetujui", tanggal_selesai: now })
            .eq("siswa_id", siswa.id)
            .eq("tahap_niti", "sajati");
        }
      }

      setIsDirty(false);
      setSaveNotification({
        type: "success",
        message: "Seluruh nilai dan evaluasi siswa berhasil disimpan ke sistem!",
      });
    } catch (err: unknown) {
      console.error("Gagal menyimpan nilai:", err);
      const errMsg = err instanceof Error ? err.message : "Terjadi kendala jaringan.";
      setSaveNotification({
        type: "error",
        message: `Gagal menyimpan: ${errMsg}`,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveNotification(null), 4000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Bar Navigation (Height: 72px) */}
      <div className="w-full max-w-[1158px] min-h-[72px] bg-[#FBFFF3] rounded-[16px] px-6 py-4 flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040] flex-wrap gap-3 border border-[#D3D8C3]/40">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[16px] text-[#3D4127]">
          <button
            onClick={() => handleSafeNavigate("/guru/siswa")}
            className="font-bold hover:text-[#636B2F] transition-colors cursor-pointer"
          >
            Input Nilai
          </button>
          <span className="text-[#3D4127]/40 font-normal">/</span>
          <span className="font-semibold text-[#3D4127]">
            {judulPenilaian}
          </span>
          {isDirty && (
            <span className="ml-2 w-2.5 h-2.5 rounded-full bg-[#d97706]" title="Ada perubahan yang belum disimpan" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSafeNavigate("/guru/siswa")}
            className="text-[#636B2F] font-semibold text-[14px] hover:opacity-80 transition-opacity cursor-pointer"
          >
            Kembali
          </button>
          <button
            onClick={handleSaveNilai}
            disabled={isSaving}
            className="bg-[#636B2F] text-[#FBFFF3] rounded-[12px] px-5 py-2.5 font-semibold text-[14px] hover:bg-[#525826] shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isSaving ? "Menyimpan..." : "Simpan Nilai"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {saveNotification && (
        <div
          className={`w-full max-w-[1158px] rounded-[12px] px-4 py-3 text-[14px] font-semibold flex items-center justify-between border ${
            saveNotification.type === "success"
              ? "bg-[#636B2F]/10 border-[#636B2F] text-[#3D4127]"
              : "bg-[#dc2626]/10 border-[#dc2626] text-[#b91c1c]"
          }`}
        >
          <span>
            {saveNotification.type === "success" ? "✓" : "✕"}{" "}
            {saveNotification.message}
          </span>
          <button
            onClick={() => setSaveNotification(null)}
            className="opacity-70 hover:opacity-100 ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter & Judul Box */}
      <div className="w-full max-w-[1158px] bg-[#FBFFF3] rounded-[16px] p-6 flex items-center gap-4 shadow-[0px_2px_2px_0px_#00000040] flex-wrap border border-[#D3D8C3]/40">
        {/* Nama Kegiatan Penilaian */}
        <div className="flex-[1.5] min-w-[240px] flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#3D4127]/70">
            Kategori Penilaian
          </label>
          <div className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40">
            Penilaian 5 Tahap Niti (Harti, Surti, Bukti, Bakti, Sajati)
          </div>
        </div>

        {/* Filter Kelas Dropdown */}
        <div className="flex-1 min-w-[160px] flex flex-col gap-1.5 relative" data-dropdown-kelas>
          <label className="text-[12px] font-medium text-[#3D4127]/70">
            Kelas
          </label>
          <div
            onClick={() => setIsKelasDropdownOpen(!isKelasDropdownOpen)}
            className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 flex items-center justify-between cursor-pointer hover:border-[#636B2F] transition-colors"
          >
            <span>{selectedKelas}</span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Select Kelas"
              width={16}
              height={16}
              className={`object-contain transition-transform ${
                isKelasDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isKelasDropdownOpen && (
            <div className="absolute top-[72px] left-0 right-0 bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] shadow-lg py-1 z-30 overflow-hidden">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setSelectedKelas(cls);
                    setIsKelasDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${
                    selectedKelas === cls
                      ? "bg-[#636B2F] text-white font-semibold"
                      : "text-[#3D4127] hover:bg-[#EDF0E8]"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tanggal Penilaian */}
        <div className="flex-1 min-w-[160px] flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#3D4127]/70">
            Tanggal Evaluasi
          </label>
          <div className="w-full bg-[#EDF0E8] rounded-[12px] p-3 text-[#3D4127] font-semibold text-[14px] border border-[#D3D8C3]/40 flex items-center justify-between">
            <span>{selectedTanggal}</span>
          </div>
        </div>
      </div>

      {/* Search Input Siswa */}
      <div className="w-[260px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="w-full max-w-[1158px] bg-[#FBFFF3] rounded-[16px] p-12 flex flex-col items-center justify-center gap-3 border border-[#D3D8C3]">
          <div className="w-8 h-8 border-3 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
          <span className="text-[14px] text-[#3D4127]/70">
            Memuat daftar tugas dan form penilaian siswa...
          </span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSiswa.length === 0 && (
        <div className="w-full max-w-[1158px] bg-[#FBFFF3] rounded-[16px] p-12 flex flex-col items-center justify-center text-center gap-2 border border-[#D3D8C3]">
          <h4 className="text-[16px] font-bold text-[#3D4127]">
            Tidak ada siswa ditemukan
          </h4>
          <p className="text-[13px] text-[#3D4127]/70">
            Coba ganti filter kelas atau kata kunci pencarian Anda.
          </p>
        </div>
      )}

      {/* Accordion List Siswa */}
      {!isLoading && filteredSiswa.length > 0 && (
        <div className="w-full max-w-[1158px] flex flex-col gap-3">
          {filteredSiswa.map((siswa) => {
            const isOpen = expandedId === siswa.id;
            const avgScore = hitungRataRata(siswa.komponen);

            return (
              <div
                key={siswa.id}
                className="w-full bg-[#FBFFF3] rounded-[16px] p-6 shadow-[0px_2px_2px_0px_#00000040] transition-all duration-300 overflow-hidden border border-[#D3D8C3]/40"
              >
                {/* Header Siswa (Click to toggle) */}
                <div
                  onClick={() => toggleAccordion(siswa.id)}
                  className="flex items-center justify-between cursor-pointer w-full select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#3D4127]/10 bg-[#EDF0E8] flex-shrink-0">
                      <Image
                        src={siswa.avatar}
                        alt={siswa.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-[#3D4127]">
                          {siswa.nama}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF0E8] text-[11px] font-bold text-[#3D4127]">
                          {siswa.kelas}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium text-[#636B2F]">
                        Rata-rata: <strong>{avgScore} / 100</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status badge tugas */}
                    <div className="hidden sm:flex items-center gap-2">
                      {siswa.submissions.bukti && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#16a34a]/10 text-[#15803d]">
                          Bukti: Ada Berkas
                        </span>
                      )}
                      {siswa.submissions.bakti && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#16a34a]/10 text-[#15803d]">
                          Bakti: Ada Berkas
                        </span>
                      )}
                    </div>

                    <Image
                      src="/guru/panah bawah.svg"
                      alt="Toggle"
                      width={16}
                      height={16}
                      className={`object-contain transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Konten Terbuka */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-5 pt-4 border-t border-[#EDF0E8]"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden flex flex-col gap-5">
                    {/* Seksi Tinjauan Tugas / Berkas Siswa */}
                    <div className="bg-[#EDF0E8]/50 rounded-[14px] p-4 border border-[#D3D8C3]/50 flex flex-col gap-3">
                      <h5 className="text-[13px] font-bold text-[#3D4127] uppercase tracking-wider">
                        Hasil Pekerjaan Siswa
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
                        {/* Surti Info */}
                        <div className="bg-[#FBFFF3] p-3 rounded-xl border border-[#D3D8C3]/40 flex flex-col gap-1">
                          <span className="font-bold text-[#636B2F]">
                            Niti Surti (Observasi)
                          </span>
                          {siswa.jawabanSurti ? (
                            <div className="text-[#3D4127] text-[12px] flex flex-col gap-0.5">
                              <p className="line-clamp-2">
                                <strong>Masalah:</strong> {siswa.jawabanSurti.masalah_ditemukan}
                              </p>
                              <p className="line-clamp-2">
                                <strong>Solusi:</strong> {siswa.jawabanSurti.alternatif_solusi}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[#9CA08D] text-[12px]">
                              Belum mengisi catatan observasi.
                            </span>
                          )}
                        </div>

                        {/* Bukti Sub */}
                        <div className="bg-[#FBFFF3] p-3 rounded-xl border border-[#D3D8C3]/40 flex flex-col justify-between gap-2">
                          <div>
                            <span className="font-bold text-[#636B2F]">
                              Niti Bukti (Rencana Aksi)
                            </span>
                            <p className="text-[12px] text-[#3D4127] truncate mt-0.5">
                              {siswa.submissions.bukti?.nama_file || "Belum ada berkas"}
                            </p>
                          </div>
                          {siswa.submissions.bukti?.file_url && (
                            <a
                              href={getDocumentPreviewUrl(
                                siswa.submissions.bukti.file_url,
                                siswa.submissions.bukti.nama_file
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] font-bold text-[#636B2F] hover:underline flex items-center gap-1"
                            >
                              <span>Lihat Berkas Dokumen ↗</span>
                            </a>
                          )}
                        </div>

                        {/* Bakti Sub */}
                        <div className="bg-[#FBFFF3] p-3 rounded-xl border border-[#D3D8C3]/40 flex flex-col justify-between gap-2">
                          <div>
                            <span className="font-bold text-[#636B2F]">
                              Niti Bakti (Aksi Lingkungan)
                            </span>
                            <p className="text-[12px] text-[#3D4127] truncate mt-0.5">
                              {siswa.submissions.bakti?.nama_file || "Belum ada berkas"}
                            </p>
                          </div>
                          {siswa.submissions.bakti?.file_url && (
                            <a
                              href={getDocumentPreviewUrl(
                                siswa.submissions.bakti.file_url,
                                siswa.submissions.bakti.nama_file
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] font-bold text-[#636B2F] hover:underline flex items-center gap-1"
                            >
                              <span>Lihat Berkas Laporan ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Header Tabel Komponen Penilaian */}
                    <div className="w-full px-2 flex items-center gap-3 text-[13px] font-bold text-[#9CA08D]">
                      <div className="flex-[2] truncate">Komponen Penilaian</div>
                      <div className="w-[120px] text-center truncate">
                        Nilai (1-100)
                      </div>
                      <div className="w-[80px] text-center truncate">Maksimal</div>
                      <div className="flex-[3] truncate">Catatan Evaluasi / Keterangan</div>
                    </div>

                    {/* Baris Komponen */}
                    <div className="flex flex-col gap-2 w-full">
                      {siswa.komponen.map((komp, kompIdx) => (
                        <div
                          key={komp.nama}
                          className="w-full min-h-[48px] px-2 py-1 flex items-center gap-3 text-[#3D4127] bg-[#FBFFF3] hover:bg-[#EDF0E8]/30 rounded-xl transition-colors"
                        >
                          {/* Nama Komponen */}
                          <div className="flex-[2] text-[14px] font-bold text-[#3D4127] truncate">
                            {komp.nama}
                          </div>

                          {/* Input Nilai */}
                          <div className="w-[120px] flex justify-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={komp.nilai}
                              onChange={(e) =>
                                handleInputChange(
                                  siswa.id,
                                  kompIdx,
                                  "nilai",
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.trim() === "" || isNaN(Number(e.target.value))) {
                                  handleInputChange(siswa.id, kompIdx, "nilai", "0");
                                }
                              }}
                              className="w-[90px] h-[38px] bg-[#EDF0E8] rounded-[10px] px-2 text-center text-[#3D4127] font-bold text-[14px] border border-[#D3D8C3]/60 focus:outline-none focus:border-[#636B2F]"
                            />
                          </div>

                          {/* Teks Maksimal */}
                          <div className="w-[80px] text-center text-[13px] font-medium text-[#3D4127]/70">
                            {komp.maksimal}
                          </div>

                          {/* Input Keterangan */}
                          <div className="flex-[3]">
                            <input
                              type="text"
                              value={komp.keterangan}
                              onChange={(e) =>
                                handleInputChange(
                                  siswa.id,
                                  kompIdx,
                                  "keterangan",
                                  e.target.value
                                )
                              }
                              placeholder="Masukkan evaluasi atau saran..."
                              className="w-full h-[38px] bg-[#EDF0E8] rounded-[10px] px-3 text-[#3D4127] font-medium text-[13px] border border-[#D3D8C3]/60 focus:outline-none focus:border-[#636B2F]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Rata-rata */}
                    <div className="pt-2 flex items-center justify-between text-[14px] border-t border-[#EDF0E8]">
                      <span className="font-semibold text-[#9CA08D]">
                        Total Nilai Rata-rata Proyek Niti:
                      </span>
                      <span className="font-extrabold text-[#636B2F] text-[16px]">
                        {avgScore} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Peringatan Perubahan Belum Disimpan */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[420px] bg-[#FBFFF3] rounded-[28px] p-6 sm:p-7 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] border border-[#D3D8C3] flex flex-col items-center text-center gap-4">
            
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[18px] font-bold text-[#3D4127]">
                Perubahan Belum Disimpan
              </h3>
              <p className="text-[13px] text-[#3D4127]/80 leading-relaxed">
                Anda telah mengubah nilai siswa. Jika berpindah halaman sekarang, perubahan tersebut akan hilang.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 py-2.5 border-2 border-[#636B2F] text-[#636B2F] rounded-[16px] font-bold text-[14px] hover:bg-[#636B2F]/10 transition-colors cursor-pointer"
              >
                Lanjut Mengisi
              </button>
              <button
                onClick={confirmDiscardAndNavigate}
                className="flex-1 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-[16px] font-bold text-[14px] transition-colors shadow-sm cursor-pointer"
              >
                Tinggalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
