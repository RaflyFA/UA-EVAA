"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import SiswaGuard from "@/components/SiswaGuard";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import LockedModal from "@/components/LockedModal";

export default function NitiBaktiPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("daur-ulang");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    nilai: number | null;
    catatan: string | null;
    status: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [panduan, setPanduan] = useState<string>(
    "Pilihlah salah satu dari 3 kategori aksi lingkungan (Daur Ulang Sampah, Menanam Pohon, atau Gerakan Hemat Energi). Laksanakan aksi tersebut bersama kelompok, dokumentasikan, lalu unggah laporan PDF bukti aksi Anda."
  );

  // Proteksi akses & cek submission sebelumnya
  useEffect(() => {
    async function init() {
      if (!profile?.id) return;

      try {
        // Ambil panduan aksi dari Guru jika ada
        const { data: kontenData } = await supabase
          .from("konten_modul")
          .select("deskripsi")
          .eq("tahap_niti", "bakti")
          .eq("tipe_konten", "panduan_tugas")
          .maybeSingle();

        if (kontenData?.deskripsi) {
          setPanduan(kontenData.deskripsi);
        }
      } catch (err) {
        console.error("Gagal mengambil panduan Niti Bakti:", err);
      }

      // Cek status tahap Niti Bakti
      const { data: prog } = await supabase
        .from("progress_siswa")
        .select("status")
        .eq("siswa_id", profile.id)
        .eq("tahap_niti", "bakti")
        .maybeSingle();

      if (prog && prog.status === "terkunci") {
        setIsLocked(true);
        return;
      }

      // Cek submission yang sudah ada
      const { data: sub } = await supabase
        .from("submission_aksi")
        .select("*")
        .eq("siswa_id", profile.id)
        .eq("tahap_niti", "bakti")
        .order("tanggal_submit", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        setUploadStatus("success");
        if (sub.nama_file) {
          setUploadedFile({ name: sub.nama_file } as File);
        }

        // Ambil nilai dari tabel nilai jika sudah dinilai guru
        const { data: nData } = await supabase
          .from("nilai")
          .select("nilai_angka, catatan")
          .eq("submission_id", sub.id)
          .maybeSingle();

        if (nData || sub.catatan_revisi) {
          setEvaluation({
            nilai: nData?.nilai_angka !== undefined && nData?.nilai_angka !== null ? Number(nData.nilai_angka) : null,
            catatan: nData?.catatan || sub.catatan_revisi || "Tugas telah disetujui guru.",
            status: sub.status,
          });
        }
      }
    }

    init();
  }, [profile, router]);

  const categories = [
    {
      id: "kampanye",
      title: "Kampanye Lingkungan",
      image: "/kampanye-lingkungan.png",
      dbValue: "kampanye_lingkungan" as const,
    },
    {
      id: "daur-ulang",
      title: "Daur Ulang",
      image: "/daur ulang.png",
      dbValue: "daur_ulang" as const,
    },
    {
      id: "konservasi",
      title: "Upaya Konservasi",
      image: "/Upaya Konservasi.png",
      dbValue: "konservasi" as const,
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setErrorMessage(null);

      // Pastikan pengguna sudah masuk
      if (!profile?.id) {
        setErrorMessage("Anda belum masuk! Silakan masuk dengan akun Siswa terlebih dahulu untuk mengunggah tugas.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Ukuran berkas melebihi batas maksimal 10 MB!");
        return;
      }

      setUploadedFile(file);
      setUploadStatus("uploading");

      try {
        const fileExt = file.name.split(".").pop();
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `niti-bakti/${safeFileName}`;

        // 1. Upload berkas ke Supabase Storage Bucket 'submissions'
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("submissions")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadErr) {
          throw new Error(`Gagal upload berkas ke storage: ${uploadErr.message}`);
        }

        if (uploadData?.path) {
          setUploadedPath(uploadData.path);
        }

        // 2. Dapatkan URL publik berkas
        const { data: urlData } = supabase.storage
          .from("submissions")
          .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl || "";
        const catObj = categories.find((c) => c.id === selectedCategory);
        const dbKategori = catObj?.dbValue || "daur_ulang";

        // 3. Simpan catatan ke tabel submission_aksi dengan schema yang sesuai
        const { error: insertErr } = await supabase.from("submission_aksi").insert({
          siswa_id: profile.id,
          tahap_niti: "bakti",
          kategori_aksi: dbKategori,
          nama_file: file.name,
          file_url: publicUrl,
          status: "menunggu_review",
        });

        if (insertErr) {
          throw new Error(`Gagal menyimpan ke database: ${insertErr.message}`);
        }

        // 4. Update progress_siswa untuk bakti dan buka Niti Sajati
        const now = new Date().toISOString();
        await supabase
          .from("progress_siswa")
          .update({
            status: "disetujui",
            tanggal_selesai: now,
            updated_at: now,
          })
          .eq("siswa_id", profile.id)
          .eq("tahap_niti", "bakti");

        const { data: sajatiProg } = await supabase
          .from("progress_siswa")
          .select("status")
          .eq("siswa_id", profile.id)
          .eq("tahap_niti", "sajati")
          .maybeSingle();

        if (sajatiProg && sajatiProg.status === "terkunci") {
          await supabase
            .from("progress_siswa")
            .update({
              status: "tersedia",
              tanggal_mulai: now,
              updated_at: now,
            })
            .eq("siswa_id", profile.id)
            .eq("tahap_niti", "sajati");
        }

        setUploadStatus("success");
      } catch (err: unknown) {
        const errObj = err as Error;
        console.error("Upload error:", errObj);
        setErrorMessage(errObj.message || "Terjadi kesalahan saat mengunggah.");
        setUploadStatus("idle");
        setUploadedFile(null);
      }
    }
  };

  const handleBoxClick = () => {
    if (uploadStatus === "idle") {
      fileInputRef.current?.click();
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedPath) {
      try {
        await supabase.storage.from("submissions").remove([uploadedPath]);
      } catch (err) {
        console.error("Gagal menghapus file dari storage:", err);
      }
    }
    setUploadedFile(null);
    setUploadedPath(null);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <SiswaGuard>
      <LockedModal
        isOpen={isLocked}
        stageName="Niti Bakti (BAB 4)"
        requiredStageName="Niti Bukti (BAB 3)"
        onAction={() => router.push("/alur")}
      />
      <main className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center px-6 pt-4 pb-[140px] relative overflow-x-hidden font-sans">
      {/* Container utama dengan lebar maksimum 354px */}
      <div className="w-full max-w-[354px] flex flex-col items-center gap-6 z-10 flex-1">
        {/* Topbar Reusable */}
        <div className="w-full z-20">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} variant="dark" />
        </div>

        {/* Header Niti Bakti - Lapisan 1: Dasaran Persegi Panjang Warna #EDF0E8 */}
        <div className="relative w-full max-w-[354px] h-[140px] bg-[#EDF0E8] rounded-bl-[24px] rounded-br-[24px] overflow-hidden shadow-md flex flex-col justify-end">
          {/* Lapisan 2: Gambar Lampiran Ilustrasi (Di atas #EDF0E8, di bawah Overlay Gradien) */}
          <div className="absolute right-0 top-0 bottom-0 w-[170px] pointer-events-none flex items-center justify-center z-10">
            <Image
              src="/niti-bakti.png"
              alt="Niti Bakti Illustration"
              width={160}
              height={140}
              priority
              className="object-contain object-right opacity-90"
            />
          </div>

          {/* Lapisan 3: Efek Gradien #636B2F (Di atas Gambar, di bawah Teks) */}
          <div
            className="absolute inset-0 rounded-bl-[24px] rounded-br-[24px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(180deg, rgba(99, 107, 47, 0) 0%, #636B2F 100%)",
              opacity: 1,
            }}
          />

          {/* Lapisan 4: Teks "Niti Bakti" & Subtitle (Paling Atas) */}
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
                Niti Bakti
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "20px",
                  letterSpacing: "0%",
                  color: "#FBFFF3",
                }}
              >
                Aksi nyata dari tiga kategori lingkungan.
              </p>
            </div>
          </div>
        </div>

        {/* Bagian Panduan Aksi Nyata dari Guru */}
        {panduan && (
          <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-5 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🌱</span>
              <h2 className="text-[16px] font-[600] leading-[22px] text-[#3D4127]">
                Panduan & Petunjuk Aksi Nyata
              </h2>
            </div>
            <p className="text-[13px] font-[400] leading-[21px] text-[#3D4127]/90 whitespace-pre-line border-t border-[#3D4127]/15 pt-2.5">
              {panduan}
            </p>
          </div>
        )}

        {/* Section Pilih Kategori Aksi */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
            Pilih Kategori Aksi
          </h2>

          {/* Scrollable Container Kategori */}
          <div className="w-full flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-none w-[134px] h-[180px] bg-[#EDF0E8] rounded-[12px] p-[16px] flex flex-col items-center justify-between gap-[12px] cursor-pointer transition-all duration-200 snap-start border-2 ${
                    isSelected
                      ? "border-[#636B2F] shadow-sm bg-[#e4e8dc]"
                      : "border-transparent hover:border-[#D3D8C3]"
                  }`}
                >
                  <div className="w-full h-[96px] relative rounded-[8px] overflow-hidden flex items-center justify-center bg-[#D3D8C3]/30">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[13px] font-[600] text-[#3D4127] text-center leading-[16px] flex-1 flex items-center justify-center">
                    {cat.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Unggah Laporan */}
        <div className="w-full max-w-[354px] bg-[#FBFFF3] rounded-[24px] p-6 shadow-[0px_2px_2px_0px_#00000040] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-[600] leading-[24px] text-[#3D4127]">
              Unggah Laporan
            </h2>
            {profile ? (
              <span className="text-[11px] font-semibold bg-[#5B6628]/15 text-[#5B6628] px-2 py-0.5 rounded-full truncate max-w-[140px]" title={profile.nama_lengkap}>
                👤 {profile.nama_lengkap}
              </span>
            ) : (
              <Link
                href="/login"
                className="text-[11px] font-bold text-[#b91c1c] underline bg-[#f87171]/15 px-2 py-0.5 rounded-full"
              >
                Belum Masuk ↗
              </Link>
            )}
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-[#f87171]/20 border border-[#f87171] rounded-[12px] text-[#b91c1c] text-xs font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {!profile && (
            <div className="p-2.5 bg-[#EDF0E8] border border-[#D3D8C3] rounded-[12px] text-[#3D4127] text-xs">
              ⚠️ Anda belum masuk. Silakan{" "}
              <Link href="/login" className="font-bold underline text-[#5B6628]">
                Masuk terlebih dahulu
              </Link>{" "}
              agar tugas Anda tersimpan ke sistem.
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />

          {/* Render UI berdasarkan Status Unggahan */}
          {uploadStatus === "idle" ? (
            /* Mode Dashed Box Awal */
            <div
              onClick={handleBoxClick}
              className="w-full max-w-[306px] h-[159px] bg-[#EDF0E8] rounded-[11px] border-2 border-dashed border-[#D3D8C3] pb-[16px] flex flex-col items-center justify-center gap-[6px] cursor-pointer hover:border-[#636B2F] transition-colors select-none mx-auto"
            >
              <Image
                src="/icon-upload.svg"
                alt="Icon Upload"
                width={48}
                height={48}
                className="object-contain"
              />
              <p className="text-[12px] font-[500] leading-[18px] text-[#9CA08D] text-center px-4">
                Format PDF / Word, Maks 10 MB
              </p>
            </div>
          ) : (
            /* Mode Loading / Success Row (Sesuai Lampiran 1 & 2) */
            <div className="w-full max-w-[306px] h-[56px] rounded-[16px] border border-[#D3D8C3] bg-[#FBFFF3] px-4 flex items-center justify-between mx-auto shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <Image
                  src="/file.svg"
                  alt="File Icon"
                  width={28}
                  height={28}
                  className="object-contain flex-shrink-0"
                />
                <span className="text-[14px] font-[600] text-[#3D4127] truncate">
                  {uploadedFile?.name || "Laporan.pdf"}
                </span>
              </div>

              {uploadStatus === "uploading" ? (
                /* Spinner Loading (Lampiran 1) */
                <div className="w-6 h-6 border-2 border-[#9CA08D] border-t-[#636B2F] rounded-full animate-spin flex-shrink-0" />
              ) : (
                /* Tombol Batal/Hapus X (Lampiran 2) */
                <button
                  onClick={handleCancel}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 text-[#3D4127] transition-colors flex-shrink-0"
                  aria-label="Hapus file"
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Kartu Hasil Penilaian & Umpan Balik Guru */}
          {evaluation && (
            <div className="w-full max-w-[306px] bg-[#FBFFF3] rounded-[18px] border border-[#636B2F]/30 p-4 flex flex-col gap-2 mx-auto shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#636B2F] uppercase tracking-wider">
                  Hasil Evaluasi Guru
                </span>
                {evaluation.nilai !== null ? (
                  <span className="text-[13px] font-black text-[#636B2F] bg-[#636B2F]/15 px-2.5 py-0.5 rounded-full">
                    {evaluation.nilai} / 100
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#15803d] bg-[#16a34a]/15 px-2 py-0.5 rounded-full">
                    Disetujui
                  </span>
                )}
              </div>
              {evaluation.catatan && (
                <p className="text-[12px] text-[#3D4127] bg-[#EDF0E8]/60 p-2.5 rounded-xl leading-relaxed">
                  <strong className="text-[#636B2F]">Catatan: </strong>
                  {evaluation.catatan}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Lanjut ke Niti Sajati (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          {uploadStatus === "success" ? (
            <Link href="/niti-sajati" className="block w-full">
              <button className="w-full h-[56px] bg-[#5B6628] hover:bg-[#4d5722] text-[#FBFFF3] rounded-[120px] flex items-center justify-center gap-2.5 transition-colors shadow-lg focus:outline-none">
                <span className="text-[16px] font-semibold leading-[24px]">
                  Lanjut ke Niti Sajati
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
          ) : (
            <button
              disabled
              className="w-full h-[56px] bg-[#D3D8C3] text-[#9CA08D] rounded-[120px] flex items-center justify-center gap-2.5 cursor-not-allowed focus:outline-none"
            >
              <span className="text-[16px] font-semibold leading-[24px]">
                Lanjut ke Niti Sajati
              </span>
              <div className="w-6 h-6 rounded-full bg-[#9CA08D]/40 flex items-center justify-center text-[#9CA08D] font-bold text-xs">
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
          )}
        </div>
      </div>

      {/* Sidebar Reusable */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </main>
  </SiswaGuard>
  );
}
