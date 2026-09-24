"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

interface TopbarProps {
  onMenuClick: () => void;
  variant?: "dark" | "light"; // "dark" text for light bg, "light" text for dark bg
  className?: string;
}

export default function Topbar({
  onMenuClick,
  variant = "light",
  className = "",
}: TopbarProps) {
  const isDarkText = variant === "dark";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fixedTopbarNode = (
    <div
      className={`fixed top-0 left-0 right-0 z-40 flex justify-center w-full px-6 transition-all duration-200 ${
        isDarkText
          ? "py-2 shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border-b border-[#3D4127]/10"
          : isScrolled
          ? "bg-[#3D4127]/90 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-4"
      }`}
      style={{
        backgroundColor: isDarkText ? "#FBFFF3" : undefined,
      }}
    >
      <header
        className={`w-full flex justify-between items-center ${
          className || "max-w-[354px]"
        }`}
      >
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity cursor-pointer inline-block"
        >
          <h1
            className={`text-xl font-bold tracking-wider drop-shadow-sm ${
              isDarkText ? "text-[#3D4127]" : "text-[#FBFFF3]"
            }`}
          >
            UA-EVAA
          </h1>
        </Link>
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
    </div>
  );

  return (
    <>
      {mounted ? createPortal(fixedTopbarNode, document.body) : fixedTopbarNode}

      {/* Spacer to preserve layout flow and prevent content jump */}
      <div
        className={`w-full shrink-0 pointer-events-none ${
          isDarkText ? "h-[48px]" : "h-[52px]"
        } ${className || "max-w-[354px]"}`}
        aria-hidden="true"
      />
    </>
  );
}


