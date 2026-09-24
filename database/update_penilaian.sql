-- ==============================================================================
-- SKRIP MIGRASI DATABASE: PENYESUAIAN SISTEM PENILAIAN 5 TAHAP NITI
-- Jalankan skrip ini di Supabase SQL Editor jika ingin mendukung penilaian penuh
-- per-tahap Niti (Harti, Surti, Bukti, Bakti, Sajati).
-- ==============================================================================

-- 1. Jadikan submission_id boleh NULL pada tabel nilai
-- (karena tahap Harti, Surti, dan Sajati tidak selalu mewajibkan berkas upload terpisah)
alter table if exists public.nilai alter column submission_id drop not null;

-- 2. Tambahkan kolom tahap_niti pada tabel nilai
alter table if exists public.nilai add column if not exists tahap_niti text 
  check (tahap_niti in ('harti','surti','bukti','bakti','sajati'));

-- 3. Hapus foreign key unique constraint lama pada submission_id (jika ada)
alter table if exists public.nilai drop constraint if exists nilai_submission_id_key;

-- 4. Buat unique index per (siswa_id, tahap_niti) agar dapat di-upsert per siswa & tahap
create unique index if not exists idx_nilai_siswa_tahap on public.nilai (siswa_id, tahap_niti);

-- 5. Perbarui kebijakan RLS jika diperlukan
alter table if exists public.nilai enable row level security;

drop policy if exists "Siswa bisa membaca nilai miliknya" on public.nilai;
drop policy if exists "Guru bisa mengelola semua nilai" on public.nilai;

create policy "Siswa bisa membaca nilai miliknya"
  on public.nilai for select
  to authenticated
  using (siswa_id = auth.uid());

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
