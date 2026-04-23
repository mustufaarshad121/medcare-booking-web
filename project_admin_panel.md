---
name: Admin Panel Build
description: Complete admin panel added to MedCare Mobile — 5 tabs, analytics charts, doctor/user/notification/settings management
type: project
---

Admin panel was built from scratch on 2026-04-23. Admin route triggers when `user.email === 'mustufa.dex@gmail.com'`.

**Why:** User requested full SaaS-style admin panel with analytics, doctor CRUD, user management, notifications, and settings.

**How to apply:** When working on admin features, check `screens/admin/` directory. The admin SQL setup is in `scripts/admin-setup.sql` — must be run in Supabase SQL Editor before admin features work. The `lib/admin.ts` contains all admin Supabase functions.

**Key technical decisions:**
- RLS policies use `(auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com'` to avoid circular reference
- Charts use `react-native-chart-kit` + `react-native-svg` (both installed)
- `DoctorWithFee` type extends `Doctor` with `consultation_fee` and `is_available`
- Profiles table auto-populated via trigger on auth.users INSERT
- Broadcast notifications are local (expo-notifications) + logged to `notification_logs` table
