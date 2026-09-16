"use client";

import React, { useEffect, useState } from "react";

interface ToastNotificationProps {
  message: string;
  type?: "success" | "error" | "warning";
  duration?: number; // default 5000ms (5 detik)
  onClose: () => void;
}

export default function ToastNotification({
  message,
  type = "success",
  duration = 5000,
  onClose,
}: ToastNotificationProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 250);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleManualClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      role="alert"
      className={`fixed top-6 left-1/2 z-[9999] w-[90%] max-w-[650px] rounded-[14px] px-5 py-3.5 text-[14px] font-semibold flex items-center justify-between border shadow-[0px_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-md transition-all duration-200 ${
        isClosing
          ? "opacity-0 -translate-y-3 pointer-events-none"
          : "animate-toast-in"
      } ${
        type === "success"
          ? "bg-[#EAF0DE] border-[#636B2F] text-[#3D4127]"
          : type === "warning"
          ? "bg-[#FEF9C3] border-[#ca8a04] text-[#854d0e]"
          : "bg-[#FEECEB] border-[#dc2626] text-[#b91c1c]"
      }`}
      style={{
        transform: isClosing ? "translate(-50%, -12px)" : undefined,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[16px] font-bold flex items-center justify-center">
          {type === "success" ? "✓" : type === "warning" ? "⚠️" : "✕"}
        </span>
        <span className="leading-snug">{message}</span>
      </div>
      <button
        type="button"
        onClick={handleManualClose}
        className="opacity-60 hover:opacity-100 ml-4 font-bold text-[16px] cursor-pointer p-1 transition-opacity"
        aria-label="Tutup notifikasi"
      >
        ✕
      </button>
    </div>
  );
}
