"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ToastNotification from "@/components/ToastNotification";

interface SubmissionRow {
  id: string; // submission_aksi.id
  siswaId: string;
  nama: string;
  kelas: string;
  avatar: string;
  tahapNiti: "bukti" | "bakti";
  judulProyek: string; // nama_file
  fileUrl: string;
  tanggalSubmit: string; // ISO string
  status: "menunggu_review" | "disetujui" | "perlu_revisi";
  catatanRevisi?: string;
}

// Helper untuk pratinjau dokumen (Office via Google Docs Viewer, native utk PDF/gambar)
function getDocumentPreviewUrl(fileUrl?: string, fileName?: string): string {
  if (!fileUrl) return "#";
  const name = (fileName || fileUrl).toLowerCase();
  const ext = name.split("?")[0].split(".").pop() || "";
  const officeExtensions = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  if (officeExtensions.includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false`;
  }
  return fileUrl;
}

export default function GuruProjectPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedTahap, setSelectedTahap] = useState("Semua Tahap");
  const [sortAscending, setSortAscending] = useState(false); // Default descending (terbaru)

  // Dropdown UI states
  const [isKelasOpen, setIsKelasOpen] = useState(false);
  const [isTahapOpen, setIsTahapOpen] = useState(false);
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Tutup dropdown menu atau popover saat klik di luar area terkait
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-action-menu]")) {
        setActiveActionMenuId(null);
      }
      if (!target.closest("[data-status-dropdown]")) {
        setActiveStatusDropdownId(null);
      }
      if (!target.closest("[data-kelas-dropdown]")) {
        setIsKelasOpen(false);
      }
      if (!target.closest("[data-tahap-dropdown]")) {
        setIsTahapOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data dari Supabase
  const loadData = async () => {
    try {
      setIsLoading(true);

      // Ambil user pengajar yang sedang login
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setTeacherId(authData.user.id);
      }

      // Ambil data profiles siswa
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, kelas, avatar_url")
        .eq("role", "siswa");

      if (pErr) throw pErr;

      const profileMap = new Map<string, { nama: string; kelas: string; avatar: string }>();
      (profiles || []).forEach((p) => {
        profileMap.set(p.id, {
          nama: p.nama_lengkap || "Siswa",
          kelas: p.kelas || "VII-A",
          avatar: p.avatar_url || "/guru/profile.jpg",
        });
      });

      // Ambil semua submission bukti & bakti
      const { data: subs, error: sErr } = await supabase
        .from("submission_aksi")
        .select("*")
        .order("tanggal_submit", { ascending: false });

      if (sErr) throw sErr;

      // Gabungkan data submission dengan profil siswa
      const formatted: SubmissionRow[] = (subs || []).map((s) => {
        const student = profileMap.get(s.siswa_id) || {
          nama: "Siswa",
          kelas: "-",
          avatar: "/guru/profile.jpg",
        };

        return {
          id: s.id,
          siswaId: s.siswa_id,
          nama: student.nama,
          kelas: student.kelas,
          avatar: student.avatar,
          tahapNiti: (s.tahap_niti === "bakti" ? "bakti" : "bukti") as "bukti" | "bakti",
          judulProyek: s.nama_file || "Dokumen Proyek",
          fileUrl: s.file_url,
          tanggalSubmit: s.tanggal_submit,
          status: (s.status as "menunggu_review" | "disetujui" | "perlu_revisi") || "menunggu_review",
          catatanRevisi: s.catatan_revisi,
        };
      });

      setSubmissions(formatted);
    } catch (err: any) {
      console.error("Gagal mengambil data project:", err);
      setNotification({
        type: "error",
        message: "Gagal memuat data submission proyek dari server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update status submission ke Supabase & sync progress_siswa
  const handleStatusChange = async (
    submissionId: string,
    newStatus: "menunggu_review" | "disetujui" | "perlu_revisi"
  ) => {
    setActiveStatusDropdownId(null);
    const target = submissions.find((s) => s.id === submissionId);
    if (!target) return;

    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
    );

    try {
      const now = new Date().toISOString();

      // 1. Update ke tabel submission_aksi
      const { error: subErr } = await supabase
        .from("submission_aksi")
        .update({
          status: newStatus,
          direview_oleh: teacherId,
          tanggal_review: now,
        })
        .eq("id", submissionId);

      if (subErr) throw subErr;

      // 2. Sinkronkan dengan progress_siswa
      if (newStatus === "disetujui") {
        const { error: progErr } = await supabase
          .from("progress_siswa")
          .update({ status: "disetujui", tanggal_selesai: now })
          .eq("siswa_id", target.siswaId)
          .eq("tahap_niti", target.tahapNiti);
        if (progErr) console.warn("Error updating current progress_siswa:", progErr.message);

        // Buka tahap berikutnya
        if (target.tahapNiti === "bukti") {
          const { error: nextErr } = await supabase
            .from("progress_siswa")
            .update({ status: "tersedia" })
            .eq("siswa_id", target.siswaId)
            .eq("tahap_niti", "bakti");
          if (nextErr) console.warn("Error unlocking Niti Bakti:", nextErr.message);
        } else if (target.tahapNiti === "bakti") {
          const { error: nextErr } = await supabase
            .from("progress_siswa")
            .update({ status: "tersedia" })
            .eq("siswa_id", target.siswaId)
            .eq("tahap_niti", "sajati");
          if (nextErr) console.warn("Error unlocking Niti Sajati:", nextErr.message);
        }
      } else if (newStatus === "perlu_revisi") {
        const { error: progErr } = await supabase
          .from("progress_siswa")
          .update({ status: "perlu_revisi" })
          .eq("siswa_id", target.siswaId)
          .eq("tahap_niti", target.tahapNiti);
        if (progErr) console.warn("Error updating progress_siswa to perlu_revisi:", progErr.message);
      } else {
        const { error: progErr } = await supabase
          .from("progress_siswa")
          .update({ status: "menunggu_review" })
          .eq("siswa_id", target.siswaId)
          .eq("tahap_niti", target.tahapNiti);
        if (progErr) console.warn("Error updating progress_siswa to menunggu_review:", progErr.message);
      }

      setNotification({
        type: "success",
        message: `Status proyek "${target.nama}" berhasil diubah menjadi "${getStatusLabel(newStatus)}"`,
      });
    } catch (err: any) {
      console.error("Gagal memperbarui status:", err);
      setNotification({
        type: "error",
        message: `Gagal memperbarui status: ${err?.message || "Kesalahan jaringan"}`,
      });
      // Revert data
      loadData();
    }
  };

  // Helper buka pratinjau dokumen di tab baru
  const handleOpenFile = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      setNotification({
        type: "error",
        message: "Berkas dokumen tidak ditemukan.",
      });
      return;
    }
    const previewUrl = getDocumentPreviewUrl(fileUrl, fileName);
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  // Status visual label & styling
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disetujui":
        return "Disetujui";
      case "perlu_revisi":
        return "Perlu Revisi";
      case "menunggu_review":
      default:
        return "Diajukan";
    }
  };

  // Format tanggal Indonesia
  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // List opsi kelas unik dari data
  const availableClasses = useMemo(() => {
    const classes = new Set(submissions.map((s) => s.kelas).filter(Boolean));
    return ["Semua Kelas", ...Array.from(classes).sort()];
  }, [submissions]);

  const availableTahap = ["Semua Tahap", "Niti Bukti", "Niti Bakti"];

  // Filter & Urutan Data
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((item) => {
        // Search
        const query = searchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          item.nama.toLowerCase().includes(query) ||
          item.judulProyek.toLowerCase().includes(query) ||
          item.kelas.toLowerCase().includes(query);

        // Kelas
        const matchKelas =
          selectedKelas === "Semua Kelas" || item.kelas === selectedKelas;

        // Tahap
        const matchTahap =
          selectedTahap === "Semua Tahap" ||
          (selectedTahap === "Niti Bukti" && item.tahapNiti === "bukti") ||
          (selectedTahap === "Niti Bakti" && item.tahapNiti === "bakti");

        return matchSearch && matchKelas && matchTahap;
      })
      .sort((a, b) => {
        const timeA = a.tanggalSubmit ? new Date(a.tanggalSubmit).getTime() : 0;
        const timeB = b.tanggalSubmit ? new Date(b.tanggalSubmit).getTime() : 0;
        return sortAscending ? timeA - timeB : timeB - timeA;
      });
  }, [submissions, searchQuery, selectedKelas, selectedTahap, sortAscending]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toast Notification */}
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Top Control Bar (Search & Filters) */}
      <div className="w-full max-w-[1158px] flex items-center justify-start flex-wrap gap-3">
        {/* Input Search */}
        <div className="w-[260px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau proyek..."
            className="w-full bg-transparent text-[#3D4127] placeholder-[#3D4127]/50 text-[14px] font-medium focus:outline-none"
          />
          <Image
            src="/guru/search.svg"
            alt="Search"
            width={18}
            height={18}
            className="object-contain flex-shrink-0 cursor-pointer opacity-70"
          />
        </div>

        {/* Filter Semua Kelas Dropdown */}
        <div className="relative" data-kelas-dropdown>
          <button
            type="button"
            onClick={() => {
              setIsKelasOpen(!isKelasOpen);
              setIsTahapOpen(false);
            }}
            className="min-w-[164px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer hover:border-[#636B2F] transition-colors shadow-sm"
          >
            <span className="text-[14px] font-medium text-[#3D4127] truncate">
              {selectedKelas}
            </span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Filter Kelas"
              width={16}
              height={16}
              className={`object-contain flex-shrink-0 transition-transform ${
                isKelasOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isKelasOpen && (
            <div className="absolute top-[56px] left-0 min-w-[180px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] shadow-lg py-1 z-30 overflow-hidden">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setSelectedKelas(cls);
                    setIsKelasOpen(false);
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

        {/* Filter Tahap Dropdown */}
        <div className="relative" data-tahap-dropdown>
          <button
            type="button"
            onClick={() => {
              setIsTahapOpen(!isTahapOpen);
              setIsKelasOpen(false);
            }}
            className="min-w-[164px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer hover:border-[#636B2F] transition-colors shadow-sm"
          >
            <span className="text-[14px] font-medium text-[#3D4127] truncate">
              {selectedTahap}
            </span>
            <Image
              src="/guru/panah bawah.svg"
              alt="Filter Tahap"
              width={16}
              height={16}
              className={`object-contain flex-shrink-0 transition-transform ${
                isTahapOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isTahapOpen && (
            <div className="absolute top-[56px] left-0 min-w-[180px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[14px] shadow-lg py-1 z-30 overflow-hidden">
              {availableTahap.map((tahap) => (
                <button
                  key={tahap}
                  type="button"
                  onClick={() => {
                    setSelectedTahap(tahap);
                    setIsTahapOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${
                    selectedTahap === tahap
                      ? "bg-[#636B2F] text-white font-semibold"
                      : "text-[#3D4127] hover:bg-[#EDF0E8]"
                  }`}
                >
                  {tahap}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Box (Data Table) */}
      <div className="w-full max-w-[1158px] min-h-[545px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-3">
        {/* Table Header Row */}
        <div className="w-full max-w-[1110px] h-[28px] px-[12px] flex items-center gap-[12px] text-[15px] font-[600] text-[#9CA08D]">
          <div className="flex-[3] truncate">Siswa</div>
          <div className="flex-[3] truncate">Judul Proyek / Berkas</div>
          <button
            type="button"
            onClick={() => setSortAscending(!sortAscending)}
            className="flex-[2.5] flex items-center gap-1.5 truncate hover:text-[#636B2F] transition-colors cursor-pointer text-left"
            title="Klik untuk urutkan tanggal"
          >
            <span>Tanggal Pengajuan</span>
            <Image
              src="/guru/panah atas.svg"
              alt="Sort Tanggal"
              width={14}
              height={14}
              className={`object-contain transition-transform ${
                sortAscending ? "" : "rotate-180"
              }`}
            />
          </button>
          <div className="w-[153px] flex-shrink-0 truncate">Status</div>
          <div className="w-6 flex-shrink-0" /> {/* Spacer titik 3 */}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-[#3D4127]/60">
            <div className="w-8 h-8 border-3 border-[#636B2F] border-t-transparent rounded-full animate-spin" />
            <span className="text-[14px] font-medium">Memuat data submission proyek...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSubmissions.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-2 text-center text-[#3D4127]">
            
            <h4 className="font-semibold text-[16px]">Belum Ada Pengajuan Proyek</h4>
            <p className="text-[14px] text-[#3D4127]/60 max-w-[400px]">
              {searchQuery || selectedKelas !== "Semua Kelas" || selectedTahap !== "Semua Tahap"
                ? "Tidak ada pengajuan proyek yang cocok dengan filter atau kata kunci pencarian Anda."
                : "Siswa belum mengunggah dokumen aksi lingkungan pada tahap Niti Bukti atau Niti Bakti."}
            </p>
          </div>
        )}

        {/* Table Data Rows */}
        {!isLoading && filteredSubmissions.length > 0 && (
          <div className="flex flex-col gap-[8px] w-full max-w-[1110px]">
            {filteredSubmissions.map((row) => {
              const isStatusOpen = activeStatusDropdownId === row.id;
              const isActionOpen = activeActionMenuId === row.id;

              return (
                <div
                  key={row.id}
                  className="w-full min-h-[64px] px-[12px] py-2 flex items-center gap-[12px] text-[#3D4127] transition-colors border-b border-[#EDF0E8] last:border-0 hover:bg-[#EDF0E8]/30 rounded-lg"
                >
                  {/* Kolom Siswa (Nama Link + Kelas Badge) */}
                  <div className="flex-[3] flex items-center gap-3 truncate">
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/guru/siswa/${row.siswaId}`}
                        className="text-[14px] font-semibold text-[#3D4127] hover:text-[#636B2F] hover:underline truncate transition-colors"
                      >
                        {row.nama}
                      </Link>
                      <span className="text-[12px] text-[#3D4127]/60 font-medium truncate">
                        Kelas {row.kelas}
                      </span>
                    </div>
                  </div>

                  {/* Kolom Judul Proyek & Tahap */}
                  <div className="flex-[3] flex flex-col justify-center gap-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${
                          row.tahapNiti === "bukti"
                            ? "bg-[#e0e7ff] text-[#3730a3]"
                            : "bg-[#fef3c7] text-[#92400e]"
                        }`}
                      >
                        {row.tahapNiti === "bukti" ? "Niti Bukti" : "Niti Bakti"}
                      </span>
                      <span
                        className="text-[14px] font-medium text-[#3D4127] truncate"
                        title={row.judulProyek}
                      >
                        {row.judulProyek}
                      </span>
                    </div>
                    {row.fileUrl && (
                      <button
                        type="button"
                        onClick={() => handleOpenFile(row.fileUrl, row.judulProyek)}
                        className="text-[12px] text-[#636B2F] hover:underline font-medium text-left flex items-center gap-1 w-fit cursor-pointer"
                      >
                        <span>Lihat Berkas Dokumen ↗</span>
                      </button>
                    )}
                  </div>

                  {/* Kolom Tanggal Pengajuan */}
                  <div className="flex-[2.5] text-[14px] font-medium text-[#3D4127]/80 truncate">
                    {formatDate(row.tanggalSubmit)}
                  </div>

                  {/* Kolom Status (Interactive Dropdown) */}
                  <div className="w-[153px] flex-shrink-0 relative" data-status-dropdown>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStatusDropdownId(isStatusOpen ? null : row.id);
                        setActiveActionMenuId(null);
                      }}
                      className="w-[153px] h-[48px] rounded-[12px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer transition-colors bg-transparent text-[#3D4127] hover:bg-black/1"
                    >
                      <span className="text-[14px] font-semibold truncate">
                        {getStatusLabel(row.status)}
                      </span>
                      <Image
                        src="/guru/panah bawah.svg"
                        alt="Status Arrow"
                        width={16}
                        height={16}
                        className={`object-contain flex-shrink-0 transition-transform ${
                          isStatusOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Popup Pilihan Status */}
                    {isStatusOpen && (
                      <div className="absolute top-[52px] left-0 w-[180px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[12px] shadow-xl py-1 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "menunggu_review")}
                          className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold flex items-center gap-2 transition-colors ${
                            row.status === "menunggu_review"
                              ? "bg-[#636B2F]/50 text-[#3D4127]"
                              : "text-[#3D4127] hover:bg-[#EDF0E8]"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#636B2F]" />
                          Diajukan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "disetujui")}
                          className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold flex items-center gap-2 transition-colors ${
                            row.status === "disetujui"
                              ? "bg-[#4ED953]/50 text-[#3D4127]"
                              : "text-[#3D4127] hover:bg-[#EDF0E8]"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4ED953]" />
                          Disetujui
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "perlu_revisi")}
                          className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold flex items-center gap-2 transition-colors ${
                            row.status === "perlu_revisi"
                              ? "bg-[#D3D8C3]/50 text-[#3D4127]"
                              : "text-[#3D4127] hover:bg-[#EDF0E8]"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8b9175]" />
                          Perlu Revisi
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tombol Opsi 3 Titik & Popover Menu */}
                  <div className="w-6 flex-shrink-0 relative" data-action-menu>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionMenuId(isActionOpen ? null : row.id);
                        setActiveStatusDropdownId(null);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 transition-colors cursor-pointer"
                      aria-label="Opsi aksi"
                    >
                      <Image
                        src="/guru/icon titik 3.svg"
                        alt="Opsi"
                        width={18}
                        height={18}
                        className="object-contain opacity-70"
                      />
                    </button>

                    {isActionOpen && (
                      <div className="absolute top-[30px] right-0 w-[200px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[12px] shadow-xl py-1.5 z-40 overflow-hidden text-[#3D4127]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveActionMenuId(null);
                            handleOpenFile(row.fileUrl, row.judulProyek);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[#EDF0E8] transition-colors flex items-center gap-2.5"
                        >
                          <span className="text-[14px]">📄</span>
                          <span>Lihat Dokumen</span>
                        </button>
                        <Link
                          href={`/guru/siswa/${row.siswaId}`}
                          className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[#EDF0E8] transition-colors flex items-center gap-2.5"
                        >
                          <span className="text-[14px]">✏️</span>
                          <span>Beri Nilai & Evaluasi</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
