"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GuruLoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#EDF0E8] text-[#3D4127]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#3D4127] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Mengalihkan ke halaman Masuk terpusat...</p>
      </div>
    </div>
  );
}
