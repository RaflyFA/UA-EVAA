"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  // State Login
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  // State Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotSent, setIsForgotSent] = useState(false);

  // State Register
  const [namaLengkap, setNamaLengkap] = useState("");
  const [registerRole, setRegisterRole] = useState<"siswa" | "guru">("siswa");
  const [kelas, setKelas] = useState("VII-A");
  const [nomorInduk, setNomorInduk] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cek jika diarahkan dari reset password sukses
  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessMessage(
        "Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda."
      );
    }
  }, [searchParams]);

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

  // 3. Handle Submit Lupa Password (Kirim Link Reset via Email)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "http://localhost:3000";

      await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${origin}/reset-password`,
      });
    } catch (err: unknown) {
      console.error("Error saat meminta reset password:", err);
    } finally {
      // Selalu tampilkan pesan ambigu untuk melindungi privasi email pengguna
      setIsForgotSent(true);
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
          style={{
            filter: "contrast(1.38) brightness(0.82) saturate(1.08) url(#sharpen)",
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
            {mode === "login"
              ? "Masuk untuk mengakses materi dan tugas"
              : mode === "register"
              ? "Daftar akun baru Siswa atau Guru"
              : "Pemulihan Kata Sandi Akun"}
          </p>
        </div>

        {/* Tab Switch: Masuk / Daftar (hanya tampil saat bukan mode forgot) */}
        {mode !== "forgot" ? (
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
        ) : null}

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

        {/* 1. FORM LOGIN */}
        {mode === "login" && (
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
                placeholder="Email atau Username"
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

            {/* Link Lupa Kata Sandi */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setIsForgotSent(false);
                  if (emailOrUsername.includes("@")) {
                    setForgotEmail(emailOrUsername);
                  }
                }}
                className="text-[13px] font-[500] text-[#FBFFF3]/80 hover:text-white transition-colors underline underline-offset-2 cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
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
        )}

        {/* 2. FORM REGISTER */}
        {mode === "register" && (
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
            <div className="w-full flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-[#FBFFF3]/90 px-1 flex items-center justify-between">
                <span>Daftar sebagai:</span>
                <span className="text-[11px] font-medium text-[#FBFFF3]/70">
                  {registerRole === "siswa"
                    ? "Akses materi & tugas"
                    : "Akses modul & penilaian"}
                </span>
              </span>

              <div className="grid grid-cols-2 gap-2.5 w-full">
                {/* Opsi Siswa */}
                <button
                  type="button"
                  onClick={() => setRegisterRole("siswa")}
                  className={`relative py-2.5 px-3 rounded-[16px] flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                    registerRole === "siswa"
                      ? "bg-[#FBFFF3] text-[#3D4127] font-bold shadow-md ring-2 ring-[#FBFFF3]"
                      : "bg-[#FBFFF3]/15 hover:bg-[#FBFFF3]/25 text-[#FBFFF3] font-medium border border-[#FBFFF3]/30"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      registerRole === "siswa"
                        ? "bg-[#3D4127]/10 text-[#3D4127]"
                        : "bg-white/10 text-[#FBFFF3]"
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[14px] leading-tight">Siswa</span>
                    <span
                      className={`text-[10px] leading-tight mt-0.5 ${
                        registerRole === "siswa"
                          ? "text-[#3D4127]/70 font-medium"
                          : "text-[#FBFFF3]/70"
                      }`}
                    >
                      Murid
                    </span>
                  </div>
                  {registerRole === "siswa" && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#5B6628] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                </button>

                {/* Opsi Guru */}
                <button
                  type="button"
                  onClick={() => setRegisterRole("guru")}
                  className={`relative py-2.5 px-3 rounded-[16px] flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                    registerRole === "guru"
                      ? "bg-[#FBFFF3] text-[#3D4127] font-bold shadow-md ring-2 ring-[#FBFFF3]"
                      : "bg-[#FBFFF3]/15 hover:bg-[#FBFFF3]/25 text-[#FBFFF3] font-medium border border-[#FBFFF3]/30"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      registerRole === "guru"
                        ? "bg-[#3D4127]/10 text-[#3D4127]"
                        : "bg-white/10 text-[#FBFFF3]"
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[14px] leading-tight">Guru</span>
                    <span
                      className={`text-[10px] leading-tight mt-0.5 ${
                        registerRole === "guru"
                          ? "text-[#3D4127]/70 font-medium"
                          : "text-[#FBFFF3]/70"
                      }`}
                    >
                      Pengajar
                    </span>
                  </div>
                  {registerRole === "guru" && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#5B6628] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                </button>
              </div>
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

        {/* 3. FORM LUPA KATA SANDI */}
        {mode === "forgot" && (
          <div className="w-full flex flex-col gap-[14px]">
            {isForgotSent ? (
              <div className="w-full flex flex-col items-center text-center gap-4 py-2">
                <div className="w-14 h-14 rounded-full bg-[#4ade80]/20 border border-[#4ade80] flex items-center justify-center text-2xl">
                  ✉️
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-bold text-[#FBFFF3]">
                    Tautan Pemulihan Dikirim
                  </h3>
                  <p className="text-[13px] text-[#FBFFF3]/90 leading-relaxed">
                    Jika email Anda terdaftar, kami telah mengirimkan tautan
                    untuk mengatur ulang kata sandi. Silakan periksa kotak masuk
                    atau folder spam email Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setIsForgotSent(false);
                    setErrorMessage(null);
                  }}
                  className="w-full h-[52px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center font-[700] text-[#3D4127] text-[16px] hover:bg-[#f3f7ea] active:scale-[0.99] transition-all cursor-pointer mt-2"
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleForgotPassword}
                className="w-full flex flex-col gap-[14px]"
              >
                <p className="text-[13px] text-[#FBFFF3]/90 leading-relaxed">
                  Masukkan alamat email yang terdaftar pada akun Anda. Kami akan
                  mengirimkan tautan untuk mengatur ulang kata sandi.
                </p>

                {/* Input Email */}
                <div className="w-full h-[52px] bg-[#FBFFF330] border border-[#FBFFF340] rounded-[16px] px-[16px] flex items-center gap-[14px] focus-within:border-white focus-within:bg-[#FBFFF340] transition-colors">
                  <Image
                    src="/icon-profile.png"
                    alt="Icon Email"
                    width={22}
                    height={22}
                    className="object-contain filter brightness-0 invert flex-shrink-0"
                  />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Masukkan email terdaftar"
                    className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/50 text-[15px] font-[500] focus:outline-none"
                    required
                  />
                </div>

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[54px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center gap-[8px] hover:bg-[#f3f7ea] active:scale-[0.99] transition-all cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-[#3D4127] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-[18px] font-[700] text-[#3D4127]">
                      Kirim Link Reset
                    </span>
                  )}
                </button>

                <div className="w-full text-center mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage(null);
                    }}
                    className="text-[13px] text-[#FBFFF3]/80 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Batal dan Kembali ke Masuk
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Link Kembali ke Beranda */}
        <div className="w-full text-center">
          <Link
            href="/"
            className="text-[13px] text-[#FBFFF3]/80 hover:text-white transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#3D4127] text-white">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
