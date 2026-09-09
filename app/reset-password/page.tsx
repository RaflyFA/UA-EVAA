"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Cek sesi saat ini
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && isMounted) {
          setIsValidSession(true);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    checkInitialSession();

    // 2. Dengarkan event auth (PASSWORD_RECOVERY atau SIGNED_IN saat token diparsing)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setIsValidSession(true);
      }
    });

    // 3. Fallback timeout: Jika dalam 2.5 detik tidak ada recovery session, tandai tidak valid
    const timeout = setTimeout(async () => {
      if (!isMounted) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setIsValidSession(false);
      }
    }, 2500);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(`Gagal memperbarui kata sandi: ${error.message}`);
        setIsLoading(false);
        return;
      }

      // Sesuai standar: Sign out temporary session agar user masuk secara bersih dengan password baru
      await supabase.auth.signOut();
      router.push("/login?reset=success");
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(
        errObj?.message || "Terjadi kendala saat memperbarui kata sandi."
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden font-sans select-none py-10 px-4">
      {/* SVG Filter untuk penajaman */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="sharpen-reset">
          <feConvolveMatrix
            order="3"
            preserveAlpha="true"
            kernelMatrix="0 0  0 
                          -1  8 -1 
                           0 -1  0"
          />
        </filter>
      </svg>

      {/* Background Image Fullscreen */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/gambar 1.png"
          alt="Background Pemandangan"
          fill
          priority
          unoptimized={true}
          className="object-cover object-center -z-10 contrast-[1.38] brightness-[0.42] saturate-[1.08]"
          style={{
            filter:
              "contrast(1.38) brightness(0.82) saturate(1.08) url(#sharpen-reset)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#3D4127]/40 via-[#3D4127]/20 to-[#3D4127]/70 -z-10" />
      </div>

      {/* Card Glassmorphism */}
      <div className="relative z-10 w-full max-w-[460px] bg-[#D9D9D930] border border-[#FBFFF340] backdrop-blur-[14px] rounded-[28px] shadow-[0px_10px_24px_0px_#00000050] p-[28px] sm:p-[32px] flex flex-col gap-[20px] text-[#FBFFF3]">
        {/* Header Title */}
        <div className="flex flex-col gap-1 items-center text-center w-full">
          <h1 className="text-[32px] font-[800] leading-[38px] tracking-wide text-[#FBFFF3]">
            UA-EVAA
          </h1>
          <p className="text-[14px] font-[500] leading-[20px] text-[#FBFFF3]/90">
            Pengaturan Ulang Kata Sandi
          </p>
        </div>

        {/* State 1: Memeriksa Sesi Pemulihan */}
        {isValidSession === null && (
          <div className="w-full flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-3 border-[#FBFFF3] border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-[#FBFFF3]/90 font-medium">
              Memverifikasi tautan pemulihan...
            </p>
          </div>
        )}

        {/* State 2: Tautan Tidak Valid atau Kedaluwarsa */}
        {isValidSession === false && (
          <div className="w-full flex flex-col items-center text-center gap-4 py-3">
            <div className="w-14 h-14 rounded-full bg-[#f87171]/20 border border-[#f87171] flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[18px] font-bold text-[#FBFFF3]">
                Tautan Tidak Valid atau Kedaluwarsa
              </h2>
              <p className="text-[13px] text-[#FBFFF3]/85 leading-relaxed">
                Tautan pemulihan ini sudah kedaluwarsa, tidak valid, atau telah
                digunakan sebelumnya. Silakan ajukan permintaan lupa kata sandi
                kembali.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full h-[52px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center font-[700] text-[#3D4127] text-[16px] hover:bg-[#f3f7ea] transition-all cursor-pointer mt-2"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        )}

        {/* State 3: Sesi Valid - Form Reset Password */}
        {isValidSession === true && (
          <form
            onSubmit={handleResetPassword}
            className="w-full flex flex-col gap-[14px]"
          >
            {/* Notifikasi Alert Error */}
            {errorMessage && (
              <div className="w-full bg-[#f87171]/25 border border-[#f87171] rounded-[14px] p-3 text-[13px] text-white flex flex-col gap-2">
                <span className="font-medium leading-relaxed">
                  ⚠️ {errorMessage}
                </span>
              </div>
            )}

            <p className="text-[13px] text-[#FBFFF3]/90 leading-relaxed">
              Buat kata sandi baru untuk akun Anda. Gunakan minimal 8 karakter.
            </p>

            {/* Input Password Baru */}
            <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px] focus-within:border-white focus-within:bg-[#FBFFF340] transition-colors">
              <Image
                src="/icon-gembok.svg"
                alt="Icon Gembok"
                width={22}
                height={22}
                className="object-contain filter brightness-0 invert opacity-90 flex-shrink-0"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kata Sandi Baru (Min. 8 karakter)"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
                minLength={8}
              />
            </div>

            {/* Input Konfirmasi Password Baru */}
            <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px] focus-within:border-white focus-within:bg-[#FBFFF340] transition-colors">
              <Image
                src="/icon-gembok.svg"
                alt="Icon Gembok"
                width={22}
                height={22}
                className="object-contain filter brightness-0 invert opacity-90 flex-shrink-0"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi Kata Sandi Baru"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
                minLength={8}
              />
            </div>

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center gap-[8px] hover:bg-[#f3f7ea] active:scale-[0.99] transition-all cursor-pointer mt-1"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#3D4127] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-[18px] font-[700] text-[#3D4127]">
                  Simpan Kata Sandi Baru
                </span>
              )}
            </button>

            {/* Link Batal */}
            <div className="w-full text-center mt-1">
              <Link
                href="/login"
                className="text-[13px] text-[#FBFFF3]/80 hover:text-white transition-colors"
              >
                ← Batal dan Kembali ke Masuk
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
