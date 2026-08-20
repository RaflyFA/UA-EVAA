"use client";

import Image from "next/image";

interface TopbarProps {
  onMenuClick: () => void;
  variant?: "dark" | "light"; // "dark" text for light bg, "light" text for dark bg
}

export default function Topbar({ onMenuClick, variant = "light" }: TopbarProps) {
  const isDarkText = variant === "dark";

  return (
    <header className="w-full max-w-[354px] flex justify-between items-center z-10">
      <h1
        className={`text-xl font-bold tracking-wider drop-shadow-sm ${
          isDarkText ? "text-[#3D4127]" : "text-[#FBFFF3]"
        }`}
      >
        UA-EVAA
      </h1>
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
        aria-label="Open Sidebar Menu"
      >
        {isDarkText ? (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15 16.5V19.5H33V16.5H15ZM15 25.5V22.5H33V25.5H15ZM15 31.5V28.5H33V31.5H15Z"
              fill="#3D4127"
            />
          </svg>
        ) : (
          <Image
            src="/icon sidebar.svg"
            alt="Sidebar Menu"
            width={52}
            height={52}
          />
        )}
      </button>
    </header>
  );
}
