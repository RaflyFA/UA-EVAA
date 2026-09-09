"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function NitiSurtiPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [masalah, setMasalah] = useState("");
  const [solusi, setSolusi] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Proteksi akses & ambil data jawaban yang tersimpan jika ada
  useEffect(() => {
    async function initPage() {
      if (authLoading) return;
      if (!user) return;

      try {
        // Cek status tahap Niti Surti
        const { data: prog } = await supabase
          .from("progress_siswa")
          .select("status")
          .eq("siswa_id", user.id)
          .eq("tahap_niti", "surti")
          .maybeSingle();

        if (prog && prog.status === "terkunci") {
          alert("Tahap Niti Surti masih terkunci! Selesaikan Niti Harti terlebih dahulu.");
          router.push("/alur");
          return;
        }

        // Ambil jawaban sebelumnya jika siswa membuka kembali halaman ini
        const { data: ans } = await supabase
          .from("jawaban_niti_surti")
          .select("masalah_ditemukan, alternatif_solusi, validasi_kebenaran")
          .eq("siswa_id", user.id)
          .maybeSingle();

        if (ans) {
          setMasalah(ans.masalah_ditemukan || "");
          setSolusi(ans.alternatif_solusi || "");
          setIsValidated(ans.validasi_kebenaran || false);
        }
      } catch (err) {
        console.error("Gagal inisialisasi Niti Surti:", err);
      }
    }

    initPage();
  }, [user, authLoading, router]);

  // 2. Simpan jawaban dan lanjutkan ke Niti Bukti
  const handleLanjut = async () => {
    if (!isValidated || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (user) {
        const now = new Date().toISOString();

        // 1. Simpan jawaban ke tabel jawaban_niti_surti (upsert)
        await supabase.from("jawaban_niti_surti").upsert({
          siswa_id: user.id,
          masalah_ditemukan: masalah.trim() || "Tidak ada catatan masalah",
          alternatif_solusi: solusi.trim() || "Tidak ada catatan alternatif",
          validasi_kebenaran: isValidated,
          updated_at: now,
        });

        // 2. Tandai Niti Surti sebagai disetujui (selesai)
        await supabase
          .from("progress_siswa")
          .update({
            status: "disetujui",
            tanggal_selesai: now,
            updated_at: now,
          })
          .eq("siswa_id", user.id)
          .eq("tahap_niti", "surti");

        // 3. Buka gembok Niti Bukti (ubah dari terkunci menjadi tersedia)
        const { data: buktiData } = await supabase
          .from("progress_siswa")
          .select("status")
          .eq("siswa_id", user.id)
          .eq("tahap_niti", "bukti")
          .maybeSingle();

        if (buktiData && buktiData.status === "terkunci") {
          await supabase
            .from("progress_siswa")
            .update({
              status: "tersedia",
              tanggal_mulai: now,
              updated_at: now,
            })
            .eq("siswa_id", user.id)
            .eq("tahap_niti", "bukti");
        }
      }

      router.push("/niti-bukti");
    } catch (err) {
      console.error("Gagal memproses Niti Surti:", err);
      router.push("/niti-bukti");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-32 relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Header Niti Surti */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          <div className="absolute right-0 top-0 bottom-0 w-[160px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/niti-surti.png"
              alt="Niti Surti Illustration"
              width={140}
              height={140}
              priority
              className="object-contain object-right opacity-90"
            />
          </div>

          <div
            className="absolute inset-0 rounded-bl-[24px] rounded-br-[24px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
              opacity: 1,
            }}
          />

          <div className="relative z-30 w-full h-full p-6 flex flex-col justify-end gap-[12px]">
            <div className="flex flex-col gap-1 w-full max-w-[210px]">
              <h1 className="font-bold text-[32px] leading-[38px] text-[#FBFFF3]">
                Niti Surti
              </h1>
              <p className="font-medium text-[14px] leading-[20px] text-[#FBFFF3]">
                Mengelompokkan Informasi.
              </p>
            </div>
          </div>
        </div>

        {/* Bagian Masalah Yang Ditemukan */}
        <div className="w-full max-w-[354px] min-h-[109px] bg-[#FBFFF3] rounded-[24px] p-4 sm:p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col justify-between gap-[12px]">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Masalah Yang Ditemukan
          </h2>
          <div className="w-full border-t border-[#3D4127]/15 pt-2">
            <input
              type="text"
              value={masalah}
              onChange={(e) => setMasalah(e.target.value)}
              placeholder="Ketik kalimat yang ingin disampaikan..."
              className="w-full bg-transparent text-[14px] font-[400] leading-[20px] text-[#3D4127] placeholder-[#9CA08D] focus:outline-none"
            />
          </div>
        </div>

        {/* Bagian Alternatif Solusi */}
        <div className="w-full max-w-[354px] min-h-[109px] bg-[#FBFFF3] rounded-[24px] p-4 sm:p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col justify-between gap-[12px]">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Alternatif Solusi
          </h2>
          <div className="w-full border-t border-[#3D4127]/15 pt-2">
            <input
              type="text"
              value={solusi}
              onChange={(e) => setSolusi(e.target.value)}
              placeholder="Ketik kalimat yang ingin disampaikan..."
              className="w-full bg-transparent text-[14px] font-[400] leading-[20px] text-[#3D4127] placeholder-[#9CA08D] focus:outline-none"
            />
          </div>
        </div>

        {/* Bagian Memvalidasi Kebenaran Informasi */}
        <div
          onClick={() => setIsValidated(!isValidated)}
          className="w-full max-w-[354px] h-[56px] bg-[#FBFFF3] rounded-[24px] px-6 py-4 shadow-[0px_2px_2px_0px_#00000040] flex items-center gap-[12px] cursor-pointer select-none"
        >
          <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
            {isValidated ? (
              <div className="w-[24px] h-[24px] rounded-full border-[2.5px] border-[#636B2F] bg-[#636B2F] flex items-center justify-center transition-colors">
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 5L5 8.5L12.5 1"
                    stroke="#FBFFF3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-[24px] h-[24px] rounded-full border-[2.5px] border-[#3D4127] bg-transparent transition-colors" />
            )}
          </div>
          <span className="text-[14px] font-[600] leading-[24px] text-[#3D4127]">
            Memvalidasi Kebenaran Informasi
          </span>
        </div>
      </div>

      {/* Tombol Lanjut ke Niti Bukti (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          <button
            onClick={handleLanjut}
            disabled={!isValidated || isSubmitting}
            className={`w-full h-[56px] rounded-[120px] flex items-center justify-center gap-2 transition-colors shadow-lg focus:outline-none ${
              isValidated
                ? "bg-[#636B2F] text-[#FBFFF3] hover:bg-[#525826] cursor-pointer"
                : "bg-[#3D41271A] text-[#9CA08D] cursor-not-allowed"
            }`}
          >
            <span className="text-[16px] font-semibold leading-[24px]">
              {isSubmitting ? "Menyimpan..." : "Lanjut ke Niti Bukti"}
            </span>
            <Image
              src={
                isValidated
                  ? "/panah-button-terang.svg"
                  : "/panah-nobg.svg"
              }
              alt="Panah"
              width={20}
              height={20}
              className={isValidated ? "" : "opacity-40"}
            />
          </button>
        </div>
      </div>

      {/* Sidebar Reusable */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  );
}
