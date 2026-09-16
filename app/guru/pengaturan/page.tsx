"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import ToastNotification from "@/components/ToastNotification";

export default function GuruPengaturanPage() {
  const { user, profile, refreshProfile } = useAuth();

  // State profil
  const [namaLengkap, setNamaLengkap] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State email
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // State password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast notification
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (profile?.nama_lengkap) {
      setNamaLengkap(profile.nama_lengkap);
    }
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [profile, user]);

  // 1. Simpan Nama Profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      setNotification({
        type: "error",
        message: "Nama lengkap tidak boleh kosong.",
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      if (!user?.id) throw new Error("Sesi pengguna tidak valid.");

      // Update di tabel profiles
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          nama_lengkap: namaLengkap.trim(),
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // Update di auth metadata
      await supabase.auth.updateUser({
        data: {
          nama_lengkap: namaLengkap.trim(),
        },
      });

      await refreshProfile();

      setNotification({
        type: "success",
        message: "Nama profil guru berhasil diperbarui.",
      });
    } catch (err: unknown) {
      const errObj = err as Error;
      setNotification({
        type: "error",
        message: errObj.message || "Gagal memperbarui profil.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 2. Perbarui Email Guru
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setNotification({
        type: "error",
        message: "Alamat email tidak boleh kosong.",
      });
      return;
    }

    if (cleanEmail === user?.email) {
      setNotification({
        type: "error",
        message: "Email baru sama dengan email saat ini.",
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: cleanEmail,
      });

      if (error) throw error;

      setNotification({
        type: "success",
        message:
          "Permintaan pembaruan email berhasil diproses. Jika konfirmasi email aktif di sistem, silakan periksa kotak masuk email baru Anda.",
      });
    } catch (err: unknown) {
      const errObj = err as Error;
      setNotification({
        type: "error",
        message: errObj.message || "Gagal memperbarui email.",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // 3. Perbarui Kata Sandi Guru
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setNotification({
        type: "error",
        message: "Kata sandi baru minimal harus 8 karakter.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification({
        type: "error",
        message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setNotification({
        type: "success",
        message: "Kata sandi guru berhasil diperbarui.",
      });
    } catch (err: unknown) {
      const errObj = err as Error;
      setNotification({
        type: "error",
        message: errObj.message || "Gagal memperbarui kata sandi.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[860px]">
      {/* Toast Notification */}
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      

      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Ubah Nama Profil */}
        <div className="bg-[#FBFFF3] rounded-[16px] p-6 shadow-sm border border-[#D3D8C3]/60 flex flex-col gap-5">
          <div className="border-b border-[#D3D8C3]/40 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#3D4127]">
                Informasi Profil
              </h2>
              <p className="text-[12px] text-[#3D4127]/65 mt-0.5">
                Nama yang akan ditampilkan pada sistem dan modul ajar.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#5B6628]/10 text-[#5B6628] rounded-full text-[12px] font-semibold">
              Guru Pengajar
            </span>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#3D4127]">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama Lengkap Beserta Gelar"
                className="w-full h-[46px] bg-white border border-[#D3D8C3] rounded-[12px] px-4 text-[14px] text-[#3D4127] placeholder-[#3D4127]/40 focus:outline-none focus:border-[#5B6628]"
                required
              />
            </div>

            {profile?.nomor_induk && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#3D4127]/70">
                  NIP / Nomor Induk
                </label>
                <input
                  type="text"
                  value={profile.nomor_induk}
                  disabled
                  className="w-full h-[46px] bg-[#EDF0E8]/60 border border-[#D3D8C3] rounded-[12px] px-4 text-[14px] text-[#3D4127]/70 cursor-not-allowed"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="h-[44px] px-6 bg-[#5B6628] hover:bg-[#4a5420] text-white rounded-[12px] text-[14px] font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Ubah Email */}
        <div className="bg-[#FBFFF3] rounded-[16px] p-6 shadow-sm border border-[#D3D8C3]/60 flex flex-col gap-5">
          <div className="border-b border-[#D3D8C3]/40 pb-3">
            <h2 className="text-[16px] font-semibold text-[#3D4127]">
              Alamat Email
            </h2>
            <p className="text-[12px] text-[#3D4127]/65 mt-0.5">
              Alamat email aktif yang digunakan untuk masuk ke portal guru.
            </p>
          </div>

          <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#3D4127]">
                Email Akun
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
                placeholder="alamat.email@sekolah.id"
                className="w-full h-[46px] bg-white border border-[#D3D8C3] rounded-[12px] px-4 text-[14px] text-[#3D4127] placeholder-[#3D4127]/40 focus:outline-none focus:border-[#5B6628]"
                required
              />
              <span className="text-[11px] text-[#3D4127]/60">
                *Otomatis dikonversi menjadi huruf kecil.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingEmail}
                className="h-[44px] px-6 bg-[#5B6628] hover:bg-[#4a5420] text-white rounded-[12px] text-[14px] font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingEmail ? "Memperbarui..." : "Perbarui Email"}
              </button>
            </div>
          </form>
        </div>

        {/* Card 3: Ubah Kata Sandi */}
        <div className="bg-[#FBFFF3] rounded-[16px] p-6 shadow-sm border border-[#D3D8C3]/60 flex flex-col gap-5">
          <div className="border-b border-[#D3D8C3]/40 pb-3">
            <h2 className="text-[16px] font-semibold text-[#3D4127]">
              Keamanan Kata Sandi
            </h2>
            <p className="text-[12px] text-[#3D4127]/65 mt-0.5">
              Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#3D4127]">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full h-[46px] bg-white border border-[#D3D8C3] rounded-[12px] px-4 text-[14px] text-[#3D4127] placeholder-[#3D4127]/40 focus:outline-none focus:border-[#5B6628]"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#3D4127]">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full h-[46px] bg-white border border-[#D3D8C3] rounded-[12px] px-4 text-[14px] text-[#3D4127] placeholder-[#3D4127]/40 focus:outline-none focus:border-[#5B6628]"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <span className="text-[11px] text-[#3D4127]/60">
              *Kata sandi baru wajib memiliki panjang minimal 8 karakter.
            </span>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="h-[44px] px-6 bg-[#5B6628] hover:bg-[#4a5420] text-white rounded-[12px] text-[14px] font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPassword ? "Menyimpan..." : "Perbarui Kata Sandi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
