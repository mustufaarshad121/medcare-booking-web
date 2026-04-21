# Research: MedCare Health — Clinic Appointment Booking

**Phase**: 0 — Outline & Research  
**Date**: 2026-04-21  
**Updated**: 2026-04-21 — Added auth decisions  
**Branch**: `001-medcare-booking`

---

## Decision 1: Patient Authentication — Supabase Auth

**Decision**: Use Supabase Auth (email + password) for patient authentication. Sessions are managed via HTTP-only cookies using `@supabase/ssr`.

**Rationale**: Supabase Auth integrates directly with the existing Supabase PostgreSQL instance. It handles password hashing, session tokens, and refresh token rotation automatically. The `@supabase/ssr` package provides Next.js App Router-compatible helpers for reading sessions in Server Components and middleware. This eliminates building and securing a custom auth system.

**Session flow**:
1. Patient registers → Supabase Auth creates `auth.users` entry → session cookie set
2. Patient logs in → session cookie set → all subsequent requests carry the session
3. Middleware reads session on every request to protected routes
4. Patient logs out → Supabase Auth invalidates session → cookie cleared

**Alternatives considered**:
- NextAuth.js — rejected; adds a third-party auth abstraction over Supabase, introducing unnecessary complexity when Supabase Auth already exists
- JWT in localStorage — rejected; vulnerable to XSS; HTTP-only cookies are more secure
- Custom password hashing (bcrypt) — rejected; Supabase Auth handles this securely out of the box

---

## Decision 2: Admin Authentication — Hardcoded Server-Side Credential

**Decision**: Admin auth uses a server-side credential check against environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). A separate session is tracked via a signed HTTP-only cookie (`admin_session`). This is entirely independent of Supabase Auth.

**Rationale**: The spec requires a single admin user with fixed credentials (username: `admin`, password: `Admin1`). Using Supabase Auth for admin would require managing a second auth provider or mixing admin/patient user accounts in the same `auth.users` table — both add unnecessary complexity. A server-side credential check is the simplest correct implementation for an MVP admin surface.

**Security note**: Hardcoded admin credentials are acceptable for MVP/demo purposes only. In production, admin credentials should be stored as hashed values in environment configuration and admin accounts should be managed via a proper user management system.

**Implementation**:
- `lib/admin-auth.ts` exports `validateAdminCredentials(username, password): boolean`
- Reads from `process.env.ADMIN_USERNAME` and `process.env.ADMIN_PASSWORD`
- On success, `POST /api/admin/auth` sets a signed `admin_session` cookie
- All admin API routes verify the `admin_session` cookie before processing

**Alternatives considered**:
- Supabase Auth with a separate admin email account — rejected; conflates admin identity with patient auth system
- Supabase RLS + role-based access — rejected; overkill for a single-admin MVP
- Basic HTTP auth — rejected; not compatible with a proper login page UX

---

## Decision 3: Route Protection — Next.js Middleware

**Decision**: `app/middleware.ts` uses the Supabase session to protect patient routes and an `admin_session` cookie check to protect admin routes.

**Protected patient routes**: `/book`, `/bookings` → redirect to `/login` if no session  
**Protected admin routes**: `/admin` (but not `/admin/login`) → redirect to `/admin/login` if no admin session  
**Auth redirect routes**: `/login`, `/register` → redirect to `/` if already logged in

**Rationale**: Next.js middleware runs before page rendering on the server — protection cannot be bypassed by client-side JavaScript. This is the recommended pattern for Supabase Auth + Next.js App Router.

**Alternatives considered**:
- Client-side redirect in each page component — rejected; creates a flash of protected content before redirect
- Supabase RLS only — rejected; RLS protects data but does not redirect users to login

---

## Decision 4: Appointments Linked to auth.users via user_id

**Decision**: The `appointments` table gains a `user_id UUID` column referencing `auth.users(id)`. All patient-facing appointment queries filter by the authenticated user's `user_id`. Email is still stored for admin display but is no longer the lookup key.

**Rationale**: Linking appointments to `auth.users.id` ensures that a patient can only access their own bookings — even if two patients share an email (unlikely but theoretically possible). It also enables Supabase Row Level Security (RLS) policies that enforce `user_id = auth.uid()` at the database level.

**RLS policies**:
```sql
-- Patients can only SELECT their own appointments
create policy "patients_read_own" on appointments
  for select using (auth.uid() = user_id);

-- Patients can INSERT their own appointments  
create policy "patients_insert_own" on appointments
  for insert with check (auth.uid() = user_id);

-- Patients can UPDATE (cancel) their own confirmed appointments
create policy "patients_cancel_own" on appointments
  for update using (auth.uid() = user_id and status = 'confirmed');
```

The service role key (used in admin API routes) bypasses RLS — giving admin full access to all appointments.

**Alternatives considered**:
- Email-based lookup without `user_id` — rejected; removed from spec; not secure
- Supabase Auth metadata for storing patient name — rejected; name is better stored in a separate `profiles` table or as metadata

---

## Decision 5: Patient Profile Storage

**Decision**: Store patient's display name in Supabase Auth user metadata (`raw_user_meta_data`) at registration time, not in a separate `profiles` table.

**Rationale**: For MVP, storing name in Auth metadata avoids creating an additional `profiles` table and join. The name is only used for display in the admin dashboard (shown from appointment record) and in the booking confirmation.

**Implementation**: At registration, call `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`. The `full_name` from metadata is copied into the `patient_name` field of the `appointments` record at booking time.

**Alternatives considered**:
- Separate `profiles` table with `user_id` FK — considered; better for scalability but adds a table + join for MVP with no other profile fields needed

---

## Decision 6: 3-Step Booking Form State

**Decision**: Single `app/book/page.tsx` with `useState` step tracking (1 | 2 | 3 | 'confirmed'). The authenticated user's `id` is obtained from the session server-side and passed as a prop.

**Rationale**: Short linear wizard. No URL segments per step needed at this scale.

**Alternatives considered**: URL-per-step — rejected; requires state serialization, no benefit for 3 steps.

---

## Decision 7: Time Slot Generation

**Decision**: Generate time slots client-side from the selected date. No DB table.

**Slot rules**:
- Mon–Fri: `['8:00 AM', '9:00 AM', ... '5:00 PM']` (10 slots)
- Saturday: `['9:00 AM', '10:00 AM', ... '1:00 PM']` (5 slots)
- Sunday: no slots (date not selectable)

---

## Decision 8: Doctor Avatars

**Decision**: Initials + deterministic color from doctor's last name initial. No external images.

---

## Decision 9: CSS Design Token Strategy

**Brand palette**:
```
--color-primary:  #0f3460   /* Navy */
--color-accent:   #16a085   /* Teal */
--color-bg:       #f8fafc   /* Off-white */
--color-text:     #1a202c   /* Near-black */
--color-muted:    #64748b   /* Slate */
--color-success:  #059669   /* Green */
--color-danger:   #dc2626   /* Red */
```

---

## Decision 10: Doctor Seed Data Strategy

Seed `doctors` table via Supabase dashboard SQL editor (one-time, documented in `quickstart.md`).

**Doctors**:
| Name | Specialty | Location |
|------|-----------|----------|
| Dr. James Carter | Oncology | New York |
| Dr. Michael Harrison | Pulmonology | New York |
| Dr. Sarah Mitchell | Cardiology | London |
| Dr. Robert Andrews | Internal Medicine | Dubai |
| Dr. Elizabeth Thompson | Family Medicine | New York |
| Dr. William Foster | Oncology | London |
| Dr. Margaret Collins | Pulmonology | Dubai |

---

## All Clarifications Resolved

No `NEEDS CLARIFICATION` items remain.
