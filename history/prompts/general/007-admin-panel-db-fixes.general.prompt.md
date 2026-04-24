---
name: Admin Panel DB Fixes
description: Fix 4 admin panel issues after DB update — notifications table, profiles table with phone, consultation_fee, dashboard analytics
type: general
id: "007"
stage: green
date: 2026-04-23
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Mustufa Arshad
command: fix 4 admin panel issues
labels: ["admin", "supabase", "notifications", "users", "doctors", "dashboard", "analytics"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
---

## Prompt

```
Database has been updated. Fix these 4 issues:

1. NOTIFICATIONS PAGE
   - Fetch from 'notifications' table
   - Columns: id, title, message, type, created_at
   - Show in dark themed cards
   - Type badge: info=blue, reminder=yellow

2. USERS PAGE  
   - Fetch from 'profiles' table
   - Columns: id, full_name, email, phone, created_at
   - Show in dark themed table

3. DOCTORS PAGE
   - consultation_fee column now exists
   - Remove any fallback ?? 0 errors
   - Show fee as $200, $350 etc

4. DASHBOARD ANALYTICS
   - Fetch real data from appointments table
   - Group by doctor_name for bar chart
   - Group by status for donut chart
   - Group by DATE(appointment_date) for line chart

Use SUPABASE_SERVICE_ROLE_KEY for all admin queries.
Fix only these 4 issues. Do not rebuild entire panel.
```

## Response

Fixed all 4 issues with minimal targeted changes:

**Files Modified:**
- `app/admin/notifications/page.tsx` — rewrote to fetch from `notifications` table; dark-themed card layout with info=blue/reminder=yellow badges
- `app/admin/users/page.tsx` — simplified fetch to `id, full_name, email, phone, created_at` from `profiles`; dark header
- `components/admin/UsersManager.tsx` — replaced complex block/unblock component with a clean dark-themed table showing name, email, phone, joined date with search
- `lib/types.ts` — added `phone` to `UserProfile`; made `is_admin`, `is_blocked`, `push_token` optional for new simplified schema
- `components/admin/DoctorsManager.tsx` — removed `?? 0` fallback on `consultation_fee` display (line 119)
- `app/admin/page.tsx` — updated dashboard to query `id, status, appointment_date, doctor_name` directly from appointments (no join); groups by doctor_name for bar chart, status for donut, date for line chart; removed SpecialtyBar and Revenue card

## Files Changed

 - app/admin/notifications/page.tsx
 - app/admin/users/page.tsx
 - components/admin/UsersManager.tsx
 - lib/types.ts
 - components/admin/DoctorsManager.tsx
 - app/admin/page.tsx

## Tests

 - none
