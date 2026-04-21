# API Contract: Appointments & Admin

**Service**: MedCare Health — Next.js API Routes  
**Date**: 2026-04-21  
**Updated**: 2026-04-21 — Added auth, admin endpoints, removed anonymous access

---

## Authentication

### Patient Routes
All patient appointment routes require a valid Supabase Auth session (HTTP-only cookie set by Supabase Auth). The session is verified server-side in each API route handler via `createServerClient`.

### Admin Routes
All admin routes require a valid `admin_session` HTTP-only cookie, set by `POST /api/admin/auth`. This is independent of Supabase Auth.

---

## Patient Endpoints

---

### GET /api/appointments

Retrieve the authenticated patient's own appointments.

**Auth**: Supabase session cookie required. Returns 401 if missing.

**Query Parameters**: None (patient identity from session)

**Success Response** — `200 OK`

```json
{
  "appointments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "770e8400-e29b-41d4-a716-446655440002",
      "doctor_id": "660e8400-e29b-41d4-a716-446655440001",
      "patient_name": "James Wilson",
      "patient_email": "james.wilson@email.com",
      "patient_phone": "+1 (212) 555-0100",
      "appointment_date": "2026-04-28",
      "time_slot": "10:00 AM",
      "location": "New York",
      "status": "confirmed",
      "created_at": "2026-04-21T14:30:00Z",
      "doctor": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Dr. James Carter",
        "specialty": "Oncology",
        "location": "New York",
        "avatar_color": "#0f3460"
      }
    }
  ]
}
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid session |
| 500 | `DB_ERROR` | Supabase query failed |

---

### POST /api/appointments

Create a new appointment for the authenticated patient.

**Auth**: Supabase session cookie required.

**Request Body** — `application/json`

```json
{
  "doctor_id": "660e8400-e29b-41d4-a716-446655440001",
  "patient_phone": "+1 (212) 555-0100",
  "appointment_date": "2026-04-28",
  "time_slot": "10:00 AM",
  "location": "New York"
}
```

> `patient_name` and `patient_email` are derived from the authenticated session — not accepted from the request body.

**Field Validation**

| Field | Validation |
|-------|-----------|
| `doctor_id` | Required, valid UUID of an existing doctor |
| `patient_phone` | Required, non-empty string |
| `appointment_date` | Required, ISO date YYYY-MM-DD, not Sunday, within 30 days |
| `time_slot` | Required, valid slot for the given day of week |
| `location` | Required, one of: 'New York', 'London', 'Dubai' |

**Success Response** — `201 Created`

```json
{
  "appointment": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "doctor_id": "660e8400-e29b-41d4-a716-446655440001",
    "patient_name": "James Wilson",
    "patient_email": "james.wilson@email.com",
    "patient_phone": "+1 (212) 555-0100",
    "appointment_date": "2026-04-28",
    "time_slot": "10:00 AM",
    "location": "New York",
    "status": "confirmed",
    "created_at": "2026-04-21T14:30:00Z"
  }
}
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid session |
| 400 | `VALIDATION_ERROR` | Field validation failed |
| 404 | `DOCTOR_NOT_FOUND` | `doctor_id` does not match any doctor |
| 500 | `DB_ERROR` | Supabase insert failed |

---

### PATCH /api/appointments/[id]

Cancel an appointment. Patient can only cancel their own confirmed appointments (enforced by RLS).

**Auth**: Supabase session cookie required.

**Path Parameters**: `id` — appointment UUID

**Request Body**

```json
{ "status": "cancelled" }
```

**Success Response** — `200 OK`

```json
{ "appointment": { "id": "...", "status": "cancelled" } }
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid session |
| 403 | `FORBIDDEN` | Appointment belongs to a different patient |
| 404 | `NOT_FOUND` | Appointment does not exist |
| 409 | `ALREADY_CANCELLED` | Appointment is already cancelled |
| 500 | `DB_ERROR` | Update failed |

---

## Admin Endpoints

---

### POST /api/admin/auth

Authenticate as admin and set admin session cookie.

**Auth**: None required (this is the login endpoint).

**Request Body**

```json
{ "username": "admin", "password": "Admin1" }
```

**Success Response** — `200 OK`

Sets HTTP-only `admin_session` cookie (1-day expiry).

```json
{ "ok": true }
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `INVALID_CREDENTIALS` | Username or password incorrect |

---

### DELETE /api/admin/auth

Log out admin (clear admin session cookie).

**Auth**: `admin_session` cookie required.

**Success Response** — `200 OK`

```json
{ "ok": true }
```

---

### GET /api/admin/appointments

Retrieve ALL appointments across all patients, sorted by date descending.

**Auth**: `admin_session` cookie required.

**Query Parameters** (optional):

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by 'confirmed' or 'cancelled' |
| `location` | string | Filter by 'New York', 'London', 'Dubai' |

**Success Response** — `200 OK`

```json
{
  "appointments": [
    {
      "id": "550e8400-...",
      "user_id": "770e8400-...",
      "patient_name": "James Wilson",
      "patient_email": "james.wilson@email.com",
      "patient_phone": "+1 (212) 555-0100",
      "appointment_date": "2026-04-28",
      "time_slot": "10:00 AM",
      "location": "New York",
      "status": "confirmed",
      "created_at": "2026-04-21T14:30:00Z",
      "doctor": {
        "name": "Dr. James Carter",
        "specialty": "Oncology",
        "location": "New York"
      }
    }
  ]
}
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid admin session |
| 500 | `DB_ERROR` | Query failed |

---

### PATCH /api/admin/appointments/[id]

Update any appointment's status. Admin can set either 'confirmed' or 'cancelled'.

**Auth**: `admin_session` cookie required.

**Path Parameters**: `id` — appointment UUID

**Request Body**

```json
{ "status": "confirmed" }
```

> Admin can set status to either `"confirmed"` or `"cancelled"` (unlike patient, who can only cancel).

**Success Response** — `200 OK`

```json
{ "appointment": { "id": "...", "status": "confirmed" } }
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid admin session |
| 400 | `INVALID_STATUS` | Status is not 'confirmed' or 'cancelled' |
| 404 | `NOT_FOUND` | Appointment does not exist |
| 500 | `DB_ERROR` | Update failed |

---

## Error Response Shape (all endpoints)

```typescript
interface ErrorResponse {
  error: string;        // machine-readable code
  message: string;      // human-readable description
  fields?: Record<string, string>; // field-level validation errors (POST only)
}
```

---

## Notes

- The Supabase service role key (bypasses RLS) is used only in admin API routes
- Patient API routes use the patient's session-scoped Supabase client — RLS enforces data isolation
- Admin credentials are stored in environment variables, never in code
- `patient_name` and `patient_email` in POST /api/appointments come from the auth session, not the request body — prevents patients from booking under a different name/email
