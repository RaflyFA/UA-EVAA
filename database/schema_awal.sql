-- 1. PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama_lengkap text not null,
  role text not null check (role in ('guru','siswa')),
  kelas text,
  nomor_induk text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. KONTEN MODUL
create table konten_modul (
  id uuid primary key default gen_random_uuid(),
  tahap_niti text not null check (tahap_niti in ('harti','surti','bukti','bakti','sajati')),
  tipe_konten text not null check (tipe_konten in ('bacaan','video')),
  judul text not null,
  deskripsi text,
  url_youtube text,
  urutan integer not null default 0,
  dibuat_oleh uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. PROGRESS SISWA
create table progress_siswa (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references profiles(id),
  tahap_niti text not null check (tahap_niti in ('harti','surti','bukti','bakti','sajati')),
  status text not null default 'terkunci'
    check (status in ('terkunci','tersedia','sedang_dikerjakan','menunggu_review','perlu_revisi','disetujui')),
  tanggal_mulai timestamptz,
  tanggal_selesai timestamptz,
  updated_at timestamptz not null default now(),
  unique (siswa_id, tahap_niti)
);

-- 4. JAWABAN NITI SURTI
create table jawaban_niti_surti (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null unique references profiles(id),
  masalah_ditemukan text not null,
  alternatif_solusi text not null,
  validasi_kebenaran boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. SUBMISSION AKSI (Niti Bukti & Niti Bakti)
create table submission_aksi (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references profiles(id),
  tahap_niti text not null check (tahap_niti in ('bukti','bakti')),
  kategori_aksi text check (kategori_aksi in ('kampanye_lingkungan','daur_ulang','konservasi')),
  file_url text not null,
  nama_file text not null,
  status text not null default 'menunggu_review'
    check (status in ('menunggu_review','disetujui','perlu_revisi')),
  catatan_revisi text,
  direview_oleh uuid references profiles(id),
  tanggal_submit timestamptz not null default now(),
  tanggal_review timestamptz
);

-- 6. NILAI
create table nilai (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references submission_aksi(id),
  siswa_id uuid not null references profiles(id),
  nilai_angka numeric(5,2),
  catatan text,
  diberikan_oleh uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- 7. ABSENSI
create table absensi (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references profiles(id),
  tanggal date not null,
  status text not null check (status in ('hadir','izin','sakit','alpa')),
  dicatat_oleh uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  unique (siswa_id, tanggal)
);

-- 8. SERTIFIKAT
create table sertifikat (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null unique references profiles(id),
  nomor_sertifikat text not null unique,
  url_file text,
  tanggal_terbit timestamptz not null default now()
);
