"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");

  // State Login
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  // State Register
  const [namaLengkap, setNamaLengkap] = useState("");
  const [registerRole, setRegisterRole] = useState<"siswa" | "guru">("siswa");
  const [kelas, setKelas] = useState("VII-A");
  const [nomorInduk, setNomorInduk] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper untuk format email jika user mengetik username
  const formatEmail = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    return trimmed.includes("@") ? trimmed : `${trimmed}@sekolah.id`;
  };

  // 1. Handle Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = formatEmail(emailOrUsername);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Email belum dikonfirmasi di Supabase. Mohon nonaktifkan opsi 'Confirm email' di Supabase Dashboard (Authentication > Providers > Email)."
          );
        } else if (error.message === "Invalid login credentials") {
          setErrorMessage("Email/Nama Pengguna atau Kata Sandi salah.");
        } else {
          setErrorMessage(`Gagal masuk: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        // Ambil data profile untuk tahu role
        const { data: profData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (profData?.role === "guru") {
          router.push("/guru/manajemen-modul");
        } else {
          router.push("/");
        }
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj?.message || "Terjadi kendala koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Submit Register (Pembuatan Akun Baru)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = formatEmail(emailOrUsername);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama_lengkap: namaLengkap,
            role: registerRole,
            kelas: registerRole === "siswa" ? kelas : null,
            nomor_induk: nomorInduk || null,
          },
        },
      });

      if (error) {
        setErrorMessage(`Gagal mendaftar: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Jika auto-confirm aktif di Supabase
        setSuccessMessage("Pendaftaran berhasil! Mengalihkan...");
        setTimeout(() => {
          if (registerRole === "guru") {
            router.push("/guru/manajemen-modul");
          } else {
            router.push("/");
          }
        }, 1200);
      } else {
        // Jika perlu konfirmasi email
        setSuccessMessage(
          "Akun berhasil dibuat! Silakan coba masuk. (Jika muncul pesan 'Email not confirmed', nonaktifkan 'Confirm email' di Supabase Auth)."
        );
        setMode("login");
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj?.message || "Terjadi kendala pendaftaran.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden font-sans select-none py-10 px-4">
      {/* SVG Filter untuk penajaman */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="sharpen">
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
          style={{ filter: "contrast(1.38) brightness(0.82) saturate(1.08) url(#sharpen)" }}
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
            {mode === "login"
              ? "Masuk untuk mengakses materi dan tugas"
              : "Daftar akun baru Siswa atau Guru"}
          </p>
        </div>

        {/* Tab Switch: Masuk / Daftar */}
        <div className="w-full flex bg-[#FBFFF325] rounded-[16px] p-1 border border-[#FBFFF320]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-[12px] text-[14px] font-semibold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#FBFFF3] text-[#3D4127] shadow-sm"
                : "text-[#FBFFF3] hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-[12px] text-[14px] font-semibold transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#FBFFF3] text-[#3D4127] shadow-sm"
                : "text-[#FBFFF3] hover:text-white"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Notifikasi Alert Error */}
        {errorMessage && (
          <div className="w-full bg-[#f87171]/25 border border-[#f87171] rounded-[14px] p-3 text-[13px] text-white flex flex-col gap-2">
            <span className="font-medium leading-relaxed">⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Notifikasi Alert Success */}
        {successMessage && (
          <div className="w-full bg-[#4ade80]/25 border border-[#4ade80] rounded-[14px] p-3 text-[13px] text-[#FBFFF3] font-medium">
            ✅ {successMessage}
          </div>
        )}

        {/* FORM LOGIN */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-[14px]">
            {/* Input Email / Username */}
            <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px] focus-within:border-white focus-within:bg-[#FBFFF340] transition-colors">
              <Image
                src="/icon-profile.png"
                alt="Icon Profile"
                width={22}
                height={22}
                className="object-contain filter brightness-0 invert flex-shrink-0"
              />
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Email atau Username (cth: siswa / guru)"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
              />
            </div>

            {/* Input Password */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
              />
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center gap-[8px] hover:bg-[#f3f7ea] active:scale-[0.99] transition-all cursor-pointer mt-1"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#3D4127] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-[18px] font-[700] text-[#3D4127]">
                    Masuk
                  </span>
                  <Image
                    src="/panah hitam.png"
                    alt="Panah Masuk"
                    width={22}
                    height={18}
                    className="object-contain"
                  />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORM REGISTER */
          <form onSubmit={handleRegister} className="w-full flex flex-col gap-[14px]">
            {/* Input Nama Lengkap */}
            <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px]">
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="w-full flex items-center gap-3 px-1">
              <span className="text-[14px] font-semibold">Daftar sebagai:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[14px]">
                <input
                  type="radio"
                  name="role"
                  value="siswa"
                  checked={registerRole === "siswa"}
                  onChange={() => setRegisterRole("siswa")}
                  className="accent-[#FBFFF3]"
                />
                Siswa
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[14px]">
                <input
                  type="radio"
                  name="role"
                  value="guru"
                  checked={registerRole === "guru"}
                  onChange={() => setRegisterRole("guru")}
                  className="accent-[#FBFFF3]"
                />
                Guru
              </label>
            </div>

            {/* Input Email / Username */}
            <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px]">
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Email (cth: ahmad@sekolah.id)"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
              />
            </div>

            {/* Detail Tambahan: Kelas & NISN untuk Siswa, NIP untuk Guru */}
            <div className="w-full flex gap-3">
              {registerRole === "siswa" && (
                <div className="w-1/3 h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[12px] flex items-center">
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Kelas"
                    className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[14px] font-[500] focus:outline-none"
                  />
                </div>
              )}
              <div className="flex-1 h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center">
                <input
                  type="text"
                  value={nomorInduk}
                  onChange={(e) => setNomorInduk(e.target.value)}
                  placeholder={registerRole === "siswa" ? "NISN / No. Induk" : "NIP"}
                  className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[14px] font-[500] focus:outline-none"
                />
              </div>
            </div>

            {/* Input Kata Sandi */}
            <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px]">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi Minimal 6 Karakter"
                className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                required
                minLength={6}
              />
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center gap-[8px] hover:bg-[#f3f7ea] active:scale-[0.99] transition-all cursor-pointer mt-1"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#3D4127] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-[18px] font-[700] text-[#3D4127]">
                  Daftarkan Akun
                </span>
              )}
            </button>
          </form>
        )}

        {/* Link Kembali ke Beranda */}
        <div className="w-full text-center">
          <Link
            href="/"
            className="text-[13px] text-[#FBFFF3]/80 hover:text-white underline transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
