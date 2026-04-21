---
id: 003
title: Add Auth and Admin Panel to Spec
stage: plan
date: 2026-04-21
surface: agent
model: claude-sonnet-4-6
feature: 001-medcare-booking
branch: 001-medcare-booking
user: mustufa.dex@gmail.com
command: spec-update
labels: ["spec-update","auth","supabase-auth","admin-panel","session","medcare"]
links:
  spec: specs/001-medcare-booking/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-medcare-booking/spec.md
  - specs/001-medcare-booking/plan.md
  - specs/001-medcare-booking/research.md
  - specs/001-medcare-booking/data-model.md
  - specs/001-medcare-booking/quickstart.md
  - specs/001-medcare-booking/contracts/appointments-api.md
tests:
  - null
---

## Prompt

Before running sp.tasks, update the spec with these changes:
1. Patient authentication using Supabase Auth (email + password)
   - /register page — patient signs up
   - /login page — patient logs in
   - After login, patient sees only THEIR appointments
   - Logout button in navbar
2. Admin panel
   - /admin/login — separate login page
   - Username: admin, Password: Admin1
   - Admin dashboard shows ALL appointments
   - Admin can update status (confirmed/cancelled)
3. Remove email lookup from My Bookings
   - Replace with proper session-based auth
Keep Next.js, Supabase, TypeScript, Tailwind unchanged.

## Response snapshot

Updated all 5 spec/plan artifacts to incorporate patient auth and admin panel:

**spec.md**: Rewrote Overview; replaced User Story 2 (email lookup) with auth-aware stories; added US2 (Registration), US3 (Login/Logout), US5 (Admin Panel); updated all FRs (FR-001–FR-041); updated Key Entities, Success Criteria, Assumptions, and Out of Scope.

**plan.md**: Updated Summary and Technical Context (added Supabase Auth + @supabase/ssr + middleware); updated project structure with `/register`, `/login`, `/admin/login`, `/admin` pages; added `components/auth/`, `components/admin/`, `middleware.ts`, `lib/admin-auth.ts`, `lib/supabase/` split.

**research.md**: Added Decision 1 (Supabase Auth), Decision 2 (hardcoded admin credentials + server-side cookie), Decision 3 (Next.js middleware route protection), Decision 4 (user_id FK on appointments + RLS policies).

**data-model.md**: Added `user_id UUID FK → auth.users(id)` to appointments; added RLS policy SQL; added `lib/admin-auth.ts` interface; updated TypeScript interfaces.

**contracts/appointments-api.md**: Added auth requirements per endpoint; added admin endpoints (POST/DELETE /api/admin/auth, GET/PATCH /api/admin/appointments/[id]); removed anonymous access.

**quickstart.md**: Added Step 3 (Enable Supabase Auth email provider), updated Step 4 (RLS policies in SQL), added admin verification flow.

## Outcome

- ✅ Impact: All 6 planning artifacts updated consistently — auth and admin panel fully specified across spec, plan, data model, contracts, and quickstart
- 🧪 Tests: No code tests at spec/plan stage; acceptance scenarios updated in spec.md
- 📁 Files: spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/appointments-api.md
- 🔁 Next prompts: /sp.tasks to generate implementation task list
- 🧠 Reflection: Admin auth kept deliberately separate from Supabase Auth to avoid mixing admin/patient accounts. RLS policies add database-level enforcement on top of application-level guards. Hardcoded admin credentials noted as MVP-only.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a (manual spec update, not code)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Run /sp.tasks to generate dependency-ordered task list
