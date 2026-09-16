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
import ConfirmModal from "@/components/ConfirmModal";

export default function NitiBaktiPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("daur-ulang");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [submissionStatus, setSubmissionStatus] = useState<
    "menunggu_review" | "disetujui" | "perlu_revisi" | null
  >(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    nilai: number | null;
    catatan: string | null;
    status: string;
  } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
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
        setSubmissionStatus(sub.status as "menunggu_review" | "disetujui" | "perlu_revisi");
        if (sub.nama_file) {
          setUploadedFile({ name: sub.nama_file } as File);
        }
        if (sub.file_url) {
          const parts = sub.file_url.split("/submissions/");
          if (parts.length > 1) {
            setUploadedPath(decodeURIComponent(parts[1]));
          }
        }
        if (sub.kategori_aksi) {
          setSelectedCategory(sub.kategori_aksi);
        }

        // Ambil nilai dari tabel nilai jika sudah dinilai guru
        const { data: nData } = await supabase
          .from("nilai")
          .select("nilai_angka, catatan")
          .eq("submission_id", sub.id)
          .maybeSingle();

        setEvaluation({
          nilai: nData?.nilai_angka !== undefined && nData?.nilai_angka !== null ? Number(nData.nilai_angka) : null,
          catatan: nData?.catatan || sub.catatan_revisi || null,
          status: sub.status,
        });
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

        // 3. Simpan catatan ke tabel submission_aksi dengan status 'menunggu_review'
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

        // 4. Update progress_siswa untuk bakti menjadi menunggu_review (tidak langsung disetujui & tidak langsung buka Sajati)
        const now = new Date().toISOString();
        await supabase
          .from("progress_siswa")
          .update({
            status: "menunggu_review",
            updated_at: now,
          })
          .eq("siswa_id", profile.id)
          .eq("tahap_niti", "bakti");

        setSubmissionStatus("menunggu_review");
        setEvaluation({
          nilai: null,
          catatan: null,
          status: "menunggu_review",
        });
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
    setSubmissionStatus(null);
    setEvaluation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenCancelModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (submissionStatus !== "menunggu_review") {
      setAlertModal({
        isOpen: true,
        title: "Tidak Dapat Dibatalkan",
        message: "Tugas tidak dapat dibatalkan karena sudah ditinjau oleh guru.",
      });
      return;
    }
    setShowCancelModal(true);
  };

  const executeCancelSubmission = async () => {
    if (!profile?.id) return;
    setIsCancelling(true);
    setErrorMessage(null);

    try {
      // 1. Cek status terkini di database untuk memastikan guru belum mereview
      const { data: latestSub, error: checkErr } = await supabase
        .from("submission_aksi")
        .select("id, status, file_url")
        .eq("siswa_id", profile.id)
        .eq("tahap_niti", "bakti")
        .order("tanggal_submit", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (checkErr) {
        throw new Error(`Gagal memeriksa status kiriman: ${checkErr.message}`);
      }

      if (latestSub && latestSub.status !== "menunggu_review") {
        setShowCancelModal(false);
        setAlertModal({
          isOpen: true,
          title: "Tidak Dapat Dibatalkan",
          message: "Guru telah meninjau tugas ini, sehingga kiriman tidak dapat dibatalkan lagi.",
        });
        setSubmissionStatus(latestSub.status as "menunggu_review" | "disetujui" | "perlu_revisi");
        setIsCancelling(false);
        return;
      }

      // 2. Tentukan path storage file yang akan dihapus
      let pathToDel = uploadedPath;
      if (!pathToDel && latestSub?.file_url) {
        const parts = latestSub.file_url.split("/submissions/");
        if (parts.length > 1) {
          pathToDel = decodeURIComponent(parts[1]);
        }
      }

      if (pathToDel) {
        try {
          await supabase.storage.from("submissions").remove([pathToDel]);
        } catch (storageErr) {
          console.error("Gagal menghapus file dari storage:", storageErr);
        }
      }

      // 3. Hapus baris submission_aksi agar file langsung menghilang dari halaman guru
      const { error: delErr } = await supabase
        .from("submission_aksi")
        .delete()
        .eq("siswa_id", profile.id)
        .eq("tahap_niti", "bakti");

      if (delErr) {
        throw new Error(`Gagal membatalkan kiriman di database: ${delErr.message}`);
      }

      // 4. Reset progress_siswa kembali ke 'tersedia'
      await supabase
        .from("progress_siswa")
        .update({
          status: "tersedia",
          catatan_revisi: null,
          reviewed_at: null,
          reviewed_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq("siswa_id", profile.id)
        .eq("tahap_niti", "bakti");

      // 5. Reset local state
      setUploadedFile(null);
      setUploadedPath(null);
      setUploadStatus("idle");
      setSubmissionStatus(null);
      setEvaluation(null);
      setShowCancelModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err: unknown) {
      const errObj = err as Error;
      console.error("Batal kirim error:", errObj);
      setErrorMessage(errObj.message || "Gagal membatalkan kiriman dokumen.");
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
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
      <ConfirmModal
        isOpen={showCancelModal}
        title="Batalkan Kiriman?"
        message="Apakah Anda yakin ingin membatalkan kiriman dokumen aksi ini? File akan dihapus dan Anda dapat mengunggah ulang tugas."
        confirmText="Ya, Batalkan"
        cancelText="Batal"
        type="danger"
        isLoading={isCancelling}
        onConfirm={executeCancelSubmission}
        onCancel={() => !isCancelling && setShowCancelModal(false)}
      />
      <ConfirmModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Mengerti"
        type="warning"
        isAlert={true}
        onConfirm={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
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
              ) : submissionStatus === "disetujui" ? (
                /* Ikon centang untuk berkas yang sudah disetujui */
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#16a34a]/15 text-[#16a34a] flex-shrink-0" title="Tugas Disetujui">
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : submissionStatus === "menunggu_review" ? (
                /* Ikon Menunggu Review Guru */
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#ca8a04]/15 text-[#ca8a04] flex-shrink-0" title="Sedang Ditinjau Guru">
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              ) : (
                /* Tombol Batal/Ganti Berkas X */
                <button
                  onClick={handleCancel}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 text-[#3D4127] transition-colors flex-shrink-0"
                  aria-label="Hapus file"
                  title="Ganti berkas"
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

          {/* Tombol Batalkan Kiriman - Hanya tampil & berfungsi jika status masih 'menunggu_review' */}
          {submissionStatus === "menunggu_review" && (
            <button
              onClick={handleOpenCancelModal}
              disabled={isCancelling}
              className="w-full max-w-[306px] py-2 px-4 rounded-[14px] border border-[#F87171]/60 text-[#B91C1C] text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mx-auto"
              title="Batalkan kiriman dokumen"
            >
              {isCancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  <span>Membatalkan Kiriman...</span>
                </>
              ) : (
                <span>Batalkan Kiriman</span>
              )}
            </button>
          )}

          {/* Kartu Status & Evaluasi Guru */}
          {submissionStatus && (
            <div
              className={`w-full max-w-[306px] rounded-[18px] border p-4 flex flex-col gap-2.5 mx-auto shadow-sm ${
                submissionStatus === "disetujui"
                  ? "bg-[#FBFFF3] border-[#636B2F]/40"
                  : submissionStatus === "perlu_revisi"
                  ? "bg-[#FEF2F2] border-[#F87171]/40"
                  : "bg-[#FEFCE8] border-[#FACC15]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#3D4127] uppercase tracking-wider flex items-center gap-1.5">
                  {submissionStatus === "disetujui" && (
                    <span className="inline-block w-2 h-2 rounded-full bg-[#16a34a]"></span>
                  )}
                  {submissionStatus === "menunggu_review" && (
                    <span className="inline-block w-2 h-2 rounded-full bg-[#ca8a04] animate-pulse"></span>
                  )}
                  {submissionStatus === "perlu_revisi" && (
                    <span className="inline-block w-2 h-2 rounded-full bg-[#dc2626]"></span>
                  )}
                  Status Tugas
                </span>

                {submissionStatus === "disetujui" ? (
                  evaluation?.nilai !== null && evaluation?.nilai !== undefined ? (
                    <span className="text-[12px] font-black text-[#636B2F] bg-[#636B2F]/15 px-2.5 py-0.5 rounded-full">
                      Nilai: {evaluation.nilai} / 100
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[#15803d] bg-[#16a34a]/15 px-2 py-0.5 rounded-full">
                      Disetujui
                    </span>
                  )
                ) : submissionStatus === "perlu_revisi" ? (
                  <span className="text-[11px] font-bold text-[#b91c1c] bg-[#ef4444]/15 px-2 py-0.5 rounded-full">
                    Perlu Revisi
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#854d0e] bg-[#eab308]/20 px-2 py-0.5 rounded-full">
                    Menunggu Review
                  </span>
                )}
              </div>

              {submissionStatus === "menunggu_review" && (
                <p className="text-[12px] text-[#713f12] bg-[#fef08a]/30 p-2.5 rounded-xl leading-relaxed">
                  Laporan aksi berhasil diunggah dan sedang menunggu peninjauan oleh Guru. Niti Sajati akan terbuka otomatis setelah tugas ini disetujui.
                </p>
              )}

              {submissionStatus === "perlu_revisi" && (
                <div className="text-[12px] text-[#991b1b] bg-[#fee2e2]/60 p-2.5 rounded-xl leading-relaxed flex flex-col gap-1">
                  {evaluation?.catatan && (
                    <p>
                      <strong>Catatan Guru: </strong>
                      {evaluation.catatan}
                    </p>
                  )}
                  <p className="text-[11px] text-[#7f1d1d]/80">
                    Silakan klik tanda silang (✕) di atas untuk mengganti berkas dan mengunggah perbaikan laporan aksi.
                  </p>
                </div>
              )}

              {submissionStatus === "disetujui" && (
                <div className="text-[12px] text-black bg-[#EDF0E8]/60 p-2.5 rounded-xl leading-relaxed flex flex-col gap-1">
                  <p className="font-semibold text-[#15803d]">
                    Tugas telah disetujui oleh Guru.
                  </p>
                  {evaluation?.catatan && (
                    <p>
                      <strong className="text-[#636B2F]">Catatan: </strong>
                      {evaluation.catatan}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Lanjut ke Niti Sajati (Fixed Bottom) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+32px)] left-0 right-0 flex justify-center px-6 z-10 pointer-events-none">
        <div className="w-full max-w-[354px] pointer-events-auto">
          {submissionStatus === "disetujui" ? (
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
                {submissionStatus === "menunggu_review"
                  ? "Menunggu Persetujuan Guru"
                  : submissionStatus === "perlu_revisi"
                  ? "Perlu Perbaikan Tugas"
                  : "Lanjut ke Niti Sajati"}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#9CA08D]/40 flex items-center justify-center text-[#9CA08D] font-bold text-xs">
                {submissionStatus === "menunggu_review" ? (
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ) : (
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
                )}
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
