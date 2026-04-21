# Implementation Plan: MedCare Health — Clinic Appointment Booking

**Branch**: `001-medcare-booking` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Updated**: 2026-04-21 — Added Supabase Auth, Admin Panel, removed email lookup

---

## Summary

Build a professional clinic appointment booking web application (MedCare Health) using Next.js 15 App Router, TypeScript, Tailwind CSS v4, and Supabase (PostgreSQL + Auth). Patients register, log in, and manage their own appointments via session-based authentication. A separate admin panel (hardcoded credentials, server-side) gives clinic staff full visibility and status control over all appointments. Targets adults 45+ in the USA/Canada market across three clinic locations (New York, London, Dubai).

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Framework**: Next.js 15.x — App Router (already bootstrapped)  
**Primary Dependencies**: `@supabase/supabase-js`, `lucide-react`, Tailwind CSS v4 (already installed)  
**Auth**: Supabase Auth — email + password (patient); hardcoded server-side check (admin)  
**Storage**: Supabase (PostgreSQL) — cloud-hosted, accessed via REST API  
**Session**: Supabase Auth session via `@supabase/ssr` + Next.js middleware for route protection  
**Testing**: Manual end-to-end verification via browser; `npm run build` for type-safety gate  
**Target Platform**: Web — desktop and mobile (375px minimum width)  
**Performance Goals**: Home page LCP < 3s on broadband; booking form submission < 2s round-trip  
**Constraints**: Protected routes (`/book`, `/bookings`, `/admin`) must redirect unauthenticated visitors; admin session is separate from patient session  
**Scale/Scope**: MVP — ~7 pre-seeded doctors, 3 locations, unlimited patient accounts  
**Project Type**: Full-stack web application (single Next.js project, App Router)

---

## Constitution Check

*Constitution template is unfilled — applying standard web application principles as defaults.*

| Gate | Status | Notes |
|------|--------|-------|
| Smallest viable change | PASS | Auth added as explicitly required; scope bounded |
| No hardcoded secrets | PASS | Supabase keys via `.env.local`; admin password in env var only |
| Protected routes enforce auth | PASS | Next.js middleware + Supabase session guards `/book`, `/bookings`, `/admin` |
| Mobile-first responsive | PASS | 375px minimum enforced via Tailwind utilities |
| Type safety | PASS | TypeScript strict mode throughout |
| No unrelated refactors | PASS | New files only; existing scaffolding replaced with feature content |
| Admin/patient auth isolated | PASS | Admin uses separate server-side credential; no patient session grants admin access |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-medcare-booking/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   └── appointments-api.md
└── tasks.md             ← Phase 2 output (/sp.tasks — not created here)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                        ← Update: MedCare metadata, import Header/Footer
├── globals.css                       ← Update: brand CSS variables (navy/teal)
├── page.tsx                          ← Replace: Home landing page (public)
├── register/
│   └── page.tsx                      ← New: Patient registration form
├── login/
│   └── page.tsx                      ← New: Patient login form
├── book/
│   └── page.tsx                      ← New: Book Appointment — protected (auth required)
├── bookings/
│   └── page.tsx                      ← New: My Bookings — protected (auth required), session-based
├── about/
│   └── page.tsx                      ← New: About & Contact (public)
├── admin/
│   ├── login/
│   │   └── page.tsx                  ← New: Admin login (separate credentials)
│   └── page.tsx                      ← New: Admin dashboard — protected (admin session)
├── middleware.ts                      ← New: Route protection via Supabase session
└── api/
    ├── appointments/
    │   ├── route.ts                   ← New: GET (patient's own) + POST (create)
    │   └── [id]/
    │       └── route.ts               ← New: PATCH (cancel — patient or admin)
    └── admin/
        ├── auth/
        │   └── route.ts               ← New: POST (admin login), DELETE (admin logout)
        └── appointments/
            ├── route.ts               ← New: GET all appointments (admin only)
            └── [id]/
                └── route.ts           ← New: PATCH status (admin only)

components/
├── layout/
│   ├── Header.tsx                     ← New: nav — logo, links, auth state (login/register/logout)
│   └── Footer.tsx                     ← New: 3-location addresses + copyright
├── home/
│   ├── HeroSection.tsx                ← New: full-width navy hero (CTA adapts to auth state)
│   ├── ServicesSection.tsx            ← New: 5 specialty cards
│   ├── DoctorsSection.tsx             ← New: 3 featured doctor cards
│   ├── WhyChooseUsSection.tsx         ← New: 3 trust pillars
│   └── LocationsSection.tsx           ← New: 3 clinic location cards
├── auth/
│   ├── RegisterForm.tsx               ← New: name + email + password form
│   └── LoginForm.tsx                  ← New: email + password form
├── booking/
│   ├── BookingForm.tsx                ← New: orchestrates 3-step flow
│   ├── DoctorCard.tsx                 ← New: selectable doctor tile
│   ├── TimeSlotPicker.tsx             ← New: slot grid
│   └── BookingConfirmation.tsx        ← New: success screen
├── bookings/
│   ├── BookingsList.tsx               ← New: list container (no email form — uses session)
│   ├── BookingCard.tsx                ← New: individual appointment card
│   └── CancelModal.tsx                ← New: confirm cancellation dialog
├── admin/
│   ├── AdminLoginForm.tsx             ← New: username + password form
│   └── AppointmentsTable.tsx          ← New: all-appointments table with status controls
└── ui/
    ├── Button.tsx                     ← New: primary/secondary/ghost/danger variants
    ├── Card.tsx                       ← New: reusable wrapper
    ├── Badge.tsx                      ← New: Confirmed/Cancelled status
    └── Modal.tsx                      ← New: accessible overlay

lib/
├── supabase/
│   ├── client.ts                      ← New: browser Supabase client (anon key)
│   ├── server.ts                      ← New: server Supabase client (service role, API routes)
│   └── middleware.ts                  ← New: Supabase session refresh helper
├── types.ts                           ← New: Doctor, Appointment, User, Location interfaces
├── data.ts                            ← New: clinic locations, time slot generator
└── admin-auth.ts                      ← New: server-side admin credential validation
```

**Structure Decision**: Single Next.js project (App Router). Auth middleware lives in `app/middleware.ts`. Supabase client split into `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (API routes) to prevent service role key exposure. Admin auth uses a dedicated server-side helper — completely separate from Supabase Auth patient sessions.

---

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## Implementation Phases

### Phase 0 — Research & Decisions
> See `research.md` for full findings.

Key decisions:
1. Supabase Auth for patient auth — email + password, sessions via cookies
2. Admin auth — hardcoded server-side credential, separate from Supabase Auth
3. Next.js middleware for route protection — checks Supabase session before rendering protected pages
4. Appointments linked to `auth.users.id` via `user_id` FK — not email string
5. 3-step booking form — single page with `useState` step tracking
6. Time slots — computed client-side, no DB table
7. Doctor avatars — initials + deterministic color

### Phase 1 — Data Model & Contracts
> See `data-model.md` and `contracts/appointments-api.md`.

Two Supabase tables: `doctors` (seeded, read-only) and `appointments` (with `user_id` FK to `auth.users`).  
Patient API routes: `GET /api/appointments`, `POST /api/appointments`, `PATCH /api/appointments/[id]`.  
Admin API routes: `POST /api/admin/auth`, `GET /api/admin/appointments`, `PATCH /api/admin/appointments/[id]`.

### Phase 2 — Tasks
> Generated by `/sp.tasks`. Not part of this command.
