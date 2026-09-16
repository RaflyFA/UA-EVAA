"use client";

interface LockedModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  stageName?: string;
  requiredStageName?: string;
  onAction?: () => void;
  actionText?: string;
}

export default function LockedModal({
  isOpen,
  title = "Tahap Masih Terkunci",
  message,
  stageName,
  requiredStageName,
  onAction,
  actionText = "Kembali ke Alur Modul",
}: LockedModalProps) {
  if (!isOpen) return null;

  // Teks pesan default jika tidak dispesifikasikan secara manual
  const displayMessage =
    message ||
    (stageName && requiredStageName
      ? `Tahap ${stageName} masih terkunci! Selesaikan tahap ${requiredStageName} terlebih dahulu untuk membuka materi ini.`
      : stageName
      ? `Tahap ${stageName} masih terkunci! Selesaikan tahap pembelajaran sebelumnya terlebih dahulu.`
      : "Tahap ini masih terkunci! Selesaikan tahap pembelajaran sebelumnya terlebih dahulu.");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2213]/65 backdrop-blur-[6px] transition-all duration-200 select-none animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[360px] bg-[#FBFFF3] border border-[#3D4127]/15 rounded-[28px] shadow-[0px_16px_36px_rgba(0,0,0,0.22)] p-6 sm:p-7 flex flex-col items-center text-center gap-4 transition-all animate-in zoom-in-95 duration-200">
        {/* Header Teks */}
        <div className="flex flex-col gap-1.5 w-full">
          
          <h2 className="text-[20px] font-bold text-[#3D4127] leading-tight mt-1">
            {title}
          </h2>
          <p className="text-[13px] font-[500] text-[#555A38] leading-relaxed mt-1">
            {displayMessage}
          </p>
        </div>

        {/* Tombol Tindakan */}
        <button
          type="button"
          onClick={onAction}
          className="w-full h-[48px] bg-[#3D4127] hover:bg-[#4E5433] active:scale-[0.98] text-[#FBFFF3] rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-1"
        >
          <span>{actionText}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
