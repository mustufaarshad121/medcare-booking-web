# Tasks: MedCare Health — Clinic Appointment Booking

**Input**: Design documents from `/specs/001-medcare-booking/`  
**Branch**: `001-medcare-booking`  
**Date**: 2026-04-21  
**Tech Stack**: Next.js 15 App Router · TypeScript 5 strict · Tailwind CSS v4 · Supabase (PostgreSQL + Auth) · lucide-react  
**Tests**: Not requested — no test tasks generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1–US7)

---

## Phase 1: Setup

**Purpose**: Install dependencies and configure the project environment.

- [ ] T001 Install dependencies: run `npm install lucide-react @supabase/supabase-js @supabase/ssr` in project root
- [ ] T002 Create `.env.local` at project root with variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD=Admin1`
- [ ] T003 [P] Run Supabase SQL schema (from `specs/001-medcare-booking/data-model.md`) in Supabase dashboard SQL Editor to create `doctors` and `appointments` tables with RLS policies
- [ ] T004 [P] Run doctor seed SQL (from `specs/001-medcare-booking/data-model.md`) in Supabase dashboard SQL Editor to populate 7 doctors
- [ ] T005 [P] Enable Supabase Auth email provider in Supabase dashboard → Authentication → Providers → Email → disable email confirmation for MVP

**Checkpoint**: Dependencies installed, `.env.local` set, database tables created and seeded, auth enabled.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. Must complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create `lib/types.ts` — define and export `Doctor`, `Appointment`, `ClinicLocation`, `BookingFormData`, `Specialty`, `ClinicCity`, `AppointmentStatus` interfaces as specified in `specs/001-medcare-booking/data-model.md`
- [x] T007 [P] Create `lib/data.ts` — export `CLINIC_LOCATIONS` array (3 locations: New York, London, Dubai with address/phone/hours/timezone) and `getTimeSlots(date: Date): string[]` function returning Mon–Fri 8AM–5PM or Sat 9AM–1PM slots, empty for Sunday
- [x] T008 [P] Create `lib/supabase/client.ts` — export `createBrowserClient()` using `createBrowserClient` from `@supabase/ssr` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] T009 [P] Create `lib/supabase/server.ts` — export `createServerClient()` using cookies from `next/headers`; export `createServiceClient()` using `SUPABASE_SERVICE_ROLE_KEY` for admin API routes
- [x] T010 [P] Create `lib/supabase/middleware.ts` — export `updateSession(request)` helper that refreshes the Supabase session cookie on every request using `@supabase/ssr`
- [x] T011 [P] Create `lib/admin-auth.ts` — export `validateAdminCredentials(username: string, password: string): boolean` comparing against `process.env.ADMIN_USERNAME` and `process.env.ADMIN_PASSWORD`; export `ADMIN_SESSION_COOKIE = 'admin_session'`
- [x] T012 Create `middleware.ts` at project root — protect `/book` and `/bookings` (redirect to `/login` if no Supabase session); protect `/admin` (redirect to `/admin/login` if no `admin_session` cookie); redirect `/login` and `/register` to `/` if session exists; call `updateSession` from `lib/supabase/middleware.ts` on every request
- [x] T013 [P] Create `components/ui/Button.tsx` — variants: `primary` (navy bg), `secondary` (teal outline), `ghost` (transparent), `danger` (red bg); sizes: `sm`, `md`, `lg`; accepts `className`, `disabled`, `onClick`, `type` props
- [x] T014 [P] Create `components/ui/Card.tsx` — wrapper with white bg, rounded-lg, shadow-sm, `p-6` padding; accepts `className` and `children` props
- [x] T015 [P] Create `components/ui/Badge.tsx` — two variants: `confirmed` (green bg/text) and `cancelled` (red bg/text); displays status label in uppercase small caps
- [x] T016 [P] Create `components/ui/Modal.tsx` — accessible overlay with backdrop; traps focus; closes on Escape key or backdrop click; accepts `isOpen`, `onClose`, `title`, `children` props
- [x] T017 Update `app/globals.css` — add brand CSS variables: `--color-primary: #0f3460`, `--color-accent: #16a085`, `--color-bg: #f8fafc`, `--color-text: #1a202c`, `--color-muted: #64748b`, `--color-success: #059669`, `--color-danger: #dc2626`; set body background to `--color-bg`
- [x] T018 Create `components/layout/Header.tsx` — logo "MedCare Health" (navy, left); nav links: Home, Book Appointment, My Bookings, About; right side: if logged in show patient email + Logout button; if logged out show Login + Register buttons; mobile hamburger menu; uses Supabase browser client to read session state
- [x] T019 Create `components/layout/Footer.tsx` — three-column layout with address/phone for New York, London, Dubai; bottom row: copyright "© 2026 MedCare Health. All rights reserved."; links: Privacy Policy, Terms of Service (placeholder anchors)
- [x] T020 Update `app/layout.tsx` — set metadata title "MedCare Health", description "Professional clinic appointment booking for adults 45+"; import and render `Header` and `Footer` around `{children}`; apply `--color-bg` body background

**Checkpoint**: Foundation complete — types, Supabase clients, auth middleware, UI primitives, and layout shell are all ready.

---

## Phase 3: User Story 2 — Patient Registration (Priority: P2)

**Implementation note**: US2 and US3 (auth) are implemented before US1 (booking) because booking requires an authenticated session to test end-to-end.

**Goal**: New patients can create an account. After registration they are logged in and redirected home.

**Independent Test**: Navigate to `/register`, submit name + email + password. Redirected to `/`. Navbar shows email + Logout. Navigate to `/bookings` — empty state, no login prompt.

- [x] T021 [US2] Create `components/auth/RegisterForm.tsx` — form with fields: Full Name, Email, Password (min 8 chars); submit calls `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`; shows inline error for email-already-in-use and password-too-short; on success, router.push('/'); disable submit button during loading
- [x] T022 [US2] Create `app/register/page.tsx` — centered card layout; renders `RegisterForm`; includes "Already have an account? Log in" link to `/login`; page title "Create Your Account"

**Checkpoint**: Patient registration works. User can sign up and is automatically logged in.

---

## Phase 4: User Story 3 — Patient Login & Logout (Priority: P3)

**Goal**: Registered patients can log in with email + password. Logout terminates the session. Protected pages redirect correctly.

**Independent Test**: Navigate to `/login`, submit valid credentials — redirected to `/`. Navbar shows Logout. Click Logout — redirected to `/`. Navigate to `/bookings` — redirected to `/login`.

- [x] T023 [US3] Create `components/auth/LoginForm.tsx` — form with Email and Password fields; calls `supabase.auth.signInWithPassword({ email, password })`; shows generic error "Invalid email or password" on failure (do not distinguish which field is wrong); on success, router.push('/'); disable submit during loading
- [x] T024 [US3] Create `app/login/page.tsx` — centered card layout; renders `LoginForm`; includes "Don't have an account? Register" link to `/register`; page title "Sign In to MedCare Health"
- [x] T025 [US3] Update `components/layout/Header.tsx` — add Logout button that calls `supabase.auth.signOut()` then router.push('/'); show patient's `user_metadata.full_name` or email in nav when logged in; Header must react to session changes (use `supabase.auth.onAuthStateChange`)

**Checkpoint**: Login, session display, and logout all work. Route protection verified (unauthenticated visits to `/bookings` redirect to `/login`).

---

## Phase 5: User Story 1 — Book a Doctor Appointment (Priority: P1) 🎯 Core Value

**Goal**: Logged-in patients can browse doctors, select one, pick a date/time, and submit a booking. Booking is stored linked to their account.

**Independent Test**: Log in → `/book` → select Oncology doctor → choose a weekday date → select 10:00 AM slot → submit → confirmation screen appears → check Supabase appointments table for record with correct `user_id`.

- [x] T026 [US1] Create `app/api/appointments/route.ts` — `GET`: reads session from `createServerClient()`, queries `appointments` with `user_id = auth.uid()` joined with `doctors`, returns array; `POST`: validates body fields (doctor_id, patient_phone, appointment_date not Sunday/not >30 days, time_slot valid for day, location), reads patient_name + patient_email from session, inserts record with `user_id`; returns 401 if no session, 400 for validation errors with `fields` object
- [x] T027 [US1] Create `app/api/appointments/[id]/route.ts` — `PATCH`: reads session, verifies appointment `user_id = auth.uid()`, checks current status is 'confirmed', updates status to 'cancelled'; returns 401/403/404/409 errors as per contract
- [x] T028 [P] [US1] Create `components/booking/DoctorCard.tsx` — displays doctor avatar (initials circle with `avatar_color`), name, specialty, location badge, bio excerpt; accepts `doctor: Doctor`, `isSelected: boolean`, `onSelect: () => void`; selected state shows teal border + checkmark
- [x] T029 [P] [US1] Create `components/booking/TimeSlotPicker.tsx` — grid of time slot buttons (2 per row on mobile, 4 on desktop); calls `getTimeSlots(date)` from `lib/data.ts`; highlights selected slot in teal; accepts `date: Date`, `selectedSlot: string | null`, `onSelect: (slot: string) => void`
- [x] T030 [P] [US1] Create `components/booking/BookingConfirmation.tsx` — success screen with green checkmark icon, booking summary (doctor name, specialty, date formatted as "Monday, April 28 2026", time slot, location), "View My Bookings" button linking to `/bookings`, "Book Another Appointment" button
- [x] T031 [US1] Create `components/booking/BookingForm.tsx` — 3-step wizard managed with `useState(step: 1 | 2 | 3 | 'confirmed')`; step indicator bar showing current step; Step 1: specialty + location filter dropdowns + DoctorCard grid; Step 2: date picker (native `<input type="date">` min=today, max=today+30days, skip Sundays via `min`/`max` + validation) + TimeSlotPicker; Step 3: phone number input + review summary + submit button; calls `POST /api/appointments`; on success renders BookingConfirmation
- [x] T032 [US1] Create `app/book/page.tsx` — server component that reads session via `createServerClient()`, passes user data to `BookingForm` as props; fetches all doctors from Supabase via service client; renders page title "Book an Appointment" with step wizard

**Checkpoint**: Full booking flow works end-to-end for authenticated patients.

---

## Phase 6: User Story 4 — View & Cancel My Bookings (Priority: P4)

**Goal**: Logged-in patients see ONLY their own appointments. They can cancel confirmed ones. No email input — session determines whose bookings to show.

**Independent Test**: Log in as Patient A → `/bookings` → see only Patient A's appointments. Cancel one → status changes. Log in as Patient B → cannot see Patient A's appointments.

- [x] T033 [US4] Create `components/bookings/CancelModal.tsx` — Modal wrapper with title "Cancel Appointment?", body showing appointment date + doctor name, two buttons: "Keep Appointment" (closes modal) and "Yes, Cancel It" (danger variant, triggers cancellation)
- [x] T034 [P] [US4] Create `components/bookings/BookingCard.tsx` — displays Badge (status), doctor avatar + name + specialty, appointment date (formatted), time slot, location; if status is 'confirmed' shows "Cancel" button that opens CancelModal; calls `PATCH /api/appointments/[id]` on confirm; updates local state without full page reload
- [x] T035 [US4] Create `components/bookings/BookingsList.tsx` — fetches `GET /api/appointments` on mount; renders BookingCard for each result sorted by date descending; shows empty state with "Book Your First Appointment →" link if no appointments; shows loading skeleton while fetching
- [x] T036 [US4] Create `app/bookings/page.tsx` — server component confirming session exists (middleware handles redirect if not); renders page title "My Appointments"; renders `BookingsList` client component

**Checkpoint**: Patients can view and cancel their own bookings. Data isolation verified.

---

## Phase 7: User Story 5 — Admin Panel (Priority: P5)

**Goal**: Admin logs in separately, sees ALL appointments across all patients, and can update any appointment's status.

**Independent Test**: Navigate to `/admin/login` → enter `admin`/`Admin1` → redirected to `/admin` → all appointments visible → change one status → change persists → log out as patient and check that patient's My Bookings reflects the admin's change.

- [x] T037 [US5] Create `app/api/admin/auth/route.ts` — `POST`: calls `validateAdminCredentials(username, password)`, sets HTTP-only `admin_session=authenticated` cookie (SameSite=Strict, maxAge=86400, httpOnly=true) on success, returns 401 on failure; `DELETE`: clears `admin_session` cookie
- [x] T038 [US5] Create `app/api/admin/appointments/route.ts` — `GET`: verifies `admin_session` cookie, queries all appointments via `createServiceClient()` joined with doctors, supports optional `status` and `location` query params, orders by `appointment_date desc`; returns 401 if no admin session
- [x] T039 [US5] Create `app/api/admin/appointments/[id]/route.ts` — `PATCH`: verifies `admin_session` cookie, validates `status` is 'confirmed' or 'cancelled', updates appointment via `createServiceClient()` (bypasses RLS); returns 401/400/404 as per contract
- [x] T040 [P] [US5] Create `components/admin/AdminLoginForm.tsx` — form with Username and Password fields; calls `POST /api/admin/auth`; shows "Invalid credentials" error on 401; on success router.push('/admin')
- [x] T041 [P] [US5] Create `components/admin/AppointmentsTable.tsx` — table with columns: Patient Name, Patient Email, Doctor, Specialty, Location, Date, Time, Status; Status column renders a `<select>` with 'confirmed'/'cancelled' options; on change calls `PATCH /api/admin/appointments/[id]` and updates row immediately; includes filter bar at top for status and location; shows row count
- [x] T042 [US5] Create `app/admin/login/page.tsx` — centered card with "Admin Portal" heading; renders `AdminLoginForm`; no links to patient login
- [x] T043 [US5] Create `app/admin/page.tsx` — server component verifying `admin_session` cookie (middleware handles redirect); fetches initial appointment data via `GET /api/admin/appointments`; renders page title "Appointments Dashboard" with count; renders `AppointmentsTable` client component with initial data

**Checkpoint**: Admin can log in, see all appointments, and update statuses. Admin route protected from unauthenticated access and from patient sessions.

---

## Phase 8: User Story 6 — Home Page & Clinic Information (Priority: P6)

**Goal**: Publicly accessible landing page that builds trust and drives bookings. CTAs adapt to auth state.

**Independent Test**: Navigate to `/` without logging in — all sections visible. "Book Appointment" CTA links to `/login`. Log in — "Book Appointment" CTA links to `/book`.

- [x] T044 [P] [US6] Create `components/home/HeroSection.tsx` — full-width section with `--color-primary` background; headline "Expert Care for Your Health Journey"; subheadline targeting 45+ demographic (cancer screening, smoking cessation, preventive specialists); two CTA buttons: "Book Appointment" (links to `/book` if logged in, `/login` if not) and "Meet Our Doctors" (smooth scrolls to doctors section); accepts `isLoggedIn: boolean` prop
- [x] T045 [P] [US6] Create `components/home/ServicesSection.tsx` — section with heading "Our Specialties"; 5 specialty cards each with a lucide-react icon, specialty name, and 1-sentence description; specialties: Oncology, Pulmonology, Cardiology, Internal Medicine, Family Medicine
- [x] T046 [P] [US6] Create `components/home/DoctorsSection.tsx` — section with heading "Meet Our Specialists"; fetches doctors via Supabase browser client; displays 3 featured doctor cards (first 3 results); each card shows initials avatar, name, specialty, location, "Book Now" button; "Book Now" links to `/login` for logged-out visitors, `/book` for logged-in
- [x] T047 [P] [US6] Create `components/home/WhyChooseUsSection.tsx` — 3-column grid with trust pillars: "Board-Certified Specialists" (shield icon), "3 Global Locations" (map-pin icon), "Same-Week Appointments" (calendar icon); each pillar has icon, title, and 2-sentence description
- [x] T048 [P] [US6] Create `components/home/LocationsSection.tsx` — section with heading "Our Locations"; 3 cards using `CLINIC_LOCATIONS` from `lib/data.ts`; each card shows city name, full address, phone number, weekday hours, Saturday hours; uses Map icon from lucide-react
- [x] T049 [US6] Replace `app/page.tsx` — server component reading session state via `createServerClient()`; renders HeroSection (passes `isLoggedIn`), ServicesSection, DoctorsSection, WhyChooseUsSection, LocationsSection in order

**Checkpoint**: Home page renders all sections. CTAs correctly adapt between logged-in and logged-out state.

---

## Phase 9: User Story 7 — About & Contact (Priority: P7)

**Goal**: Public page with clinic mission, location details, and a contact form.

**Independent Test**: Navigate to `/about` without logging in — mission statement, 3 location cards, and contact form all render. Submit the contact form — success message appears.

- [x] T050 [P] [US7] Create `app/about/page.tsx` — sections: (1) Mission section with heading "About MedCare Health" and 2-paragraph statement focused on preventive care for adults 45+, cancer risk, and smoking cessation; (2) Locations section rendering 3 `Card` components from `CLINIC_LOCATIONS` with address, phone, hours; (3) Contact form section
- [x] T051 [US7] Add contact form to `app/about/page.tsx` — client component embedded in page; fields: Full Name, Email, Message (textarea); on submit shows success message "Thank you, we'll be in touch shortly." (client-side only, no API call); validates fields are non-empty before submit

**Checkpoint**: About page is publicly accessible and fully rendered.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration checks, responsive polish, and build validation.

- [x] T052 Verify mobile responsiveness — test all pages at 375px width: Header hamburger menu works, booking form steps stack correctly, admin table scrolls horizontally on mobile, doctor cards stack to single column
- [x] T053 [P] Add 404 page — create `app/not-found.tsx` with "Page not found" message and "Go Home" button
- [x] T054 [P] Add loading states — create `app/loading.tsx` (global loading spinner); add loading skeleton to `BookingsList.tsx` and `AppointmentsTable.tsx` while data fetches
- [x] T055 Update `.env.local.example` at project root — copy of `.env.local` with placeholder values and comments for each variable (safe to commit)
- [x] T056 Run `npm run build` — resolve any TypeScript errors or ESLint violations until build passes with zero errors
- [ ] T057 Run full end-to-end verification per `specs/001-medcare-booking/quickstart.md` — patient registration → booking → My Bookings → cancel → admin login → dashboard → status update

**Checkpoint**: Build passes. All user stories verified end-to-end.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 — **blocks all user stories**
- **Phase 3–9 (User Stories)**: Require Phase 2 complete; can proceed in priority order or in parallel
- **Phase 10 (Polish)**: Requires all user story phases complete

### User Story Dependencies

| Story | Depends On | Notes |
|-------|-----------|-------|
| US2 Registration (Phase 3) | Phase 2 | No story dependencies |
| US3 Login/Logout (Phase 4) | Phase 2 | Builds on US2 (needs registered user) |
| US1 Book Appointment (Phase 5) | Phase 2 + US2 + US3 | Requires logged-in session to test E2E |
| US4 My Bookings (Phase 6) | Phase 2 + US1 | Needs appointments to display |
| US5 Admin Panel (Phase 7) | Phase 2 | Independent of patient auth; needs appointments to display |
| US6 Home Page (Phase 8) | Phase 2 | Independent — public page |
| US7 About (Phase 9) | Phase 2 | Independent — public page |

### Within Each Phase

- Tasks marked `[P]` within the same phase can be worked on simultaneously (different files)
- API routes (T026, T027, T037–T039) should be completed before their corresponding UI components
- Middleware (T012) must be complete before any protected page can be tested

### Parallel Opportunities

**Phase 2 parallel group** (T007–T016 all touch different files):
```
T007 lib/data.ts
T008 lib/supabase/client.ts
T009 lib/supabase/server.ts
T010 lib/supabase/middleware.ts
T011 lib/admin-auth.ts
T013 components/ui/Button.tsx
T014 components/ui/Card.tsx
T015 components/ui/Badge.tsx
T016 components/ui/Modal.tsx
```

**Phase 5 parallel group**:
```
T028 components/booking/DoctorCard.tsx
T029 components/booking/TimeSlotPicker.tsx
T030 components/booking/BookingConfirmation.tsx
```

**Phase 8 parallel group**:
```
T044 components/home/HeroSection.tsx
T045 components/home/ServicesSection.tsx
T046 components/home/DoctorsSection.tsx
T047 components/home/WhyChooseUsSection.tsx
T048 components/home/LocationsSection.tsx
```

---

## Parallel Execution Examples

### Phase 2 Foundational — Parallel
```bash
# All these touch different files, run simultaneously:
Task: "T007 lib/data.ts — CLINIC_LOCATIONS + getTimeSlots()"
Task: "T008 lib/supabase/client.ts — browser Supabase client"
Task: "T009 lib/supabase/server.ts — server + service clients"
Task: "T010 lib/supabase/middleware.ts — session refresh"
Task: "T011 lib/admin-auth.ts — admin credential validation"
Task: "T013 components/ui/Button.tsx"
Task: "T014 components/ui/Card.tsx"
Task: "T015 components/ui/Badge.tsx"
Task: "T016 components/ui/Modal.tsx"
```

### Phase 5 US1 — Parallel components, then integrate
```bash
# Step 1 — parallel:
Task: "T026 app/api/appointments/route.ts"
Task: "T027 app/api/appointments/[id]/route.ts"
Task: "T028 components/booking/DoctorCard.tsx"
Task: "T029 components/booking/TimeSlotPicker.tsx"
Task: "T030 components/booking/BookingConfirmation.tsx"

# Step 2 — after parallel tasks above:
Task: "T031 components/booking/BookingForm.tsx"
Task: "T032 app/book/page.tsx"
```

---

## Implementation Strategy

### MVP (Phases 1–5 only — auth + booking)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **required before anything else**
3. Complete Phase 3: US2 Registration
4. Complete Phase 4: US3 Login/Logout
5. Complete Phase 5: US1 Book Appointment
6. **STOP and VALIDATE**: Patient can register → log in → book an appointment → see it in Supabase

### Full Delivery (Phases 1–10)

Add phases 6–9 in order after MVP is validated. Each phase is independently deployable.

### Summary

| Phase | Tasks | Stories | Can Parallelize |
|-------|-------|---------|----------------|
| Phase 1: Setup | T001–T005 | — | T003, T004, T005 |
| Phase 2: Foundational | T006–T020 | — | T007–T016 |
| Phase 3: US2 Registration | T021–T022 | US2 | — |
| Phase 4: US3 Login/Logout | T023–T025 | US3 | — |
| Phase 5: US1 Book Appointment | T026–T032 | US1 | T026–T030 |
| Phase 6: US4 My Bookings | T033–T036 | US4 | T033, T034 |
| Phase 7: US5 Admin Panel | T037–T043 | US5 | T040, T041 |
| Phase 8: US6 Home Page | T044–T049 | US6 | T044–T048 |
| Phase 9: US7 About & Contact | T050–T051 | US7 | T050 |
| Phase 10: Polish | T052–T057 | — | T053, T054, T055 |
| **Total** | **57 tasks** | **7 stories** | |

---

## Notes

- `[P]` = different files, safe to implement simultaneously
- `[Story]` label maps each task to its user story for traceability
- Admin panel (US5/Phase 7) is independent of patient auth stories — can be developed in parallel after Phase 2
- Commit after each phase checkpoint
- Verify `npm run build` passes after Phase 5 (MVP) and again after Phase 10 (full)
