import { NextRequest, NextResponse } from "next/server";

// Daftar domain yang diizinkan untuk diunduh (allowlist)
const ALLOWED_DOMAINS = [
  "storage.ua-evaa.id",
  "pub-fda94e64649c48b0841fa81b3af0d6b4.r2.dev", // fallback URL lama
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "berkas";

  if (!fileUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Validasi keamanan: pastikan URL hanya dari domain yang diizinkan
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return new NextResponse("URL tidak valid", { status: 400 });
  }

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return new NextResponse("Akses ke URL ini tidak diizinkan", { status: 403 });
  }

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return new NextResponse("Failed to fetch file", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Error in download route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
