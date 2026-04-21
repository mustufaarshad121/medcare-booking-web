# Feature Specification: MedCare Health — Clinic Appointment Booking

**Feature Branch**: `001-medcare-booking`  
**Created**: 2026-04-21  
**Updated**: 2026-04-21  
**Status**: Updated  

---

## Overview

MedCare Health is a professional clinic appointment booking web application. Patients create an account, log in, book appointments with specialist doctors at one of three clinic locations, and manage their own appointments. Access to appointments is protected by session-based authentication — patients only see their own bookings. A separate admin interface allows clinic staff to view all appointments across all patients and update appointment status.

The application serves adults aged 45 and older, with a particular focus on individuals who smoke or have a family history of cancer. The business operates across three locations: New York (USA), London (UK), and Dubai (UAE). All content is tailored for the USA and Canada market.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Book a Doctor Appointment (Priority: P1)

A logged-in patient browses available doctors filtered by specialty or location, selects a doctor, chooses a convenient date and time slot, and submits the booking. They receive on-screen confirmation with their booking summary. The booking is stored against their authenticated account.

**Why this priority**: This is the core value proposition. All other features support or depend on this flow.

**Independent Test**: Log in as a patient, navigate to `/book`, select a doctor, choose a date and time slot, and submit. A confirmation screen appears. The booking appears in the patient's My Bookings page.

**Acceptance Scenarios**:

1. **Given** a logged-in patient is on the Book Appointment page, **When** they filter by "Oncology" specialty, **Then** only Oncology doctors are displayed.
2. **Given** a logged-in patient has selected a doctor and date, **When** they view available time slots, **Then** only slots within Mon–Sat operating hours are shown in 1-hour increments.
3. **Given** a logged-in patient has completed all booking steps, **When** they submit the form, **Then** a booking confirmation is displayed with doctor name, specialty, date, time, and location.
4. **Given** a patient is not logged in, **When** they attempt to access `/book`, **Then** they are redirected to `/login`.
5. **Given** a logged-in patient selects a Saturday, **When** viewing time slots, **Then** slots are limited to 9:00 AM–2:00 PM only.

---

### User Story 2 - Patient Registration (Priority: P2)

A new patient visits the site, navigates to the registration page, provides their full name, email address, and a password, and creates an account. After successful registration they are automatically logged in and redirected to the home page.

**Why this priority**: Registration is the gateway to all authenticated features. Without it, patients cannot book or view appointments.

**Independent Test**: Navigate to `/register`, enter a unique email, full name, and a valid password, submit. User is logged in and redirected to `/`. My Bookings at `/bookings` shows an empty state (no appointments yet).

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page, **When** they submit a valid name, email, and password, **Then** their account is created and they are logged in and redirected to the home page.
2. **Given** a visitor submits a password shorter than 8 characters, **When** they attempt to register, **Then** an error message is displayed and registration is prevented.
3. **Given** a visitor submits an email already in use, **When** they attempt to register, **Then** an error message states the email is already registered.
4. **Given** a visitor is already logged in, **When** they navigate to `/register`, **Then** they are redirected to the home page.

---

### User Story 3 - Patient Login & Logout (Priority: P3)

A registered patient navigates to the login page, enters their email and password, and is authenticated. A logout button in the navigation bar ends their session. After logout, protected pages are no longer accessible.

**Why this priority**: Login and logout form the authentication lifecycle. Without them, registration is useless.

**Independent Test**: Navigate to `/login`, enter valid credentials, submit. User is redirected to home page. Navbar shows logout button. Click logout — session ends, user is redirected to home page. Attempting `/bookings` redirects to `/login`.

**Acceptance Scenarios**:

1. **Given** a registered patient enters correct email and password, **When** they submit the login form, **Then** they are authenticated and redirected to the home page.
2. **Given** a patient enters an incorrect password, **When** they submit, **Then** an error message is shown and they remain on the login page.
3. **Given** a logged-in patient clicks "Logout" in the navbar, **When** the action completes, **Then** their session is terminated and they are redirected to the home page.
4. **Given** a logged-out visitor attempts to access `/bookings`, **When** the page loads, **Then** they are redirected to `/login`.
5. **Given** a visitor is already logged in, **When** they navigate to `/login`, **Then** they are redirected to the home page.

---

### User Story 4 - View & Cancel My Bookings (Priority: P4)

A logged-in patient navigates to My Bookings and sees only their own appointments (confirmed and cancelled). They can cancel a confirmed appointment through a confirmation dialog. No email lookup is required — appointments are loaded from their authenticated session.

**Why this priority**: Patients must be able to manage their own appointments, and this must be secure — patients must never see another patient's appointments.

**Independent Test**: Log in, navigate to `/bookings`. Only appointments booked under this account are displayed. Cancel one confirmed appointment via the dialog. Status updates to "Cancelled." Log out, log in as a different account — that account's bookings do not include the first patient's appointments.

**Acceptance Scenarios**:

1. **Given** a logged-in patient navigates to My Bookings, **When** the page loads, **Then** only appointments associated with their account are displayed — no email input required.
2. **Given** a logged-in patient has a confirmed appointment, **When** they click "Cancel" and confirm in the dialog, **Then** the appointment status changes to "Cancelled" and the cancel button is removed.
3. **Given** a logged-in patient has no appointments, **When** they view My Bookings, **Then** an empty state with a "Book an Appointment" link is shown.
4. **Given** two patients each have bookings, **When** Patient A views My Bookings, **Then** Patient B's appointments are never visible.
5. **Given** a logged-out visitor attempts to access `/bookings`, **When** the page loads, **Then** they are redirected to `/login`.

---

### User Story 5 - Admin Login & Appointment Dashboard (Priority: P5)

A clinic administrator navigates to `/admin/login`, enters the admin credentials, and is authenticated. The admin dashboard displays all appointments across all patients with doctor name, patient name, date, time, location, and current status. The admin can change any appointment's status between confirmed and cancelled.

**Why this priority**: Clinic staff need operational visibility and control. This is a secondary surface separate from the patient experience.

**Independent Test**: Navigate to `/admin/login`, enter admin credentials (username: admin, password: Admin1), submit. Admin dashboard loads showing all appointments from all patients. Change the status of one appointment — the change persists and is reflected in the patient's My Bookings view.

**Acceptance Scenarios**:

1. **Given** an admin enters the correct credentials, **When** they submit the login form, **Then** they are authenticated and redirected to the admin dashboard at `/admin`.
2. **Given** an admin enters incorrect credentials, **When** they submit, **Then** an error is displayed and they remain on `/admin/login`.
3. **Given** an admin is on the dashboard, **When** the page loads, **Then** ALL appointments from all patients are displayed, including doctor name, patient name, date, time, location, and status.
4. **Given** an admin views a confirmed appointment, **When** they change its status to "Cancelled", **Then** the status updates immediately in the dashboard and in the patient's My Bookings view.
5. **Given** an unauthenticated visitor attempts to access `/admin`, **When** the page loads, **Then** they are redirected to `/admin/login`.

---

### User Story 6 - Browse Home Page & Clinic Information (Priority: P6)

A prospective patient lands on the home page and can browse clinic information, doctor previews, and specialties without logging in. CTAs guide them to register or log in before booking.

**Why this priority**: The landing page is public and builds trust, but it does not require authentication.

**Independent Test**: Navigate to `/` without being logged in. All sections render. "Book Appointment" CTA redirects to `/login` (not `/book` directly) for unauthenticated visitors.

**Acceptance Scenarios**:

1. **Given** a visitor is on the home page without being logged in, **When** the page loads, **Then** the hero section, specialties, featured doctors, trust pillars, and clinic locations are all visible.
2. **Given** a logged-out visitor clicks "Book Appointment", **When** redirected, **Then** they land on `/login` with a prompt to log in or register.
3. **Given** a logged-in patient clicks "Book Appointment", **When** clicked, **Then** they are taken directly to `/book`.

---

### User Story 7 - About & Contact (Priority: P7)

A visitor navigates to the About & Contact page to learn about the clinic's mission and find location details.

**Why this priority**: Informational page, publicly accessible, lowest priority.

**Independent Test**: Navigate to `/about`. Mission statement, three location cards, and contact form are all visible without logging in.

**Acceptance Scenarios**:

1. **Given** any visitor (logged in or not) is on the About page, **When** the page loads, **Then** a mission statement focused on preventive care for adults 45+ is displayed.
2. **Given** a visitor submits the contact form with name, email, and message, **When** submitted, **Then** a success acknowledgment is shown.
3. **Given** a visitor views location cards, **When** reading each card, **Then** full address, phone number, and operating hours are visible for all three locations.

---

### Edge Cases

- What happens when a patient tries to book a time slot on a Sunday? Sunday slots must not be shown or selectable.
- What happens when a patient submits registration with an invalid email format? Validation must reject and show an error.
- What happens when a patient's session expires mid-booking? They are redirected to `/login`; the booking is not saved.
- What happens when a patient cancels an already-cancelled appointment? The cancel button is not shown for cancelled appointments.
- What happens when the date picker goes beyond 30 days in the future? Dates beyond 30 days from today must not be selectable.
- What happens when an admin tries to access `/admin` without logging in? They are redirected to `/admin/login`.
- What happens when a logged-in patient tries to access `/admin`? They are redirected to `/admin/login` (admin auth is separate from patient auth).

---

## Requirements *(mandatory)*

### Functional Requirements

**Patient Authentication:**
- **FR-001**: The system MUST provide a `/register` page where new patients can create an account with full name, email address, and password.
- **FR-002**: The system MUST validate that passwords are at least 8 characters long during registration.
- **FR-003**: The system MUST prevent registration with an email address that is already in use, displaying a clear error message.
- **FR-004**: Upon successful registration, the system MUST automatically log the patient in and redirect them to the home page.
- **FR-005**: The system MUST provide a `/login` page where registered patients can authenticate with email and password.
- **FR-006**: The system MUST display a clear error message when login credentials are incorrect, without revealing whether the email or password was wrong.
- **FR-007**: The navigation bar MUST display a "Logout" button when a patient is logged in.
- **FR-008**: Clicking "Logout" MUST terminate the patient's session and redirect them to the home page.
- **FR-009**: The system MUST redirect unauthenticated visitors from protected pages (`/book`, `/bookings`) to `/login`.
- **FR-010**: The system MUST redirect already-authenticated patients away from `/login` and `/register` to the home page.

**Booking Flow:**
- **FR-011**: Only authenticated patients MUST be able to access the `/book` page.
- **FR-012**: Patients MUST be able to filter the doctor list by specialty (Oncology, Pulmonology, Cardiology, Internal Medicine, Family Medicine).
- **FR-013**: Patients MUST be able to filter the doctor list by clinic location (New York, London, Dubai).
- **FR-014**: Patients MUST be able to select one doctor per booking.
- **FR-015**: The system MUST display available dates within the next 30 calendar days, excluding Sundays.
- **FR-016**: The system MUST display time slots from 8:00 AM to 5:00 PM (Mon–Fri) and 9:00 AM to 1:00 PM (Sat) in 1-hour increments.
- **FR-017**: The booking MUST be stored linked to the authenticated patient's account (not by email alone).
- **FR-018**: Upon successful booking submission, the system MUST display a confirmation screen with doctor name, specialty, date, time, and location.
- **FR-019**: Each booking MUST be assigned a unique identifier and stored persistently.

**My Bookings (Session-Based):**
- **FR-020**: The `/bookings` page MUST be accessible only to authenticated patients — no email input field.
- **FR-021**: The system MUST display only the appointments belonging to the currently logged-in patient.
- **FR-022**: Each appointment card MUST display: doctor name, specialty, location, date, time slot, and current status.
- **FR-023**: Patients MUST be able to cancel a confirmed appointment via a confirmation dialog.
- **FR-024**: Once cancelled, the appointment status MUST reflect "Cancelled" and the cancel action MUST no longer be available.

**Admin Panel:**
- **FR-025**: The system MUST provide a `/admin/login` page with username and password fields.
- **FR-026**: Admin credentials MUST be username: `admin`, password: `Admin1` (validated server-side).
- **FR-027**: Successful admin login MUST establish an admin session and redirect to `/admin`.
- **FR-028**: The `/admin` dashboard MUST display ALL appointments across all patients.
- **FR-029**: Each row in the admin dashboard MUST show: patient name, patient email, doctor name, specialty, location, date, time slot, and current status.
- **FR-030**: The admin MUST be able to change any appointment's status between "confirmed" and "cancelled" directly from the dashboard.
- **FR-031**: The system MUST redirect unauthenticated visitors from `/admin` to `/admin/login`.
- **FR-032**: Patient sessions MUST NOT grant access to `/admin` — admin auth is a separate credential system.

**Home Page:**
- **FR-033**: The home page MUST be publicly accessible (no login required to view).
- **FR-034**: The home page MUST include a hero section with the clinic name, tagline, and CTAs.
- **FR-035**: For logged-out visitors, the "Book Appointment" CTA MUST link to `/login`.
- **FR-036**: For logged-in patients, the "Book Appointment" CTA MUST link to `/book`.
- **FR-037**: The home page MUST display all five medical specialties, at least three doctor profiles, and contact information for all three clinic locations.

**About & Contact:**
- **FR-038**: The About page MUST be publicly accessible.
- **FR-039**: The About page MUST include a mission statement, three location cards with full details, and a contact form that shows a success message on submission.

**General:**
- **FR-040**: All pages MUST be accessible on desktop and mobile screen sizes (375px minimum width).
- **FR-041**: No content referencing Pakistani geography, names, or culture MUST appear anywhere in the application.

### Key Entities

- **Patient (User)**: A registered user with a unique account managed by the authentication system. Identified by email and authenticated by password. Has a display name stored at registration.
- **Doctor**: A medical professional with a name, specialty, bio, assigned clinic location, and a visual avatar. Pre-seeded and read-only from the patient interface.
- **Appointment**: A booking record linked to an authenticated patient account and a doctor. Contains date, time slot, location, and status (confirmed/cancelled).
- **Clinic Location**: A physical office with address, phone, and operating hours. Three locations: New York, London, Dubai.
- **Admin Session**: A separate server-side credential check (username/password) granting access to the admin dashboard. Independent of patient auth.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can complete registration and their first appointment booking in under 5 minutes total.
- **SC-002**: A logged-in patient's My Bookings page loads and displays their appointments in under 3 seconds.
- **SC-003**: A patient can cancel an appointment within 2 clicks after viewing My Bookings.
- **SC-004**: 100% of booking submissions by authenticated patients result in a stored record visible only on that patient's My Bookings page.
- **SC-005**: The admin dashboard loads and displays all appointments in under 5 seconds.
- **SC-006**: An admin can update an appointment status in 1 click from the dashboard; the change is reflected in the patient's view without a page reload.
- **SC-007**: 0 unauthenticated requests to `/bookings`, `/book`, or `/admin` succeed — all redirect to the appropriate login page.
- **SC-008**: The home page loads in under 3 seconds on standard broadband.
- **SC-009**: All pages are fully usable on screens as small as 375px wide without horizontal scrolling.

---

## Assumptions

- Patient authentication is handled by Supabase Auth (email + password). No OAuth or SSO in scope.
- Admin authentication uses a hardcoded server-side credential check (username: `admin`, password: `Admin1`). This is acceptable for MVP; production would require proper admin user management.
- No real-time slot availability management is needed for MVP; all time slots within operating hours are considered available.
- The contact form on the About page does not need to send emails in the MVP; a client-side success message is sufficient.
- Operating hours are uniform across all three locations: Mon–Fri 8:00 AM – 6:00 PM, Sat 9:00 AM – 2:00 PM, closed Sundays.
- Doctor profiles are pre-defined and not editable through any patient-facing page.
- Patient name captured at registration is used as the patient name on all bookings from that account (no separate name entry per booking).

---

## Out of Scope

- Admin user management (adding/removing admin accounts).
- Doctor management via admin panel (adding/editing doctor profiles).
- Real-time calendar sync (Google Calendar, iCal, etc.).
- Email or SMS notifications to patients or doctors.
- Payment processing or insurance handling.
- Patient medical records or health history.
- OAuth / SSO / social login (Google, Apple, etc.).
- Password reset flow (out of scope for MVP).
- Doctor-to-doctor or doctor-to-patient messaging.
