-- ==============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) SUPABASE UNTUK UA-EVAA
-- Jalankan file ini di Supabase SQL Editor jika fitur RLS diaktifkan
-- ==============================================================================

-- 1. AKTIFKAN RLS PADA TABEL UTAMA
alter table if exists public.profiles enable row level security;
alter table if exists public.progress_siswa enable row level security;
alter table if exists public.submission_aksi enable row level security;
alter table if exists public.jawaban_niti_surti enable row level security;

-- Hapus policy lama jika sudah pernah dibuat sebelumnya agar tidak duplikat
drop policy if exists "Semua user terautentikasi bisa membaca profiles" on public.profiles;
drop policy if exists "User bisa update profil sendiri" on public.profiles;
drop policy if exists "Siswa bisa membaca progress miliknya sendiri" on public.progress_siswa;
drop policy if exists "Guru bisa membaca semua progress siswa" on public.progress_siswa;
drop policy if exists "Siswa bisa mengupdate progress miliknya sendiri" on public.progress_siswa;
drop policy if exists "Siswa bisa menambah progress miliknya" on public.progress_siswa;
drop policy if exists "Siswa bisa mengelola submission miliknya" on public.submission_aksi;
drop policy if exists "Guru bisa membaca dan mereview semua submission" on public.submission_aksi;

-- ==============================================================================
-- POLICY UNTUK TABEL PROFILES
-- ==============================================================================
-- Siapa pun yang login dapat membaca data profil (dibutuhkan untuk nama, role, foto)
create policy "Semua user terautentikasi bisa membaca profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- User hanya bisa mengedit profil miliknya sendiri
create policy "User bisa update profil sendiri"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ==============================================================================
-- POLICY UNTUK TABEL PROGRESS_SISWA
-- ==============================================================================
-- Siswa membaca progress miliknya sendiri
create policy "Siswa bisa membaca progress miliknya sendiri"
  on public.progress_siswa for select
  to authenticated
  using (siswa_id = auth.uid());

-- Guru bisa membaca progress semua siswa untuk monitoring
create policy "Guru bisa membaca semua progress siswa"
  on public.progress_siswa for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'guru'
    )
  );

-- Siswa bisa mengupdate progress miliknya sendiri (misal saat menyelesaikan bab)
create policy "Siswa bisa mengupdate progress miliknya sendiri"
  on public.progress_siswa for update
  to authenticated
  using (siswa_id = auth.uid());

-- Siswa bisa insert baris progress jika belum ada (fallback auto-seed)
create policy "Siswa bisa menambah progress miliknya"
  on public.progress_siswa for insert
  to authenticated
  with check (siswa_id = auth.uid());

-- ==============================================================================
-- POLICY UNTUK TABEL SUBMISSION_AKSI & JAWABAN
-- ==============================================================================
create policy "Siswa bisa mengelola submission miliknya"
  on public.submission_aksi for all
  to authenticated
  using (siswa_id = auth.uid())
  with check (siswa_id = auth.uid());

create policy "Guru bisa membaca dan mereview semua submission"
  on public.submission_aksi for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'guru'
    )
  );

create policy "Siswa bisa mengelola jawaban surti miliknya"
  on public.jawaban_niti_surti for all
  to authenticated
  using (siswa_id = auth.uid())
  with check (siswa_id = auth.uid());

-- ==============================================================================
-- POLICY UNTUK TABEL KONTEN_MODUL
-- ==============================================================================
-- Aktifkan RLS pada konten_modul jika belum aktif
alter table if exists public.konten_modul enable row level security;

drop policy if exists "Semua user bisa membaca konten modul" on public.konten_modul;
drop policy if exists "Guru bisa mengelola konten modul" on public.konten_modul;

-- Semua user (siswa & guru) bisa membaca konten modul
create policy "Semua user bisa membaca konten modul"
  on public.konten_modul for select
  to authenticated
  using (true);

-- Hanya guru yang bisa menambah, mengubah, dan menghapus konten modul
create policy "Guru bisa mengelola konten modul"
  on public.konten_modul for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'guru'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'guru'
    )
  );

