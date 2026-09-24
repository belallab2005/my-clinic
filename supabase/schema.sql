-- =====================================================================
-- Zondenta Dental Clinic Management — Supabase schema
-- Run this once in Supabase Studio → SQL Editor (or `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES  (extends auth.users — every login gets a row here)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  name_ar         text,
  email           text not null,
  role            text not null check (role in ('super_admin','admin','supervisor','student')),
  title           text default '',
  title_ar        text,
  avatar_bg       text default '#0C1A2B',
  student_id      text,
  section_id      uuid,
  specialty       text,
  phone           text,
  created_at      timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
-- Role/name/etc are passed in via the `data` object at sign-up time.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, name_ar, email, role, title, title_ar, student_id, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'name_ar',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'title', ''),
    new.raw_user_meta_data->>'title_ar',
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Helper: current user's role, usable inside RLS policies.
create or replace function auth_role()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_staff()
returns boolean as $$
  select auth_role() in ('super_admin','admin','supervisor');
$$ language sql stable security definer;

-- ---------------------------------------------------------------------
-- 2. SECTIONS & SUBJECTS
-- ---------------------------------------------------------------------
create table if not exists sections (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  name_ar         text not null,
  academic_year   text not null,
  supervisor_ids  uuid[] not null default '{}',
  student_ids     uuid[] not null default '{}'
);

create table if not exists subjects (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  name_ar         text not null,
  code            text not null,
  academic_year   text not null,
  requirements    jsonb not null default '[]'  -- [{procedureType, procedureTypeAr, targetCount}]
);

-- ---------------------------------------------------------------------
-- 3. PATIENTS
-- ---------------------------------------------------------------------
create table if not exists patients (
  id                     uuid primary key default gen_random_uuid(),
  patient_code           text not null unique,
  full_name              text not null,
  full_name_ar           text,
  gender                 text not null check (gender in ('male','female')),
  age                    int not null,
  birth_date             date,
  phone                  text,
  whatsapp               text,
  national_id            text,
  address                text,
  emergency_contact      jsonb default '{}',   -- {name, relationship, phone}
  assigned_student_id    uuid references profiles(id),
  medical_history_id     uuid,
  active_treatments_count int not null default 0,
  registered_at          date not null default current_date,
  status                 text not null default 'active' check (status in ('active','in_treatment','completed'))
);

-- ---------------------------------------------------------------------
-- 4. MEDICAL HISTORIES  (sensitive — patient PHI)
-- ---------------------------------------------------------------------
create table if not exists medical_histories (
  id                              uuid primary key default gen_random_uuid(),
  patient_id                      uuid not null references patients(id) on delete cascade,
  student_id                      uuid references profiles(id),
  supervisor_id                   uuid references profiles(id),
  status                          text not null default 'draft' check (status in ('draft','pending_approval','approved','rejected')),
  supervisor_feedback             text,
  approved_at                     timestamptz,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),

  blood_pressure_systolic         int,
  blood_pressure_diastolic        int,
  sicknesses                      jsonb not null default '{}',
  current_medications              jsonb not null default '{}',
  allergies                       jsonb not null default '{}',
  female_questions                jsonb,

  chief_complaint                 text,
  chief_complaint_ar              text,
  visit_reason                    text,
  last_dental_visit_date          date,
  gum_bleeding                    boolean default false,
  dental_phobia                   text default 'none' check (dental_phobia in ('none','mild','severe')),
  previous_anesthesia_issues      boolean default false,

  occlusion                       text,
  torus_palatinus                 text,
  torus_mandibularis               text,
  palatum                         text,
  anomalous_teeth_notes           text,
  gingival_condition              text,

  treatment_consent_agreed        boolean default false,
  treatment_consent_date          timestamptz,
  patient_signature_text          text,
  publish_consent_agreed          boolean default false,
  publish_consent_date            timestamptz,

  clinical_alerts                 jsonb not null default '[]'
);

alter table patients
  add constraint patients_medical_history_fk
  foreign key (medical_history_id) references medical_histories(id) on delete set null
  deferrable initially deferred;

-- ---------------------------------------------------------------------
-- 5. CASES, EVALUATIONS, X-RAYS
-- ---------------------------------------------------------------------
create table if not exists cases (
  id                    uuid primary key default gen_random_uuid(),
  case_number           text not null unique,
  patient_id            uuid not null references patients(id) on delete cascade,
  student_id            uuid references profiles(id),
  supervisor_id         uuid references profiles(id),
  subject_id            uuid references subjects(id),
  tooth_number          int not null,
  condition             text not null,
  procedure             text not null,
  procedure_ar          text,
  status                text not null default 'planned'
                          check (status in ('planned','in_progress','ready_for_review','completed','revision_requested')),
  created_at            date not null default current_date,
  completed_at          date,
  notes                 text,
  social_share_allowed  boolean not null default false
);

create table if not exists xrays (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references cases(id) on delete cascade,
  type         text not null check (type in ('pre_op','post_op','bitewing','periapical','panoramic')),
  title        text,
  title_ar     text,
  url          text not null,   -- Supabase Storage path/public URL
  uploaded_at  timestamptz not null default now(),
  notes        text
);

create table if not exists evaluations (
  id                uuid primary key default gen_random_uuid(),
  case_id           uuid not null unique references cases(id) on delete cascade,
  supervisor_id     uuid references profiles(id),
  supervisor_name   text,
  student_id        uuid references profiles(id),
  evaluated_at      timestamptz not null default now(),
  rubric            jsonb not null,  -- {diagnosis, treatmentPlan, execution, infectionControl, professionalism}
  total_score       int not null,
  percentage        int not null,
  comments          text,
  passed            boolean not null
);

-- ---------------------------------------------------------------------
-- 6. APPOINTMENTS, ATTENDANCE, NOTIFICATIONS
-- ---------------------------------------------------------------------
create table if not exists appointments (
  id                 uuid primary key default gen_random_uuid(),
  reservation_code   text not null unique,
  patient_id         uuid references patients(id) on delete cascade,
  student_id         uuid references profiles(id),
  supervisor_id      uuid references profiles(id),
  chair_number       text,
  date               date not null,
  start_time         time not null,
  end_time           time not null,
  procedure          text,
  status             text not null default 'scheduled'
                        check (status in ('scheduled','registered','in_progress','finished','cancelled','no_show')),
  fee                numeric(10,2) default 0,
  payment_status     text default 'pending' check (payment_status in ('paid','pending','free_academic')),
  notes              text,
  reminder_sent      boolean not null default false
);

create table if not exists attendance (
  id             uuid primary key default gen_random_uuid(),
  type           text not null check (type in ('student_clinic','patient_appointment')),
  target_id      uuid not null,
  target_name    text,
  section_name   text,
  date           date not null default current_date,
  time           text,
  chair_number   text,
  status         text not null check (status in ('present','absent','excused','late')),
  recorded_by    uuid references profiles(id),
  notes          text
);

create table if not exists notifications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  title_ar       text,
  message        text not null,
  message_ar     text,
  type           text not null check (type in ('medical_approval','case_evaluation','appointment','clinical_alert','quota')),
  target_role    text not null default 'all',
  target_user_id uuid references profiles(id),
  timestamp      timestamptz not null default now(),
  read           boolean not null default false,
  link_tab       text,
  link_id        text
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Baseline rules — tighten further once you've mapped exact section
-- assignments; this already prevents students from reading other
-- students' patients/medical records, which is the critical PHI risk.
-- =====================================================================
alter table profiles           enable row level security;
alter table sections           enable row level security;
alter table subjects           enable row level security;
alter table patients           enable row level security;
alter table medical_histories  enable row level security;
alter table cases              enable row level security;
alter table xrays              enable row level security;
alter table evaluations        enable row level security;
alter table appointments       enable row level security;
alter table attendance         enable row level security;
alter table notifications      enable row level security;

-- profiles: everyone signed in can read names (needed for pickers/labels);
-- only super_admin/admin can write other people's rows, everyone can edit their own.
create policy "profiles_select_all" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own_or_admin" on profiles for update
  using (id = auth.uid() or auth_role() in ('super_admin','admin'));
create policy "profiles_insert_admin" on profiles for insert
  with check (auth_role() in ('super_admin','admin'));

-- sections / subjects: staff can manage, everyone signed-in can read.
create policy "sections_select" on sections for select using (auth.uid() is not null);
create policy "sections_write" on sections for all using (is_staff()) with check (is_staff());
create policy "subjects_select" on subjects for select using (auth.uid() is not null);
create policy "subjects_write" on subjects for all using (is_staff()) with check (is_staff());

-- patients: staff see everything; a student sees only patients assigned to them.
create policy "patients_select" on patients for select
  using (is_staff() or assigned_student_id = auth.uid());
create policy "patients_write" on patients for all
  using (is_staff() or assigned_student_id = auth.uid())
  with check (is_staff() or assigned_student_id = auth.uid());

-- medical_histories: PHI — staff, or the student/supervisor on the record.
create policy "medhist_select" on medical_histories for select
  using (is_staff() or student_id = auth.uid() or supervisor_id = auth.uid());
create policy "medhist_write" on medical_histories for all
  using (is_staff() or student_id = auth.uid())
  with check (is_staff() or student_id = auth.uid());

-- cases / xrays / evaluations: staff, or the student/supervisor on the case.
create policy "cases_select" on cases for select
  using (is_staff() or student_id = auth.uid() or supervisor_id = auth.uid());
create policy "cases_write" on cases for all
  using (is_staff() or student_id = auth.uid())
  with check (is_staff() or student_id = auth.uid());

create policy "xrays_select" on xrays for select
  using (exists (select 1 from cases c where c.id = case_id and
    (is_staff() or c.student_id = auth.uid() or c.supervisor_id = auth.uid())));
create policy "xrays_write" on xrays for all
  using (exists (select 1 from cases c where c.id = case_id and (is_staff() or c.student_id = auth.uid())))
  with check (exists (select 1 from cases c where c.id = case_id and (is_staff() or c.student_id = auth.uid())));

create policy "evaluations_select" on evaluations for select
  using (is_staff() or student_id = auth.uid() or supervisor_id = auth.uid());
create policy "evaluations_write" on evaluations for all
  using (auth_role() in ('super_admin','admin','supervisor'))
  with check (auth_role() in ('super_admin','admin','supervisor'));

-- appointments / attendance: staff, or the student on the record.
create policy "appointments_select" on appointments for select
  using (is_staff() or student_id = auth.uid());
create policy "appointments_write" on appointments for all
  using (is_staff() or student_id = auth.uid())
  with check (is_staff() or student_id = auth.uid());

create policy "attendance_select" on attendance for select
  using (is_staff() or target_id = auth.uid() or recorded_by = auth.uid());
create policy "attendance_write" on attendance for all
  using (is_staff() or recorded_by = auth.uid())
  with check (is_staff() or recorded_by = auth.uid());

-- notifications: a user sees their own targeted ones, or role-wide/'all' ones.
create policy "notifications_select" on notifications for select
  using (target_user_id = auth.uid() or target_role = 'all' or target_role = auth_role());
create policy "notifications_write" on notifications for insert with check (true);
create policy "notifications_update_own" on notifications for update
  using (target_user_id = auth.uid() or is_staff());

-- ---------------------------------------------------------------------
-- 7. Storage bucket for X-ray images (private; served via signed URLs)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('xrays', 'xrays', false)
  on conflict (id) do nothing;

create policy "xrays_bucket_select" on storage.objects for select
  using (bucket_id = 'xrays' and auth.uid() is not null);
create policy "xrays_bucket_insert" on storage.objects for insert
  with check (bucket_id = 'xrays' and auth.uid() is not null);
