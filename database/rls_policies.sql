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

-- Guru bisa mengupdate progress siswa (diperlukan saat menyetujui/menolak tugas dan membuka bab selanjutnya)
create policy "Guru bisa mengupdate progress siswa"
  on public.progress_siswa for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'guru'
    )
  );


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

-- Perbarui check constraint tipe_konten jika masih terbatas bacaan/video
alter table if exists public.konten_modul drop constraint if exists konten_modul_tipe_konten_check;
alter table if exists public.konten_modul add constraint konten_modul_tipe_konten_check
  check (tipe_konten in ('bacaan','video','instruksi','panduan_tugas','ucapan_selamat'));

-- ==============================================================================
-- POLICY UNTUK TABEL ABSENSI
-- ==============================================================================
alter table if exists public.absensi enable row level security;

drop policy if exists "Siswa bisa membaca absensi miliknya" on public.absensi;
drop policy if exists "Guru bisa mengelola semua absensi" on public.absensi;

-- Siswa hanya bisa membaca riwayat absensi miliknya sendiri
create policy "Siswa bisa membaca absensi miliknya"
  on public.absensi for select
  to authenticated
  using (siswa_id = auth.uid());

-- Guru bisa mengelola semua data absensi (membaca, mencatat, mengedit, menghapus)
create policy "Guru bisa mengelola semua absensi"
  on public.absensi for all
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

-- ==============================================================================
-- POLICY UNTUK TABEL NILAI
-- ==============================================================================
alter table if exists public.nilai enable row level security;

drop policy if exists "Siswa bisa membaca nilai miliknya" on public.nilai;
drop policy if exists "Guru bisa mengelola semua nilai" on public.nilai;

-- Siswa hanya bisa melihat nilai miliknya sendiri
create policy "Siswa bisa membaca nilai miliknya"
  on public.nilai for select
  to authenticated
  using (siswa_id = auth.uid());

-- Guru bisa mengelola semua nilai (memberi nilai, mengubah nilai, menghapus nilai)
create policy "Guru bisa mengelola semua nilai"
  on public.nilai for all
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

-- ==============================================================================
-- POLICY UNTUK TABEL SERTIFIKAT
-- ==============================================================================
alter table if exists public.sertifikat enable row level security;

drop policy if exists "Siswa bisa membaca sertifikat miliknya" on public.sertifikat;
drop policy if exists "Guru bisa mengelola semua sertifikat" on public.sertifikat;

-- Siswa hanya bisa melihat sertifikat miliknya sendiri
create policy "Siswa bisa membaca sertifikat miliknya"
  on public.sertifikat for select
  to authenticated
  using (siswa_id = auth.uid());

-- Guru bisa mengelola semua sertifikat siswa (menerbitkan, membaca, mengedit, menghapus)
create policy "Guru bisa mengelola semua sertifikat"
  on public.sertifikat for all
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

-- ==============================================================================
-- POLICY UNTUK STORAGE BUCKET 'sertifikat'
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('sertifikat', 'sertifikat', true)
on conflict (id) do update set public = true;

drop policy if exists "Siapa saja bisa melihat sertifikat publik" on storage.objects;
drop policy if exists "Guru dan user terautentikasi bisa upload sertifikat" on storage.objects;
drop policy if exists "Guru dan user terautentikasi bisa update sertifikat" on storage.objects;
drop policy if exists "Guru dan user terautentikasi bisa delete sertifikat" on storage.objects;

create policy "Siapa saja bisa melihat sertifikat publik"
  on storage.objects for select
  using (bucket_id = 'sertifikat');

create policy "Guru dan user terautentikasi bisa upload sertifikat"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'sertifikat');

create policy "Guru dan user terautentikasi bisa update sertifikat"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'sertifikat')
  with check (bucket_id = 'sertifikat');

create policy "Guru dan user terautentikasi bisa delete sertifikat"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'sertifikat');


