"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SiswaItem {
  id: string;
  nama: string;
  kelas: string;
  avatar: string;
  progress: boolean[]; // [harti, surti, bukti, bakti, sajati]
}

interface SertifikatItem {
  id: string;
  nomor: string;
  url_file: string | null;
  tanggal: string;
}

const TAHAP_NITI_ORDER = ["harti", "surti", "bukti", "bakti", "sajati"] as const;
const TAHAP_NITI_LABELS = ["Niti Harti", "Niti Surti", "Niti Bukti", "Niti Bakti", "Niti Sajati"];

export default function GuruSiswaPenilaianPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedProgres, setSelectedProgres] = useState("Semua Progres");
  const [siswaData, setSiswaData] = useState<SiswaItem[]>([]);
  const [sertifikatMap, setSertifikatMap] = useState<Record<string, SertifikatItem>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Dropdown states
  const [isKelasOpen, setIsKelasOpen] = useState(false);
  const [isProgresOpen, setIsProgresOpen] = useState(false);

  // Modal Rekap Nilai
  const [isRekapOpen, setIsRekapOpen] = useState(false);

  // Modal Sertifikat states
  const [isSertifikatModalOpen, setIsSertifikatModalOpen] = useState(false);
  const [selectedSiswaForCert, setSelectedSiswaForCert] = useState<SiswaItem | null>(null);
  const [certNomor, setCertNomor] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [certSuccess, setCertSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Ambil data profiles siswa
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("id, nama_lengkap, kelas, avatar_url")
          .eq("role", "siswa")
          .order("nama_lengkap", { ascending: true });

        if (pErr) {
          console.error("Error fetching profiles:", pErr);
          setIsLoading(false);
          return;
        }

        if (!profiles || profiles.length === 0) {
          setSiswaData([]);
          setIsLoading(false);
          return;
        }

        const studentIds = profiles.map((p) => p.id);

        // 2. Ambil seluruh data progress_siswa untuk siswa tersebut
        const { data: progressRows, error: prErr } = await supabase
          .from("progress_siswa")
          .select("siswa_id, tahap_niti, status")
          .in("siswa_id", studentIds);

        if (prErr) {
          console.warn("Gagal mengambil progress siswa:", prErr.message);
        }

        // 3. Ambil data sertifikat yang sudah ada
        const { data: certRows, error: certErr } = await supabase
          .from("sertifikat")
          .select("id, siswa_id, nomor_sertifikat, url_file, tanggal_terbit")
          .in("siswa_id", studentIds);

        if (certErr) {
          console.warn("Gagal mengambil data sertifikat:", certErr.message);
        } else if (certRows) {
          const cMap: Record<string, SertifikatItem> = {};
          certRows.forEach((c) => {
            cMap[c.siswa_id] = {
              id: c.id,
              nomor: c.nomor_sertifikat,
              url_file: c.url_file,
              tanggal: c.tanggal_terbit,
            };
          });
          setSertifikatMap(cMap);
        }

        // Map progress per siswa
        const mapped: SiswaItem[] = profiles.map((p) => {
          const studentProgs = (progressRows || []).filter(
            (r) => r.siswa_id === p.id
          );

          const progressBools = TAHAP_NITI_ORDER.map((tahap) => {
            const found = studentProgs.find((r) => r.tahap_niti === tahap);
            return found ? found.status === "disetujui" : false;
          });

          return {
            id: p.id,
            nama: p.nama_lengkap || "Siswa Tanpa Nama",
            kelas: p.kelas || "VII-A",
            avatar: p.avatar_url || "/guru/profile.jpg",
            progress: progressBools,
          };
        });

        setSiswaData(mapped);
      } catch (err) {
        console.error("Error loading siswa penilaian data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleOpenCertModal = (siswa: SiswaItem) => {
    setSelectedSiswaForCert(siswa);
    const existingCert = sertifikatMap[siswa.id];
    if (existingCert) {
      setCertNomor(existingCert.nomor);
    } else {
      const randomNum = String(Math.floor(100 + Math.random() * 900));
      setCertNomor(`EVAA/SERT/${new Date().getFullYear()}/${randomNum}`);
    }
    setCertFile(null);
    setCertError(null);
    setCertSuccess(null);
    setIsSertifikatModalOpen(true);
  };

  const handleSubmitCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaForCert) return;
    if (!certNomor.trim()) {
      setCertError("Nomor sertifikat wajib diisi.");
      return;
    }

    const existingCert = sertifikatMap[selectedSiswaForCert.id];
    if (!certFile && !existingCert?.url_file) {
      setCertError("Silakan pilih berkas sertifikat (PDF atau gambar).");
      return;
    }

    try {
      setIsUploadingCert(true);
      setCertError(null);

      let fileUrl = existingCert?.url_file || null;

      if (certFile) {
        const fileExt = certFile.name.split(".").pop();
        const filePath = `${selectedSiswaForCert.id}/${Date.now()}_sertifikat.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("sertifikat")
          .upload(filePath, certFile, { upsert: true });

        if (uploadError) {
          throw new Error(
            `Gagal upload ke storage: ${uploadError.message}. Pastikan bucket 'sertifikat' publik di Supabase Storage sudah dibuat.`
          );
        }

        const { data: urlData } = supabase.storage
          .from("sertifikat")
          .getPublicUrl(filePath);

        fileUrl = urlData?.publicUrl || null;
      }

      const now = new Date().toISOString();
      if (existingCert) {
        const { error: updateErr } = await supabase
          .from("sertifikat")
          .update({
            nomor_sertifikat: certNomor.trim(),
            url_file: fileUrl,
            tanggal_terbit: now,
          })
          .eq("id", existingCert.id);

        if (updateErr) throw updateErr;

        setSertifikatMap((prev) => ({
          ...prev,
          [selectedSiswaForCert.id]: {
            id: existingCert.id,
            nomor: certNomor.trim(),
            url_file: fileUrl,
            tanggal: now,
          },
        }));
      } else {
        const { data: newCert, error: insertErr } = await supabase
          .from("sertifikat")
          .insert({
            siswa_id: selectedSiswaForCert.id,
            nomor_sertifikat: certNomor.trim(),
            url_file: fileUrl,
            tanggal_terbit: now,
          })
          .select("id")
          .single();

        if (insertErr) throw insertErr;

        setSertifikatMap((prev) => ({
          ...prev,
          [selectedSiswaForCert.id]: {
            id: newCert?.id || "temp-id",
            nomor: certNomor.trim(),
            url_file: fileUrl,
            tanggal: now,
          },
        }));
      }

      setCertSuccess("Sertifikat berhasil diterbitkan!");
      setTimeout(() => {
        setIsSertifikatModalOpen(false);
        setCertSuccess(null);
      }, 1200);
    } catch (err: unknown) {
      const errObj = err as Error;
      console.error("Gagal menerbitkan sertifikat:", errObj);
      setCertError(errObj.message || "Gagal menerbitkan sertifikat.");
    } finally {
      setIsUploadingCert(false);
    }
  };

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-filter-kelas]")) {
        setIsKelasOpen(false);
      }
      if (!target.closest("[data-filter-progres]")) {
        setIsProgresOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Opsi kelas unik
  const availableClasses = [
    "Semua Kelas",
    ...Array.from(new Set(siswaData.map((s) => s.kelas).filter(Boolean))),
  ];

  const progresOptions = [
    "Semua Progres",
    "Selesai Penuh (5/5)",
    "Sedang Berjalan (1-4)",
    "Belum Mulai (0/5)",
  ];

  // Filter siswa
  const filteredData = siswaData.filter((row) => {
    const matchSearch = row.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchKelas =
      selectedKelas === "Semua Kelas" || row.kelas === selectedKelas;

    const completedCount = row.progress.filter(Boolean).length;
    let matchProgres = true;
    if (selectedProgres === "Selesai Penuh (5/5)") {
      matchProgres = completedCount === 5;
    } else if (selectedProgres === "Sedang Berjalan (1-4)") {
      matchProgres = completedCount >= 1 && completedCount < 5;
    } else if (selectedProgres === "Belum Mulai (0/5)") {
      matchProgres = completedCount === 0;
    }

    return matchSearch && matchKelas && matchProgres;
  });

  const firstStudentId = filteredData[0]?.id || siswaData[0]?.id || "1";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Control Bar */}
      <div className="w-full max-w-[1158px] flex items-center justify-between flex-wrap gap-3">
        {/* Left Side: Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Input Search */}
          <div className="w-[230px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] shadow-sm">
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

          {/* Filter Semua Kelas Dropdown */}
          <div className="relative" data-filter-kelas>
            <div
              onClick={() => {
                setIsKelasOpen(!isKelasOpen);
                setIsProgresOpen(false);
              }}
              className="w-[164px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer shadow-sm hover:border-[#636B2F] transition-colors"
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
            </div>

            {isKelasOpen && (
              <div className="absolute top-[56px] left-0 w-[164px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] shadow-lg py-1 z-30 overflow-hidden">
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

          {/* Filter Semua Progres Dropdown */}
          <div className="relative" data-filter-progres>
            <div
              onClick={() => {
                setIsProgresOpen(!isProgresOpen);
                setIsKelasOpen(false);
              }}
              className="w-[174px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px] cursor-pointer shadow-sm hover:border-[#636B2F] transition-colors"
            >
              <span className="text-[14px] font-medium text-[#3D4127] truncate">
                {selectedProgres}
              </span>
              <Image
                src="/guru/panah bawah.svg"
                alt="Filter Progres"
                width={16}
                height={16}
                className={`object-contain flex-shrink-0 transition-transform ${
                  isProgresOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isProgresOpen && (
              <div className="absolute top-[56px] left-0 w-[190px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] shadow-lg py-1 z-30 overflow-hidden">
                {progresOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedProgres(opt);
                      setIsProgresOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                      selectedProgres === opt
                        ? "bg-[#636B2F] text-white font-semibold"
                        : "text-[#3D4127] hover:bg-[#EDF0E8]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Tombol Rekap Nilai */}
          <button
            onClick={() => setIsRekapOpen(true)}
            className="h-[50px] border-2 border-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#636B2F] font-semibold text-[15px] hover:bg-[#636B2F]/10 transition-colors cursor-pointer"
          >
            Rekap Nilai
          </button>

          {/* Tombol Input Nilai */}
          <Link
            href={`/guru/siswa/${firstStudentId}`}
            className="h-[50px] bg-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#FBFFF3] font-semibold text-[15px] hover:bg-[#525826] shadow-sm transition-colors cursor-pointer"
          >
            Input Nilai
          </Link>
        </div>
      </div>

      {/* Main Content Box (Data Table) */}
      <div className="w-full max-w-[1158px] min-h-[545px] bg-[#FBFFF3] rounded-[16px] pt-[16px] pr-[24px] pb-[24px] pl-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-3 border border-[#D3D8C3]/40">
        {/* Table Header Row */}
        <div className="w-full max-w-[1110px] h-[24px] px-[12px] flex items-center gap-[10px] text-[15px] font-[500] text-[#9CA08D] leading-[24px]">
          <div className="flex-[3] flex items-center gap-1.5 truncate">
            <span>Siswa ({filteredData.length})</span>
            <Image
              src="/guru/panah atas.svg"
              alt="Sort Siswa"
              width={14}
              height={14}
              className="object-contain"
            />
          </div>
          <div className="flex-[1.5] truncate">Kelas</div>
          <div className="flex-[3.5] flex items-center justify-between pr-4">
            <span className="truncate">Progres 5 Tahap Niti</span>
            <span className="text-[11px] text-[#9CA08D]/80">
              Harti • Surti • Bukti • Bakti • Sajati
            </span>
          </div>
          <div className="flex-[2] text-center truncate">Sertifikat</div>
          <div className="w-6" />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3D4127]/60">
            <div className="w-8 h-8 border-3 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
            <span className="text-[14px]">Memuat data siswa dan progres...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#EDF0E8] flex items-center justify-center text-[#636B2F]">
              <Image
                src="/guru/search.svg"
                alt="Empty"
                width={24}
                height={24}
                className="opacity-40"
              />
            </div>
            <h3 className="text-[16px] font-bold text-[#3D4127]">
              Tidak Ada Data Siswa
            </h3>
            <p className="text-[13px] text-[#3D4127]/70 max-w-[360px]">
              {searchQuery || selectedKelas !== "Semua Kelas" || selectedProgres !== "Semua Progres"
                ? "Tidak ada siswa yang sesuai dengan filter pencarian yang dipilih."
                : "Belum ada siswa yang terdaftar di kelas. Siswa yang mendaftar akan otomatis muncul di sini."}
            </p>
          </div>
        )}

        {/* Table Data Rows */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex flex-col gap-[8px] w-full max-w-[1110px]">
            {filteredData.map((row) => {
              const completedStages = row.progress.filter(Boolean).length;
              const cert = sertifikatMap[row.id];
              const isAllComplete = completedStages === 5;

              return (
                <div
                  key={row.id}
                  onClick={() => router.push(`/guru/siswa/${row.id}`)}
                  className="w-full h-[52px] px-[12px] flex items-center gap-[10px] text-[#3D4127] transition-all border-b border-[#EDF0E8] last:border-0 hover:bg-[#EDF0E8]/40 rounded-xl cursor-pointer group"
                >
                  {/* Kolom Siswa (Avatar + Nama) */}
                  <div className="flex-[3] flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0 border border-[#3D4127]/10 bg-[#EDF0E8]">
                      <Image
                        src={row.avatar}
                        alt={row.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[14px] font-bold text-[#3D4127] group-hover:text-[#636B2F] transition-colors truncate">
                      {row.nama}
                    </span>
                  </div>

                  {/* Kolom Kelas */}
                  <div className="flex-[1.5] text-[14px] font-semibold text-[#3D4127]/80 truncate">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EDF0E8] text-[#3D4127]">
                      {row.kelas}
                    </span>
                  </div>

                  {/* Kolom Progres Modul (5 Kapsul) */}
                  <div className="flex-[3.5] flex items-center gap-[6px]">
                    {row.progress.map((isFilled, idx) => (
                      <div
                        key={idx}
                        title={`${TAHAP_NITI_LABELS[idx]}: ${
                          isFilled ? "Selesai (Disetujui)" : "Belum Selesai"
                        }`}
                        className={`flex-1 max-w-[76px] h-[24px] rounded-[12px] transition-all flex items-center justify-center text-[10px] font-bold ${
                          isFilled
                            ? "bg-[#636B2F] text-white shadow-xs"
                            : "bg-[#D3D8C3]/50 border border-[#D3D8C3] text-[#9CA08D]"
                        }`}
                      >
                        {isFilled ? "✓" : idx + 1}
                      </div>
                    ))}
                    <span className="text-[12px] font-bold text-[#636B2F] ml-2 shrink-0">
                      {completedStages}/5
                    </span>
                  </div>

                  {/* Kolom Status & Aksi Sertifikat */}
                  <div className="flex-[2] flex items-center justify-center">
                    {cert ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCertModal(row);
                          }}
                          title="Klik untuk melihat nomor / memperbarui berkas sertifikat"
                          className="px-2.5 py-1 rounded-[10px] bg-[#636B2F]/15 hover:bg-[#636B2F]/25 text-[#636B2F] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#636B2F]/30"
                        >
                          <span>✓ Terbit</span>
                        </button>
                        {cert.url_file && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(cert.url_file!, "_blank");
                            }}
                            title="Buka berkas dokumen sertifikat di tab baru"
                            className="w-6 h-6 rounded-[8px] bg-[#EDF0E8] hover:bg-[#D3D8C3] text-[#3D4127] flex items-center justify-center text-[12px] font-bold transition-colors cursor-pointer"
                          >
                            ↗
                          </button>
                        )}
                      </div>
                    ) : isAllComplete ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCertModal(row);
                        }}
                        className="px-2.5 py-1 rounded-[10px] bg-[#eab308]/20 hover:bg-[#eab308]/35 text-[#854d0e] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#eab308]/50 shadow-xs"
                      >
                        <span>+ Terbitkan</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#9CA08D]">
                        Belum Lengkap
                      </span>
                    )}
                  </div>

                  {/* Tombol Opsi / Arrow */}
                  <div className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 transition-colors flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#9CA08D] group-hover:text-[#636B2F] transition-colors"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Rekap Nilai Siswa */}
      {isRekapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[760px] bg-[#FBFFF3] rounded-[28px] p-6 sm:p-8 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] border border-[#D3D8C3] flex flex-col gap-5 max-h-[90vh] overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#D3D8C3] pb-4">
              <div>
                <h3 className="text-[20px] font-bold text-[#3D4127]">
                  Rekapitulasi Progres & Nilai Siswa
                </h3>
                <p className="text-[13px] text-[#3D4127]/70">
                  Ringkasan penyelesaian 5 Tahap Niti untuk seluruh siswa terdaftar.
                </p>
              </div>
              <button
                onClick={() => setIsRekapOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#3D4127]/60 hover:text-[#3D4127] hover:bg-black/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Table Rekap */}
            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-[13px] text-[#3D4127]">
                <thead>
                  <tr className="border-b border-[#D3D8C3] text-[12px] font-bold text-[#3D4127]/70 uppercase">
                    <th className="py-2.5 px-2 text-center w-10">No</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3 text-center">Harti</th>
                    <th className="py-2.5 px-3 text-center">Surti</th>
                    <th className="py-2.5 px-3 text-center">Bukti</th>
                    <th className="py-2.5 px-3 text-center">Bakti</th>
                    <th className="py-2.5 px-3 text-center">Sajati</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF0E8]">
                  {siswaData.map((s, idx) => {
                    const count = s.progress.filter(Boolean).length;
                    return (
                      <tr key={s.id} className="hover:bg-[#EDF0E8]/50">
                        <td className="py-2.5 px-2 text-center font-semibold text-[#9CA08D]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#3D4127]">
                          {s.nama}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#3D4127]/80">
                          {s.kelas}
                        </td>
                        {s.progress.map((isDone, pIdx) => (
                          <td key={pIdx} className="py-2.5 px-3 text-center">
                            {isDone ? (
                              <span className="text-[#15803d] font-bold">✓</span>
                            ) : (
                              <span className="text-[#9CA08D] font-normal">-</span>
                            )}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#636B2F]">
                          {count}/5
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-[#D3D8C3]">
              <span className="text-[13px] font-semibold text-[#3D4127]/70">
                Total Siswa: {siswaData.length} orang
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border-2 border-[#636B2F] text-[#636B2F] font-bold text-[14px] rounded-[14px] hover:bg-[#636B2F]/10 transition-colors"
                >
                  Cetak / Print
                </button>
                <button
                  onClick={() => setIsRekapOpen(false)}
                  className="px-5 py-2 bg-[#636B2F] hover:bg-[#525826] text-white font-bold text-[14px] rounded-[14px] transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terbitkan / Kelola Sertifikat */}
      {isSertifikatModalOpen && selectedSiswaForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[540px] bg-[#FBFFF3] rounded-[28px] p-6 sm:p-7 shadow-[0px_4px_16px_rgba(0,0,0,0.15)] border border-[#D3D8C3] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#D3D8C3] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[22px]">📜</span>
                <div>
                  <h3 className="text-[18px] font-bold text-[#3D4127]">
                    {sertifikatMap[selectedSiswaForCert.id]
                      ? "Perbarui Sertifikat Siswa"
                      : "Terbitkan Sertifikat Siswa"}
                  </h3>
                  <p className="text-[12px] text-[#3D4127]/70">
                    Unggah berkas sertifikat resmi (PDF/gambar) untuk siswa bersangkutan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSertifikatModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#3D4127]/60 hover:text-[#3D4127] hover:bg-black/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Info Singkat Siswa */}
            <div className="flex items-center gap-3 p-3 rounded-[16px] bg-[#EDF0E8] border border-[#D3D8C3]/60">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#3D4127]/10 bg-white">
                <Image
                  src={selectedSiswaForCert.avatar}
                  alt={selectedSiswaForCert.nama}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#3D4127]">
                  {selectedSiswaForCert.nama}
                </span>
                <span className="text-[12px] text-[#3D4127]/75 font-medium">
                  Kelas {selectedSiswaForCert.kelas} • Status:{" "}
                  {selectedSiswaForCert.progress.filter(Boolean).length}/5 Tahap Disetujui
                </span>
              </div>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSubmitCert} className="flex flex-col gap-4">
              {/* Nomor Sertifikat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#3D4127]">
                  Nomor Sertifikat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={certNomor}
                  onChange={(e) => setCertNomor(e.target.value)}
                  placeholder="Contoh: EVAA/SERT/2026/001"
                  required
                  className="w-full h-[46px] bg-white border border-[#D3D8C3] rounded-[14px] px-4 text-[14px] text-[#3D4127] font-medium focus:outline-none focus:border-[#636B2F]"
                />
                <span className="text-[11px] text-[#3D4127]/60">
                  Nomor resmi sertifikat yang akan tercatat di akun siswa.
                </span>
              </div>

              {/* Upload Berkas Sertifikat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#3D4127]">
                  Berkas Dokumen Sertifikat (PDF / Gambar){" "}
                  {!sertifikatMap[selectedSiswaForCert.id]?.url_file && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                {sertifikatMap[selectedSiswaForCert.id]?.url_file && (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-[12px] bg-[#636B2F]/10 border border-[#636B2F]/30 text-[12px]">
                    <span className="text-[#3D4127] font-medium">
                      Berkas saat ini sudah tersimpan
                    </span>
                    <a
                      href={sertifikatMap[selectedSiswaForCert.id].url_file!}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#636B2F] hover:underline flex items-center gap-1"
                    >
                      Lihat Berkas ↗
                    </a>
                  </div>
                )}

                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCertFile(file);
                  }}
                  className="w-full file:mr-3 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-[12px] file:font-semibold file:bg-[#636B2F] file:text-white hover:file:bg-[#525826] file:cursor-pointer border border-[#D3D8C3] bg-white rounded-[14px] p-2 text-[13px] text-[#3D4127]"
                />
                <span className="text-[11px] text-[#3D4127]/60">
                  Format yang didukung: .pdf, .jpg, .png (Maks 10MB)
                </span>
              </div>

              {/* Feedback Error / Success */}
              {certError && (
                <div className="p-3 rounded-[12px] bg-red-100 border border-red-300 text-red-700 text-[12px] font-medium">
                  {certError}
                </div>
              )}

              {certSuccess && (
                <div className="p-3 rounded-[12px] bg-green-100 border border-green-300 text-green-800 text-[12px] font-bold">
                  {certSuccess}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D3D8C3]">
                <button
                  type="button"
                  onClick={() => setIsSertifikatModalOpen(false)}
                  disabled={isUploadingCert}
                  className="px-4 py-2 text-[#3D4127]/70 hover:text-[#3D4127] font-bold text-[14px] rounded-[12px] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingCert}
                  className="px-5 py-2.5 bg-[#636B2F] hover:bg-[#525826] text-white font-bold text-[14px] rounded-[14px] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingCert ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <span>Simpan & Terbitkan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
