-- MedCare Admin Setup — run AFTER supabase-setup.sql
-- https://supabase.com/dashboard/project/izhhdqjkzoaqpnqcuitv/sql/new

-- ── 1. Extend doctors table ───────────────────────────────────────────────
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS consultation_fee integer NOT NULL DEFAULT 150;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;

-- ── 2. Profiles table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  full_name   text,
  is_admin    boolean     NOT NULL DEFAULT false,
  is_blocked  boolean     NOT NULL DEFAULT false,
  push_token  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: owner or admin" ON public.profiles;
CREATE POLICY "Profiles: owner or admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR
    (auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com'
  );

DROP POLICY IF EXISTS "Profiles: owner insert" ON public.profiles;
CREATE POLICY "Profiles: owner insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: owner update" ON public.profiles;
CREATE POLICY "Profiles: owner update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    (auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com'
  );

-- ── 3. Notification logs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title    text        NOT NULL,
  body     text        NOT NULL,
  target   text        NOT NULL DEFAULT 'all',
  sent_by  uuid        REFERENCES auth.users(id),
  sent_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notification logs: admin only" ON public.notification_logs;
CREATE POLICY "Notification logs: admin only" ON public.notification_logs
  FOR ALL USING ((auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com');

-- ── 4. App settings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text        PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "App settings: anyone reads" ON public.app_settings;
CREATE POLICY "App settings: anyone reads" ON public.app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "App settings: admin writes" ON public.app_settings;
CREATE POLICY "App settings: admin writes" ON public.app_settings
  FOR ALL USING ((auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com');

INSERT INTO public.app_settings (key, value) VALUES
  ('notifications_enabled',    'true'),
  ('max_bookings_per_day',     '10'),
  ('default_consultation_fee', '150'),
  ('max_doctors_per_specialty','5')
ON CONFLICT (key) DO NOTHING;

-- ── 5. Admin appointment access ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users read own appointments" ON public.appointments;
CREATE POLICY "Users read own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = user_id OR
    (auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com'
  );

-- ── 6. Admin doctor write access ──────────────────────────────────────────
DROP POLICY IF EXISTS "Admin manages doctors" ON public.doctors;
CREATE POLICY "Admin manages doctors" ON public.doctors
  FOR ALL USING ((auth.jwt() ->> 'email') = 'mustufa.dex@gmail.com');

-- ── 7. Auto-create profile on signup ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 8. Seed profiles for existing users ──────────────────────────────────
-- Run this once to back-fill profiles for users who registered before the trigger
INSERT INTO public.profiles (id, email, full_name)
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
