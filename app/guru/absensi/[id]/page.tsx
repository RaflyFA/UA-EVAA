"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa";

interface SiswaAbsen {
  id: string;
  nama: string;
  nomorInduk?: string;
  avatar: string;
  status: AttendanceStatus;
}

const statusConfig: {
  value: AttendanceStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "hadir",
    label: "Hadir",
    activeClass: "bg-[#636B2F] text-white font-bold shadow-xs",
  },
  {
    value: "sakit",
    label: "Sakit",
    activeClass: "bg-[#636B2F] text-white font-bold shadow-xs",
  },
  {
    value: "izin",
    label: "Izin",
    activeClass: "bg-[#636B2F] text-white font-bold shadow-xs",
  },
  {
    value: "alpa",
    label: "Alpa",
    activeClass: "bg-[#636B2F] text-white font-bold shadow-xs",
  },
];

export default function GuruDetailAbsensiPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const rawId = decodeURIComponent((params?.id as string) || "");

  // Ekstrak tanggal & kelas dari format ${tanggal}__${kelas}
  const [initialTanggal, initialKelas] = useMemo(() => {
    let tgl = new Date().toISOString().split("T")[0];
    let kls = "VII-A";
    if (rawId.includes("__")) {
      const parts = rawId.split("__");
      if (parts[0]) tgl = parts[0];
      if (parts[1]) kls = parts[1];
    }
    return [tgl, kls];
  }, [rawId]);

  const [selectedTanggal, setSelectedTanggal] = useState(initialTanggal);
  const [selectedKelas, setSelectedKelas] = useState(initialKelas);
  const [searchQuery, setSearchQuery] = useState("");
  const [siswaAbsensi, setSiswaAbsensi] = useState<SiswaAbsen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const judulAbsensi = `Absensi Kehadiran Kelas ${selectedKelas}`;

  // Format tanggal dalam bahasa Indonesia
  const formattedTanggal = useMemo(() => {
    try {
      const d = new Date(selectedTanggal + "T00:00:00");
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return selectedTanggal;
    }
  }, [selectedTanggal]);

  // Cegah penutupan tab / browser reload jika ada perubahan belum disimpan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Handler navigasi: tampilkan custom popup modal jika ada perubahan belum disimpan
  const handleNavigateAway = (targetUrl: string) => {
    if (isDirty) {
      setPendingNavigationUrl(targetUrl);
      setShowUnsavedModal(true);
      return;
    }
    router.push(targetUrl);
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Ambil seluruh siswa di kelas ini
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, nama_lengkap, avatar_url, nomor_induk, kelas")
          .eq("role", "siswa")
          .eq("kelas", selectedKelas)
          .order("nama_lengkap", { ascending: true });

        if (profileErr) {
          console.error("Error fetching profiles:", profileErr);
        }

        const students = profiles || [];

        // 2. Ambil catatan absensi yang sudah tersimpan untuk tanggal ini
        const studentIds = students.map((s) => s.id);
        const statusMap = new Map<string, AttendanceStatus>();

        if (studentIds.length > 0) {
          const { data: existingAbsensi } = await supabase
            .from("absensi")
            .select("siswa_id, status")
            .eq("tanggal", selectedTanggal)
            .in("siswa_id", studentIds);

          (existingAbsensi || []).forEach((row) => {
            const st = (row.status || "").toLowerCase() as AttendanceStatus;
            if (["hadir", "sakit", "izin", "alpa"].includes(st)) {
              statusMap.set(row.siswa_id, st);
            }
          });
        }

        // 3. Gabungkan: jika sudah ada gunakan status DB, jika belum ada default 'hadir'
        const mapped: SiswaAbsen[] = students.map((s) => ({
          id: s.id,
          nama: s.nama_lengkap || "Siswa",
          nomorInduk: s.nomor_induk || undefined,
          avatar: s.avatar_url || "/guru/profile.jpg",
          status: statusMap.get(s.id) || "hadir",
        }));

        setSiswaAbsensi(mapped);
        setIsDirty(false);
      } catch (err) {
        console.error("Error in loadData:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedKelas, selectedTanggal]);

  const handleStatusChange = (siswaId: string, newStatus: AttendanceStatus) => {
    setSiswaAbsensi((prev) =>
      prev.map((siswa) =>
        siswa.id === siswaId ? { ...siswa, status: newStatus } : siswa
      )
    );
    setIsDirty(true);
  };

  const handleSetAllStatus = (targetStatus: AttendanceStatus) => {
    setSiswaAbsensi((prev) =>
      prev.map((siswa) => ({ ...siswa, status: targetStatus }))
    );
    setIsDirty(true);
  };

  const handleSaveAbsensi = async () => {
    if (!user) {
      setSaveNotification({
        type: "error",
        message: "Sesi login tidak ditemukan. Silakan login ulang.",
      });
      return;
    }

    if (siswaAbsensi.length === 0) {
      setSaveNotification({
        type: "error",
        message: "Tidak ada siswa yang dapat diabsen pada kelas ini.",
      });
      return;
    }

    setIsSaving(true);
    setSaveNotification(null);

    try {
      const records = siswaAbsensi.map((s) => ({
        siswa_id: s.id,
        tanggal: selectedTanggal,
        status: s.status,
        dicatat_oleh: user.id,
      }));

      const { error } = await supabase.from("absensi").upsert(records, {
        onConflict: "siswa_id,tanggal",
      });

      if (error) {
        throw error;
      }

      setIsDirty(false);
      setSaveNotification({
        type: "success",
        message: `Absensi ${selectedKelas} untuk tanggal ${formattedTanggal} berhasil disimpan!`,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan absensi ke server.";
      setSaveNotification({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveNotification(null), 5000);
    }
  };

  // Ringkasan hitungan
  const stats = useMemo(() => {
    const total = siswaAbsensi.length;
    const hadir = siswaAbsensi.filter((s) => s.status === "hadir").length;
    const sakit = siswaAbsensi.filter((s) => s.status === "sakit").length;
    const izin = siswaAbsensi.filter((s) => s.status === "izin").length;
    const alpa = siswaAbsensi.filter((s) => s.status === "alpa").length;
    return { total, hadir, sakit, izin, alpa };
  }, [siswaAbsensi]);

  const filteredSiswa = siswaAbsensi.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nomorInduk && s.nomorInduk.includes(searchQuery))
  );

  return (
    <div className="w-full flex flex-col gap-4 pb-12">
      {/* Top Bar Navigation & Actions */}
      <div className="w-full max-w-[1158px] min-h-[72px] bg-[#FBFFF3] rounded-[16px] px-[24px] py-[16px] flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040] flex-wrap gap-3">
        {/* Breadcrumb Kiri */}
        <div className="flex items-center gap-2 text-[15px] text-[#3D4127] flex-wrap">
          <button
            type="button"
            onClick={() => handleNavigateAway("/guru/absensi")}
            className="font-bold hover:underline transition-all flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-[#3D4127]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Daftar Absensi
          </button>
          <span className="text-[#3D4127]/40 font-normal">/</span>
          <span className="font-semibold text-[#3D4127]">{judulAbsensi}</span>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNavigateAway("/guru/absensi")}
            className="text-[#636B2F] font-semibold text-[14px] hover:bg-[#636B2F]/10 px-3 py-2 rounded-[12px] transition-colors cursor-pointer"
          >
            Kembali
          </button>
          <button
            onClick={handleSaveAbsensi}
            disabled={isSaving || isLoading || siswaAbsensi.length === 0}
            className="bg-[#636B2F] text-[#FBFFF3] rounded-[12px] px-5 py-2.5 font-bold text-[14px] hover:bg-[#525826] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isSaving ? "Menyimpan..." : "Simpan Absensi"}</span>
          </button>
        </div>
      </div>

      {/* Notifikasi Toast */}
      {saveNotification && (
        <div
          className={`w-full max-w-[1158px] rounded-[12px] px-4 py-3 text-[14px] font-semibold flex items-center justify-between transition-all ${
            saveNotification.type === "success"
              ? "bg-[#636B2F]/15 border border-[#636B2F] text-[#3D4127]"
              : "bg-[#dc2626]/15 border border-[#dc2626] text-[#b91c1c]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{saveNotification.type === "success" ? "✓" : "⚠️"}</span>
            <span>{saveNotification.message}</span>
          </div>
          <button
            onClick={() => setSaveNotification(null)}
            className="opacity-70 hover:opacity-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Kotak Info Sesi Absensi & Stat Cards */}
      <div className="w-full max-w-[1158px] bg-[#FBFFF3] rounded-[16px] p-[20px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Field Kelas */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#3D4127]/70">
              Kelas
            </label>
            <div className="w-full bg-[#EDF0E8] rounded-[12px] px-3.5 py-2.5 text-[#3D4127] font-bold text-[14px] border border-[#D3D8C3]/50 flex items-center justify-between">
              <span>Kelas {selectedKelas}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#636B2F]/15 text-[#636B2F] text-[11px] font-bold uppercase">
                Aktif
              </span>
            </div>
          </div>

          {/* Field Tanggal */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#3D4127]/70">
              Tanggal Pelaksanaan
            </label>
            <div className="w-full bg-[#EDF0E8] rounded-[12px] px-3.5 py-2.5 text-[#3D4127] font-bold text-[14px] border border-[#D3D8C3]/50 flex items-center justify-between">
              <span>{formattedTanggal}</span>
            </div>
          </div>

          {/* Field Total Siswa */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#3D4127]/70">
              Total Siswa Terdaftar
            </label>
            <div className="w-full bg-[#EDF0E8] rounded-[12px] px-3.5 py-2.5 text-[#3D4127] font-bold text-[14px] border border-[#D3D8C3]/50 flex items-center justify-between">
              <span>{stats.total} Siswa</span>
              <span className="text-[12px] font-medium text-[#3D4127]/60">
                {stats.hadir} Hadir ({stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Summary Chips & Quick Action */}
        <div className="flex items-center justify-between pt-2 border-t border-[#3D4127]/10 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap text-[12px]">
            <span className="px-2.5 py-1 rounded-full bg-[#636B2F]/15 text-[#636B2F] font-bold">
              Hadir: {stats.hadir}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#636B2F]/15 text-[#636B2F] font-bold">
              Sakit: {stats.sakit}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#636B2F]/15 text-[#636B2F] font-bold">
              Izin: {stats.izin}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#636B2F]/15 text-[#636B2F] font-bold">
              Alpa: {stats.alpa}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSetAllStatus("hadir")}
            className="bg-[#636B2F] hover:bg-[#525826] text-[#FBFFF3] text-[12px] font-bold px-3.5 py-2 rounded-[10px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <span>✓</span> Tandai Semua Hadir
          </button>
        </div>
      </div>

      {/* Control Search Siswa */}
      <div className="w-[260px] h-[48px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[10px] flex items-center justify-between gap-[10px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari siswa di kelas ini..."
          className="w-full bg-transparent text-[#3D4127] placeholder-[#3D4127]/50 text-[13px] font-medium focus:outline-none"
        />
        <Image
          src="/guru/search.svg"
          alt="Search"
          width={16}
          height={16}
          className="object-contain flex-shrink-0"
        />
      </div>

      {/* Kotak Detail Absen Per Siswa */}
      <div className="w-full max-w-[1158px] min-h-[400px] bg-[#FBFFF3] rounded-[16px] p-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-2">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3D4127]/60">
            <div className="w-8 h-8 border-3 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
            <span className="text-[14px]">Memuat daftar siswa kelas {selectedKelas}...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && siswaAbsensi.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EDF0E8] flex items-center justify-center text-[#636B2F]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#3D4127]">
              Belum Ada Siswa di Kelas {selectedKelas}
            </h3>
            <p className="text-[13px] text-[#3D4127]/70 max-w-[420px]">
              Tidak ada akun siswa dengan kelas <b>{selectedKelas}</b> di database.
              Pastikan siswa mendaftar dengan memilih kelas {selectedKelas}.
            </p>
            <button
              type="button"
              onClick={() => handleNavigateAway("/guru/absensi")}
              className="mt-2 bg-[#636B2F] hover:bg-[#525826] text-white text-[13px] font-semibold px-4 py-2 rounded-[12px] transition-colors cursor-pointer"
            >
              Kembali ke Daftar Absensi
            </button>
          </div>
        )}

        {/* Siswa List */}
        {!isLoading && siswaAbsensi.length > 0 && (
          <div className="flex flex-col gap-[6px] w-full">
            {filteredSiswa.map((siswa, idx) => (
              <div
                key={siswa.id}
                className="w-full min-h-[52px] px-[14px] py-2 flex items-center justify-between gap-[12px] text-[#3D4127] border-b border-[#EDF0E8] last:border-0 hover:bg-[#EDF0E8]/40 rounded-xl transition-colors flex-wrap"
              >
                {/* Kolom Siswa: Nomor Urut + Avatar + Nama + NISN */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-[12px] font-semibold text-[#3D4127]/50 text-right">
                    {idx + 1}.
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0 border border-[#3D4127]/10 bg-[#EDF0E8]">
                    <Image
                      src={siswa.avatar}
                      alt={siswa.nama}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold text-[#3D4127] truncate">
                      {siswa.nama}
                    </span>
                    {siswa.nomorInduk && (
                      <span className="text-[11px] font-medium text-[#3D4127]/60">
                        NISN: {siswa.nomorInduk}
                      </span>
                    )}
                  </div>
                </div>

                {/* Segmented Control 4 Status: Hadir | Sakit | Izin | Alpa */}
                <div className="bg-[#EDF0E8] rounded-[14px] p-[4px] flex items-center gap-[4px] flex-shrink-0">
                  {statusConfig.map((cfg) => {
                    const isActive = siswa.status === cfg.value;
                    return (
                      <button
                        key={cfg.value}
                        type="button"
                        onClick={() => handleStatusChange(siswa.id, cfg.value)}
                        className={`min-w-[68px] h-[32px] rounded-[10px] px-2 flex items-center justify-center transition-all cursor-pointer text-[12px] ${
                          isActive
                            ? cfg.activeClass
                            : "text-[#3D4127]/80 font-medium hover:bg-black/5"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredSiswa.length === 0 && searchQuery && (
              <div className="py-12 text-center text-[13px] text-[#3D4127]/60">
                Tidak ada siswa yang cocok dengan pencarian &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Popup Konfirmasi Perubahan Belum Disimpan */}
      {showUnsavedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2213]/65 backdrop-blur-[6px] transition-all duration-200 select-none animate-in fade-in cursor-pointer"
          onClick={() => setShowUnsavedModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-[400px] bg-[#FBFFF3] border border-[#3D4127]/15 rounded-[28px] shadow-[0px_16px_36px_rgba(0,0,0,0.22)] p-6 sm:p-7 flex flex-col items-center text-center gap-4 transition-all animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >


            {/* Header Teks */}
            <div className="flex flex-col gap-1.5 w-full">
              <h2 className="text-[20px] font-bold text-[#3D4127] leading-tight">
                Perubahan Belum Disimpan
              </h2>
              <p className="text-[13px] font-[500] text-[#555A38] leading-relaxed mt-1">
                Anda mengubah data absensi namun belum menyimpannya. Perubahan akan hilang jika belum disimpan.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-center gap-3 w-full mt-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 h-[46px] rounded-[16px] text-[14px] font-bold text-[#3D4127] bg-[#EDF0E8] hover:bg-[#D3D8C3] transition-colors cursor-pointer"
              >
                Tetap di Sini
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  if (pendingNavigationUrl) {
                    router.push(pendingNavigationUrl);
                  }
                }}
                className="flex-1 h-[46px] rounded-[16px] text-[14px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] shadow-md transition-colors cursor-pointer"
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
