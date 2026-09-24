"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  isAlert?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi Tindakan",
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "danger",
  isLoading = false,
  isAlert = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2213]/60 backdrop-blur-[4px] transition-all duration-200 select-none animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[340px] bg-[#FBFFF3] border border-[#3D4127]/15 rounded-[24px] shadow-[0px_16px_36px_rgba(0,0,0,0.22)] p-6 flex flex-col items-center text-center gap-4 transition-all animate-in zoom-in-95 duration-200">
        {/* Teks Judul & Pesan */}
        <div className="flex flex-col gap-1.5 w-full">
          <h2 className="text-[18px] font-bold text-[#3D4127] leading-tight">
            {title}
          </h2>
          <p className="text-[13px] font-[500] text-[#555A38] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Tombol Aksi */}
        {isAlert ? (
          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-[44px] bg-[#3D4127] hover:bg-[#4E5433] active:scale-[0.98] text-[#FBFFF3] rounded-[14px] font-semibold text-[14px] flex items-center justify-center transition-all cursor-pointer shadow-sm mt-1"
          >
            {confirmText || "Mengerti"}
          </button>
        ) : (
          <div className="flex items-center gap-2.5 w-full mt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-[44px] bg-[#E2E8D5] hover:bg-[#D5DDC5] active:scale-[0.98] text-[#3D4127] rounded-[14px] font-semibold text-[14px] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-[44px] rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] text-white disabled:opacity-60 ${
                type === "danger"
                  ? "bg-[#B91C1C] hover:bg-[#991B1B] shadow-[0px_4px_12px_rgba(185,28,28,0.25)]"
                  : "bg-[#3D4127] hover:bg-[#4E5433]"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : null}
              <span>{confirmText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
