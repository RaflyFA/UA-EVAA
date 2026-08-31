"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GuruLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi login dummy singkat 1 detik lalu redirect ke dashboard guru
    setTimeout(() => {
      setIsLoading(false);
      router.push("/guru/manajemen-modul");
    }, 1000);
  };

  return (
    <main className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden font-sans select-none">
      {/* SVG Filter untuk efek penajaman (Sharpening) */}
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

      {/* Background Image Fullscreen dengan Efek Sama seperti Beranda */}
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
        {/* Background Overlay dengan warna hijau hutan sejuk */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3D4127]/30 via-[#3D4127]/10 to-[#3D4127]/60 -z-10" />
      </div>

      {/* Box Login Glassmorphism di Tengah Layar */}
      <div className="relative z-10 w-full max-w-[480px] min-h-[398px] bg-[#D9D9D940] border border-[#FBFFF340] backdrop-blur-[10px] rounded-[24px] shadow-[0px_8px_16px_0px_#00000040] p-[32px] flex flex-col gap-[24px] items-center text-[#FBFFF3]">
        {/* Header Title & Subtitle */}
        <div className="flex flex-col gap-1 items-center text-center w-full">
          <h1 className="w-[201px] h-[38px] text-[32px] font-[700] leading-[38px] tracking-[0%] text-center text-[#FBFFF3]">
            UA-EVAA
          </h1>
          <p className="text-[16px] font-[500] leading-[24px] text-center text-[#FBFFF3]">
            Masuk dengan akun anda.
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
          {/* Input Nama Pengguna atau Email */}
          <div className="w-full h-[56px] bg-[#FBFFF340] border border-[#FBFFF340] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] px-[16px] py-[12px] flex items-center gap-[16px]">
            <Image
              src="/icon-profile.png"
              alt="Icon Profile"
              width={24}
              height={24}
              className="object-contain flex-shrink-0 filter brightness-0 invert"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nama Pengguna atau Email"
              className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/40 text-[16px] font-[500] focus:outline-none"
              required
            />
          </div>

          {/* Input Kata Sandi */}
          <div className="w-full h-[56px] bg-[#FBFFF340] border border-[#FBFFF340] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] px-[16px] py-[12px] flex items-center gap-[16px]">
            <Image
              src="/icon-gembok.svg"
              alt="Icon Gembok"
              width={24}
              height={24}
              className="object-contain flex-shrink-0 filter brightness-0 invert opacity-90"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata Sandi"
              className="w-full bg-transparent text-[#FBFFF3] placeholder-[#FBFFF3]/40 text-[16px] font-[500] focus:outline-none"
              required
            />
          </div>

          {/* Link Lupa Kata Sandi */}
          <div className="w-full flex justify-end -mt-1">
            <Link
              href="#"
              className="text-[14px] font-[500] text-[#FBFFF3] underline hover:opacity-80 transition-opacity"
            >
              Lupa Kata Sandi?
            </Link>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[56px] bg-[#FBFFF3] rounded-[16px] shadow-[0px_4px_4px_0px_#0000001A] p-[12px] flex items-center justify-center gap-[6px] hover:bg-[#f3f7ea] active:scale-[0.99] transition-all cursor-pointer mt-1"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-[#3D4127] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-[20px] font-[700] leading-[24px] text-[#3D4127]">
                  Masuk
                </span>
                <Image
                  src="/panah hitam.png"
                  alt="Panah Masuk"
                  width={25}
                  height={20}
                  className="object-contain"
                />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
