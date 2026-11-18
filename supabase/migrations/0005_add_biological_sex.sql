-- Needed for accurate local BMR/calorie calculations (Mifflin-St Jeor
-- formula differs by biological sex). Added after the initial schema.

alter table public.profiles
  add column if not exists biological_sex text
    check (biological_sex in ('male', 'female', 'unspecified'));
