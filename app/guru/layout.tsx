"use client";

import { usePathname } from "next/navigation";
import GuruTopbar from "@/components/guru/GuruTopbar";
import GuruSidebar from "@/components/guru/GuruSidebar";

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Jangan tampilkan Topbar & Sidebar di halaman Login
  if (pathname === "/guru/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-[#EDF0E8] flex flex-col font-sans">
      {/* Topbar Guru (Fixed top) */}
      <GuruTopbar />

      {/* Main Container Layout (Sidebar + Content) */}
      <div className="flex-1 w-full flex gap-[12px] p-[12px] max-w-[1512px] mx-auto">
        {/* Sidebar Guru */}
        <GuruSidebar />

        {/* Dynamic Page Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
