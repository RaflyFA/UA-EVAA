-- 1. Bikin fungsinya (robot pekerja)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nama_lengkap, role, kelas, nomor_induk)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama_lengkap', 'User Baru'), -- Ngambil nama dari inputan Frontend
    coalesce(new.raw_user_meta_data->>'role', 'siswa'),             -- Defaultnya jadi 'siswa'
    new.raw_user_meta_data->>'kelas',                               -- Boleh kosong
    new.raw_user_meta_data->>'nomor_induk'                          -- Boleh kosong
  );
  return new;
end;
$$;

-- 2. Bikin trigger (sensor otomatisnya)
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 1. Bikin fungsinya (robot penyiap raport)
create or replace function public.initialize_student_progress()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Cuma dieksekusi kalau yang baru daftar itu role-nya 'siswa'
  if new.role = 'siswa' then
    insert into public.progress_siswa (siswa_id, tahap_niti, status)
    values
      (new.id, 'harti', 'tersedia'),
      (new.id, 'surti', 'terkunci'),
      (new.id, 'bukti', 'terkunci'),
      (new.id, 'bakti', 'terkunci'),
      (new.id, 'sajati', 'terkunci');
  end if;
  return new;
end;
$$;

-- 2. Bikin trigger (sensornya ditempel di tabel profiles)
create or replace trigger on_student_profile_created
  after insert on public.profiles
  for each row execute procedure public.initialize_student_progress();
