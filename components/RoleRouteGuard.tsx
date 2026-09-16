"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RoleRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const effectiveRole =
    profile?.role || (user?.user_metadata?.role as "guru" | "siswa" | undefined);

  useEffect(() => {
    if (loading) return;

    // 1. Otorisasi Akun Guru
    if (user && effectiveRole === "guru") {
      const isGuruPath = pathname.startsWith("/guru");
      const isAuthExempt = pathname === "/reset-password";

      // Guru DILARANG mengakses halaman siswa (Beranda, Alur, Modul, dll.)
      if (!isGuruPath && !isAuthExempt) {
        router.replace("/guru/manajemen-modul");
      }
    }

    // 2. Otorisasi Akun Siswa
    if (user && effectiveRole === "siswa") {
      // Siswa DILARANG mengakses halaman dashboard guru (/guru/*)
      if (pathname.startsWith("/guru")) {
        router.replace("/");
      }
    }
  }, [user, effectiveRole, loading, pathname, router]);

  // Cegah rendering / flashing halaman siswa saat akun guru sedang dialihkan
  if (
    !loading &&
    user &&
    effectiveRole === "guru" &&
    !pathname.startsWith("/guru") &&
    pathname !== "/reset-password"
  ) {
    return (
      <div className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3D4127]">
            Mengalihkan ke Dashboard Guru...
          </p>
        </div>
      </div>
    );
  }

  // Cegah rendering / flashing rute guru saat akun siswa sedang dialihkan
  if (
    !loading &&
    user &&
    effectiveRole === "siswa" &&
    pathname.startsWith("/guru")
  ) {
    return (
      <div className="min-h-screen w-full bg-[#EDF0E8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#636B2F]/20 border-t-[#636B2F] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3D4127]">
            Mengalihkan ke Halaman Siswa...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
