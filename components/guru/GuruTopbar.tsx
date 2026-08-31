"use client";

import Image from "next/image";

export default function GuruTopbar() {
  return (
    <header className="w-full h-[64px] bg-[#FBFFF3] px-6 py-4 flex items-center justify-between shadow-[0px_2px_2px_0px_#00000040] z-30 sticky top-0">
      {/* Brand / Title */}
      <div className="flex items-center gap-2">
        <span className="text-[20px] font-bold text-[#3D4127] tracking-tight">
          UA-EVAA
        </span>
        <span className="text-[16px] font-medium text-[#3D4127]/50">|</span>
        <span className="text-[14px] font-medium text-[#3D4127]/70">
          Modul IPA Digital
        </span>
      </div>

      {/* Action Icons & User Info */}
      <div className="flex items-center gap-5">
        {/* Bell / Notification Icon */}
        <button
          className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Notifications"
        >
          <Image
            src="/guru/bell.svg"
            alt="Notifikasi"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>

        {/* Theme / Dark mode toggle icon */}
        <button
          className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Theme Toggle"
        >
          <Image
            src="/guru/tema.svg"
            alt="Tema"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>

        {/* Fullscreen / Expand icon */}
        <button
          className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Expand"
        >
          <Image
            src="/guru/persegi.svg"
            alt="Expand"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 ml-1 cursor-pointer">
          <span className="text-[14px] font-semibold text-[#3D4127]">
            Nama Guru
          </span>
          <div className="w-8 h-8 rounded-full overflow-hidden relative border border-[#3D4127]/20">
            <Image
              src="/guru/profile.jpg"
              alt="Profil Guru"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
