"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SessionItem {
  id: string; // encoded key: tanggal__kelas
  nama: string;
  kelas: string;
  tanggal: string; // raw YYYY-MM-DD
  tanggalFormatted: string;
  totalSiswa: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  jumlahKehadiran: string;
  absensiIds: string[];
}

const DEFAULT_CLASSES = ["VII-A", "VII-B", "VII-C"];

export default function GuruAbsensiPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>(DEFAULT_CLASSES);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Sesi Baru State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKelas, setModalKelas] = useState("VII-A");
  const [modalTanggal, setModalTanggal] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Action Menu Dropdown (untuk hapus sesi)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAbsensiData();
  }, []);

  // Tutup dropdown menu saat klik di luar area menu
  useEffect(() => {
    if (!activeMenuId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-session-menu]")) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  async function loadAbsensiData() {
    setIsLoading(true);
    try {
      // Ambil data absensi dan data profiles siswa secara paralel
      const [absensiRes, profilesRes] = await Promise.all([
        supabase
          .from("absensi")
          .select("id, siswa_id, tanggal, status, dicatat_oleh")
          .order("tanggal", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, nama_lengkap, kelas, avatar_url")
          .eq("role", "siswa"),
      ]);

      const profiles = profilesRes.data || [];
      const absensiList = absensiRes.data || [];

      // Kumpulkan kelas unik dari profil siswa dan gabungkan tanpa stale closure
      const profileClasses = Array.from(
        new Set(
          profiles
            .map((p) => p.kelas?.trim())
            .filter((k): k is string => Boolean(k))
        )
      );
      
      const mergedClasses = Array.from(
        new Set([...DEFAULT_CLASSES, ...profileClasses])
      ).sort();
      setAvailableClasses(mergedClasses);
      setModalKelas((prev) =>
        mergedClasses.includes(prev) ? prev : mergedClasses[0] || "VII-A"
      );

      // Map profil berdasarkan ID siswa
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      // Kelompokkan data absensi per (tanggal, kelas)
      const sessionMap = new Map<
        string,
        {
          key: string;
          tanggal: string;
          kelas: string;
          totalSiswa: number;
          hadir: number;
          sakit: number;
          izin: number;
          alpa: number;
          absensiIds: string[];
        }
      >();

      absensiList.forEach((item) => {
        const student = profileMap.get(item.siswa_id);
        const kelas = student?.kelas?.trim() || "Tanpa Kelas";
        const key = `${item.tanggal}__${kelas}`;

        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            key,
            tanggal: item.tanggal,
            kelas,
            totalSiswa: 0,
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpa: 0,
            absensiIds: [],
          });
        }

        const s = sessionMap.get(key)!;
        s.absensiIds.push(item.id);
        s.totalSiswa += 1;
        const st = (item.status || "").toLowerCase();
        if (st === "hadir") s.hadir += 1;
        else if (st === "sakit") s.sakit += 1;
        else if (st === "izin") s.izin += 1;
        else if (st === "alpa") s.alpa += 1;
      });

      // Format ke list sesi
      const mappedSessions: SessionItem[] = Array.from(sessionMap.values()).map(
        (s) => {
          let formattedDate = s.tanggal;
          try {
            const d = new Date(s.tanggal + "T00:00:00");
            formattedDate = d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          } catch {
            formattedDate = s.tanggal;
          }

          return {
            id: s.key,
            nama:
              s.kelas === "Tanpa Kelas"
                ? `Absensi Siswa (Tanpa Kelas)`
                : `Absensi Kehadiran ${s.kelas}`,
            kelas: s.kelas,
            tanggal: s.tanggal,
            tanggalFormatted: formattedDate,
            totalSiswa: s.totalSiswa,
            hadir: s.hadir,
            sakit: s.sakit,
            izin: s.izin,
            alpa: s.alpa,
            jumlahKehadiran: `${s.hadir}/${s.totalSiswa}`,
            absensiIds: s.absensiIds,
          };
        }
      );

      setSessions(mappedSessions);
    } catch (err) {
      console.error("Error fetching absensi data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteSession = async (session: SessionItem) => {
    const labelSesi =
      session.kelas === "Tanpa Kelas"
        ? "Absensi (Tanpa Kelas)"
        : `kelas ${session.kelas}`;

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus seluruh catatan absensi ${labelSesi} pada tanggal ${session.tanggalFormatted}?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Hapus data absensi langsung berdasarkan ID catatan absensi yang tercakup dalam sesi ini
      // Ini memastikan konsistensi meskipun siswa sudah pindah kelas atau berganti profil
      if (session.absensiIds && session.absensiIds.length > 0) {
        const { error } = await supabase
          .from("absensi")
          .delete()
          .in("id", session.absensiIds);

        if (error) {
          alert("Gagal menghapus sesi absensi: " + error.message);
        } else {
          setSessions((prev) => prev.filter((s) => s.id !== session.id));
        }
      } else {
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    } finally {
      setIsDeleting(false);
      setActiveMenuId(null);
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalKelas || !modalTanggal) return;
    setIsModalOpen(false);
    router.push(`/guru/absensi/${modalTanggal}__${modalKelas}`);
  };

  // Filter Data
  const filteredData = sessions.filter((row) => {
    const matchSearch =
      row.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.tanggalFormatted.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas =
      selectedKelas === "Semua Kelas" || row.kelas === selectedKelas;
    const matchTanggal =
      !selectedTanggal || row.tanggal === selectedTanggal;
    return matchSearch && matchKelas && matchTanggal;
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Control Bar */}
      <div className="w-full max-w-[1158px] flex items-center justify-between flex-wrap gap-3">
        {/* Left Side: Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Input Search */}
          <div className="w-[230px] h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] flex items-center justify-between gap-[12px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari sesi absensi..."
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

          {/* Filter Kelas */}
          <div className="relative">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              aria-label="Filter Kelas"
              className="h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[12px] text-[14px] font-medium text-[#3D4127] focus:outline-none cursor-pointer pr-9 appearance-none"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {availableClasses.map((kls) => (
                <option key={kls} value={kls}>
                  Kelas {kls}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Image
                src="/guru/panah bawah.svg"
                alt="Panah"
                width={14}
                height={14}
                className="object-contain opacity-70"
              />
            </div>
          </div>

          {/* Filter Tanggal */}
          <div className="h-[50px] bg-[#FBFFF3] border border-[#D3D8C3] rounded-[16px] px-[16px] py-[8px] flex items-center gap-2">
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              aria-label="Filter Tanggal"
              className="bg-transparent text-[13px] font-medium text-[#3D4127] focus:outline-none cursor-pointer"
            />
            {selectedTanggal && (
              <button
                onClick={() => setSelectedTanggal("")}
                title="Reset Tanggal"
                className="text-[12px] text-[#3D4127]/60 hover:text-[#b91c1c] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Tombol Absensi Kehadiran */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-[50px] bg-[#636B2F] rounded-[16px] px-[20px] py-[8px] flex items-center justify-center gap-[10px] text-[#FBFFF3] font-semibold text-[15px] hover:bg-[#525826] shadow-sm transition-colors cursor-pointer"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Absensi Kehadiran</span>
          </button>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="w-full max-w-[1158px] min-h-[500px] bg-[#FBFFF3] rounded-[16px] p-[24px] shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-3">
        {/* Table Header Row */}
        <div className="w-full h-[24px] px-[12px] flex items-center gap-[10px] text-[15px] font-[600] text-[#9CA08D] leading-[24px]">
          <div className="flex-[3] truncate">Sesi Absensi</div>
          <div className="flex-[1.5] truncate">Kelas</div>
          <div className="flex-[2] truncate">Tanggal</div>
          <div className="flex-[2] truncate">Hadir / Total</div>
          <div className="w-10 text-right">Aksi</div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3D4127]/60">
            <div className="w-8 h-8 border-3 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
            <span className="text-[14px]">Memuat data absensi...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredData.length === 0 && (
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#3D4127]">
              Belum Ada Sesi Absensi
            </h3>
            <p className="text-[13px] text-[#3D4127]/70 max-w-[380px]">
              {searchQuery || selectedKelas !== "Semua Kelas" || selectedTanggal
                ? "Tidak ada sesi yang cocok dengan filter pencarian Anda."
                : "Mulai pencatatan absensi baru dengan menekan tombol 'Absensi Kehadiran' di atas."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 bg-[#636B2F] hover:bg-[#525826] text-white text-[13px] font-semibold px-4 py-2 rounded-[12px] transition-colors"
            >
              Mulai Absensi Baru
            </button>
          </div>
        )}

        {/* Table Data Rows */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex flex-col gap-[8px] w-full">
            {filteredData.map((row) => (
              <div
                key={row.id}
                className="w-full h-[48px] bg-[#EDF0E8] rounded-[10px] px-[12px] py-[8px] flex items-center gap-[10px] text-[#3D4127] transition-colors hover:bg-[#e2e6db] relative"
              >
                {/* Clickable Area to detail page */}
                <Link
                  href={`/guru/absensi/${row.id}`}
                  className="flex-1 flex items-center gap-[10px] min-w-0"
                >
                  <div className="flex-[3] text-[14px] font-bold text-[#3D4127] truncate flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#636B2F]" />
                    {row.nama}
                  </div>
                  <div className="flex-[1.5] text-[14px] font-medium text-[#3D4127]/80 truncate">
                    <span className="px-2 py-0.5 rounded-md bg-[#3D4127]/10 text-[12px] font-semibold">
                      {row.kelas}
                    </span>
                  </div>
                  <div className="flex-[2] text-[14px] font-medium text-[#3D4127]/80 truncate">
                    {row.tanggalFormatted}
                  </div>
                  <div className="flex-[2] text-[14px] font-semibold text-[#636B2F] truncate">
                    {row.jumlahKehadiran}{" "}
                    <span className="text-[12px] font-normal text-[#3D4127]/60">
                      siswa hadir
                    </span>
                  </div>
                </Link>

                {/* Dropdown Options Button */}
                <div className="w-10 flex items-center justify-end relative" data-session-menu>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === row.id ? null : row.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors"
                    aria-label="Opsi sesi"
                  >
                    <Image
                      src="/guru/icon titik 3.svg"
                      alt="Opsi"
                      width={16}
                      height={16}
                      className="object-contain opacity-70"
                    />
                  </button>

                  {/* Popover Action Menu */}
                  {activeMenuId === row.id && (
                    <div
                      className="absolute right-0 top-10 bg-white border border-[#D3D8C3] shadow-lg rounded-[12px] p-1 z-30 min-w-[140px] flex flex-col gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/guru/absensi/${row.id}`}
                        className="w-full px-3 py-1.5 text-left text-[13px] font-medium text-[#3D4127] hover:bg-[#EDF0E8] rounded-lg transition-colors flex items-center gap-2"
                        onClick={() => setActiveMenuId(null)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Sesi
                      </Link>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteSession(row)}
                        className="w-full px-3 py-1.5 text-left text-[13px] font-medium text-[#b91c1c] hover:bg-[#fecaca]/40 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Image
                          src="/guru/icon delet.svg"
                          alt="Hapus"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                        Hapus Sesi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Mulai Sesi Baru */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#FBFFF3] w-full max-w-[440px] rounded-[20px] p-6 shadow-2xl flex flex-col gap-5 border border-[#D3D8C3] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3D4127]/10">
              <div>
                <h3 className="text-[17px] font-bold text-[#3D4127]">
                  Mulai Sesi Absensi Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#3D4127]/60 hover:text-[#3D4127]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
              {/* Pilihan Kelas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#3D4127]">
                  Pilih Kelas
                </label>
                <div className="relative">
                  <select
                    value={modalKelas}
                    onChange={(e) => setModalKelas(e.target.value)}
                    className="w-full bg-[#EDF0E8] border border-[#D3D8C3] rounded-[12px] p-3 text-[14px] font-semibold text-[#3D4127] focus:outline-none appearance-none pr-10"
                    required
                  >
                    {availableClasses.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <Image
                      src="/guru/panah bawah.svg"
                      alt="Panah"
                      width={14}
                      height={14}
                      className="object-contain opacity-70"
                    />
                  </div>
                </div>
              </div>

              {/* Pilihan Tanggal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#3D4127]">
                  Tanggal Absensi
                </label>
                <input
                  type="date"
                  value={modalTanggal}
                  onChange={(e) => setModalTanggal(e.target.value)}
                  className="w-full bg-[#EDF0E8] border border-[#D3D8C3] rounded-[12px] p-3 text-[14px] font-semibold text-[#3D4127] focus:outline-none"
                  required
                />
              </div>

              <div className="bg-[#EDF0E8]/70 rounded-[12px] p-3 text-[12px] text-[#3D4127]/80">
                💡 <span className="font-semibold">Informasi:</span> Jika sesi
                untuk kelas dan tanggal ini sudah pernah dibuat sebelumnya, sistem
                akan membuka data tersimpan untuk Anda tinjau atau perbarui.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-[12px] text-[13px] font-semibold text-[#3D4127]/70 hover:bg-black/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[12px] text-[13px] font-bold bg-[#636B2F] hover:bg-[#525826] text-white transition-colors shadow-sm"
                >
                  Buka Lembar Absensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
