-- ==============================================================================
-- KEBIJAKAN STORAGE RLS UNTUK BUCKET 'sertifikat'
-- Jalankan query ini di SQL Editor Supabase untuk mengatasi:
-- "new row violates row-level security policy for table 'objects'"
-- ==============================================================================

-- 1. Pastikan bucket 'sertifikat' ada dan berstatus publik
insert into storage.buckets (id, name, public)
values ('sertifikat', 'sertifikat', true)
on conflict (id) do update set public = true;

-- 2. Hapus policy lama jika pernah ada
drop policy if exists "Siapa saja bisa melihat sertifikat publik" on storage.objects;
drop policy if exists "Guru dan user terautentikasi bisa upload sertifikat" on storage.objects;
drop policy if exists "Guru dan user terautentikasi bisa update sertifikat" on storage.objects;
drop policy if exists "Guru dan user terautentikasi bisa delete sertifikat" on storage.objects;

-- 3. Policy SELECT: Berkas sertifikat dapat diakses/dilihat publik / siapa saja
create policy "Siapa saja bisa melihat sertifikat publik"
  on storage.objects for select
  using (bucket_id = 'sertifikat');

-- 4. Policy INSERT: Pengguna terautentikasi (Guru) bisa mengunggah berkas sertifikat
create policy "Guru dan user terautentikasi bisa upload sertifikat"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'sertifikat');

-- 5. Policy UPDATE: Pengguna terautentikasi (Guru) bisa memperbarui berkas sertifikat
create policy "Guru dan user terautentikasi bisa update sertifikat"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'sertifikat')
  with check (bucket_id = 'sertifikat');

-- 6. Policy DELETE: Pengguna terautentikasi (Guru) bisa menghapus berkas sertifikat
create policy "Guru dan user terautentikasi bisa delete sertifikat"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'sertifikat');
