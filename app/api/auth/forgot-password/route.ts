import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Alamat email wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Cari user di Supabase Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      console.error("Gagal memeriksa data pengguna:", listError);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat memproses permintaan." },
        { status: 500 }
      );
    }

    const foundUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    // Jika pengguna tidak ditemukan, beri respon ambigu standar keamanan
    if (!foundUser) {
      return NextResponse.json({
        success: true,
        isSiswa: false,
        message:
          "Jika email Anda terdaftar sebagai Guru/Pengajar, tautan pemulihan kata sandi telah dikirimkan.",
      });
    }

    // 2. Periksa peran (role) pengguna
    let role = foundUser.user_metadata?.role;
    if (!role) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", foundUser.id)
        .maybeSingle();
      role = profile?.role;
    }

    // 3. JIKA SISWA: TOLAK DAN INSTRUKSIKAN UNTUK HUBUNGI GURU
    if (role === "siswa") {
      return NextResponse.json({
        success: false,
        isSiswa: true,
        message:
          "Akun Anda terdaftar sebagai Siswa. Untuk alasan keamanan, siswa tidak dapat mereset kata sandi secara mandiri. Silakan hubungi Guru Anda untuk mendapatkan kata sandi baru.",
      });
    }

    // 4. JIKA GURU: KIRIMKAN TAUTAN PEMULIHAN SANDI VIA EMAIL
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: `${origin}/reset-password`,
      }
    );

    if (resetError) {
      console.error("Gagal mengirim email reset:", resetError);
      return NextResponse.json(
        { error: `Gagal mengirim email pemulihan: ${resetError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isSiswa: false,
      message:
        "Tautan untuk mengatur ulang kata sandi telah berhasil dikirimkan ke email Anda. Silakan periksa kotak masuk atau spam.",
    });
  } catch (err: unknown) {
    const errorObj = err as Error;
    console.error("Error pada API forgot-password:", errorObj);
    return NextResponse.json(
      { error: errorObj?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
