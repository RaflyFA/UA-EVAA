import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Helper untuk memverifikasi apakah token milik pengguna dengan role "guru"
async function verifyGuru(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { error: "Token otentikasi tidak ditemukan.", status: 401, user: null };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { error: "Sesi tidak valid atau telah kedaluwarsa.", status: 401, user: null };
  }

  // Verifikasi role dari metadata atau dari tabel profiles
  const roleFromMeta = user.user_metadata?.role;
  if (roleFromMeta === "guru") {
    return { error: null, status: 200, user };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "guru") {
    return {
      error: "Akses ditolak. Tindakan ini hanya dapat dilakukan oleh Guru.",
      status: 403,
      user: null,
    };
  }

  return { error: null, status: 200, user };
}

// 1. DELETE: Menghapus akun siswa
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await verifyGuru(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { siswa_id } = await req.json();

    if (!siswa_id || typeof siswa_id !== "string") {
      return NextResponse.json({ error: "Parameter siswa_id wajib diisi." }, { status: 400 });
    }

    // Pastikan target adalah siswa, bukan guru/admin lain
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, nama_lengkap, role")
      .eq("id", siswa_id)
      .maybeSingle();

    if (targetProfile && targetProfile.role !== "siswa") {
      return NextResponse.json(
        { error: "Hanya akun dengan peran Siswa yang dapat dihapus." },
        { status: 400 }
      );
    }

    // Hapus dari Supabase Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(siswa_id);
    if (deleteAuthError) {
      console.error("Gagal menghapus user dari Supabase Auth:", deleteAuthError);
      return NextResponse.json(
        { error: `Gagal menghapus akun: ${deleteAuthError.message}` },
        { status: 500 }
      );
    }

    // Pastikan profiles dan data terkait juga terhapus jika cascade belum aktif di beberapa relasi
    await supabaseAdmin.from("progress_siswa").delete().eq("siswa_id", siswa_id);
    await supabaseAdmin.from("submission_aksi").delete().eq("siswa_id", siswa_id);
    await supabaseAdmin.from("jawaban_niti_surti").delete().eq("siswa_id", siswa_id);
    await supabaseAdmin.from("sertifikat").delete().eq("siswa_id", siswa_id);
    await supabaseAdmin.from("profiles").delete().eq("id", siswa_id);

    return NextResponse.json({
      success: true,
      message: `Akun siswa ${targetProfile?.nama_lengkap || ""} berhasil dihapus secara permanen.`,
    });
  } catch (err: unknown) {
    const errorObj = err as Error;
    console.error("Error pada API DELETE siswa:", errorObj);
    return NextResponse.json(
      { error: errorObj?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// 2. POST: Mereset kata sandi akun siswa
export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyGuru(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { siswa_id, new_password } = await req.json();

    if (!siswa_id || !new_password) {
      return NextResponse.json(
        { error: "siswa_id dan new_password wajib diisi." },
        { status: 400 }
      );
    }

    if (typeof new_password !== "string" || new_password.trim().length < 8) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    // Pastikan target adalah siswa
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, nama_lengkap, role")
      .eq("id", siswa_id)
      .maybeSingle();

    if (targetProfile && targetProfile.role !== "siswa") {
      return NextResponse.json(
        { error: "Hanya akun Siswa yang dapat diatur ulang kata sandinya oleh Guru." },
        { status: 400 }
      );
    }

    // Update kata sandi lewat Supabase Auth Admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(siswa_id, {
      password: new_password.trim(),
    });

    if (updateError) {
      console.error("Gagal mereset kata sandi user:", updateError);
      return NextResponse.json(
        { error: `Gagal memperbarui sandi: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Kata sandi untuk ${targetProfile?.nama_lengkap || "siswa"} berhasil diatur ulang.`,
    });
  } catch (err: unknown) {
    const errorObj = err as Error;
    console.error("Error pada API POST reset password siswa:", errorObj);
    return NextResponse.json(
      { error: errorObj?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
