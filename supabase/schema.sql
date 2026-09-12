-- Production appointment backend for Supabase/PostgreSQL.
-- Security model: clinic staff are authenticated with Supabase Auth and every
-- staff record is scoped to the clinic_id attached to their auth identity.
-- Public appointment creation uses secure server-side RPC functions (create_appointment_secure)
-- with validation + rate limiting + interval duration overlap prevention; no arbitrary anonymous INSERT policy.

create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

-- ----------------------------------------------------------------------------
-- Core Entities
-- ----------------------------------------------------------------------------

create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text not null,
  email text,
  website text,
  whatsapp text,
  timezone text not null default 'Asia/Kathmandu',
  created_at timestamptz not null default now()
);

create table if not exists clinic_hours (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  open_time time not null default '08:00:00',
  close_time time not null default '20:00:00',
  is_open boolean not null default true,
  unique (clinic_id, day_of_week)
);

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  specialization text,
  bio text,
  image text,
  display_title text,
  qualification text,
  experience_years integer,
  languages text[],
  memberships text[],
  education text[],
  availability jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clinic_users (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin','receptionist','doctor')),
  doctor_id uuid references doctors(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  start_time time not null default '08:00:00',
  end_time time not null default '20:00:00',
  slot_duration_minutes integer not null default 30 check (slot_duration_minutes > 0),
  break_start_time time,
  break_end_time time,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (doctor_id, day_of_week)
);

create table if not exists availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  exception_date date not null,
  is_available boolean not null default false,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  unique (doctor_id, exception_date)
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer check (duration_minutes > 0),
  price numeric check (price >= 0),
  category text,
  icon_name text,
  image text,
  short_description text,
  full_description text,
  benefits text[],
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_name text not null check (char_length(patient_name) between 2 and 120),
  patient_phone text not null check (char_length(patient_phone) between 7 and 30),
  patient_email text,
  doctor_id uuid references doctors(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  message text check (message is null or char_length(message) <= 1000),
  contact_consent_at timestamptz,
  appointment_duration_minutes integer not null default 30 check (appointment_duration_minutes between 5 and 480),
  appointment_range tsrange,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments add column if not exists contact_consent_at timestamptz;

create table if not exists appointment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  actor_id uuid,
  actor_role text not null default 'system',
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('patient','clinic')),
  recipient_contact text not null,
  channel text not null check (channel in ('email','whatsapp')),
  title text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  endpoint text not null,
  request_count integer not null default 1,
  window_start timestamptz not null default now(),
  unique (ip_address, endpoint)
);

-- Safe migrations for an existing deployment.
alter table clinic_users add column if not exists doctor_id uuid references doctors(id) on delete set null;
alter table appointments add column if not exists appointment_duration_minutes integer not null default 30 check (appointment_duration_minutes between 5 and 480);
alter table appointments add column if not exists appointment_range tsrange;

-- ----------------------------------------------------------------------------
-- Indexes & Constraints
-- ----------------------------------------------------------------------------

create index if not exists appointments_clinic_date_idx on appointments(clinic_id, appointment_date);
create index if not exists appointments_doctor_date_idx on appointments(doctor_id, appointment_date);
create index if not exists audit_logs_clinic_appointment_idx on appointment_audit_logs(clinic_id, appointment_id);

-- Database-level interval protection. Pending/confirmed appointments for the same
-- doctor may never overlap, regardless of their starting times.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_no_interval_overlap'
  ) then
    alter table appointments
      add constraint appointments_no_interval_overlap
      exclude using gist (doctor_id with =, appointment_range with &&)
      where (doctor_id is not null and status in ('pending','confirmed'));
  end if;
end $$;

create index if not exists appointments_active_lookup_idx
  on appointments(doctor_id, appointment_date, status);
create unique index if not exists clinic_users_doctor_unique_idx
  on clinic_users(clinic_id, doctor_id) where doctor_id is not null;

-- ----------------------------------------------------------------------------
-- Row Level Security & Security Definer Scope Helpers
-- ----------------------------------------------------------------------------

alter table clinics enable row level security;
alter table clinic_hours enable row level security;
alter table clinic_users enable row level security;
alter table doctors enable row level security;
alter table doctor_schedules enable row level security;
alter table availability_exceptions enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table appointment_audit_logs enable row level security;
alter table notifications enable row level security;
alter table rate_limits enable row level security;

-- SECURITY DEFINER functions to obtain caller scope safely
create or replace function public.current_user_clinic_id()
returns uuid
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select clinic_id from public.clinic_users where id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select role from public.clinic_users where id = auth.uid() limit 1;
$$;

create or replace function public.current_user_doctor_id()
returns uuid
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select cu.doctor_id
  from public.clinic_users cu
  where cu.id = auth.uid()
    and cu.role = 'doctor'
  limit 1;
$$;

revoke all on function public.current_user_clinic_id() from public;
revoke all on function public.current_user_role() from public;
revoke all on function public.current_user_doctor_id() from public;
grant execute on function public.current_user_clinic_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_doctor_id() to authenticated;

create or replace function public.validate_clinic_user_record()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.role = 'doctor' then
    if new.doctor_id is null or not exists (select 1 from doctors d where d.id = new.doctor_id and d.clinic_id = new.clinic_id and d.active = true) then
      raise exception 'INVALID_DOCTOR_ASSIGNMENT';
    end if;
  elsif new.doctor_id is not null then
    raise exception 'DOCTOR_ID_ONLY_ALLOWED_FOR_DOCTOR_ROLE';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_clinic_user_record on clinic_users;
create trigger trg_validate_clinic_user_record
before insert or update on clinic_users
for each row execute function public.validate_clinic_user_record();
revoke execute on function public.validate_clinic_user_record() from public, anon, authenticated;

-- RLS Policies
drop policy if exists "clinic staff can read own clinic" on clinics;
create policy "clinic staff can read own clinic" on clinics for select to authenticated
using (id = public.current_user_clinic_id());

drop policy if exists "users can read own clinic users" on clinic_users;
create policy "users can read own clinic users" on clinic_users for select to authenticated
using (clinic_id = public.current_user_clinic_id());

-- Prevent staff role escalation: only ADMIN can mutate staff memberships.
drop policy if exists "admins can manage staff" on clinic_users;
create policy "admins can insert staff" on clinic_users for insert to authenticated
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can update staff" on clinic_users for update to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin')
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can delete staff" on clinic_users for delete to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');

-- Public access is exposed through narrow RPCs; direct catalog reads are staff-scoped.
drop policy if exists "anyone can view active doctors" on doctors;
drop policy if exists "staff can manage doctors" on doctors;
create policy "admins can insert doctors" on doctors for insert to authenticated
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can update doctors" on doctors for update to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin')
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can delete doctors" on doctors for delete to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
drop policy if exists "staff can read doctors" on doctors;
create policy "staff can read doctors" on doctors for select to authenticated
using (clinic_id = public.current_user_clinic_id());

drop policy if exists "anyone can view active services" on services;
drop policy if exists "staff can manage services" on services;
create policy "admins can insert services" on services for insert to authenticated
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can update services" on services for update to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin')
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can delete services" on services for delete to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
drop policy if exists "staff can read services" on services;
create policy "staff can read services" on services for select to authenticated
using (clinic_id = public.current_user_clinic_id());

-- Doctor Role Appointment Isolation.
drop policy if exists "staff can read own clinic appointments" on appointments;
create policy "staff can read own clinic appointments" on appointments for select to authenticated
using (clinic_id = public.current_user_clinic_id() and (public.current_user_role() in ('admin','receptionist') or (public.current_user_role() = 'doctor' and doctor_id = public.current_user_doctor_id())));
drop policy if exists "staff can update own clinic appointments" on appointments;
create policy "staff can update own clinic appointments" on appointments for update to authenticated
using (clinic_id = public.current_user_clinic_id() and (public.current_user_role() in ('admin','receptionist') or (public.current_user_role() = 'doctor' and doctor_id = public.current_user_doctor_id())))
with check (clinic_id = public.current_user_clinic_id() and (public.current_user_role() in ('admin','receptionist') or (public.current_user_role() = 'doctor' and doctor_id = public.current_user_doctor_id())));
drop policy if exists "staff can create own clinic appointments" on appointments;
create policy "staff can create own clinic appointments" on appointments for insert to authenticated
with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() in ('admin','receptionist'));

drop policy if exists "staff can view audit logs" on appointment_audit_logs;
create policy "staff can view audit logs" on appointment_audit_logs for select to authenticated
using (clinic_id = public.current_user_clinic_id() and public.current_user_role() in ('admin','receptionist'));

-- Schedule administration: staff can read; only admins can mutate.
drop policy if exists "staff can read clinic hours" on clinic_hours;
create policy "staff can read clinic hours" on clinic_hours for select to authenticated using (clinic_id = public.current_user_clinic_id());
drop policy if exists "admins can manage clinic hours" on clinic_hours;
create policy "admins can insert clinic hours" on clinic_hours for insert to authenticated with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can update clinic hours" on clinic_hours for update to authenticated using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin') with check (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');
create policy "admins can delete clinic hours" on clinic_hours for delete to authenticated using (clinic_id = public.current_user_clinic_id() and public.current_user_role() = 'admin');

drop policy if exists "staff can read doctor schedules" on doctor_schedules;
create policy "staff can read doctor schedules" on doctor_schedules for select to authenticated using (exists (select 1 from public.doctors d where d.id = doctor_schedules.doctor_id and d.clinic_id = public.current_user_clinic_id()));
drop policy if exists "admins can manage doctor schedules" on doctor_schedules;
create policy "admins can insert doctor schedules" on doctor_schedules for insert to authenticated with check (exists (select 1 from public.doctors d where d.id = doctor_schedules.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin');
create policy "admins can update doctor schedules" on doctor_schedules for update to authenticated using (exists (select 1 from public.doctors d where d.id = doctor_schedules.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin') with check (exists (select 1 from public.doctors d where d.id = doctor_schedules.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin');
create policy "admins can delete doctor schedules" on doctor_schedules for delete to authenticated using (exists (select 1 from public.doctors d where d.id = doctor_schedules.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin');

drop policy if exists "staff can read availability exceptions" on availability_exceptions;
create policy "staff can read availability exceptions" on availability_exceptions for select to authenticated using (exists (select 1 from public.doctors d where d.id = availability_exceptions.doctor_id and d.clinic_id = public.current_user_clinic_id()));
drop policy if exists "admins can manage availability exceptions" on availability_exceptions;
create policy "admins can insert availability exceptions" on availability_exceptions for insert to authenticated with check (exists (select 1 from public.doctors d where d.id = availability_exceptions.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin');
create policy "admins can update availability exceptions" on availability_exceptions for update to authenticated using (exists (select 1 from public.doctors d where d.id = availability_exceptions.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin') with check (exists (select 1 from public.doctors d where d.id = availability_exceptions.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin');
create policy "admins can delete availability exceptions" on availability_exceptions for delete to authenticated using (exists (select 1 from public.doctors d where d.id = availability_exceptions.doctor_id and d.clinic_id = public.current_user_clinic_id()) and public.current_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- Rate Limiting RPC
-- ----------------------------------------------------------------------------

create or replace function public.check_rate_limit(
  p_ip text,
  p_endpoint text,
  p_max_requests integer default 10,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  if nullif(trim(p_ip), '') is null or nullif(trim(p_endpoint), '') is null
     or p_max_requests < 1 or p_window_seconds < 1 then
    return false;
  end if;

  -- Atomic UPSERT avoids the SELECT-then-INSERT race when multiple requests
  -- from the same client arrive concurrently.
  insert into rate_limits (ip_address, endpoint, request_count, window_start)
  values (trim(p_ip), trim(p_endpoint), 1, now())
  on conflict (ip_address, endpoint) do update
  set
    request_count = case
      when now() - rate_limits.window_start >= make_interval(secs => p_window_seconds)
        then 1
      else rate_limits.request_count + 1
    end,
    window_start = case
      when now() - rate_limits.window_start >= make_interval(secs => p_window_seconds)
        then now()
      else rate_limits.window_start
    end
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer) from public, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

-- ----------------------------------------------------------------------------
-- Database-Driven Availability Engine RPC
-- ----------------------------------------------------------------------------

create or replace function public.get_available_slots(
  p_clinic_id uuid,
  p_doctor_id uuid,
  p_date date,
  p_service_id uuid default null
)
returns table(slot_time time, available boolean)
language plpgsql
security definer
stable
set search_path = pg_catalog, public
as $$
declare
  v_day integer := extract(dow from p_date)::integer;
  v_clinic_open time;
  v_clinic_close time;
  v_doctor_start time;
  v_doctor_end time;
  v_slot_duration integer;
  v_break_start time;
  v_break_end time;
  v_service_duration integer := 30;
  v_exception_available boolean;
  v_exception_start time;
  v_exception_end time;
  v_start time;
  v_end time;
  v_cur time;
  v_timezone text;
begin
  select c.timezone into v_timezone from clinics c where c.id = p_clinic_id;
  if v_timezone is null then
    return;
  end if;
  if p_date < (now() at time zone v_timezone)::date then
    return;
  end if;

  if p_service_id is not null then
    select s.duration_minutes into v_service_duration
    from services s
    where s.id = p_service_id and s.clinic_id = p_clinic_id and s.active = true;
    if v_service_duration is null then return; end if;
  end if;

  if p_doctor_id is not null then
    if not exists (select 1 from doctors d where d.id = p_doctor_id and d.clinic_id = p_clinic_id and d.active = true) then
      return;
    end if;
  else
    -- For "Any dentist", expose only times that at least one active dentist can
    -- actually accept, considering that dentist's schedule, exceptions and
    -- existing appointments. This avoids displaying clinic-wide fake slots.
    return query
      select slots.slot_time, true
      from doctors d
      cross join lateral public.get_available_slots(
        p_clinic_id, d.id, p_date, p_service_id
      ) slots
      where d.clinic_id = p_clinic_id
        and d.active = true
        and slots.available = true
      group by slots.slot_time
      order by slots.slot_time;
    return;
  end if;

  select ch.open_time, ch.close_time
    into v_clinic_open, v_clinic_close
  from clinic_hours ch
  where ch.clinic_id = p_clinic_id and ch.day_of_week = v_day and ch.is_open = true;

  if v_clinic_open is null or v_clinic_close is null then
    return;
  end if;

  if p_doctor_id is not null then
    select ds.start_time, ds.end_time, ds.slot_duration_minutes, ds.break_start_time, ds.break_end_time
      into v_doctor_start, v_doctor_end, v_slot_duration, v_break_start, v_break_end
    from doctor_schedules ds
    where ds.doctor_id = p_doctor_id and ds.day_of_week = v_day and ds.active = true;

    if v_doctor_start is null or v_doctor_end is null then
      return;
    end if;

    v_start := greatest(v_clinic_open, v_doctor_start);
    v_end := least(v_clinic_close, v_doctor_end);
  else
    v_start := v_clinic_open;
    v_end := v_clinic_close;
    v_slot_duration := 30;
  end if;

  select ae.is_available, ae.start_time, ae.end_time
    into v_exception_available, v_exception_start, v_exception_end
  from availability_exceptions ae
  where ae.doctor_id = p_doctor_id and ae.exception_date = p_date;

  if p_doctor_id is not null and v_exception_available is false then
    return;
  end if;

  if p_doctor_id is not null and v_exception_available is true then
    if v_exception_start is not null and v_exception_end is not null then
      v_start := greatest(v_start, v_exception_start);
      v_end := least(v_end, v_exception_end);
    end if;
  end if;

  if v_start is null or v_end is null or v_start >= v_end then return; end if;
  v_cur := v_start;

  while v_cur + make_interval(mins => v_service_duration) <= v_end loop
    -- Never expose/book a slot whose start has already passed in the clinic's timezone.
    if p_date = (now() at time zone v_timezone)::date
       and (p_date + v_cur)::timestamp <= (now() at time zone v_timezone) then
      v_cur := v_cur + make_interval(mins => greatest(1, coalesce(v_slot_duration, 30)));
      continue;
    end if;

    if (v_break_start is not null and v_break_end is not null and v_cur < v_break_end and v_cur + make_interval(mins => v_service_duration) > v_break_start) then
      v_cur := v_cur + make_interval(mins => greatest(1, coalesce(v_slot_duration, 30)));
      continue;
    end if;

    slot_time := v_cur;
    available := not exists (
      select 1
      from appointments a
      where a.clinic_id = p_clinic_id
        and (p_doctor_id is null or a.doctor_id = p_doctor_id)
        and a.appointment_date = p_date
        and a.status in ('pending','confirmed')
        and a.appointment_range && tsrange(
          (p_date + v_cur)::timestamp,
          ((p_date + v_cur)::timestamp + make_interval(mins => v_service_duration)),
          '[)'
        )
    );
    return next;
    v_cur := v_cur + make_interval(mins => greatest(1, coalesce(v_slot_duration, 30)));
  end loop;
end;
$$;

revoke all on function public.get_available_slots(uuid, uuid, date, uuid) from public, authenticated;
revoke execute on function public.get_available_slots(uuid, uuid, date, uuid) from authenticated;
grant execute on function public.get_available_slots(uuid, uuid, date, uuid) to anon, service_role;

-- Narrow public directory RPCs. These expose only safe active fields and require a clinic id.
drop function if exists public.get_public_doctors(uuid);
create function public.get_public_doctors(p_clinic_id uuid)
returns table(id uuid, name text, specialization text, bio text, image text, display_title text, qualification text, experience_years integer, languages text[], memberships text[], education text[], available_days text[])
language sql security definer stable set search_path = pg_catalog, public
as $$
  select d.id, d.name, d.specialization, d.bio, d.image, d.display_title, d.qualification, d.experience_years, d.languages, d.memberships, d.education,
    coalesce((select array_agg(x.day_name order by x.day_no) from (select distinct ds.day_of_week as day_no, case ds.day_of_week when 0 then 'Sunday' when 1 then 'Monday' when 2 then 'Tuesday' when 3 then 'Wednesday' when 4 then 'Thursday' when 5 then 'Friday' when 6 then 'Saturday' end as day_name from public.doctor_schedules ds where ds.doctor_id=d.id and ds.active=true) x), '{}'::text[])
  from public.doctors d where d.clinic_id=p_clinic_id and d.active=true order by d.name;
$$;
revoke all on function public.get_public_doctors(uuid) from public, authenticated;
revoke execute on function public.get_public_doctors(uuid) from authenticated;
grant execute on function public.get_public_doctors(uuid) to anon;

drop function if exists public.get_public_services(uuid);
create function public.get_public_services(p_clinic_id uuid)
returns table(id uuid, name text, description text, duration_minutes integer, price numeric, category text, icon_name text, image text, short_description text, full_description text, benefits text[])
language sql security definer stable set search_path = pg_catalog, public
as $$
  select s.id, s.name, s.description, s.duration_minutes, s.price, coalesce(s.category,'General'), coalesce(s.icon_name,'Smile'), coalesce(s.image,''), coalesce(s.short_description,s.description,''), coalesce(s.full_description,s.description,''), coalesce(s.benefits,'{}'::text[])
  from public.services s where s.clinic_id=p_clinic_id and s.active=true order by s.name;
$$;
revoke all on function public.get_public_services(uuid) from public, authenticated;
revoke execute on function public.get_public_services(uuid) from authenticated;
grant execute on function public.get_public_services(uuid) to anon;

-- ----------------------------------------------------------------------------
-- Appointment integrity trigger
-- ----------------------------------------------------------------------------

create or replace function public.validate_appointment_record()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_duration integer;
begin
  if new.doctor_id is not null then
    if not exists (select 1 from doctors d where d.id = new.doctor_id and d.clinic_id = new.clinic_id) then
      raise exception 'INVALID_DOCTOR';
    end if;
  end if;

  if new.service_id is not null then
    select s.duration_minutes into v_duration
    from services s
    where s.id = new.service_id and s.clinic_id = new.clinic_id and s.active = true;
    if v_duration is null then raise exception 'INVALID_SERVICE'; end if;
    new.appointment_duration_minutes := v_duration;
  end if;

  if new.appointment_date < current_date then
    raise exception 'PAST_DATE_NOT_ALLOWED';
  end if;

  if new.patient_email is not null and new.patient_email <> '' and new.patient_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'INVALID_PATIENT_EMAIL';
  end if;

  if char_length(trim(new.patient_name)) < 2 or char_length(trim(new.patient_name)) > 120 then
    raise exception 'INVALID_PATIENT_NAME';
  end if;
  if char_length(trim(new.patient_phone)) < 7 or char_length(trim(new.patient_phone)) > 30 then
    raise exception 'INVALID_PATIENT_PHONE';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_appointment_record on appointments;
create trigger trg_validate_appointment_record
before insert or update on appointments
for each row execute function public.validate_appointment_record();
revoke execute on function public.validate_appointment_record() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- Secure public appointment creation
-- IMPORTANT: this RPC is intentionally service-role only. Public callers must use
-- an Edge Function which supplies trusted request metadata and invokes this RPC.
-- ----------------------------------------------------------------------------

create or replace function public.create_appointment_secure(
  p_clinic_id uuid,
  p_patient_name text,
  p_patient_phone text,
  p_patient_email text,
  p_doctor_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_appointment_time time,
  p_message text,
  p_contact_consent boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_appointment_id uuid;
  v_doctor_id uuid := p_doctor_id;
  v_service_duration integer;
  v_timezone text;
begin
  select c.timezone into v_timezone from clinics c where c.id = p_clinic_id;
  if v_timezone is null then raise exception 'INVALID_CLINIC'; end if;

  if p_service_id is null then
    v_service_duration := 30;
  else
    select s.duration_minutes into v_service_duration
    from services s
    where s.id = p_service_id and s.clinic_id = p_clinic_id and s.active = true;
    if v_service_duration is null then raise exception 'INVALID_SERVICE'; end if;
  end if;

  if p_patient_name is null or char_length(trim(p_patient_name)) not between 2 and 120 then raise exception 'INVALID_PATIENT_NAME'; end if;
  if p_patient_phone is null or char_length(trim(p_patient_phone)) not between 7 and 30 or trim(p_patient_phone) !~ '^[+()0-9\s./-]+$' then raise exception 'INVALID_PATIENT_PHONE'; end if;
  if p_patient_email is not null and trim(p_patient_email) <> '' and trim(p_patient_email) !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'INVALID_PATIENT_EMAIL'; end if;
  if p_message is not null and char_length(p_message) > 1000 then raise exception 'INVALID_MESSAGE'; end if;
  if p_contact_consent is not true then raise exception 'CONTACT_CONSENT_REQUIRED'; end if;
  if p_appointment_date < (now() at time zone v_timezone)::date then raise exception 'PAST_DATE_NOT_ALLOWED'; end if;

  if v_doctor_id is not null then
    if not exists (select 1 from doctors d where d.id = v_doctor_id and d.clinic_id = p_clinic_id and d.active = true) then raise exception 'INVALID_DOCTOR'; end if;
  else
    -- "Any dentist" must mean any dentist who is actually bookable at this
    -- requested time, not merely any dentist without an overlapping booking.
    select d.id into v_doctor_id
    from doctors d
    where d.clinic_id = p_clinic_id
      and d.active = true
      and exists (
        select 1
        from public.get_available_slots(p_clinic_id, d.id, p_appointment_date, p_service_id) s
        where s.slot_time = p_appointment_time and s.available = true
      )
    order by d.id
    limit 1;

    if v_doctor_id is null then raise exception 'SLOT_UNAVAILABLE'; end if;
  end if;

  -- Clinic hours + doctor schedule are mandatory for real bookings.
  if not exists (
    select 1 from public.get_available_slots(p_clinic_id, v_doctor_id, p_appointment_date, p_service_id)
    where slot_time = p_appointment_time and available = true
  ) then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into appointments (
    clinic_id, patient_name, patient_phone, patient_email, doctor_id, service_id,
    appointment_date, appointment_time, message, appointment_duration_minutes, contact_consent_at, status
  ) values (
    p_clinic_id, trim(p_patient_name), trim(p_patient_phone), nullif(trim(p_patient_email), ''),
    v_doctor_id, p_service_id, p_appointment_date, p_appointment_time, nullif(trim(p_message), ''),
    v_service_duration, now(), 'pending'
  ) returning id into v_appointment_id;

  insert into appointment_audit_logs (clinic_id, appointment_id, actor_role, action, details)
  values (p_clinic_id, v_appointment_id, 'patient_public', 'APPOINTMENT_CREATED',
          jsonb_build_object('doctor_id', v_doctor_id, 'service_id', p_service_id, 'date', p_appointment_date, 'time', p_appointment_time));

  return jsonb_build_object('success', true, 'appointment_id', v_appointment_id, 'doctor_id', v_doctor_id);
exception
  when exclusion_violation then raise exception 'SLOT_UNAVAILABLE';
  when unique_violation then raise exception 'SLOT_UNAVAILABLE';
end;
$$;

revoke all on function public.create_appointment_secure(uuid, text, text, text, uuid, uuid, date, time, text, boolean) from public, anon, authenticated;
grant execute on function public.create_appointment_secure(uuid, text, text, text, uuid, uuid, date, time, text, boolean) to service_role;

-- Secure rescheduling for clinic staff. The caller must already be authorized by role/RLS.
create or replace function public.reschedule_appointment_secure(
  p_appointment_id uuid,
  p_new_date date,
  p_new_time time
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_appointment appointments%rowtype;
begin
  select * into v_appointment from appointments where id = p_appointment_id for update;
  if not found then raise exception 'APPOINTMENT_NOT_FOUND'; end if;

  if v_appointment.clinic_id <> public.current_user_clinic_id() then raise exception 'UNAUTHORIZED'; end if;
  if public.current_user_role() not in ('admin','receptionist','doctor') then raise exception 'UNAUTHORIZED'; end if;
  if v_appointment.status not in ('pending','confirmed') then raise exception 'APPOINTMENT_NOT_RESCHEDULABLE'; end if;
  if public.current_user_role() = 'doctor' and v_appointment.doctor_id <> public.current_user_doctor_id() then raise exception 'UNAUTHORIZED'; end if;
  if p_new_date < (now() at time zone (select timezone from clinics where id = v_appointment.clinic_id))::date then raise exception 'PAST_DATE_NOT_ALLOWED'; end if;

  if not exists (
    select 1 from public.get_available_slots(v_appointment.clinic_id, v_appointment.doctor_id, p_new_date, v_appointment.service_id)
    where slot_time = p_new_time and available = true
  ) then raise exception 'SLOT_UNAVAILABLE'; end if;

  perform set_config('app.allow_schedule_change', 'true', true);
  update appointments
  set appointment_date = p_new_date, appointment_time = p_new_time, updated_at = now()
  where id = p_appointment_id;

  return jsonb_build_object('success', true);
exception
  when exclusion_violation then raise exception 'SLOT_UNAVAILABLE';
end;
$$;
revoke all on function public.reschedule_appointment_secure(uuid, date, time) from public, anon;
grant execute on function public.reschedule_appointment_secure(uuid, date, time) to authenticated;

-- Keep the overlap range synchronized after the validation trigger has set service duration.
create or replace function public.set_appointment_range()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_duration integer;
begin
  if new.service_id is not null then
    select s.duration_minutes into v_duration from public.services s where s.id=new.service_id and s.clinic_id=new.clinic_id and s.active=true;
    if v_duration is not null then new.appointment_duration_minutes:=v_duration; end if;
  end if;
  new.appointment_range:=tsrange((new.appointment_date+new.appointment_time)::timestamp,((new.appointment_date+new.appointment_time)::timestamp+(new.appointment_duration_minutes||' minutes')::interval),'[)');
  return new;
end;
$$;
revoke execute on function public.set_appointment_range() from public,anon,authenticated;
drop trigger if exists set_appointment_range_trigger on appointments;
create trigger set_appointment_range_trigger before insert or update of appointment_date, appointment_time, appointment_duration_minutes, service_id on appointments for each row execute function public.set_appointment_range();
update appointments set appointment_date = appointment_date;

-- Prevent doctor users from reassigning appointments during ordinary updates.
drop policy if exists "staff can update own clinic appointments" on appointments;
create policy "staff can update own clinic appointments" on appointments for update to authenticated
using (
  clinic_id = public.current_user_clinic_id()
  and (public.current_user_role() in ('admin','receptionist') or (public.current_user_role() = 'doctor' and doctor_id = public.current_user_doctor_id()))
)
with check (
  clinic_id = public.current_user_clinic_id()
  and (
    public.current_user_role() in ('admin','receptionist')
    or (public.current_user_role() = 'doctor' and doctor_id = public.current_user_doctor_id())
  )
);

create or replace function public.enforce_appointment_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is not null
     and old.status is distinct from new.status
     and not (
       (old.status = 'pending' and new.status in ('confirmed','cancelled'))
       or (old.status = 'confirmed' and new.status in ('completed','cancelled','no_show'))
     ) then
    raise exception 'INVALID_STATUS_TRANSITION';
  end if;

  -- Direct browser updates may change status/message only. Scheduling changes
  -- must go through the transaction-safe reschedule RPC.
  if auth.uid() is not null
     and current_setting('app.allow_schedule_change', true) is distinct from 'true'
     and (
       old.clinic_id is distinct from new.clinic_id
       or old.doctor_id is distinct from new.doctor_id
       or old.service_id is distinct from new.service_id
       or old.appointment_date is distinct from new.appointment_date
       or old.appointment_time is distinct from new.appointment_time
       or old.appointment_duration_minutes is distinct from new.appointment_duration_minutes
     ) then
    raise exception 'SCHEDULE_CHANGE_REQUIRES_RESCHEDULE';
  end if;

  if public.current_user_role() = 'doctor' then
    if old.clinic_id is distinct from new.clinic_id
       or old.doctor_id is distinct from new.doctor_id
       or old.service_id is distinct from new.service_id
       or old.patient_name is distinct from new.patient_name
       or old.patient_phone is distinct from new.patient_phone
       or old.patient_email is distinct from new.patient_email
       or old.appointment_date is distinct from new.appointment_date
       or old.appointment_time is distinct from new.appointment_time
       or old.appointment_duration_minutes is distinct from new.appointment_duration_minutes then
      raise exception 'DOCTOR_UPDATE_NOT_ALLOWED';
    end if;
  end if;

  return new;
end;
$$;
revoke execute on function public.enforce_appointment_mutation() from public, anon, authenticated;

drop trigger if exists trg_enforce_appointment_mutation on appointments;
create trigger trg_enforce_appointment_mutation
before update on appointments
for each row execute function public.enforce_appointment_mutation();

-- Appointment mutation audit trail. Details are generated from OLD/NEW values.
create or replace function public.audit_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status or old.appointment_date is distinct from new.appointment_date or old.appointment_time is distinct from new.appointment_time or old.doctor_id is distinct from new.doctor_id then
      insert into appointment_audit_logs (clinic_id, appointment_id, actor_id, actor_role, action, details)
      values (new.clinic_id, new.id, auth.uid(), coalesce(public.current_user_role(),'system'), 'APPOINTMENT_UPDATED',
        jsonb_build_object('old_status',old.status,'new_status',new.status,'old_date',old.appointment_date,'new_date',new.appointment_date,'old_time',old.appointment_time,'new_time',new.appointment_time,'old_doctor_id',old.doctor_id,'new_doctor_id',new.doctor_id));
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.audit_appointment_change() from public, anon, authenticated;
drop trigger if exists trg_audit_appointment_change on appointments;
create trigger trg_audit_appointment_change
after update on appointments
for each row execute function public.audit_appointment_change();
