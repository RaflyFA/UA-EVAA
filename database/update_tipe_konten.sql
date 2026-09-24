-- ==============================================================================
-- SKRIP MIGRASI DATABASE: MEMPERBARUI CONSTRAINT TIPE KONTEN MODUL
-- Masalah: Kolom tipe_konten pada tabel konten_modul sebelumnya hanya membolehkan
-- ('bacaan', 'video'). Ketika guru menyimpan modul Niti Surti ('instruksi'),
-- Niti Bukti/Bakti ('panduan_tugas'), atau Niti Sajati ('ucapan_selamat'),
-- database menolak query insert karena melanggar check constraint.
-- ==============================================================================

-- 1. Hapus check constraint lama pada tipe_konten jika ada
ALTER TABLE public.konten_modul 
  DROP CONSTRAINT IF EXISTS konten_modul_tipe_konten_check;

-- 2. Tambahkan check constraint baru yang mencakup semua tipe konten 5 tahap Niti
ALTER TABLE public.konten_modul 
  ADD CONSTRAINT konten_modul_tipe_konten_check 
  CHECK (tipe_konten IN ('bacaan', 'video', 'instruksi', 'panduan_tugas', 'ucapan_selamat'));
