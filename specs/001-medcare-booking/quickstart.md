# Quickstart: MedCare Health

**Branch**: `001-medcare-booking`  
**Date**: 2026-04-21

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account and project (free tier sufficient)
- npm

---

## Step 1 — Clone & Install

```bash
git clone <repo-url>
cd medicare-booking-app
git checkout 001-medcare-booking
npm install
```

---

## Step 2 — Configure Environment

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Admin credentials (MVP — change for production)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin1
```

Find Supabase values in your dashboard → **Settings → API**.

> **Security**:
> - `SUPABASE_SERVICE_ROLE_KEY` is server-side only — never exposed to the browser
> - `ADMIN_PASSWORD` is server-side only — stored in env, never in code
> - Never commit `.env.local` to version control

---

## Step 3 — Enable Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication → Providers**
2. Ensure **Email** provider is enabled
3. Under **Email → Confirm email**: set to **disabled** for MVP (no email verification needed)

---

## Step 4 — Create Database Tables

In your Supabase dashboard → **SQL Editor**, run:

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Doctors table
create table public.doctors (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  specialty    text not null check (specialty in ('Oncology','Pulmonology','Cardiology','Internal Medicine','Family Medicine')),
  bio          text,
  location     text not null check (location in ('New York','London','Dubai')),
  avatar_color text not null default '#0f3460'
);

alter table public.doctors enable row level security;
create policy "public_read_doctors" on public.doctors
  for select using (true);

-- Appointments table
create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  doctor_id        uuid not null references public.doctors(id),
  patient_name     text not null,
  patient_email    text not null,
  patient_phone    text not null,
  appointment_date date not null,
  time_slot        text not null,
  location         text not null,
  status           text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at       timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "patients_read_own" on public.appointments
  for select using (auth.uid() = user_id);

create policy "patients_insert_own" on public.appointments
  for insert with check (auth.uid() = user_id);

create policy "patients_cancel_own" on public.appointments
  for update using (auth.uid() = user_id and status = 'confirmed')
  with check (status = 'cancelled');

create index idx_appointments_user_id on public.appointments (user_id);
create index idx_appointments_date on public.appointments (appointment_date desc);
```

---

## Step 5 — Seed Doctors

In the SQL Editor, run:

```sql
insert into public.doctors (name, specialty, location, bio, avatar_color) values
  ('Dr. James Carter',       'Oncology',          'New York', 'Board-certified oncologist with 20+ years specializing in lung and colorectal cancers.', '#0f3460'),
  ('Dr. Michael Harrison',   'Pulmonology',        'New York', 'Pulmonologist specializing in smoking-related lung disease, COPD, and respiratory cancer screening.', '#16a085'),
  ('Dr. Sarah Mitchell',     'Cardiology',         'London',   'Interventional cardiologist with expertise in preventive cardiology for adults over 45.', '#4f46e5'),
  ('Dr. Robert Andrews',     'Internal Medicine',  'Dubai',    'Internal medicine physician focusing on preventive care and cancer early detection.', '#0891b2'),
  ('Dr. Elizabeth Thompson', 'Family Medicine',    'New York', 'Family medicine specialist dedicated to preventive screenings and coordinated specialist referrals.', '#059669'),
  ('Dr. William Foster',     'Oncology',           'London',   'Consultant oncologist specializing in hereditary cancer syndromes and chemoprevention.', '#64748b'),
  ('Dr. Margaret Collins',   'Pulmonology',        'Dubai',    'Pulmonologist with special interest in smoking cessation and early detection of pulmonary conditions.', '#0f3460');
```

---

## Step 6 — Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Step 7 — Verify End-to-End

### Patient flow
1. `/register` — register with a new email (e.g., `james@test.com`)
2. After registration, verify you're redirected to home and the navbar shows "Logout"
3. `/book` — complete a booking (select doctor → date → time → phone → submit)
4. **Supabase → Table Editor → appointments** — confirm the record exists with your `user_id`
5. `/bookings` — your appointment appears (no email prompt needed)
6. Cancel the appointment — status updates to "Cancelled"
7. Click "Logout" — session ends
8. Try navigating to `/bookings` — redirected to `/login`

### Admin flow
1. `/admin/login` — enter `admin` / `Admin1`
2. Admin dashboard loads showing ALL appointments
3. Change the status of one appointment — confirm it updates
4. Register a second patient and book an appointment — admin dashboard shows both patients' bookings

---

## Build & Type Check

```bash
npm run build   # full type check + production build
npm run lint    # ESLint
```

Both must pass with zero errors before the feature is considered complete.

---

## Environment Variables Reference

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anon key for reads + Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS — admin API routes only |
| `ADMIN_USERNAME` | Server only | Admin login username |
| `ADMIN_PASSWORD` | Server only | Admin login password |
