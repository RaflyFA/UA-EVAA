"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import SiswaGuard from "@/components/SiswaGuard";
import LockedModal from "@/components/LockedModal";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

interface BabItem {
  id: number;
  key: "harti" | "surti" | "bukti" | "bakti" | "sajati";
  title: string;
  href: string;
}

const babs: BabItem[] = [
  { id: 1, key: "harti", title: "BAB 1: Niti Harti", href: "/niti-harti" },
  { id: 2, key: "surti", title: "BAB 2: Niti Surti", href: "/niti-surti" },
  { id: 3, key: "bukti", title: "BAB 3: Niti Bukti", href: "/niti-bukti" },
  { id: 4, key: "bakti", title: "BAB 4: Niti Bakti", href: "/niti-bakti" },
  { id: 5, key: "sajati", title: "BAB 5: Niti Sajati", href: "/niti-sajati" },
];

export default function AlurModulPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lockedModalData, setLockedModalData] = useState<{
    isOpen: boolean;
    stageName: string;
    requiredStageName: string;
  } | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, string>>({
    harti: "tersedia",
    surti: "terkunci",
    bukti: "terkunci",
    bakti: "terkunci",
    sajati: "terkunci",
  });
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      if (!user || profile?.role !== "siswa") {
        setIsLoadingProgress(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("progress_siswa")
          .select("tahap_niti, status")
          .eq("siswa_id", user.id);

        if (error) {
          console.warn("Gagal mengambil progress siswa:", error.message);
        }

        if (data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((row) => {
            map[row.tahap_niti] = row.status;
          });
          setProgressMap((prev) => ({ ...prev, ...map }));
        } else {
          // Self-healing: jika akun siswa belum memiliki baris di progress_siswa
          const initialRows = [
            { siswa_id: user.id, tahap_niti: "harti", status: "tersedia" },
            { siswa_id: user.id, tahap_niti: "surti", status: "terkunci" },
            { siswa_id: user.id, tahap_niti: "bukti", status: "terkunci" },
            { siswa_id: user.id, tahap_niti: "bakti", status: "terkunci" },
            { siswa_id: user.id, tahap_niti: "sajati", status: "terkunci" },
          ];
          await supabase.from("progress_siswa").insert(initialRows);
          setProgressMap({
            harti: "tersedia",
            surti: "terkunci",
            bukti: "terkunci",
            bakti: "terkunci",
            sajati: "terkunci",
          });
        }
      } catch (err) {
        console.error("Error loading student progress:", err);
      } finally {
        setIsLoadingProgress(false);
      }
    }

    if (!authLoading) {
      loadProgress();

      const handleRefresh = () => {
        if (document.visibilityState === "visible") {
          loadProgress();
        }
      };

      window.addEventListener("focus", handleRefresh);
      document.addEventListener("visibilitychange", handleRefresh);

      return () => {
        window.removeEventListener("focus", handleRefresh);
        document.removeEventListener("visibilitychange", handleRefresh);
      };
    }
  }, [user, profile, authLoading]);

  // Tentukan tahap yang sedang aktif (yang belum 'disetujui') untuk tombol bawah
  const currentUnfinishedBab = babs.find((b) => {
    const status = progressMap[b.key] || "terkunci";
    return (
      status === "tersedia" ||
      status === "sedang_dikerjakan" ||
      status === "menunggu_review" ||
      status === "perlu_revisi"
    );
  }) || babs[0];

  const allCompleted = babs.every((b) => progressMap[b.key] === "disetujui");

  return (
    <SiswaGuard>
      <LockedModal
        isOpen={!!lockedModalData?.isOpen}
        stageName={lockedModalData?.stageName}
        requiredStageName={lockedModalData?.requiredStageName}
        actionText="Mengerti"
        onAction={() => setLockedModalData(null)}
      />
      <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-between px-6 pt-4 pb-8 relative overflow-x-hidden font-sans">
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />

        {/* Judul Halaman */}
        <div className="w-full">
          <h1 className="text-[28px] font-bold leading-[38px] text-[#3D4127]">
            Alur Modul
          </h1>
        </div>

        {/* Struktur Alur Modul */}
        <div className="w-full flex flex-col items-center pb-24">
          {babs.map((bab, index) => {
            const status = progressMap[bab.key] || "terkunci";
            const isCompleted = status === "disetujui";
            const isReview = status === "menunggu_review";
            const isRevision = status === "perlu_revisi";
            const isAvailable = status === "tersedia" || status === "sedang_dikerjakan";
            // User diizinkan membuka bab yang tersedia, sedang direview, perlu revisi, maupun yang sudah selesai
            const isOpen = isCompleted || isAvailable || isReview || isRevision;

            return (
              <div key={bab.id} className="w-full flex flex-col items-center">
                {/* Card BAB */}
                {isOpen ? (
                  <Link href={bab.href} className="w-full block">
                    <div className="w-full h-[56px] rounded-[120px] border-[2px] border-[#9CA08D] bg-[#FBFFF3] flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#f3f7ea] transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[#3D4127] text-[16px] font-semibold leading-[24px]">
                          {bab.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#636B2F]/15 text-[#636B2F]">
                            Selesai
                          </span>
                        )}
                        {isReview && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EAB308]/20 text-[#A16207]">
                            Review
                          </span>
                        )}
                        {isRevision && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EF4444]/20 text-[#B91C1C]">
                            Revisi
                          </span>
                        )}
                        <Image
                          src="/panah-nobg.svg"
                          alt="Arrow Right"
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    onClick={() => {
                      const prevBab =
                        index > 0 ? babs[index - 1].title : "sebelumnya";
                      setLockedModalData({
                        isOpen: true,
                        stageName: bab.title,
                        requiredStageName: prevBab,
                      });
                    }}
                    className="w-full h-[56px] rounded-[120px] bg-[#3D41271A] hover:bg-[#3D412726] active:scale-[0.99] flex items-center px-6 py-4 select-none opacity-85 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icon-gembok.svg"
                        alt="Icon Gembok"
                        width={24}
                        height={24}
                      />
                      <span className="text-[#9CA08D] text-[16px] font-semibold leading-[24px]">
                        {bab.title}
                      </span>
                    </div>
                  </div>
                )}

                {/* Panah Antar BAB */}
                {index < babs.length - 1 && (
                  <div className="my-2 flex justify-center">
                    <Image
                      src="/panah kebawah.svg"
                      alt="Panah Bawah"
                      width={24}
                      height={24}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

          {/* Loading Indicator jika progress sedang diambil */}
          {isLoadingProgress && (
            <p className="text-xs text-[#3D4127]/60 animate-pulse -mt-20 mb-20">
              Memuat data perkembangan alur...
            </p>
          )}

          {/* Tombol Aksi di Bawah (Sticky/Fixed) */}
          <div className="fixed bottom-6 w-full max-w-[354px] z-20">
            {allCompleted ? (
              <Link href="/niti-harti" className="block w-full">
                <button className="w-full h-[56px] bg-[#636B2F] rounded-[120px] flex items-center justify-center gap-2 hover:bg-[#525826] transition-colors shadow-lg focus:outline-none">
                  <span className="text-[#FBFFF3] text-[16px] font-semibold leading-[24px]">
                    Semua Bab Selesai (Kembali)
                  </span>
                </button>
              </Link>
            ) : (
              <Link href={currentUnfinishedBab.href} className="block w-full">
                <button className="w-full h-[56px] bg-[#636B2F] rounded-[120px] flex items-center justify-center gap-2 hover:bg-[#525826] transition-colors shadow-lg focus:outline-none">
                  <span className="text-[#FBFFF3] text-[16px] font-semibold leading-[24px]">
                    {progressMap[currentUnfinishedBab.key] === "disetujui"
                      ? `Buka ${currentUnfinishedBab.title.split(":")[1]?.trim() || currentUnfinishedBab.title}`
                      : `Lanjut ke ${currentUnfinishedBab.title.split(":")[1]?.trim() || currentUnfinishedBab.title}`}
                  </span>
                  <Image
                    src="/panah-button-terang.svg"
                    alt="Panah"
                    width={20}
                    height={20}
                  />
                </button>
              </Link>
            )}
          </div>
        </div>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </main>
    </SiswaGuard>
  );
}
