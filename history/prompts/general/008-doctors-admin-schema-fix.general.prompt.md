---
name: Doctors Admin Schema Fix
description: Fix doctors admin panel — add experience_years, drop location/avatar_color, ensure is_available throughout, build passes
type: general
id: "008"
stage: green
date: 2026-04-24
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Mustufa Arshad
command: fix doctors admin panel for updated DB schema
labels: ["admin", "doctors", "supabase", "schema", "experience_years", "is_available"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
---

## Prompt

```
Fix doctors admin panel:
1. In ALL these files find any reference to 'available' column and change to 'is_available':
   - components/admin/DoctorsManager.tsx
   - app/api/admin/doctors/route.ts
   - app/api/admin/doctors/[id]/route.ts
   - app/admin/doctors/page.tsx
2. When ADDING a new doctor, insert these fields:
   - name (text)
   - specialty (text)
   - consultation_fee (integer)
   - is_available (boolean, default true)
   - experience_years (integer)
   - bio (text)
3. When EDITING a doctor, update same fields.
4. Make sure SELECT query includes is_available not available.
Fix only doctors. Nothing else.
Run npx next build when done to verify.
```

## Response

Root cause: DB schema changed — `location` and `avatar_color` columns removed, `experience_years` added. Code was still sending old columns on INSERT/PATCH causing DB errors.

**Changes made:**
- `lib/types.ts` — `DoctorWithFee` made standalone (no longer extends `Doctor`); has `id, name, specialty, bio, consultation_fee, is_available, experience_years`. `Doctor` kept unchanged for booking flow.
- `components/admin/DoctorsManager.tsx` — removed `location`/`avatar_color` from `Form`, `EMPTY`, `openEdit`, `payload`; added `experience_years` field; avatar color now derived from name hash; card shows experience_years.
- `app/api/admin/doctors/route.ts` — POST now inserts `name, specialty, bio, consultation_fee, is_available, experience_years`; removed `location`/`avatar_color`.
- `app/admin/doctors/page.tsx` — changed `d.is_available !== false` to `d.is_available === true` for strict DB column match.
- `app/api/admin/doctors/[id]/route.ts` — no change needed (passes body directly).

Build: `✓ Compiled successfully` — no TypeScript errors.

## Files Changed

 - lib/types.ts
 - components/admin/DoctorsManager.tsx
 - app/api/admin/doctors/route.ts
 - app/admin/doctors/page.tsx

## Tests

 - npx next build — passed clean
